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

// New types for workflow definitions
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

// Add onError interface for error handling
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

// Combined data type that merges definition with execution
export interface CombinedWorkflowState {
  name: string;
  type: 'operation' | 'switch' | string;
  
  // From definition (always present)
  definition: WorkflowDefinitionState;
  
  // From execution (only present if this state was executed)
  execution?: WorkflowState;
  
  // Derived properties
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