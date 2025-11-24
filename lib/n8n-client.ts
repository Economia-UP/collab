/**
 * n8n API Client
 * 
 * This client handles communication with n8n workflow automation backend.
 * n8n should be running as a separate service (Docker container or cloud instance).
 */

const N8N_API_URL = process.env.N8N_API_URL || "http://localhost:5678";
const N8N_API_KEY = process.env.N8N_API_KEY;

export interface N8NWorkflowExecution {
  id: string;
  finished: boolean;
  mode: string;
  retryOf?: string;
  retrySuccessId?: string;
  startedAt: string;
  stoppedAt?: string;
  workflowId: string;
  workflowData: {
    id: string;
    name: string;
    nodes: any[];
    connections: any;
  };
}

export interface N8NWorkflow {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings?: any;
  staticData?: any;
  tags?: string[];
}

/**
 * Execute a workflow by ID
 */
export async function executeN8NWorkflow(
  workflowId: string,
  data: Record<string, any> = {}
): Promise<N8NWorkflowExecution> {
  const url = `${N8N_API_URL}/api/v1/workflows/${workflowId}/execute`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (N8N_API_KEY) {
    headers["X-N8N-API-KEY"] = N8N_API_KEY;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      data,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n workflow execution failed: ${error}`);
  }

  return response.json();
}

/**
 * Trigger a workflow by webhook
 */
export async function triggerN8NWebhook(
  webhookPath: string,
  data: Record<string, any> = {}
): Promise<any> {
  const url = `${N8N_API_URL}/webhook/${webhookPath}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`n8n webhook trigger failed: ${error}`);
  }

  return response.json();
}

/**
 * Get workflow by ID
 */
export async function getN8NWorkflow(workflowId: string): Promise<N8NWorkflow> {
  const url = `${N8N_API_URL}/api/v1/workflows/${workflowId}`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (N8N_API_KEY) {
    headers["X-N8N-API-KEY"] = N8N_API_KEY;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get n8n workflow: ${error}`);
  }

  return response.json();
}

/**
 * List all workflows
 */
export async function listN8NWorkflows(): Promise<N8NWorkflow[]> {
  const url = `${N8N_API_URL}/api/v1/workflows`;
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (N8N_API_KEY) {
    headers["X-N8N-API-KEY"] = N8N_API_KEY;
  }

  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list n8n workflows: ${error}`);
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Check if n8n is configured and available
 */
export function isN8NConfigured(): boolean {
  return !!N8N_API_URL && N8N_API_URL !== "http://localhost:5678";
}

/**
 * Check if n8n is available (health check)
 */
export async function checkN8NAvailability(): Promise<boolean> {
  try {
    const url = `${N8N_API_URL}/healthz`;
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    return response.ok;
  } catch (error) {
    console.warn("n8n health check failed:", error);
    return false;
  }
}

