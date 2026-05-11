import { default as React } from 'react';
import { NodeData } from '../types';
interface NodeDetailPanelProps {
    isOpen: boolean;
    nodeData: NodeData | null;
    onClose: () => void;
    darkMode?: boolean;
}
declare const NodeDetailPanel: React.FC<NodeDetailPanelProps>;
export default NodeDetailPanel;
