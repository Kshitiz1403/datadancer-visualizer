import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeData } from '../types';
import { formatDuration, getNodeTypeColor } from '../utils/workflowParser';
import JsonModal from './JsonModal';
import { 
  Clock, 
  AlertCircle, 
  Activity,
  GitBranch,
  Database,
  Eye,
  Zap,
  ZapOff
} from 'lucide-react';

interface WorkflowNodeProps {
  data: NodeData;
  onNodeClick?: (nodeData: NodeData, nodeId: string) => void;
  isSelected?: boolean;
  id?: string;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data, onNodeClick, isSelected, id }) => {
  const [modalData, setModalData] = useState<{ isOpen: boolean; title: string; data: any; subtitle?: string }>({
    isOpen: false,
    title: '',
    data: null,
    subtitle: ''
  });
  const { label, state, duration, hasError, wasExecuted } = data;
  
  const nodeColor = getNodeTypeColor(state.type, hasError, wasExecuted);
  
  const getTypeIcon = () => {
    const iconProps = {
      size: 16,
      style: { color: getNodeTypeColor(state.type, hasError, wasExecuted) }
    };
    
    switch (state.type) {
      case 'operation':
        return <Activity {...iconProps} />;
      case 'switch':
        return <GitBranch {...iconProps} />;
      default:
        return <Database {...iconProps} />;
    }
  };

  const openJsonModal = (title: string, data: any, subtitle?: string) => {
    setModalData({ isOpen: true, title, data, subtitle });
  };

  const closeJsonModal = () => {
    setModalData({ isOpen: false, title: '', data: null, subtitle: '' });
  };

  const nodeClass = hasError ? 'error' : state.type;
  const typeClass = hasError ? 'error' : !wasExecuted ? 'unexecuted' : state.type;
  const selectedClass = isSelected ? 'selected' : '';

  // Get data from execution if available, otherwise from definition
  const executionState = state.execution;
  const definitionState = state.definition;

  const handleNodeClick = (e: React.MouseEvent) => {
    // Don't trigger node click if clicking on expand button or action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onNodeClick?.(data, id || '');
  };

  const renderExecutedContent = () => {
    if (!executionState) return null;

    return (
      <>
        <div className="node-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{formatDuration(duration)}</span>
          </div>
          {executionState.actions && executionState.actions.length > 0 && (
            <div className="meta-item">
              <Activity size={14} />
              <span>{executionState.actions.length} action{executionState.actions.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="node-summary">
          {state.type === 'switch' && executionState.matchedCondition && (
            <div className="summary-item condition-item">
              <GitBranch size={12} />
              <span>Matched: {executionState.matchedCondition}</span>
            </div>
          )}
          
          {executionState.actions && executionState.actions.length > 0 && (
            <div className="summary-item actions-preview">
              <div className="actions-list">
                {executionState.actions.slice(0, 2).map((action, index) => (
                  <div key={index} className="action-preview">
                    <span className="action-preview-name">{action.activityName}</span>
                    <span className="action-preview-duration">
                      {formatDuration(
                        new Date(action.endTime).getTime() - new Date(action.startTime).getTime()
                      )}
                    </span>
                    {action.error && <AlertCircle size={10} className="action-preview-error" />}
                  </div>
                ))}
                {executionState.actions.length > 2 && (
                  <div className="action-preview more-actions">
                    +{executionState.actions.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="summary-item data-preview">
            <div className="data-preview-grid">
              <div className="data-preview-item">
                <span className="data-label">Input</span>
                <span className="data-preview-text">
                  {typeof executionState.input === 'object' ? 
                    `${Object.keys(executionState.input || {}).length} fields` : 
                    String(executionState.input).substring(0, 20) + '...'
                  }
                </span>
              </div>
              <div className="data-preview-item">
                <span className="data-label">Output</span>
                <span className="data-preview-text">
                  {typeof executionState.output === 'object' ? 
                    `${Object.keys(executionState.output || {}).length} fields` : 
                    String(executionState.output).substring(0, 20) + '...'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderUnexecutedContent = () => {
    return (
      <>
        <div className="node-meta">
          <div className="meta-item">
            <ZapOff size={14} />
            <span>Not executed</span>
          </div>
          {definitionState.actions && definitionState.actions.length > 0 && (
            <div className="meta-item">
              <Activity size={14} />
              <span>{definitionState.actions.length} planned action{definitionState.actions.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <div className="node-summary">
          {state.type === 'switch' && definitionState.dataConditions && (
            <div className="summary-item">
              <div className="actions-list">
                {definitionState.dataConditions.map((condition, index) => (
                  <div key={index} className="condition-item unexecuted">
                    <GitBranch size={12} />
                    <span>{condition.name}: {condition.condition}</span>
                  </div>
                ))}
                {definitionState.defaultCondition && (
                  <div className="condition-item unexecuted">
                    <GitBranch size={12} />
                    <span>default: fallback</span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {definitionState.actions && definitionState.actions.length > 0 && (
            <div className="summary-item actions-preview">
              <div className="actions-list">
                {definitionState.actions.slice(0, 2).map((action, index) => (
                  <div key={index} className="action-preview unexecuted">
                    <span className="action-preview-name">{action.functionRef.refName}</span>
                    <span className="action-preview-duration">planned</span>
                  </div>
                ))}
                {definitionState.actions.length > 2 && (
                  <div className="action-preview more-actions">
                    +{definitionState.actions.length - 2} more planned
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };



  return (
    <div className={`workflow-node ${nodeClass} ${selectedClass}`} onClick={handleNodeClick}>
      <Handle type="target" position={Position.Left} />
      
      <div className="node-header">
        <div className="node-title">
          {wasExecuted ? <Zap size={16} className="success-icon" /> : <ZapOff size={16} className="unexecuted-icon" />}
          {getTypeIcon()}
          <span>{label}</span>
          {hasError && (
            <AlertCircle size={16} className="error-icon" />
          )}
        </div>
      </div>

      <div className="node-content">
        {wasExecuted ? renderExecutedContent() : renderUnexecutedContent()}
      </div>

      <Handle type="source" position={Position.Right} />
      
      <JsonModal
        isOpen={modalData.isOpen}
        onClose={closeJsonModal}
        title={modalData.title}
        data={modalData.data}
        subtitle={modalData.subtitle}
      />
    </div>
  );
};

export default WorkflowNode; 