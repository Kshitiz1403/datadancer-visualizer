# datadancer-visualizer

A React library for visualizing [Serverless Workflow](https://serverlessworkflow.io/) executions as interactive graphs. Load a workflow definition alongside an execution trace and see exactly what ran, what was skipped, and where errors occurred.

![Workflow Visualization](https://raw.githubusercontent.com/kshitizagrawal/datadancer-visualizer/main/docs/screenshot.png)

## Features

- **Combined view** — overlay execution data on top of the workflow definition
- **Error tracing** — see which error handlers fired and why
- **Switch conditions** — visualize which branch was taken and why
- **Node detail panel** — inspect input/output data, action durations, and errors per state
- **Theming** — override colors to match your design system
- **Composable** — use the full component, individual pieces, or just the parser utilities
- **TypeScript** — fully typed, ships with `.d.ts` declarations

## Installation

```bash
npm install datadancer-visualizer @xyflow/react lucide-react
```

> `@xyflow/react` and `lucide-react` are peer dependencies — install them alongside this package.

## Quick Start

```tsx
import { WorkflowVisualizer } from 'datadancer-visualizer';
import 'datadancer-visualizer/styles';
import '@xyflow/react/dist/style.css';

export default function App() {
  return (
    <div style={{ height: '100vh' }}>
      <WorkflowVisualizer data={workflowData} />
    </div>
  );
}
```

## Loading Data

Use `combineWorkflowData` to merge a workflow definition with an execution trace:

```ts
import { combineWorkflowData } from 'datadancer-visualizer';

// Both definition and execution trace
const data = combineWorkflowData(workflowDefinition, executionTrace);

// Definition only (shows planned flow, no execution state)
const data = combineWorkflowData(workflowDefinition);
```

### Data formats

**Workflow definition** (Serverless Workflow spec):
```json
{
  "id": "my-workflow",
  "name": "My Workflow",
  "start": "FirstState",
  "states": [
    {
      "name": "FirstState",
      "type": "operation",
      "actions": [{ "functionRef": { "refName": "MyFunction", "arguments": {} } }],
      "transition": { "nextState": "SecondState" }
    },
    {
      "name": "SecondState",
      "type": "switch",
      "dataConditions": [
        { "name": "IsSuccess", "condition": ".status == \"ok\"", "transition": { "nextState": "Done" } }
      ],
      "defaultCondition": { "transition": { "nextState": "HandleFailure" } }
    }
  ]
}
```

**Execution trace**:
```json
{
  "states": [
    {
      "name": "FirstState",
      "type": "operation",
      "startTime": "2025-01-01T10:00:00Z",
      "endTime": "2025-01-01T10:00:01Z",
      "input": { "status": "ok" },
      "output": { "status": "ok", "result": 42 },
      "actions": [
        {
          "activityName": "MyFunction",
          "arguments": {},
          "startTime": "2025-01-01T10:00:00Z",
          "endTime": "2025-01-01T10:00:01Z",
          "output": { "result": 42 }
        }
      ]
    }
  ]
}
```

---

## API

### Level 1 — Drop-in component

The simplest integration. One component with built-in node detail panel.

```tsx
<WorkflowVisualizer
  data={data}                          // required

  // Callbacks
  onNodeClick={(nodeData) => {}}       // fires on node click (alongside built-in panel)

  // Detail panel control
  showDetailPanel={true}               // show/hide the built-in right panel (default: true)
  renderDetailPanel={(node, onClose) => // replace built-in panel with your own UI
    <MyPanel node={node} onClose={onClose} />
  }

  // Appearance
  theme={{ colors: { error: '#ff0000' } }}
  className="my-visualizer"
  style={{ height: '600px' }}

  // Graph behavior
  fitView={true}                       // auto-fit on load (default: true)
  minZoom={0.3}                        // default: 0.3
  maxZoom={2}                          // default: 2
/>
```

### Level 2 — Composable components

Use individual pieces and wire them together yourself.

```tsx
import {
  WorkflowGraph,
  NodeDetailPanel,
  combineWorkflowData,
} from 'datadancer-visualizer';
import { useState } from 'react';

function MyDashboard({ definition, execution }) {
  const [selected, setSelected] = useState(null);
  const data = combineWorkflowData(definition, execution);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <WorkflowGraph
        data={data}
        onNodeClick={(nodeData) => setSelected(nodeData)}
        selectedNodeId={selected?.state.name ? `state-${selected.state.name}` : null}
        theme={{ colors: { operation: '#6366f1' } }}
        style={{ flex: 1 }}
      />
      <NodeDetailPanel
        isOpen={!!selected}
        nodeData={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
```

#### `WorkflowGraph` props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `WorkflowDebugData \| CombinedWorkflowData` | required | Workflow data |
| `onNodeClick` | `(nodeData, nodeId) => void` | — | Node click handler |
| `selectedNodeId` | `string \| null` | `null` | Highlights the node with this ID |
| `theme` | `Partial<WorkflowTheme>` | — | Color overrides |
| `fitView` | `boolean` | `true` | Auto-fit graph on load |
| `minZoom` | `number` | `0.3` | Minimum zoom level |
| `maxZoom` | `number` | `2` | Maximum zoom level |
| `className` | `string` | — | CSS class on root element |
| `style` | `CSSProperties` | — | Inline styles on root element |

#### `NodeDetailPanel` props

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls panel visibility |
| `nodeData` | `NodeData \| null` | Data for the selected node |
| `onClose` | `() => void` | Called when user closes the panel |

#### `JsonModal` props

A generic JSON viewer modal — not workflow-specific, usable anywhere.

| Prop | Type | Description |
|------|------|-------------|
| `isOpen` | `boolean` | Controls modal visibility |
| `onClose` | `() => void` | Called on close |
| `title` | `string` | Modal header title |
| `data` | `any` | JSON-serializable data to display |
| `subtitle` | `string` | Optional subtitle below title |

### Level 3 — Data utilities

Pure TypeScript functions with no React dependency.

```ts
import {
  combineWorkflowData,
  parseCombinedWorkflowData,
  parseWorkflowData,
  formatDuration,
  getNodeTypeColor,
} from 'datadancer-visualizer';

// Merge definition + execution
const combined = combineWorkflowData(definition, execution);

// Get ReactFlow nodes and edges (for use with your own graph renderer)
const { nodes, edges } = parseCombinedWorkflowData(combined);

// Execution-only mode (no definition)
const { nodes, edges } = parseWorkflowData(executionTrace);

// Formatting helpers
formatDuration(1500);                           // "1.50s"
formatDuration(250);                            // "250ms"
getNodeTypeColor('operation', false, true);     // "#10b981"
getNodeTypeColor('switch', false, true);        // "#f59e0b"
getNodeTypeColor('operation', true, true);      // "#ef4444" (has error)
```

---

## Theming

Override any color by passing a `theme` prop:

```tsx
import type { WorkflowTheme } from 'datadancer-visualizer';

const theme: Partial<WorkflowTheme> = {
  colors: {
    executed: '#10b981',    // successfully executed states
    unexecuted: '#9ca3af',  // states that didn't run
    error: '#ef4444',       // states with errors
    operation: '#10b981',   // operation-type state accent
    switch: '#f59e0b',      // switch/condition-type state accent
    default: '#6366f1',     // all other state types
  },
};

<WorkflowVisualizer data={data} theme={theme} />
```

All theme fields are optional — only override what you need.

---

## TypeScript

All types are exported:

```ts
import type {
  // Input data types
  WorkflowDefinition,
  WorkflowDefinitionState,
  WorkflowDefinitionAction,
  WorkflowCondition,
  WorkflowOnError,
  WorkflowDebugData,
  WorkflowState,
  WorkflowAction,

  // Combined types (definition + execution merged)
  CombinedWorkflowData,
  CombinedWorkflowState,

  // Component / graph types
  NodeData,
  WorkflowTheme,
} from 'datadancer-visualizer';
```

---

## CSS

Import the component styles once in your app:

```ts
import 'datadancer-visualizer/styles';
import '@xyflow/react/dist/style.css'; // also required by @xyflow/react
```

The library's CSS uses plain class names (no CSS Modules). If you need to override specific styles, target the class names directly — e.g., `.workflow-node`, `.node-detail-panel`, `.json-modal`.

---

## Demo App

The [datadancer-visualizer-app](https://github.com/kshitizagrawal/datadancer-visualizer-app) repository is a full demo application built on this library. It includes several example workflow definitions and execution traces you can use as reference.

---

## License

MIT
