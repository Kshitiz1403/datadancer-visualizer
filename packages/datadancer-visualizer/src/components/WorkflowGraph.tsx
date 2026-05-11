import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState
} from '@xyflow/react';
import type { NodeTypes } from '@xyflow/react';
import WorkflowNode from './WorkflowNode';
import type { WorkflowDebugData, WorkflowDefinition, NodeData, WorkflowTheme } from '../types';
import { parseCombinedWorkflowData, combineWorkflowData, getNodeTypeColor } from '../utils/workflowParser';

const DEFAULT_THEME: WorkflowTheme = {
  colors: {
    executed: '#10b981',
    unexecuted: '#9ca3af',
    error: '#ef4444',
    operation: '#10b981',
    switch: '#f59e0b',
    default: '#6366f1',
  }
};

const DEFAULT_DARK_THEME: WorkflowTheme = {
  colors: {
    executed: '#34d399',
    unexecuted: '#9ca3af',
    error: '#f87171',
    operation: '#34d399',
    switch: '#fbbf24',
    default: '#818cf8',
  }
};

/** Internal React context for passing the resolved theme to WorkflowNode. */
export const WorkflowThemeContext = React.createContext<WorkflowTheme>(DEFAULT_THEME);

export interface WorkflowGraphProps {
  /** Workflow definition (structure). */
  workflow: WorkflowDefinition;
  /** Execution trace from a workflow run. Omit to render definition-only. */
  execution?: WorkflowDebugData;
  /** Called when a node is clicked. */
  onNodeClick?: (nodeData: NodeData, nodeId: string) => void;
  /** ID of the currently selected node (controls selection highlight). */
  selectedNodeId?: string | null;
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

const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  workflow,
  execution,
  onNodeClick,
  selectedNodeId = null,
  theme: themeProp,
  darkMode = false,
  fitView = true,
  minZoom = 0.3,
  maxZoom = 2,
  className,
  style,
}) => {
  const theme = useMemo<WorkflowTheme>(() => {
    const defaultTheme = darkMode ? DEFAULT_DARK_THEME : DEFAULT_THEME;
    return { colors: { ...defaultTheme.colors, ...themeProp?.colors } };
  }, [themeProp, darkMode]);

  const WrappedWorkflowNode = React.useCallback((props: any) => {
    const isSelected = selectedNodeId === props.id;
    return <WorkflowNode {...props} onNodeClick={onNodeClick} isSelected={isSelected} />;
  }, [onNodeClick, selectedNodeId]);

  const nodeTypesWithHandler: NodeTypes = React.useMemo(() => ({
    workflowNode: WrappedWorkflowNode,
  }), [WrappedWorkflowNode]);

  const combinedData = useMemo(() => combineWorkflowData(workflow, execution), [workflow, execution]);
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => parseCombinedWorkflowData(combinedData),
    [combinedData]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = parseCombinedWorkflowData(
      combineWorkflowData(workflow, execution)
    );
    setNodes(newNodes);
    setEdges(newEdges);

    if (reactFlowInstance) {
      setTimeout(() => reactFlowInstance.fitView(), 100);
    }
  }, [workflow, execution, setNodes, setEdges, reactFlowInstance]);

  const rootClass = ['wf-root', darkMode ? 'wf-dark' : '', className].filter(Boolean).join(' ');

  return (
    <WorkflowThemeContext.Provider value={theme}>
      <div
        className={rootClass}
        style={{ width: '100%', height: '100%', minHeight: '400px', ...style }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypesWithHandler}
          fitView={fitView}
          fitViewOptions={{ padding: 100, minZoom, maxZoom }}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: true }}
          onInit={(instance) => {
            setReactFlowInstance(instance);
            setTimeout(() => instance.fitView(), 100);
          }}
          panOnScroll={true}
          zoomOnScroll={true}
          zoomOnPinch={true}
          panOnScrollSpeed={0.85}
          key={`workflow-${nodes.length}-${edges.length}`}
        >
          <Controls position="bottom-left" />
          <MiniMap
            position="bottom-right"
            bgColor={darkMode ? '#111827' : '#f8fafc'}
            maskColor={darkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(240, 240, 240, 0.6)'}
            nodeColor={(node) => {
              const nodeData = node.data as NodeData | undefined;
              return getNodeTypeColor(
                nodeData?.state?.type ?? '',
                nodeData?.hasError ?? false,
                nodeData?.wasExecuted ?? true,
                theme
              );
            }}
          />
          <Background variant={"dots" as any} gap={16} size={1} color={darkMode ? '#374151' : '#d1d5db'} />
        </ReactFlow>
      </div>
    </WorkflowThemeContext.Provider>
  );
};

export default WorkflowGraph;
