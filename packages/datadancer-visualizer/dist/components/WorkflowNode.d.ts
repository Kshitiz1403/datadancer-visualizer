import { default as React } from 'react';
import { NodeData } from '../types';
interface WorkflowNodeProps {
    data: NodeData;
    onNodeClick?: (nodeData: NodeData, nodeId: string) => void;
    isSelected?: boolean;
    id?: string;
}
declare const WorkflowNode: React.FC<WorkflowNodeProps>;
export default WorkflowNode;
