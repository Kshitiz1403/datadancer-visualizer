import React, { useState } from 'react';
import '@xyflow/react/dist/style.css';
import './App.css';
import WorkflowVisualizer from './components/WorkflowVisualizer';
import FileSelector from './components/FileSelector';
import type { WorkflowDebugData, CombinedWorkflowData } from './types';

function App() {
  const [workflowData, setWorkflowData] = useState<WorkflowDebugData | CombinedWorkflowData | null>(null);
  const [currentFile, setCurrentFile] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleDataLoad = (data: WorkflowDebugData | CombinedWorkflowData, filename: string) => {
    setWorkflowData(data);
    setCurrentFile(filename);
    setSidebarOpen(false); // Close sidebar after selecting a file
  };

  return (
    <div className="App">
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <FileSelector onDataLoad={handleDataLoad} />
      </div>
      <div className="main-content">
        <button 
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {sidebarOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M3 12h18m-9-9l9 9-9 9" />
            )}
          </svg>
        </button>
        {workflowData && (
          <div className="visualizer-container">
            <WorkflowVisualizer data={workflowData} />
          </div>
        )}
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default App;
