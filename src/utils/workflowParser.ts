import type { Node, Edge } from '@xyflow/react';
import type { WorkflowDebugData, NodeData } from '../types';

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
      state,
      duration,
      hasError
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

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  return `${(milliseconds / 1000).toFixed(2)}s`;
};

export const getNodeTypeColor = (type: string, hasError: boolean): string => {
  if (hasError) return '#ef4444';
  
  switch (type) {
    case 'operation':
      return '#10b981'; // Emerald - clearly green
    case 'switch':
      return '#f59e0b'; // Amber - clearly orange/yellow
    default:
      return '#6366f1'; // Indigo - clearly purple
  }
}; 