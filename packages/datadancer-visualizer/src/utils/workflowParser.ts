import type { Node, Edge } from '@xyflow/react';
import type {
  WorkflowDebugData,
  NodeData,
  WorkflowDefinition,
  CombinedWorkflowData,
  CombinedWorkflowState,
  WorkflowDefinitionState,
  WorkflowOnError,
  WorkflowTheme,
} from '../types';

const DEFAULT_COLORS = {
  executed: '#10b981',
  unexecuted: '#9ca3af',
  error: '#ef4444',
  operation: '#10b981',
  switch: '#f59e0b',
  default: '#6366f1',
};

// Helper function to check if an error matches an error reference
const matchesErrorRef = (errorMessage: string, errorRef: string): boolean => {
  if (!errorMessage || !errorRef) return false;
  return errorMessage.toLowerCase().includes(errorRef.toLowerCase());
};

// Helper function to find which error handler was triggered
const findTriggeredErrorHandler = (
  state: CombinedWorkflowState
): { errorHandler: WorkflowOnError; nextState: string } | null => {
  if (!state.hasError || !state.definition.onErrors || !state.execution) {
    return null;
  }

  const errorMessage = state.execution.error ||
    state.execution.actions?.find(action => action.error)?.error;

  if (!errorMessage) return null;

  for (const errorHandler of state.definition.onErrors) {
    if (errorHandler.errorRef !== 'DefaultErrorRef' && matchesErrorRef(errorMessage, errorHandler.errorRef)) {
      const nextState = typeof errorHandler.transition === 'string'
        ? errorHandler.transition
        : errorHandler.transition.nextState;
      return { errorHandler, nextState };
    }
  }

  const defaultHandler = state.definition.onErrors.find(handler => handler.errorRef === 'DefaultErrorRef');
  if (defaultHandler) {
    const nextState = typeof defaultHandler.transition === 'string'
      ? defaultHandler.transition
      : defaultHandler.transition.nextState;
    return { errorHandler: defaultHandler, nextState };
  }

  return null;
};

const getErrorHandlerNextState = (errorHandler: WorkflowOnError): string => {
  if (typeof errorHandler.transition === 'string') {
    return errorHandler.transition;
  }
  return errorHandler.transition.nextState;
};

const getNextStateName = (state: WorkflowDefinitionState): string | null => {
  if (!state.transition || state.end) return null;

  if (typeof state.transition === 'string') {
    return state.transition;
  } else if (state.transition.nextState) {
    return state.transition.nextState;
  }

  return null;
};

/** Parse execution-only debug data into ReactFlow nodes and edges (legacy mode). */
export const parseWorkflowData = (data: WorkflowDebugData): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  data.states.forEach((state, index) => {
    const startTime = new Date(state.startTime).getTime();
    const endTime = new Date(state.endTime).getTime();
    const duration = endTime - startTime;
    const hasError = !!(state.error || state.actions?.some(action => action.error));

    const nodeData: NodeData = {
      label: state.name,
      state: {
        name: state.name,
        type: state.type,
        definition: state as any,
        wasExecuted: true,
        hasError,
        duration,
        execution: state
      },
      duration,
      hasError,
      wasExecuted: true
    };

    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = col * 380;
    const y = row * 220 + (state.type === 'switch' ? 50 : 0);

    nodes.push({
      id: `state-${index}`,
      type: 'workflowNode',
      position: { x, y },
      data: nodeData,
    });

    if (index < data.states.length - 1) {
      const hasError = !!(state.error || state.actions?.some(action => action.error));
      let strokeColor = DEFAULT_COLORS.operation;
      if (hasError) strokeColor = DEFAULT_COLORS.error;
      else if (state.type === 'switch') strokeColor = DEFAULT_COLORS.switch;

      edges.push({
        id: `edge-${index}`,
        source: `state-${index}`,
        target: `state-${index + 1}`,
        type: 'default',
        animated: !hasError,
        style: {
          stroke: strokeColor,
          strokeWidth: 3,
          strokeDasharray: hasError ? '5,5' : undefined
        }
      });
    }
  });

  return { nodes, edges };
};

/** Parse combined workflow definition + execution data into ReactFlow nodes and edges. */
export const parseCombinedWorkflowData = (combinedData: CombinedWorkflowData): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const statePositions = new Map<string, { x: number, y: number }>();

  const stateMap = new Map<string, CombinedWorkflowState>();
  combinedData.states.forEach(state => {
    stateMap.set(state.name, state);
  });

  const layoutStates = (stateName: string, visited: Set<string>, level: number, position: number): void => {
    if (visited.has(stateName) || !stateMap.has(stateName)) return;

    visited.add(stateName);
    const state = stateMap.get(stateName)!;

    statePositions.set(stateName, { x: level * 400, y: position * 250 });

    let nextPosition = 0;

    if (state.definition.type === 'switch') {
      if (state.definition.dataConditions) {
        state.definition.dataConditions.forEach(condition => {
          const nextState = typeof condition.transition === 'string' ? condition.transition : condition.transition.nextState;
          layoutStates(nextState, visited, level + 1, position + nextPosition);
          nextPosition++;
        });
      }
      if (state.definition.defaultCondition) {
        const defaultNextState = typeof state.definition.defaultCondition.transition === 'string' ? state.definition.defaultCondition.transition : state.definition.defaultCondition.transition.nextState;
        layoutStates(defaultNextState, visited, level + 1, position + nextPosition);
        nextPosition++;
      }
    } else {
      const nextState = getNextStateName(state.definition);
      if (nextState) {
        layoutStates(nextState, visited, level + 1, position + nextPosition);
        nextPosition++;
      }

      if (state.definition.onErrors) {
        state.definition.onErrors.forEach((errorHandler, index) => {
          const errorNextState = getErrorHandlerNextState(errorHandler);
          layoutStates(errorNextState, visited, level + 1, position + nextPosition + index);
        });
      }
    }
  };

  layoutStates(combinedData.startState, new Set(), 0, 0);

  combinedData.states.forEach((state, index) => {
    const duration = state.duration || 0;
    const nodeData: NodeData = {
      label: state.name,
      state,
      duration,
      hasError: state.hasError,
      wasExecuted: state.wasExecuted
    };

    const position = statePositions.get(state.name) || { x: index * 400, y: 0 };

    nodes.push({
      id: `state-${state.name}`,
      type: 'workflowNode',
      position,
      data: nodeData,
      className: state.wasExecuted ? 'executed-node' : 'unexecuted-node'
    });
  });

  combinedData.states.forEach(state => {
    const sourceId = `state-${state.name}`;

    if (state.definition.type === 'switch') {
      if (state.definition.dataConditions) {
        state.definition.dataConditions.forEach((condition, index) => {
          const conditionNextState = typeof condition.transition === 'string' ? condition.transition : condition.transition.nextState;
          const targetId = `state-${conditionNextState}`;
          const conditionKey = condition.name ?? condition.condition;
          const matched = state.execution?.matchedCondition;
          const isExecutedPath = state.wasExecuted && !!(matched && (matched === condition.name || matched === condition.condition));

          edges.push({
            id: `edge-${state.name}-${conditionKey}`,
            source: sourceId,
            sourceHandle: `condition-${index}`,
            target: targetId,
            type: 'default',
            label: conditionKey,
            animated: isExecutedPath,
            style: {
              stroke: isExecutedPath ? DEFAULT_COLORS.switch : '#d1d5db',
              strokeWidth: isExecutedPath ? 3 : 2,
              strokeDasharray: !isExecutedPath ? '5,5' : undefined
            },
            labelStyle: {
              fontSize: 11,
              fontWeight: isExecutedPath ? 600 : 400,
              fill: isExecutedPath ? DEFAULT_COLORS.switch : '#6b7280'
            }
          });
        });
      }

      if (state.definition.defaultCondition) {
        const targetId = `state-${typeof state.definition.defaultCondition.transition === 'string' ? state.definition.defaultCondition.transition : state.definition.defaultCondition.transition.nextState}`;
        const isExecutedPath = state.wasExecuted && state.execution?.matchedCondition === 'default';

        edges.push({
          id: `edge-${state.name}-default`,
          source: sourceId,
          sourceHandle: 'condition-default',
          target: targetId,
          type: 'default',
          label: 'default',
          animated: isExecutedPath,
          style: {
            stroke: isExecutedPath ? DEFAULT_COLORS.switch : '#d1d5db',
            strokeWidth: isExecutedPath ? 3 : 2,
            strokeDasharray: !isExecutedPath ? '5,5' : undefined
          },
          labelStyle: {
            fontSize: 11,
            fontWeight: isExecutedPath ? 600 : 400,
            fill: isExecutedPath ? DEFAULT_COLORS.switch : '#6b7280'
          }
        });
      }
    } else {
      const triggeredErrorHandler = findTriggeredErrorHandler(state);
      const nextStateName = getNextStateName(state.definition);

      if (nextStateName) {
        const targetId = `state-${nextStateName}`;
        const isExecutedPath = state.wasExecuted && !state.hasError;
        let strokeColor = DEFAULT_COLORS.operation;
        if (state.hasError || !state.wasExecuted) strokeColor = '#d1d5db';

        edges.push({
          id: `edge-${state.name}-${nextStateName}`,
          source: sourceId,
          target: targetId,
          type: 'default',
          animated: isExecutedPath,
          style: {
            stroke: strokeColor,
            strokeWidth: isExecutedPath ? 3 : 2,
            strokeDasharray: !isExecutedPath ? '5,5' : undefined
          }
        });
      }

      if (triggeredErrorHandler) {
        edges.push({
          id: `edge-${state.name}-error-${triggeredErrorHandler.errorHandler.errorRef}`,
          source: sourceId,
          target: `state-${triggeredErrorHandler.nextState}`,
          type: 'default',
          label: `error: ${triggeredErrorHandler.errorHandler.errorRef}`,
          animated: true,
          style: { stroke: DEFAULT_COLORS.error, strokeWidth: 3, strokeDasharray: '3,3' },
          labelStyle: { fontSize: 10, fontWeight: 600, fill: DEFAULT_COLORS.error }
        });

        if (state.definition.onErrors) {
          state.definition.onErrors.forEach(errorHandler => {
            if (errorHandler.errorRef !== triggeredErrorHandler.errorHandler.errorRef) {
              edges.push({
                id: `edge-${state.name}-error-unexecuted-${errorHandler.errorRef}`,
                source: sourceId,
                target: `state-${getErrorHandlerNextState(errorHandler)}`,
                type: 'default',
                label: `error: ${errorHandler.errorRef}`,
                animated: false,
                style: { stroke: '#d1d5db', strokeWidth: 2, strokeDasharray: '5,5' },
                labelStyle: { fontSize: 10, fontWeight: 400, fill: '#6b7280' }
              });
            }
          });
        }
      } else if (state.definition.onErrors) {
        state.definition.onErrors.forEach(errorHandler => {
          edges.push({
            id: `edge-${state.name}-error-unexecuted-${errorHandler.errorRef}`,
            source: sourceId,
            target: `state-${getErrorHandlerNextState(errorHandler)}`,
            type: 'default',
            label: `error: ${errorHandler.errorRef}`,
            animated: false,
            style: { stroke: '#d1d5db', strokeWidth: 2, strokeDasharray: '5,5' },
            labelStyle: { fontSize: 10, fontWeight: 400, fill: '#6b7280' }
          });
        });
      }
    }
  });

  return { nodes, edges };
};

/** Merge a workflow definition with an optional execution trace into a CombinedWorkflowData structure. */
export const combineWorkflowData = (
  definition: WorkflowDefinition,
  execution?: WorkflowDebugData
): CombinedWorkflowData => {
  const executionMap = new Map<string, any>();

  if (execution) {
    execution.states.forEach(state => {
      executionMap.set(state.name, state);
    });
  }

  const states = definition.states.map(defState => {
    const executionState = executionMap.get(defState.name);
    const wasExecuted = !!executionState;
    const hasError = wasExecuted
      ? !!(executionState.error || executionState.actions?.some((action: any) => action.error))
      : false;

    let duration = 0;
    if (wasExecuted && executionState.startTime && executionState.endTime) {
      duration = new Date(executionState.endTime).getTime() - new Date(executionState.startTime).getTime();
    }

    return {
      name: defState.name,
      type: defState.type,
      definition: defState,
      execution: executionState,
      wasExecuted,
      hasError,
      duration
    };
  });

  return { definition, execution, states, startState: definition.start };
};

/** Format a duration in milliseconds to a human-readable string. */
export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) return `${milliseconds}ms`;
  return `${(milliseconds / 1000).toFixed(2)}s`;
};

/** Get the display color for a workflow node based on its type and status. Accepts an optional theme to override defaults. */
export const getNodeTypeColor = (
  type: string,
  hasError: boolean,
  wasExecuted: boolean = true,
  theme?: WorkflowTheme
): string => {
  const colors = theme?.colors ?? DEFAULT_COLORS;
  if (hasError) return colors.error;
  if (!wasExecuted) return colors.unexecuted;

  switch (type) {
    case 'operation': return colors.operation;
    case 'switch': return colors.switch;
    default: return colors.default;
  }
};
