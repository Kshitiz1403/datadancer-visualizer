import React from 'react';
import WorkflowGraph from './WorkflowGraph';
import NodeDetailPanel from './NodeDetailPanel';
import type { WorkflowDebugData, WorkflowDefinition, NodeData, WorkflowTheme } from '../types';

export interface WorkflowVisualizerProps {
  /** Workflow definition (structure). */
  workflow: WorkflowDefinition;
  /** Execution trace from a workflow run. Omit to render definition-only. */
  execution?: WorkflowDebugData;
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
  /** Enable dark mode. */
  darkMode?: boolean;
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

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({
  workflow,
  execution,
  onNodeClick,
  showDetailPanel = true,
  renderDetailPanel,
  theme,
  darkMode = false,
  fitView = true,
  minZoom = 0.3,
  maxZoom = 2,
  className,
  style,
}) => {
  const [detailPanel, setDetailPanel] = React.useState<{
    isOpen: boolean;
    nodeData: NodeData | null;
    selectedNodeId: string | null;
  }>({
    isOpen: false,
    nodeData: null,
    selectedNodeId: null
  });

  const handleNodeClick = React.useCallback((nodeData: NodeData, nodeId: string) => {
    onNodeClick?.(nodeData);

    if (showDetailPanel || renderDetailPanel) {
      setDetailPanel({ isOpen: true, nodeData, selectedNodeId: nodeId });
    }
  }, [onNodeClick, showDetailPanel, renderDetailPanel]);

  const handleDetailPanelClose = React.useCallback(() => {
    setDetailPanel({ isOpen: false, nodeData: null, selectedNodeId: null });
  }, []);

  const rootClass = ['wf-root', darkMode ? 'wf-dark' : '', className].filter(Boolean).join(' ');

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px', ...style }} className={rootClass}>
      <WorkflowGraph
        workflow={workflow}
        execution={execution}
        onNodeClick={handleNodeClick}
        selectedNodeId={detailPanel.selectedNodeId}
        theme={theme}
        darkMode={darkMode}
        fitView={fitView}
        minZoom={minZoom}
        maxZoom={maxZoom}
      />

      {renderDetailPanel && detailPanel.isOpen && detailPanel.nodeData
        ? renderDetailPanel(detailPanel.nodeData, handleDetailPanelClose)
        : showDetailPanel && (
            <NodeDetailPanel
              isOpen={detailPanel.isOpen}
              nodeData={detailPanel.nodeData}
              onClose={handleDetailPanelClose}
              darkMode={darkMode}
            />
          )
      }
    </div>
  );
};

export default WorkflowVisualizer;
