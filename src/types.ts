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

export interface NodeData {
  label: string;
  state: WorkflowState;
  duration: number;
  hasError: boolean;
  [key: string]: unknown;
} 