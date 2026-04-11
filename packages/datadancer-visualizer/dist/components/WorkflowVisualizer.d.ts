import { default as React } from 'react';
import { WorkflowDebugData, CombinedWorkflowData, NodeData, WorkflowTheme } from '../types';
export interface WorkflowVisualizerProps {
    /** Workflow data to render — either combined definition+execution or execution-only. */
    data: WorkflowDebugData | CombinedWorkflowData;
    /** Called when a node is clicked (fires alongside the built-in detail panel). */
    onNodeClick?: (nodeData: NodeData) => void;
    /**
     * Whether to show the built-in right-side detail panel on node click.
     * Set to false to suppress it and handle display yourself via onNodeClick.
     * Default: true.
     */
    showDetailPanel?: boolean;
    /**
     * Replace the built-in detail panel with a custom render function.
     * Receives the clicked node data and a close callback.
     */
    renderDetailPanel?: (nodeData: NodeData, onClose: () => void) => React.ReactNode;
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
declare const WorkflowVisualizer: React.FC<WorkflowVisualizerProps>;
export default WorkflowVisualizer;
