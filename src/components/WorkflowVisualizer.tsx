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
import NodeDetailPanel from './NodeDetailPanel';
import type { WorkflowDebugData, CombinedWorkflowData, NodeData } from '../types';
import { parseWorkflowData, parseCombinedWorkflowData } from '../utils/workflowParser';

interface WorkflowVisualizerProps {
  data: WorkflowDebugData | CombinedWorkflowData;
}

const nodeTypes: NodeTypes = {
  workflowNode: WorkflowNode,
};

// Type guard to check if data is CombinedWorkflowData
const isCombinedWorkflowData = (data: WorkflowDebugData | CombinedWorkflowData): data is CombinedWorkflowData => {
  return 'definition' in data && 'startState' in data;
};

const WorkflowVisualizer: React.FC<WorkflowVisualizerProps> = ({ data }) => {
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
    setDetailPanel({
      isOpen: true,
      nodeData,
      selectedNodeId: nodeId
    });
  }, []);

  const handleDetailPanelClose = React.useCallback(() => {
    setDetailPanel({
      isOpen: false,
      nodeData: null,
      selectedNodeId: null
    });
  }, []);

  // Create a wrapped node component that has access to the click handler
  const WrappedWorkflowNode = React.useCallback((props: any) => {
    const isSelected = detailPanel.selectedNodeId === props.id;
    return <WorkflowNode {...props} onNodeClick={handleNodeClick} isSelected={isSelected} />;
  }, [handleNodeClick, detailPanel.selectedNodeId]);

  const nodeTypesWithHandler: NodeTypes = React.useMemo(() => ({
    workflowNode: WrappedWorkflowNode,
  }), [WrappedWorkflowNode]);

  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    if (isCombinedWorkflowData(data)) {
      return parseCombinedWorkflowData(data);
    } else {
      return parseWorkflowData(data);
    }
  }, [data]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  // Update nodes and edges when data changes
  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = isCombinedWorkflowData(data)
      ? parseCombinedWorkflowData(data)
      : parseWorkflowData(data);
    
    setNodes(newNodes);
    setEdges(newEdges);
    
    // Fit view after a small delay to ensure nodes are rendered
    if (reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView();
      }, 100);
    }
  }, [data, setNodes, setEdges, reactFlowInstance]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '400px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypesWithHandler}
        fitView
        fitViewOptions={{
          padding: 100,
          minZoom: 0.3,
          maxZoom: 2
        }}
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
          position="top-right"
          nodeColor={(node) => {
            const nodeData = node.data as NodeData | undefined;
            const hasError = nodeData?.hasError;
            const wasExecuted = nodeData?.wasExecuted ?? true;
            const type = nodeData?.state?.type;
            
            if (hasError) return '#ef4444';
            if (!wasExecuted) return '#9ca3af';
            
            switch (type) {
              case 'operation': return '#10b981';
              case 'switch': return '#f59e0b';
              default: return '#6366f1';
            }
          }}
        />
        <Background 
          variant={"dots" as any} 
          gap={16} 
          size={1} 
          color="#d1d5db"
        />
      </ReactFlow>

      <NodeDetailPanel
        isOpen={detailPanel.isOpen}
        nodeData={detailPanel.nodeData}
        onClose={handleDetailPanelClose}
      />
    </div>
  );
};

export default WorkflowVisualizer; 