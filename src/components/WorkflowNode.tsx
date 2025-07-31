import React, { useState } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeData } from '../types';
import { formatDuration, getNodeTypeColor } from '../utils/workflowParser';
import JsonModal from './JsonModal';
import { 
  Clock, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  Activity,
  GitBranch,
  Database,
  Eye
} from 'lucide-react';

interface WorkflowNodeProps {
  data: NodeData;
}

const WorkflowNode: React.FC<WorkflowNodeProps> = ({ data }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalData, setModalData] = useState<{ isOpen: boolean; title: string; data: any; subtitle?: string }>({
    isOpen: false,
    title: '',
    data: null,
    subtitle: ''
  });
  const { label, state, duration, hasError } = data;
  
  const nodeColor = getNodeTypeColor(state.type, hasError);
  
  const getTypeIcon = () => {
    const iconProps = {
      size: 16,
      style: { color: getNodeTypeColor(state.type, hasError) }
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
  const typeClass = hasError ? 'error' : state.type;

  return (
    <div className={`workflow-node ${nodeClass}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="node-header">
        <div className="node-title">
          {getTypeIcon()}
          <span>{label}</span>
          {hasError && (
            <AlertCircle size={16} className="error-icon" />
          )}
        </div>
        <button 
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="node-content">
        <div className="node-meta">
          <div className="meta-item">
            <Clock size={14} />
            <span>{formatDuration(duration)}</span>
          </div>
          {state.actions && state.actions.length > 0 && (
            <div className="meta-item">
              <Activity size={14} />
              <span>{state.actions.length} action{state.actions.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Show key information based on node type */}
        <div className="node-summary">
          {state.type === 'switch' && state.matchedCondition && (
            <div className="summary-item condition-item">
              <GitBranch size={12} />
              <span>Condition: {state.matchedCondition}</span>
            </div>
          )}
          
          {state.actions && state.actions.length > 0 && (
            <div className="summary-item actions-preview">
              <div className="actions-list">
                {state.actions.slice(0, 2).map((action, index) => (
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
                {state.actions.length > 2 && (
                  <div className="action-preview more-actions">
                    +{state.actions.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show input/output data preview */}
          <div className="summary-item data-preview">
            <div className="data-preview-grid">
              <div className="data-preview-item">
                <span className="data-label">Input</span>
                <span className="data-preview-text">
                  {typeof state.input === 'object' ? 
                    `${Object.keys(state.input || {}).length} fields` : 
                    String(state.input).substring(0, 20) + '...'
                  }
                </span>
              </div>
              <div className="data-preview-item">
                <span className="data-label">Output</span>
                <span className="data-preview-text">
                  {typeof state.output === 'object' ? 
                    `${Object.keys(state.output || {}).length} fields` : 
                    String(state.output).substring(0, 20) + '...'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>



        {isExpanded && (
          <div className="expanded-content">
            {state.actions && state.actions.length > 0 && (
              <div className="actions-section">
                <h4>Actions ({state.actions.length})</h4>
                {state.actions.map((action, index) => (
                  <div key={index} className="action-item">
                    <div className="action-main">
                      <div className="action-header">
                        <span className="action-name">{action.activityName}</span>
                        {action.error && <AlertCircle size={12} className="action-error" />}
                      </div>
                      <div className="action-duration">
                        {formatDuration(
                          new Date(action.endTime).getTime() - new Date(action.startTime).getTime()
                        )}
                      </div>
                    </div>
                    <div className="action-data-buttons">
                      <button
                        className="action-data-btn"
                        onClick={() => openJsonModal(
                          `${label} > ${action.activityName} - Arguments`,
                          action.arguments,
                          'Action input arguments'
                        )}
                        title="View action arguments"
                      >
                        <Eye size={12} />
                        Args
                      </button>
                      <button
                        className={`action-data-btn ${action.error ? 'action-error-btn' : ''}`}
                        onClick={() => openJsonModal(
                          `${label} > ${action.activityName} - Output`,
                          action.output || action.error,
                          action.error ? 'Action error details' : 'Action output data'
                        )}
                        title={action.error ? "View action error" : "View action output"}
                      >
                        <Eye size={12} />
                        {action.error ? 'Error' : 'Out'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {hasError && (
              <div className="error-section">
                <h4>Errors</h4>
                {state.error && <div className="error-message">{state.error}</div>}
                {state.actions?.map((action, index) => 
                  action.error && (
                    <div key={index} className="error-message">
                      {action.activityName}: {action.error}
                    </div>
                  )
                )}
              </div>
            )}

            <div className="io-section">
              <div className="io-item">
                <div className="io-header">
                  <h4>Input</h4>
                  <button 
                    className="io-expand-btn"
                    onClick={() => openJsonModal(`${label} - Input`, state.input, 'State input data')}
                    title="View full input"
                  >
                    <Eye size={14} />
                  </button>
                </div>
                <pre className="io-content">{JSON.stringify(state.input, null, 2)}</pre>
              </div>
              <div className="io-item">
                <div className="io-header">
                  <h4>Output</h4>
                  <button 
                    className="io-expand-btn"
                    onClick={() => openJsonModal(`${label} - Output`, state.output, 'State output data')}
                    title="View full output"
                  >
                    <Eye size={14} />
                  </button>
                </div>
                <pre className="io-content">{JSON.stringify(state.output, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
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