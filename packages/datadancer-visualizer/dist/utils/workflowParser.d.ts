import { Node, Edge } from '@xyflow/react';
import { WorkflowDebugData, WorkflowDefinition, CombinedWorkflowData, WorkflowTheme } from '../types';
/** Parse execution-only debug data into ReactFlow nodes and edges (legacy mode). */
export declare const parseWorkflowData: (data: WorkflowDebugData) => {
    nodes: Node[];
    edges: Edge[];
};
/** Parse combined workflow definition + execution data into ReactFlow nodes and edges. */
export declare const parseCombinedWorkflowData: (combinedData: CombinedWorkflowData) => {
    nodes: Node[];
    edges: Edge[];
};
/** Merge a workflow definition with an optional execution trace into a CombinedWorkflowData structure. */
export declare const combineWorkflowData: (definition: WorkflowDefinition, execution?: WorkflowDebugData) => CombinedWorkflowData;
/** Format a duration in milliseconds to a human-readable string. */
export declare const formatDuration: (milliseconds: number) => string;
/** Get the display color for a workflow node based on its type and status. Accepts an optional theme to override defaults. */
export declare const getNodeTypeColor: (type: string, hasError: boolean, wasExecuted?: boolean, theme?: WorkflowTheme) => string;
