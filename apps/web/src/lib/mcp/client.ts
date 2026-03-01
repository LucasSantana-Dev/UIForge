import type {
  McpGatewayConfig,
  McpToolDefinition,
  McpToolResult,
  McpJsonRpcRequest,
  McpJsonRpcResponse,
  McpGenerateOptions,
} from './types';

function getConfig(): McpGatewayConfig {
  const baseUrl = process.env.MCP_GATEWAY_URL;
  const jwt = process.env.MCP_GATEWAY_JWT;

  if (!baseUrl || !jwt) {
    throw new Error(
      'MCP gateway is not configured. Set MCP_GATEWAY_URL and MCP_GATEWAY_JWT environment variables.'
    );
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ''),
    jwt,
    timeoutMs: 120_000,
  };
}

async function rpc(
  config: McpGatewayConfig,
  method: string,
  params: Record<string, unknown>
): Promise<McpJsonRpcResponse> {
  const body: McpJsonRpcRequest = {
    jsonrpc: '2.0',
    id: Date.now(),
    method,
    params,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/rpc`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.jwt}`,
        'Content-Type': 'application/json',
      },
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
  return !!(process.env.MCP_GATEWAY_URL && process.env.MCP_GATEWAY_JWT);
}

export async function listTools(): Promise<McpToolDefinition[]> {
  const config = getConfig();
  const response = await fetch(`${config.baseUrl}/tools?limit=0&include_pagination=false`, {
    headers: { Authorization: `Bearer ${config.jwt}` },
  });

  if (!response.ok) {
    throw new Error(
      `MCP gateway is unavailable (HTTP ${response.status}). Generation will use direct provider instead.`
    );
  }

  const data = await response.json();
  return Array.isArray(data) ? data : (data.tools ?? []);
}

export async function callTool(
  name: string,
  args: Record<string, unknown>
): Promise<McpToolResult> {
  const config = getConfig();
  const result = await rpc(config, 'tools/call', { name, arguments: args });

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

export async function generateComponent(options: McpGenerateOptions): Promise<string> {
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

  const result = await callTool('execute_specialist_task', {
    task,
    category: 'ui_generation',
    user_preferences: JSON.stringify(preferences),
    cost_optimization: true,
  });

  const textContent = result.content.find((c) => c.type === 'text');
  if (!textContent?.text) {
    throw new Error(
      'The AI model did not produce any code. Try rephrasing your prompt or using a different provider.'
    );
  }

  return textContent.text;
}
