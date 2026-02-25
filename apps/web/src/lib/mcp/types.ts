export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface McpToolResult {
  content: McpContentBlock[];
  isError?: boolean;
}

export interface McpContentBlock {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
}

export interface McpJsonRpcRequest {
  jsonrpc: '2.0';
  id: number;
  method: string;
  params: Record<string, unknown>;
}

export interface McpJsonRpcResponse {
  jsonrpc: '2.0';
  id: number;
  result?: McpToolResult;
  error?: McpJsonRpcError;
}

export interface McpJsonRpcError {
  code: number;
  message: string;
  data?: unknown;
}

export interface McpGatewayConfig {
  baseUrl: string;
  jwt: string;
  timeoutMs: number;
}

export interface McpGenerateOptions {
  prompt: string;
  framework: string;
  componentLibrary?: string;
  style?: string;
  typescript?: boolean;
  imageBase64?: string;
  imageMimeType?: string;
  contextAddition?: string;
}
