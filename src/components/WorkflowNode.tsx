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
  Eye,
  Zap,
  ZapOff
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

  // Get data from execution if available, otherwise from definition
  const executionState = state.execution;
  const definitionState = state.definition;

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

  const renderExpandedExecutedContent = () => {
    if (!executionState) return null;

    return (
      <>
        {executionState.actions && executionState.actions.length > 0 && (
          <div className="actions-section">
            <h4>Actions ({executionState.actions.length})</h4>
            {executionState.actions.map((action, index) => (
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
            {executionState.error && <div className="error-message">{executionState.error}</div>}
            {executionState.actions?.map((action, index) => 
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
                onClick={() => openJsonModal(`${label} - Input`, executionState.input, 'State input data')}
                title="View full input"
              >
                <Eye size={14} />
              </button>
            </div>
            <pre className="io-content">{JSON.stringify(executionState.input, null, 2)}</pre>
          </div>
          <div className="io-item">
            <div className="io-header">
              <h4>Output</h4>
              <button 
                className="io-expand-btn"
                onClick={() => openJsonModal(`${label} - Output`, executionState.output, 'State output data')}
                title="View full output"
              >
                <Eye size={14} />
              </button>
            </div>
            <pre className="io-content">{JSON.stringify(executionState.output, null, 2)}</pre>
          </div>
        </div>
      </>
    );
  };

  const renderExpandedUnexecutedContent = () => {
    return (
      <>
        {definitionState.actions && definitionState.actions.length > 0 && (
          <div className="actions-section">
            <h4>Planned Actions ({definitionState.actions.length})</h4>
            {definitionState.actions.map((action, index) => (
              <div key={index} className="action-item">
                <div className="action-main">
                  <div className="action-header">
                    <span className="action-name">{action.functionRef.refName}</span>
                  </div>
                  <div className="action-duration">would execute</div>
                </div>
                <div className="action-data-buttons">
                  <button
                    className="action-data-btn"
                    onClick={() => openJsonModal(
                      `${label} > ${action.functionRef.refName} - Arguments`,
                      action.functionRef.arguments,
                      'Planned action arguments'
                    )}
                    title="View planned action arguments"
                  >
                    <Eye size={12} />
                    Args
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {state.type === 'switch' && (
          <div className="io-section">
            <div className="io-item">
              <div className="io-header">
                <h4>Conditions</h4>
              </div>
              <pre className="io-content">
                {JSON.stringify({
                  dataConditions: definitionState.dataConditions || [],
                  defaultCondition: definitionState.defaultCondition || null
                }, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {definitionState.actions && definitionState.actions.length > 0 && (
          <div className="io-section">
            <div className="io-item">
              <div className="io-header">
                <h4>Definition</h4>
                <button 
                  className="io-expand-btn"
                  onClick={() => openJsonModal(`${label} - Definition`, definitionState, 'State definition')}
                  title="View full definition"
                >
                  <Eye size={14} />
                </button>
              </div>
              <pre className="io-content">{JSON.stringify(definitionState, null, 2)}</pre>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={`workflow-node ${nodeClass}`}>
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
        <button 
          className="expand-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      </div>

      <div className="node-content">
        {wasExecuted ? renderExecutedContent() : renderUnexecutedContent()}

        {isExpanded && (
          <div className="expanded-content">
            {wasExecuted ? renderExpandedExecutedContent() : renderExpandedUnexecutedContent()}
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