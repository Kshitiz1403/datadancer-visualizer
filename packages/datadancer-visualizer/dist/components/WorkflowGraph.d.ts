import { default as React } from 'react';
import { WorkflowDebugData, CombinedWorkflowData, NodeData, WorkflowTheme } from '../types';
/** Internal React context for passing the resolved theme to WorkflowNode. */
export declare const WorkflowThemeContext: React.Context<WorkflowTheme>;
export interface WorkflowGraphProps {
    /** Workflow data to render — either combined definition+execution or execution-only. */
    data: WorkflowDebugData | CombinedWorkflowData;
    /** Called when a node is clicked. */
    onNodeClick?: (nodeData: NodeData, nodeId: string) => void;
    /** ID of the currently selected node (controls selection highlight). */
    selectedNodeId?: string | null;
    /** Override default node/edge colors. */
    theme?: Partial<WorkflowTheme>;
    /** Auto-fit the graph on data load (default: true). */
    fitView?: boolean;
    /** Minimum zoom level (default: 0.3). */
    minZoom?: number;
    /** Maximum zoom level (default: 2). */
    maxZoom?: number;
    /** CSS class applied to the root element. */
    className?: string;
    /** Inline styles applied to the root element. */
    style?: React.CSSProperties;
}
declare const WorkflowGraph: React.FC<WorkflowGraphProps>;
export default WorkflowGraph;
