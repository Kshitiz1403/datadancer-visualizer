import React, { useState, useEffect } from 'react';
import type { WorkflowDebugData } from '../types';
import { FileText, Upload } from 'lucide-react';

interface FileSelectorProps {
  onDataLoad: (data: WorkflowDebugData, filename: string) => void;
}

const EXAMPLE_FILES = [
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

const FileSelector: React.FC<FileSelectorProps> = ({ onDataLoad }) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const loadExampleFile = async (filename: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/examples/${filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load ${filename}`);
      }
      
      const data = await response.json();
      onDataLoad(data, filename);
      setSelectedFile(filename);
    } catch (err) {
      setError(`Error loading file: ${err instanceof Error ? err.message : 'Unknown error'}`);
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
        onDataLoad(data, file.name);
        setSelectedFile(file.name);
        setError('');
      } catch (err) {
        setError('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  // Load first example by default
  useEffect(() => {
    if (EXAMPLE_FILES.length > 0) {
      loadExampleFile(EXAMPLE_FILES[0]);
    }
  }, []);

  return (
    <div className="file-selector">
      <div className="selector-header">
        <h2>Workflow Debug Visualizer</h2>
        <p>Select an example workflow or upload your own debug file</p>
      </div>

      <div className="file-controls">
        <div className="example-files">
          <h3>Example Workflows</h3>
          <div className="file-grid">
            {EXAMPLE_FILES.map((filename) => (
              <button
                key={filename}
                className={`file-button ${selectedFile === filename ? 'active' : ''}`}
                onClick={() => loadExampleFile(filename)}
                disabled={isLoading}
              >
                <FileText size={16} />
                <span>{filename.replace('_debug.json', '').replace(/_/g, ' ')}</span>
              </button>
            ))}
          </div>
        </div>

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
      {selectedFile && !isLoading && !error && (
        <div className="current-file">
          Currently viewing: <strong>{selectedFile}</strong>
        </div>
      )}
    </div>
  );
};

export default FileSelector; 