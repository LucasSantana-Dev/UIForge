import type { GenerationEvent } from '@/lib/services/generation-types';
import type {
  McpGatewayConfig,
  McpToolDefinition,
  McpToolResult,
  McpJsonRpcRequest,
  McpJsonRpcResponse,
  McpGenerateOptions,
} from './types';

function getBaseUrl(): string {
  const baseUrl = process.env.MCP_GATEWAY_URL;
  if (!baseUrl) {
    throw new Error('MCP gateway is not configured. Set MCP_GATEWAY_URL environment variable.');
  }
  return baseUrl.replace(/\/$/, '');
}

function getConfig(accessToken: string): McpGatewayConfig {
  return {
    baseUrl: getBaseUrl(),
    jwt: accessToken,
    timeoutMs: 120_000,
  };
}

async function rpc(
  config: McpGatewayConfig,
  method: string,
  params: Record<string, unknown>,
  requestId?: string
): Promise<McpJsonRpcResponse> {
  const body: McpJsonRpcRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.jwt}`,
    'Content-Type': 'application/json',
  };
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  try {
    const response = await fetch(`${config.baseUrl}/rpc`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`MCP gateway returned ${response.status}: ${response.statusText}`);
    }

    return (await response.json()) as McpJsonRpcResponse;
  } finally {
    clearTimeout(timeout);
  }
}

export function isMcpConfigured(): boolean {
  return !!process.env.MCP_GATEWAY_URL;
}

export async function listTools(accessToken: string): Promise<McpToolDefinition[]> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/tools?limit=0&include_pagination=false`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(
      `MCP gateway is unavailable (HTTP ${response.status}). Check gateway health and auth configuration.`
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.tools ?? []);
}

export async function callTool(
  name: string,
  args: Record<string, unknown>,
  accessToken: string,
  requestId?: string
): Promise<McpToolResult> {
  const config = getConfig(accessToken);
  const result = await rpc(config, 'tools/call', { name, arguments: args }, requestId);

  if (result.error) {
    throw new Error(`MCP tool error (${result.error.code}): ${result.error.message}`);
  }

  if (!result.result) {
    throw new Error(
      'MCP gateway returned an empty result. The AI model may have failed to generate output — please try again.'
    );
  }

  return result.result;
}

export async function generateComponent(
  options: McpGenerateOptions,
  accessToken: string,
  requestId?: string
): Promise<string> {
  const preferences = {
    cost_preference: 'balanced',
    responsive: true,
    dark_mode: true,
    framework: options.framework === 'react' ? 'react' : options.framework,
    design_system:
      options.componentLibrary === 'tailwind' || options.componentLibrary === 'shadcn'
        ? 'tailwind_ui'
        : options.componentLibrary === 'mui'
          ? 'material_design'
          : options.componentLibrary === 'chakra'
            ? 'chakra_ui'
            : 'tailwind_ui',
  };

  let task = options.prompt;
  if (options.style) {
    task += ` Design style: ${options.style}.`;
  }
  if (options.typescript) {
    task += ' Use TypeScript with proper type annotations.';
  }
  if (options.contextAddition) {
    task += `\n\nAdditional context:\n${options.contextAddition}`;
  }

  const result = await callTool(
    'execute_specialist_task',
    {
      task,
      category: 'ui_generation',
      user_preferences: JSON.stringify(preferences),
      cost_optimization: true,
    },
    accessToken,
    requestId
  );

  const textContent = result.content.find((c) => c.type === 'text');
  if (!textContent?.text) {
    throw new Error(
      'The AI model did not produce any code. Try rephrasing your prompt or using a different provider.'
    );
  }

  return textContent.text;
}

export async function* generateComponentStream(
  options: McpGenerateOptions,
  accessToken: string,
  requestId?: string
): AsyncGenerator<GenerationEvent> {
  const baseUrl = getBaseUrl();
  const preferences = {
    cost_preference: 'balanced',
    responsive: true,
    dark_mode: true,
    framework: options.framework === 'react' ? 'react' : options.framework,
    design_system:
      options.componentLibrary === 'tailwind' || options.componentLibrary === 'shadcn'
        ? 'tailwind_ui'
        : options.componentLibrary === 'mui'
          ? 'material_design'
          : options.componentLibrary === 'chakra'
            ? 'chakra_ui'
            : 'tailwind_ui',
  };

  let task = options.prompt;
  if (options.style) {
    task += ` Design style: ${options.style}.`;
  }
  if (options.typescript) {
    task += ' Use TypeScript with proper type annotations.';
  }
  if (options.contextAddition) {
    task += `\n\nAdditional context:\n${options.contextAddition}`;
  }

  const body: McpJsonRpcRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method: 'tools/call',
    params: {
      name: 'execute_specialist_task',
      arguments: {
        task,
        category: 'ui_generation',
        user_preferences: JSON.stringify(preferences),
        cost_optimization: true,
      },
    },
  };

  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  if (requestId) {
    headers['X-Request-ID'] = requestId;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);

  try {
    const response = await fetch(`${baseUrl}/rpc/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`MCP gateway returned ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('MCP gateway returned no response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr) as GenerationEvent;
          yield event;
        } catch {
          // skip malformed SSE events
        }
      }
    }
  } finally {
    clearTimeout(timeout);
  }
}
