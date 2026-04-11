import './styles/workflow.css';

// Level 1: All-in-one component
export { default as WorkflowVisualizer } from './components/WorkflowVisualizer';
export type { WorkflowVisualizerProps } from './components/WorkflowVisualizer';

// Level 2: Composable components
export { default as WorkflowGraph } from './components/WorkflowGraph';
export type { WorkflowGraphProps } from './components/WorkflowGraph';
export { default as NodeDetailPanel } from './components/NodeDetailPanel';
export { default as WorkflowNode } from './components/WorkflowNode';
export { default as JsonModal } from './components/JsonModal';

// Level 3: Data utilities (framework-agnostic)
export {
  parseWorkflowData,
  parseCombinedWorkflowData,
  combineWorkflowData,
  formatDuration,
  getNodeTypeColor,
} from './utils/workflowParser';

// Types
export type {
  WorkflowAction,
  WorkflowState,
  WorkflowDebugData,
  WorkflowDefinitionAction,
  WorkflowCondition,
  WorkflowOnError,
  WorkflowDefinitionState,
  WorkflowDefinition,
  CombinedWorkflowState,
  CombinedWorkflowData,
  NodeData,
  WorkflowTheme,
} from './types';
