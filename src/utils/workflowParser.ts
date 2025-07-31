import type { Node, Edge } from '@xyflow/react';
import type { 
  WorkflowDebugData, 
  NodeData, 
  WorkflowDefinition, 
  CombinedWorkflowData, 
  CombinedWorkflowState,
  WorkflowDefinitionState,
  WorkflowOnError
} from '../types';

// Helper function to check if an error matches an error reference
const matchesErrorRef = (errorMessage: string, errorRef: string): boolean => {
  if (!errorMessage || !errorRef) return false;
  
  // Check if error message contains the error reference
  return errorMessage.toLowerCase().includes(errorRef.toLowerCase());
};

// Helper function to find which error handler was triggered
const findTriggeredErrorHandler = (
  state: CombinedWorkflowState
): { errorHandler: WorkflowOnError; nextState: string } | null => {
  if (!state.hasError || !state.definition.onErrors || !state.execution) {
    return null;
  }
  
  // Get the error message from the execution
  const errorMessage = state.execution.error || 
    state.execution.actions?.find(action => action.error)?.error;
  
  if (!errorMessage) return null;
  
  // First, try to find specific error handlers (non-DefaultErrorRef)
  for (const errorHandler of state.definition.onErrors) {
    if (errorHandler.errorRef !== 'DefaultErrorRef' && matchesErrorRef(errorMessage, errorHandler.errorRef)) {
      const nextState = typeof errorHandler.transition === 'string' 
        ? errorHandler.transition 
        : errorHandler.transition.nextState;
      return { errorHandler, nextState };
    }
  }
  
  // If no specific handler matched, try to find DefaultErrorRef as fallback
  const defaultHandler = state.definition.onErrors.find(handler => handler.errorRef === 'DefaultErrorRef');
  if (defaultHandler) {
    const nextState = typeof defaultHandler.transition === 'string' 
      ? defaultHandler.transition 
      : defaultHandler.transition.nextState;
    return { errorHandler: defaultHandler, nextState };
  }
  
  return null;
};

// Helper function to get the next state from error handler transition
const getErrorHandlerNextState = (errorHandler: WorkflowOnError): string => {
  if (typeof errorHandler.transition === 'string') {
    return errorHandler.transition;
  }
  return errorHandler.transition.nextState;
};

// Original parser for backward compatibility
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
        definition: state as any, // Legacy compatibility
        wasExecuted: true,
        hasError,
        duration,
        execution: state
      },
      duration,
      hasError,
      wasExecuted: true
    };

    // Better layout algorithm - stagger nodes vertically for better visibility
    const row = Math.floor(index / 3); // 3 nodes per row max
    const col = index % 3;
    const x = col * 380; // More horizontal spacing for wider nodes
    const y = row * 220 + (state.type === 'switch' ? 50 : 0); // More vertical spacing

    const node: Node = {
      id: `state-${index}`,
      type: 'workflowNode',
      position: { x, y },
      data: nodeData,
      draggable: true
    };

    nodes.push(node);

    // Create edge to next state
    if (index < data.states.length - 1) {
      const sourceType = state.type;
      const targetType = data.states[index + 1]?.type;
      
      // Use color based on source node type
      let strokeColor = '#10b981'; // Default green for operations
      if (hasError) {
        strokeColor = '#ef4444';
      } else if (sourceType === 'switch') {
        strokeColor = '#f59e0b';
      }

      const edge: Edge = {
        id: `edge-${index}`,
        source: `state-${index}`,
        target: `state-${index + 1}`,
        type: 'default',
        animated: !hasError,
        style: {
          stroke: strokeColor,
          strokeWidth: 2,
          strokeDasharray: hasError ? '5,5' : undefined
        }
      };
      edges.push(edge);
    }
  });

  return { nodes, edges };
};

// New parser that combines workflow definition with execution debug data
export const parseCombinedWorkflowData = (combinedData: CombinedWorkflowData): { nodes: Node[], edges: Edge[] } => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const statePositions = new Map<string, { x: number, y: number }>();

  // First, build the complete workflow structure from definition
  const stateMap = new Map<string, CombinedWorkflowState>();
  combinedData.states.forEach(state => {
    stateMap.set(state.name, state);
  });

  // Layout algorithm: traverse the workflow starting from the start state
  const layoutStates = (stateName: string, visited: Set<string>, level: number, position: number): void => {
    if (visited.has(stateName) || !stateMap.has(stateName)) return;
    
    visited.add(stateName);
    const state = stateMap.get(stateName)!;
    
    // Calculate position
    const x = level * 400; // Horizontal spacing between levels
    const y = position * 250; // Vertical spacing between nodes at same level
    statePositions.set(stateName, { x, y });

    // Recursively layout connected states
    let nextPosition = 0;
    
    if (state.definition.type === 'switch') {
      // Handle switch conditions
      if (state.definition.dataConditions) {
        state.definition.dataConditions.forEach((condition, index) => {
          layoutStates(condition.transition.nextState, visited, level + 1, position + nextPosition);
          nextPosition++;
        });
      }
      // Handle default condition
      if (state.definition.defaultCondition) {
        layoutStates(state.definition.defaultCondition.transition.nextState, visited, level + 1, position + nextPosition);
        nextPosition++;
      }
    } else {
      // Handle regular transition
      const nextState = getNextStateName(state.definition);
      if (nextState) {
        layoutStates(nextState, visited, level + 1, position + nextPosition);
        nextPosition++;
      }
      
      // Handle error handlers - position them below the normal flow
      if (state.definition.onErrors) {
        state.definition.onErrors.forEach((errorHandler, index) => {
          const errorNextState = getErrorHandlerNextState(errorHandler);
          // Position error handlers at a lower vertical position to show the error flow
          layoutStates(errorNextState, visited, level + 1, position + nextPosition + index);
        });
      }
    }
  };

  // Start layout from the start state
  layoutStates(combinedData.startState, new Set(), 0, 0);

  // Create nodes for all states
  combinedData.states.forEach((state, index) => {
    const duration = state.duration || 0;
    const hasError = state.hasError;
    const wasExecuted = state.wasExecuted;

    const nodeData: NodeData = {
      label: state.name,
      state,
      duration,
      hasError,
      wasExecuted
    };

    const position = statePositions.get(state.name) || { x: index * 400, y: 0 };

    const node: Node = {
      id: `state-${state.name}`,
      type: 'workflowNode',
      position,
      data: nodeData,
      draggable: true,
      className: wasExecuted ? 'executed-node' : 'unexecuted-node'
    };

    nodes.push(node);
  });

  // Create edges based on workflow definition
  combinedData.states.forEach(state => {
    const sourceId = `state-${state.name}`;
    
    if (state.definition.type === 'switch') {
      // Create edges for switch conditions
      if (state.definition.dataConditions) {
        state.definition.dataConditions.forEach((condition, index) => {
          const targetId = `state-${condition.transition.nextState}`;
          const isExecutedPath = state.wasExecuted && 
            state.execution?.matchedCondition === condition.name;
          
          const edge: Edge = {
            id: `edge-${state.name}-${condition.name}`,
            source: sourceId,
            target: targetId,
            type: 'default',
            label: condition.name,
            animated: isExecutedPath,
            style: {
              stroke: isExecutedPath ? '#f59e0b' : '#d1d5db',
              strokeWidth: isExecutedPath ? 2 : 1,
              strokeDasharray: !isExecutedPath ? '5,5' : undefined
            },
            labelStyle: {
              fontSize: 11,
              fontWeight: isExecutedPath ? 600 : 400,
              fill: isExecutedPath ? '#f59e0b' : '#6b7280'
            }
          };
          edges.push(edge);
        });
      }

      // Create edge for default condition
      if (state.definition.defaultCondition) {
        const targetId = `state-${state.definition.defaultCondition.transition.nextState}`;
        const isExecutedPath = state.wasExecuted && 
          state.execution?.matchedCondition === 'default'; // Check if default condition was matched
        
        const edge: Edge = {
          id: `edge-${state.name}-default`,
          source: sourceId,
          target: targetId,
          type: 'default',
          label: 'default',
          animated: isExecutedPath,
          style: {
            stroke: isExecutedPath ? '#f59e0b' : '#d1d5db',
            strokeWidth: isExecutedPath ? 2 : 1,
            strokeDasharray: !isExecutedPath ? '5,5' : undefined
          },
          labelStyle: {
            fontSize: 11,
            fontWeight: isExecutedPath ? 600 : 400,
            fill: isExecutedPath ? '#f59e0b' : '#6b7280'
          }
        };
        edges.push(edge);
      }
    } else {
      // Check if this state has error handlers and an error occurred
      const triggeredErrorHandler = findTriggeredErrorHandler(state);
      
      // Always create the normal transition edge first (if it exists)
      const nextStateName = getNextStateName(state.definition);
      if (nextStateName) {
        const targetId = `state-${nextStateName}`;
        const isExecutedPath = state.wasExecuted && !state.hasError;
        
        let strokeColor = '#10b981'; // Default green for operations
        if (state.hasError) {
          // Show as unexecuted since error prevented normal flow
          strokeColor = '#d1d5db'; // Gray for unexecuted paths
        } else if (!state.wasExecuted) {
          strokeColor = '#d1d5db'; // Gray for unexecuted paths
        }

        const edge: Edge = {
          id: `edge-${state.name}-${nextStateName}`,
          source: sourceId,
          target: targetId,
          type: 'default',
          animated: isExecutedPath,
          style: {
            stroke: strokeColor,
            strokeWidth: isExecutedPath ? 2 : 1,
            strokeDasharray: !isExecutedPath ? '5,5' : undefined
          }
        };
        edges.push(edge);
      }

      if (triggeredErrorHandler) {
        // Create edge to the error handler that was triggered
        const errorTargetId = `state-${triggeredErrorHandler.nextState}`;
        const edge: Edge = {
          id: `edge-${state.name}-error-${triggeredErrorHandler.errorHandler.errorRef}`,
          source: sourceId,
          target: errorTargetId,
          type: 'default',
          label: `error: ${triggeredErrorHandler.errorHandler.errorRef}`,
          animated: true,
          style: {
            stroke: '#ef4444', // Red for error paths
            strokeWidth: 2,
            strokeDasharray: '3,3' // Different dash pattern for errors
          },
          labelStyle: {
            fontSize: 10,
            fontWeight: 600,
            fill: '#ef4444',
            backgroundColor: '#fef2f2',
            padding: '2px 4px',
            borderRadius: '3px'
          }
        };
        edges.push(edge);
        
        // Create unexecuted edges for other error handlers
        if (state.definition.onErrors) {
          state.definition.onErrors.forEach(errorHandler => {
            if (errorHandler.errorRef !== triggeredErrorHandler.errorHandler.errorRef) {
              const unexecutedTargetId = `state-${getErrorHandlerNextState(errorHandler)}`;
              const unexecutedEdge: Edge = {
                id: `edge-${state.name}-error-unexecuted-${errorHandler.errorRef}`,
                source: sourceId,
                target: unexecutedTargetId,
                type: 'default',
                label: `error: ${errorHandler.errorRef}`,
                animated: false,
                style: {
                  stroke: '#d1d5db', // Gray for unexecuted
                  strokeWidth: 1,
                  strokeDasharray: '5,5'
                },
                labelStyle: {
                  fontSize: 10,
                  fontWeight: 400,
                  fill: '#6b7280'
                }
              };
              edges.push(unexecutedEdge);
            }
          });
        }
      } else if (state.definition.onErrors) {
        // Create unexecuted error handler edges if error handlers exist but no error occurred
        state.definition.onErrors.forEach(errorHandler => {
          const errorTargetId = `state-${getErrorHandlerNextState(errorHandler)}`;
          const errorEdge: Edge = {
            id: `edge-${state.name}-error-unexecuted-${errorHandler.errorRef}`,
            source: sourceId,
            target: errorTargetId,
            type: 'default',
            label: `error: ${errorHandler.errorRef}`,
            animated: false,
            style: {
              stroke: '#d1d5db', // Gray for unexecuted
              strokeWidth: 1,
              strokeDasharray: '5,5'
            },
            labelStyle: {
              fontSize: 10,
              fontWeight: 400,
              fill: '#6b7280'
            }
          };
          edges.push(errorEdge);
        });
      }
    }
  });

  return { nodes, edges };
};

// Helper function to get next state name from a definition state
const getNextStateName = (state: WorkflowDefinitionState): string | null => {
  if (!state.transition || state.end) return null;
  
  if (typeof state.transition === 'string') {
    return state.transition;
  } else if (state.transition.nextState) {
    return state.transition.nextState;
  }
  
  return null;
};

// Function to combine workflow definition with execution debug data
export const combineWorkflowData = (
  definition: WorkflowDefinition, 
  execution?: WorkflowDebugData
): CombinedWorkflowData => {
  const executionMap = new Map<string, any>();
  
  // Create a map of executed states
  if (execution) {
    execution.states.forEach(state => {
      executionMap.set(state.name, state);
    });
  }

  // Combine definition states with execution data
  const combinedStates: CombinedWorkflowState[] = definition.states.map(defState => {
    const executionState = executionMap.get(defState.name);
    const wasExecuted = !!executionState;
    const hasError = wasExecuted ? !!(executionState.error || executionState.actions?.some((action: any) => action.error)) : false;
    
    let duration = 0;
    if (wasExecuted && executionState.startTime && executionState.endTime) {
      const startTime = new Date(executionState.startTime).getTime();
      const endTime = new Date(executionState.endTime).getTime();
      duration = endTime - startTime;
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

  return {
    definition,
    execution,
    states: combinedStates,
    startState: definition.start
  };
};

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  return `${(milliseconds / 1000).toFixed(2)}s`;
};

export const getNodeTypeColor = (type: string, hasError: boolean, wasExecuted: boolean = true): string => {
  if (hasError) return '#ef4444';
  if (!wasExecuted) return '#9ca3af'; // Gray for unexecuted
  
  switch (type) {
    case 'operation':
      return '#10b981'; // Emerald - clearly green
    case 'switch':
      return '#f59e0b'; // Amber - clearly orange/yellow
    default:
      return '#6366f1'; // Indigo - clearly purple
  }
}; 