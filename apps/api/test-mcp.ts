/**
 * MCP Server Testing Script
 * Tests generateComponent, validateCode, and formatCode tools
 */

import { createMCPServer } from './src/mcp/server';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';

async function testMCPServer() {
  console.log('🧪 Testing UIForge MCP Server...\n');

  const server = createMCPServer();

  // Test 1: Generate Component
  console.log('📝 Test 1: Generate React Component');
  try {
    const generateRequest = {
      method: 'tools/call',
      params: {
        name: 'generateComponent',
        arguments: {
          framework: 'react',
          componentLibrary: 'shadcn',
          description: 'A modern login form with email and password fields, submit button, and forgot password link',
          style: 'modern',
          typescript: true,
        },
      },
    };

    const handler = (server as any)._requestHandlers.get('tools/call');
    if (handler) {
      const result = await handler(generateRequest as any, {} as any);

      if (!result || !Array.isArray(result.content) || result.content.length === 0) {
        console.error('❌ Invalid result structure');
        return;
      }

      const content = result.content[0];
      if (!content || content.type !== 'text') {
        console.error('❌ Invalid content type');
        return;
      }

      try {
        const data = JSON.parse(content.text);
        console.log('✅ Component generated successfully');
        console.log(`   Framework: ${data.framework}`);
        console.log(`   Language: ${data.language}`);
        console.log(`   Code length: ${data.code.length} characters`);
        console.log(`   Tokens used: ${data.tokensUsed || 'N/A'}`);
        console.log(`   Preview:\n${data.code.substring(0, 200)}...\n`);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
      }
    }
  } catch (error) {
    console.error('❌ Test 1 failed:', error);
  }

  // Test 2: Validate Code
  console.log('🔍 Test 2: Validate TypeScript Code');
  try {
    const sampleCode = `
import React from 'react';

export const Button = ({ children }: { children: React.ReactNode }) => {
  return <button className="btn">{children}</button>;
};
`;

    const validateRequest = {
      method: 'tools/call',
      params: {
        name: 'validateCode',
        arguments: {
          code: sampleCode,
          language: 'typescript',
        },
      },
    };

    const handler = (server as any)._requestHandlers.get('tools/call');
    if (handler) {
      const result = await handler(validateRequest as any, {} as any);

      // Defensive checks
      if (!result) {
        console.error('❌ Test 2: No result returned');
        return;
      }

      if (!Array.isArray(result.content) || result.content.length === 0) {
        console.error('❌ Test 2: Invalid or empty content array');
        return;
      }

      const content = result.content[0];
      if (content.type !== 'text') {
        console.error('❌ Test 2: Content type is not text');
        return;
      }

      try {
        const data = JSON.parse(content.text);
        console.log(`✅ Code validation ${data.valid ? 'passed' : 'failed'}`);
        console.log(`   Language: ${data.language}`);
        console.log(`   Valid: ${data.valid}\n`);
      } catch (parseError) {
        console.error('❌ Test 2: Failed to parse JSON response:', parseError);
      }
    }
  } catch (error) {
    console.error('❌ Test 2 failed:', error);
  }

  // Test 3: Format Code
  console.log('✨ Test 3: Format Code');
  try {
    const messyCode = `const x={a:1,b:2};function foo(){return x.a+x.b;}`;

    const formatRequest = {
      method: 'tools/call',
      params: {
        name: 'formatCode',
        arguments: {
          code: messyCode,
          language: 'javascript',
        },
      },
    };

    const handler = (server as any)._requestHandlers.get('tools/call');
    if (handler) {
      const result = await handler(formatRequest as any, {} as any);

      // Defensive checks for result structure
      if (!result || !Array.isArray(result.content) || result.content.length === 0) {
        console.error('❌ Test 3 failed: Invalid response structure');
        return;
      }

      const content = result.content[0];

      if (!content || typeof content !== 'object') {
        console.error('❌ Test 3 failed: Invalid content structure');
        return;
      }

      if (content.type === 'text') {
        console.log('✅ Code formatted successfully');
        console.log(`   Original: ${messyCode}`);
        console.log(`   Formatted:\n${content.text}\n`);
      }
    }
  } catch (error) {
    console.error('❌ Test 3 failed:', error);
  }

  console.log('✅ MCP Server testing complete!\n');
}

// Run tests
testMCPServer().catch(console.error);
