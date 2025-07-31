import React from 'react';
import type { NodeData } from '../types';
import { formatDuration } from '../utils/workflowParser';
import JsonModal from './JsonModal';
import { 
  X, 
  Clock, 
  Activity, 
  GitBranch, 
  Database,
  Eye,
  Zap,
  ZapOff,
  AlertCircle,
  ChevronRight,
  Shield,
  ShieldAlert
} from 'lucide-react';

interface NodeDetailPanelProps {
  isOpen: boolean;
  nodeData: NodeData | null;
  onClose: () => void;
}

const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ isOpen, nodeData, onClose }) => {
  const [modalData, setModalData] = React.useState<{ isOpen: boolean; title: string; data: any; subtitle?: string }>({
    isOpen: false,
    title: '',
    data: null,
    subtitle: ''
  });

  if (!isOpen || !nodeData) return null;

  const { label, state, duration, hasError, wasExecuted } = nodeData;
  const executionState = state.execution;
  const definitionState = state.definition;

  // Helper function to check if an error matches an error reference
  const matchesErrorRef = (errorMessage: string, errorRef: string): boolean => {
    if (!errorMessage || !errorRef) return false;
    return errorMessage.toLowerCase().includes(errorRef.toLowerCase());
  };

  // Helper function to find which error handler was triggered
  const getTriggeredErrorHandler = () => {
    if (!hasError || !definitionState.onErrors || !executionState) {
      return null;
    }
    
    const errorMessage = executionState.error || 
      executionState.actions?.find(action => action.error)?.error;
    
    if (!errorMessage) return null;
    
    // First, try to find specific error handlers (non-DefaultErrorRef)
    const specificHandler = definitionState.onErrors.find(errorHandler => 
      errorHandler.errorRef !== 'DefaultErrorRef' && matchesErrorRef(errorMessage, errorHandler.errorRef)
    );
    
    if (specificHandler) return specificHandler;
    
    // If no specific handler matched, try to find DefaultErrorRef as fallback
    return definitionState.onErrors.find(errorHandler => errorHandler.errorRef === 'DefaultErrorRef');
  };

  const triggeredErrorHandler = getTriggeredErrorHandler();

  const openJsonModal = (title: string, data: any, subtitle?: string) => {
    setModalData({ isOpen: true, title, data, subtitle });
  };

  const closeJsonModal = () => {
    setModalData({ isOpen: false, title: '', data: null, subtitle: '' });
  };

  const getTypeIcon = () => {
    const iconProps = { size: 20 };
    switch (state.type) {
      case 'operation':
        return <Activity {...iconProps} />;
      case 'switch':
        return <GitBranch {...iconProps} />;
      default:
        return <Database {...iconProps} />;
    }
  };

  return (
    <>
      {isOpen && (
        <>
          <div className="panel-overlay" onClick={onClose} />
          <div className="node-detail-panel open">
            <div className="panel-header">
              <div className="panel-title">
                <div className="title-main">
                  {wasExecuted ? <Zap size={18} className="success-icon" /> : <ZapOff size={18} className="unexecuted-icon" />}
                  {getTypeIcon()}
                  <span className="node-name">{label}</span>
                  {hasError && <AlertCircle size={18} className="error-icon" />}
                </div>
                <div className="title-meta">
                  <span className={`node-status ${wasExecuted ? 'executed' : 'unexecuted'}`}>
                    {wasExecuted ? 'Executed' : 'Not Executed'}
                  </span>
                  <span className="node-type-badge">{state.type}</span>
                </div>
              </div>
              <button className="panel-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

        <div className="panel-content">
          {/* Execution Summary */}
          <div className="detail-section">
            <h3>Execution Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <Clock size={16} />
                <span className="label">Duration</span>
                <span className="value">{wasExecuted ? formatDuration(duration) : 'N/A'}</span>
              </div>
              {executionState?.actions && (
                <div className="summary-item">
                  <Activity size={16} />
                  <span className="label">Actions</span>
                  <span className="value">{executionState.actions.length}</span>
                </div>
              )}
              {!wasExecuted && definitionState.actions && (
                <div className="summary-item">
                  <Activity size={16} />
                  <span className="label">Planned Actions</span>
                  <span className="value">{definitionState.actions.length}</span>
                </div>
              )}
            </div>
          </div>

          {/* Switch Conditions */}
          {state.type === 'switch' && (
            <div className="detail-section">
              <h3>Switch Conditions</h3>
              {wasExecuted && executionState?.matchedCondition ? (
                <div className="condition-result">
                  <div className="matched-condition">
                    <ChevronRight size={16} className="success-icon" />
                    <span>Matched: <strong>{executionState.matchedCondition}</strong></span>
                  </div>
                </div>
              ) : null}
              
              {definitionState.dataConditions && (
                <div className="conditions-list">
                  {definitionState.dataConditions.map((condition, index) => (
                    <div 
                      key={index} 
                      className={`condition-item ${
                        wasExecuted && executionState?.matchedCondition === condition.name ? 'matched' : 'unmatched'
                      }`}
                    >
                      <div className="condition-header">
                        <span className="condition-name">{condition.name}</span>
                        {wasExecuted && executionState?.matchedCondition === condition.name && (
                          <span className="condition-badge">Matched</span>
                        )}
                      </div>
                      <div className="condition-expression">{condition.condition}</div>
                      <div className="condition-target">→ {condition.transition.nextState}</div>
                    </div>
                  ))}
                  
                  {definitionState.defaultCondition && (
                    <div 
                      className={`condition-item ${
                        wasExecuted && executionState?.matchedCondition === 'default' ? 'matched' : 'unmatched'
                      }`}
                    >
                      <div className="condition-header">
                        <span className="condition-name">default</span>
                        {wasExecuted && executionState?.matchedCondition === 'default' && (
                          <span className="condition-badge">Matched</span>
                        )}
                      </div>
                      <div className="condition-expression">fallback condition</div>
                      <div className="condition-target">→ {definitionState.defaultCondition.transition.nextState}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Handlers */}
          {definitionState.onErrors && (
            <div className="detail-section">
              <h3>Error Handlers</h3>
              {hasError && triggeredErrorHandler && (
                <div className="error-handler-result">
                  <div className="triggered-handler">
                    <ShieldAlert size={16} className="error-icon" />
                    <span>Triggered: <strong>{triggeredErrorHandler.errorRef}</strong></span>
                  </div>
                </div>
              )}
              
              <div className="error-handlers-list">
                {definitionState.onErrors.map((errorHandler, index) => {
                  const isTriggered = hasError && triggeredErrorHandler?.errorRef === errorHandler.errorRef;
                  const nextState = typeof errorHandler.transition === 'string' 
                    ? errorHandler.transition 
                    : errorHandler.transition.nextState;
                  
                  return (
                    <div 
                      key={index} 
                      className={`error-handler-item ${isTriggered ? 'triggered' : 'not-triggered'}`}
                    >
                      <div className="error-handler-header">
                        <div className="error-handler-name">
                          {isTriggered ? (
                            <ShieldAlert size={16} className="error-icon" />
                          ) : (
                            <Shield size={16} className="shield-icon" />
                          )}
                          <span>{errorHandler.errorRef}</span>
                        </div>
                        {isTriggered && (
                          <span className="error-handler-badge">Triggered</span>
                        )}
                      </div>
                      <div className="error-handler-target">→ {nextState}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions Detail */}
          {((wasExecuted && executionState?.actions) || (!wasExecuted && definitionState.actions)) && (
            <div className="detail-section">
              <h3>{wasExecuted ? 'Executed Actions' : 'Planned Actions'}</h3>
              <div className="actions-detail">
                {wasExecuted && executionState?.actions ? (
                  executionState.actions.map((action, index) => (
                    <div key={index} className="action-detail-item">
                      <div className="action-header">
                        <span className="action-name">{action.activityName}</span>
                        <div className="action-meta">
                          <span className="action-duration">
                            {formatDuration(new Date(action.endTime).getTime() - new Date(action.startTime).getTime())}
                          </span>
                          {action.error && <AlertCircle size={14} className="error-icon" />}
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="detail-button"
                          onClick={() => openJsonModal(
                            `${label} > ${action.activityName} - Arguments`,
                            action.arguments,
                            'Action input arguments'
                          )}
                        >
                          <Eye size={14} />
                          Arguments
                        </button>
                        <button 
                          className={`detail-button ${action.error ? 'error' : ''}`}
                          onClick={() => openJsonModal(
                            `${label} > ${action.activityName} - ${action.error ? 'Error' : 'Output'}`,
                            action.output || action.error,
                            action.error ? 'Action error details' : 'Action output data'
                          )}
                        >
                          <Eye size={14} />
                          {action.error ? 'Error' : 'Output'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  definitionState.actions?.map((action, index) => (
                    <div key={index} className="action-detail-item planned">
                      <div className="action-header">
                        <span className="action-name">{action.functionRef.refName}</span>
                        <div className="action-meta">
                          <span className="action-duration">planned</span>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <button 
                          className="detail-button"
                          onClick={() => openJsonModal(
                            `${label} > ${action.functionRef.refName} - Arguments`,
                            action.functionRef.arguments,
                            'Planned action arguments'
                          )}
                        >
                          <Eye size={14} />
                          Arguments
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Input/Output Data */}
          <div className="detail-section">
            <h3>Data</h3>
            <div className="data-detail">
              {wasExecuted && executionState ? (
                <>
                  <div className="data-item">
                    <div className="data-header">
                      <span>Input Data</span>
                      <button 
                        className="detail-button small"
                        onClick={() => openJsonModal(`${label} - Input`, executionState.input, 'State input data')}
                      >
                        <Eye size={12} />
                        View Full
                      </button>
                    </div>
                    <pre className="data-preview">{JSON.stringify(executionState.input, null, 2).substring(0, 200)}...</pre>
                  </div>
                  <div className="data-item">
                    <div className="data-header">
                      <span>Output Data</span>
                      <button 
                        className="detail-button small"
                        onClick={() => openJsonModal(`${label} - Output`, executionState.output, 'State output data')}
                      >
                        <Eye size={12} />
                        View Full
                      </button>
                    </div>
                    <pre className="data-preview">{JSON.stringify(executionState.output, null, 2).substring(0, 200)}...</pre>
                  </div>
                </>
              ) : (
                <div className="data-item">
                  <div className="data-header">
                    <span>Definition</span>
                    <button 
                      className="detail-button small"
                      onClick={() => openJsonModal(`${label} - Definition`, definitionState, 'State definition')}
                    >
                      <Eye size={12} />
                      View Full
                    </button>
                  </div>
                  <pre className="data-preview">{JSON.stringify(definitionState, null, 2).substring(0, 200)}...</pre>
                </div>
              )}
            </div>
          </div>

          {/* Error Details */}
          {hasError && wasExecuted && executionState && (
            <div className="detail-section error-section">
              <h3>Error Details</h3>
              <div className="error-details">
                {executionState.error && (
                  <div className="error-message">{executionState.error}</div>
                )}
                {executionState.actions?.map((action, index) => 
                  action.error && (
                    <div key={index} className="error-message">
                      <strong>{action.activityName}:</strong> {action.error}
                    </div>
                  )
                )}
              </div>
            </div>
            )}
          </div>
        </div>

        <JsonModal
          isOpen={modalData.isOpen}
          onClose={closeJsonModal}
          title={modalData.title}
          data={modalData.data}
          subtitle={modalData.subtitle}
        />
      </>
    )}
    </>
  );
};

export default NodeDetailPanel; 