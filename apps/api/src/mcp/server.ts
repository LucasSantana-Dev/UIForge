/**
 * Self-hosted MCP Server for UIForge
 * Implements Model Context Protocol with UIForge-specific tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { generateComponent, hasCodePatterns, formatCode } from '../services/ai-generation';
import { logger } from '../utils/logger';

// Define UIForge MCP tools
const UIFORGE_TOOLS: Tool[] = [
  {
    name: 'generateComponent',
    description: 'Generate a UI component using Gemini AI based on a description',
    inputSchema: {
      type: 'object',
      properties: {
        framework: {
          type: 'string',
          enum: ['react', 'vue', 'angular', 'svelte'],
          description: 'UI framework to use',
        },
        componentLibrary: {
          type: 'string',
          enum: ['tailwind', 'mui', 'chakra', 'shadcn', 'none'],
          description: 'Component library to use (optional)',
        },
        description: {
          type: 'string',
          description: 'Natural language description of the component to generate',
        },
        style: {
          type: 'string',
          enum: ['modern', 'minimal', 'colorful'],
          description: 'Design style preference (optional)',
        },
        typescript: {
          type: 'boolean',
          description: 'Use TypeScript (default: true)',
        },
      },
      required: ['framework', 'description'],
    },
  },
  {
    name: 'validateCode',
    description: 'Check if code contains common patterns (heuristic check, not real syntax validation)',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code to validate',
        },
        language: {
          type: 'string',
          enum: ['typescript', 'javascript'],
          description: 'Programming language',
        },
      },
      required: ['code', 'language'],
    },
  },
  {
    name: 'formatCode',
    description: 'Format component code with proper indentation and style',
    inputSchema: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'Code to format',
        },
        language: {
          type: 'string',
          enum: ['typescript', 'javascript'],
          description: 'Programming language',
        },
      },
      required: ['code', 'language'],
    },
  },
];

/**
 * Create and configure MCP server
 */
export function createMCPServer(): Server {
  const server = new Server(
    {
      name: 'uiforge-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register tool list handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    logger.debug('MCP: Listing tools');
    return {
      tools: UIFORGE_TOOLS,
    };
  });

  // Register tool call handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    logger.info('MCP: Tool call', { tool: name });

    try {
      switch (name) {
        case 'generateComponent': {
          if (!args) {
            throw new Error('Missing required arguments for generateComponent');
          }

          // Validate required fields
          if (typeof args.description !== 'string' || args.description.trim().length === 0) {
            throw new Error('Invalid or missing description: must be a non-empty string');
          }

          const validFrameworks = ['react', 'vue', 'angular', 'svelte'] as const;
          if (!args.framework || !validFrameworks.includes(args.framework as any)) {
            throw new Error('Invalid framework: must be one of react, vue, angular, or svelte');
          }

          const framework = args.framework as 'react' | 'vue' | 'angular' | 'svelte';
          const description = args.description;

          // Validate optional fields with defaults
          const validLibraries = ['tailwind', 'mui', 'chakra', 'shadcn', 'none'] as const;
          const componentLibrary = (!args.componentLibrary || !validLibraries.includes(args.componentLibrary as any))
            ? 'none'
            : args.componentLibrary as 'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none';

          const validStyles = ['modern', 'minimal', 'colorful'] as const;
          const style = (!args.style || !validStyles.includes(args.style as any))
            ? 'modern'
            : args.style as 'modern' | 'minimal' | 'colorful';

          const typescript = args.typescript !== false;

          const result = await generateComponent({
            framework,
            componentLibrary,
            description,
            style,
            typescript,
          });

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'validateCode': {
          if (!args) {
            throw new Error('Missing required arguments for validateCode');
          }
          if (typeof args.code !== 'string' || typeof args.language !== 'string') {
            throw new Error('Invalid arguments: code and language must be strings');
          }
          const code = args.code;
          const language = args.language;

          const isValid = await hasCodePatterns(code, language);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  valid: isValid,
                  language,
                }),
              },
            ],
          };
        }

        case 'formatCode': {
          if (!args) {
            throw new Error('Missing required arguments for formatCode');
          }
          const code = args.code as string;
          const language = args.language as string;

          const formatted = await formatCode(code, language);

          return {
            content: [
              {
                type: 'text',
                text: formatted,
              },
            ],
          };
        }

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      logger.error('MCP: Tool execution failed', error, { tool: name });
      throw error;
    }
  });

  return server;
}

/**
 * Start MCP server with stdio transport
 */
export async function startMCPServer(): Promise<void> {
  logger.info('Starting UIForge MCP Server');

  const server = createMCPServer();
  const transport = new StdioServerTransport();

  await server.connect(transport);

  logger.info('UIForge MCP Server connected via stdio');
}
