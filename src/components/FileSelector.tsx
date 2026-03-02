import React, { useState, useEffect } from 'react';
import type { WorkflowDebugData, WorkflowDefinition, CombinedWorkflowData } from '../types';
import { FileText, Upload, GitBranch, Activity, ChevronDown } from 'lucide-react';
import { combineWorkflowData } from '../utils/workflowParser';

interface FileSelectorProps {
  onDataLoad: (data: WorkflowDebugData | CombinedWorkflowData, filename: string) => void;
}

// Workflow definitions (complete workflows)
const WORKFLOW_DEFINITIONS = [
  'email_workflow.json',
  'loan_workflow.json',
  'error_handling_workflow.json',
  'custom_activity_workflow.json',
  'sleep_workflow.json',
  'html_unescape_workflow.json'
];

// Debug execution files (what actually ran)
const DEBUG_EXECUTIONS = [
  'email_workflow_standard_debug.json',
  'email_workflow_business_debug.json',
  'email_workflow_premium_debug.json',
  'loan_workflow_low_risk_application_debug.json',
  'loan_workflow_medium_risk_application_debug.json',
  'error_handling_Timeout Error_debug.json',
  'error_handling_Connection Error_debug.json',
  'error_handling_Successful Order Processing_debug.json',
  'custom_activity_workflow_debug.json',
  'sleep_workflow_normal_execution_debug.json',
  'sleep_workflow_invalid_duration_execution_debug.json'
];

// Suggested combinations (workflow + execution pairs)
const SUGGESTED_COMBINATIONS = [
  {
    workflow: 'email_workflow.json',
    executions: [
      'email_workflow_standard_debug.json',
      'email_workflow_business_debug.json',
      'email_workflow_premium_debug.json'
    ],
    name: 'Email Workflow'
  },
  {
    workflow: 'loan_workflow.json',
    executions: [
      'loan_workflow_low_risk_application_debug.json',
      'loan_workflow_medium_risk_application_debug.json'
    ],
    name: 'Loan Application'
  },
  {
    workflow: 'error_handling_workflow.json',
    executions: [
      'error_handling_Timeout Error_debug.json',
      'error_handling_Connection Error_debug.json',
      'error_handling_Successful Order Processing_debug.json'
    ],
    name: 'Error Handling'
  },
  {
    workflow: 'custom_activity_workflow.json',
    executions: ['custom_activity_workflow_debug.json'],
    name: 'Custom Activity'
  },
  {
    workflow: 'sleep_workflow.json',
    executions: [
      'sleep_workflow_normal_execution_debug.json',
      'sleep_workflow_invalid_duration_execution_debug.json'
    ],
    name: 'Sleep Workflow'
  }
];

const FileSelector: React.FC<FileSelectorProps> = ({ onDataLoad }) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  const [selectedExecution, setSelectedExecution] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [mode, setMode] = useState<'combined' | 'debug-only'>('combined');
  const [pasteExpanded, setPasteExpanded] = useState(false);
  const [pasteDefJson, setPasteDefJson] = useState('');
  const [pasteDebugJson, setPasteDebugJson] = useState('');
  const [pasteDefError, setPasteDefError] = useState<string | null>(null);
  const [pasteDebugError, setPasteDebugError] = useState<string | null>(null);

  const loadFile = async (filename: string): Promise<any> => {
    const baseUrl = import.meta.env.BASE_URL || '/';
    const url = `${baseUrl}examples/${filename}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    return await response.json();
  };

  const loadCombinedWorkflow = async (workflowFile: string, executionFile: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const [workflowDef, executionDebug] = await Promise.all([
        loadFile(workflowFile),
        loadFile(executionFile)
      ]);
      
      const combinedData = combineWorkflowData(workflowDef, executionDebug);
      onDataLoad(combinedData, `${workflowFile} + ${executionFile}`);
      setSelectedWorkflow(workflowFile);
      setSelectedExecution(executionFile);
    } catch (err) {
      setError(`Error loading files: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflowOnly = async (workflowFile: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const workflowDef = await loadFile(workflowFile);
      const combinedData = combineWorkflowData(workflowDef); // No execution data
      onDataLoad(combinedData, workflowFile);
      setSelectedWorkflow(workflowFile);
      setSelectedExecution('');
    } catch (err) {
      setError(`Error loading workflow: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDebugOnly = async (debugFile: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const debugData = await loadFile(debugFile);
      onDataLoad(debugData, debugFile);
      setSelectedWorkflow('');
      setSelectedExecution(debugFile);
    } catch (err) {
      setError(`Error loading debug file: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Try to detect if it's a workflow definition or debug data
        if (data.states && data.version && data.specVersion) {
          // Looks like a workflow definition
          const combinedData = combineWorkflowData(data);
          onDataLoad(combinedData, file.name);
        } else if (data.states && data.states[0]?.startTime) {
          // Looks like debug data
          onDataLoad(data, file.name);
        } else {
          throw new Error('Unrecognized file format');
        }
        
        setSelectedWorkflow(file.name);
        setSelectedExecution('');
        setError('');
      } catch (err) {
        setError('Invalid JSON file or unrecognized format');
      }
    };
    reader.readAsText(file);
  };

  const validateDefinitionJson = (raw: string) => {
    if (!raw.trim()) { setPasteDefError(null); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.states || !parsed.version || !parsed.specVersion) {
        setPasteDefError('Missing required fields: states, version, or specVersion');
      } else {
        setPasteDefError(null);
      }
    } catch {
      setPasteDefError('Invalid JSON syntax');
    }
  };

  const validateDebugJson = (raw: string) => {
    if (!raw.trim()) { setPasteDebugError(null); return; }
    try {
      const parsed = JSON.parse(raw);
      if (!parsed.states || !Array.isArray(parsed.states)) {
        setPasteDebugError('Expected { states: [...] } format');
      } else if (parsed.states.length > 0 && !parsed.states[0].startTime) {
        setPasteDebugError('States appear to be definitions, not debug execution data');
      } else {
        setPasteDebugError(null);
      }
    } catch {
      setPasteDebugError('Invalid JSON syntax');
    }
  };

  const handlePasteVisualize = () => {
    const hasDefinition = pasteDefJson.trim().length > 0;
    const hasDebug = pasteDebugJson.trim().length > 0;
    if (!hasDefinition && !hasDebug) {
      setError('Paste at least one JSON block to visualize');
      return;
    }
    setError('');
    try {
      let result: WorkflowDebugData | CombinedWorkflowData;
      let label: string;
      if (hasDefinition && hasDebug) {
        const def: WorkflowDefinition = JSON.parse(pasteDefJson);
        const debug: WorkflowDebugData = JSON.parse(pasteDebugJson);
        result = combineWorkflowData(def, debug);
        label = `Pasted: ${def.name || def.id} + execution`;
      } else if (hasDefinition) {
        const def: WorkflowDefinition = JSON.parse(pasteDefJson);
        result = combineWorkflowData(def);
        label = `Pasted: ${def.name || def.id}`;
      } else {
        const debug: WorkflowDebugData = JSON.parse(pasteDebugJson);
        result = debug;
        label = 'Pasted: execution trace';
      }
      onDataLoad(result, label);
      setSelectedWorkflow('');
      setSelectedExecution('');
    } catch (err) {
      setError(`Could not parse JSON: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Load first example by default
  useEffect(() => {
    if (SUGGESTED_COMBINATIONS.length > 0) {
      const first = SUGGESTED_COMBINATIONS[0];
      loadCombinedWorkflow(first.workflow, first.executions[0]);
    }
  }, []);

  const canVisualize =
    (pasteDefJson.trim().length > 0 || pasteDebugJson.trim().length > 0) &&
    pasteDefError === null &&
    pasteDebugError === null;

  return (
    <div className="file-selector">
      <div className="selector-header">
        <h2>Workflow Visualizer</h2>
        <p>View complete workflows with execution highlights</p>
      </div>

      <div className="file-controls">
        {/* Paste JSON Section */}
        <div className="paste-section">
          <button
            className="paste-section-toggle"
            onClick={() => setPasteExpanded(!pasteExpanded)}
          >
            <span>Paste Your Own JSON</span>
            <ChevronDown
              size={16}
              style={{
                transform: pasteExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            />
          </button>
          {pasteExpanded && (
            <div className="paste-section-body">
              <div className="paste-field">
                <label className="paste-label">
                  <GitBranch size={14} />
                  Workflow Definition JSON
                  <span className="paste-optional">(optional)</span>
                </label>
                <textarea
                  className={`paste-textarea${pasteDefError ? ' paste-textarea--error' : ''}`}
                  value={pasteDefJson}
                  onChange={(e) => { setPasteDefJson(e.target.value); validateDefinitionJson(e.target.value); }}
                  placeholder={'{\n  "id": "my-workflow",\n  "version": "1.0",\n  "specVersion": "0.8",\n  "name": "My Workflow",\n  "start": "FirstState",\n  "states": [...]\n}'}
                  rows={6}
                  spellCheck={false}
                />
                {pasteDefError && <span className="paste-error-text">{pasteDefError}</span>}
              </div>
              <div className="paste-field">
                <label className="paste-label">
                  <Activity size={14} />
                  Debug Execution JSON
                  <span className="paste-optional">(optional)</span>
                </label>
                <textarea
                  className={`paste-textarea${pasteDebugError ? ' paste-textarea--error' : ''}`}
                  value={pasteDebugJson}
                  onChange={(e) => { setPasteDebugJson(e.target.value); validateDebugJson(e.target.value); }}
                  placeholder={'{\n  "states": [\n    {\n      "name": "FirstState",\n      "startTime": "...",\n      "endTime": "..."\n    }\n  ]\n}'}
                  rows={6}
                  spellCheck={false}
                />
                {pasteDebugError && <span className="paste-error-text">{pasteDebugError}</span>}
              </div>
              <button
                className="paste-visualize-btn"
                onClick={handlePasteVisualize}
                disabled={!canVisualize}
              >
                <FileText size={16} />
                <span>Visualize</span>
              </button>
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="mode-toggle">
          <h3>Visualization Mode</h3>
          <div className="mode-buttons">
            <button
              className={`mode-button ${mode === 'combined' ? 'active' : ''}`}
              onClick={() => setMode('combined')}
            >
              <GitBranch size={16} />
              <span>Complete Workflow</span>
            </button>
            <button
              className={`mode-button ${mode === 'debug-only' ? 'active' : ''}`}
              onClick={() => setMode('debug-only')}
            >
              <Activity size={16} />
              <span>Debug Only</span>
            </button>
          </div>
          <p className="mode-description">
            {mode === 'combined' 
              ? 'Show complete workflow structure with execution highlights'
              : 'Show only executed states (legacy mode)'
            }
          </p>
        </div>

        {mode === 'combined' ? (
          <>
            {/* Suggested Combinations */}
            <div className="suggested-combinations">
              <h3>Quick Start - Workflow + Execution</h3>
              <div className="combination-grid">
                {SUGGESTED_COMBINATIONS.map((combo) => (
                  <div key={combo.name} className="combination-group">
                    <h4>{combo.name}</h4>
                    <div className="execution-buttons">
                      {combo.executions.map((execution) => (
                        <button
                          key={execution}
                          className={`execution-button ${
                            selectedWorkflow === combo.workflow && selectedExecution === execution ? 'active' : ''
                          }`}
                          onClick={() => loadCombinedWorkflow(combo.workflow, execution)}
                          disabled={isLoading}
                        >
                          <Activity size={14} />
                          <span>{execution.replace(`${combo.workflow.replace('.json', '')}_`, '').replace('_debug.json', '').replace(/_/g, ' ')}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Individual Workflow Definitions */}
            <div className="workflow-definitions">
              <h3>Workflow Definitions (No Execution)</h3>
              <div className="file-grid">
                {WORKFLOW_DEFINITIONS.map((filename) => (
                  <button
                    key={filename}
                    className={`file-button ${selectedWorkflow === filename && !selectedExecution ? 'active' : ''}`}
                    onClick={() => loadWorkflowOnly(filename)}
                    disabled={isLoading}
                  >
                    <GitBranch size={16} />
                    <span>{filename.replace('_workflow.json', '').replace(/_/g, ' ')}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Debug Only Mode */
          <div className="debug-files">
            <h3>Debug Execution Files</h3>
            <div className="file-grid">
              {DEBUG_EXECUTIONS.map((filename) => (
                <button
                  key={filename}
                  className={`file-button ${selectedExecution === filename ? 'active' : ''}`}
                  onClick={() => loadDebugOnly(filename)}
                  disabled={isLoading}
                >
                  <Activity size={16} />
                  <span>{filename.replace('_debug.json', '').replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="upload-section">
          <h3>Upload Custom File</h3>
          <label className="upload-button">
            <Upload size={16} />
            <span>Choose JSON file</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
        </div>

      </div>

      {isLoading && <div className="loading">Loading workflow...</div>}
      {error && <div className="error">{error}</div>}
      {(selectedWorkflow || selectedExecution) && !isLoading && !error && (
        <div className="current-file">
          Currently viewing: <strong>
            {selectedWorkflow && selectedExecution 
              ? `${selectedWorkflow} + ${selectedExecution}`
              : selectedWorkflow || selectedExecution
            }
          </strong>
        </div>
      )}
    </div>
  );
};

export default FileSelector; 