/**
 * MCP Server Entry Point
 * Standalone MCP server for stdio transport
 */

import { startMCPServer } from './server';
import { logger } from '../utils/logger';

// Start MCP server
startMCPServer().catch((error) => {
  logger.error('Failed to start MCP server', error);
  process.exit(1);
});
