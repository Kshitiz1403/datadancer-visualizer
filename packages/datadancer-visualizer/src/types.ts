export interface WorkflowAction {
  activityName: string;
  arguments: Record<string, any>;
  startTime: string;
  endTime: string;
  output: any;
  error?: string;
}

export interface WorkflowState {
  name: string;
  type: 'operation' | 'switch' | string;
  startTime: string;
  endTime: string;
  input: any;
  output: any;
  actions?: WorkflowAction[];
  error?: string;
  matchedCondition?: string;
}

export interface WorkflowDebugData {
  states: WorkflowState[];
}

export interface WorkflowDefinitionAction {
  functionRef: {
    refName: string;
    arguments: Record<string, any>;
  };
}

export interface WorkflowCondition {
  name: string;
  condition: string;
  transition: {
    nextState: string;
  };
}

export interface WorkflowOnError {
  errorRef: string;
  transition: {
    nextState: string;
  } | string;
}

export interface WorkflowDefinitionState {
  name: string;
  type: 'operation' | 'switch' | string;
  actions?: WorkflowDefinitionAction[];
  transition?: {
    nextState: string;
  } | string;
  dataConditions?: WorkflowCondition[];
  defaultCondition?: {
    transition: {
      nextState: string;
    };
  };
  onErrors?: WorkflowOnError[];
  end?: boolean;
}

export interface WorkflowDefinition {
  version: string;
  specVersion: string;
  id: string;
  name: string;
  description: string;
  start: string;
  states: WorkflowDefinitionState[];
}

export interface CombinedWorkflowState {
  name: string;
  type: 'operation' | 'switch' | string;
  definition: WorkflowDefinitionState;
  execution?: WorkflowState;
  wasExecuted: boolean;
  hasError: boolean;
  duration?: number;
}

export interface CombinedWorkflowData {
  definition: WorkflowDefinition;
  execution?: WorkflowDebugData;
  states: CombinedWorkflowState[];
  startState: string;
}

export interface NodeData {
  label: string;
  state: CombinedWorkflowState;
  duration: number;
  hasError: boolean;
  wasExecuted: boolean;
  [key: string]: unknown;
}

/** Theme for customizing visualizer colors. All fields are optional — defaults are used for any omitted field. */
export interface WorkflowTheme {
  colors: {
    /** Color for successfully executed states */
    executed: string;
    /** Color for states that were not executed */
    unexecuted: string;
    /** Color for states that encountered an error */
    error: string;
    /** Color for operation-type states */
    operation: string;
    /** Color for switch/condition-type states */
    switch: string;
    /** Color for all other state types */
    default: string;
  };
}
