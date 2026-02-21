/**
 * Cloudflare Workers API - Enhanced with Google AI Integration
 * Full UIForge API implementation for Cloudflare Workers with BYOK support
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { convertWireframeToFigma } from './services/wireframe-to-figma-enhanced';

// Environment interface for Cloudflare Workers
interface Env {
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  GEMINI_API_KEY: string;
  FIGMA_ACCESS_TOKEN: string;
  NODE_ENV?: string;
}

// Wireframe request interfaces
interface WireframeRequest {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentType: 'mobile' | 'web' | 'desktop' | 'tablet';
  description: string;
  style?: 'low-fidelity' | 'high-fidelity' | 'prototype';
  outputFormat?: 'figma' | 'json' | 'svg' | 'png';
  includeCode?: boolean;
  componentLibrary?: 'tailwind' | 'mui' | 'chakra' | 'shadcn' | 'none';
  typescript?: boolean;
}

interface WireframeElement {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fills?: Fill[];
  strokes?: Stroke[];
  cornerRadius?: number;
  textContent?: string;
  fontSize?: number;
  fontFamily?: string;
}

interface Fill {
  type: 'SOLID';
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

interface Stroke {
  type: 'SOLID';
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  weight?: number;
}

interface WireframeStyles {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

interface GeneratedWireframe {
  type: string;
  width: number;
  height: number;
  elements: WireframeElement[];
  styles: WireframeStyles;
}

interface WireframeResponse {
  wireframe: GeneratedWireframe;
  metadata: {
    version: string;
    generatedAt: string;
    outputFormat: string;
  };
}

// Rate limiting (simple in-memory for Workers)
const rateLimits = new Map<string, { count: number; resetTime: number }>();

function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(
  request: Request,
  limit: number,
  windowMs: number
): { allowed: boolean; resetAt?: number } {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = rateLimits.get(key);

  if (!record) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { allowed: true };
  }

  if (record.count >= limit) {
    return { allowed: false, resetAt: record.resetTime };
  }

  record.count++;
  return { allowed: true };
}

// Health check implementation
async function handleHealth(env: Env): Promise<Response> {
  try {
    // Simple health check - just return OK
    return new Response(
      JSON.stringify({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: env.NODE_ENV || 'development',
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Component generation using Google AI
async function handleGenerate(request: Request, env: Env): Promise<Response> {
  try {
    if (!checkRateLimit(request, 10, 60 * 60 * 1000).allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetAt: Date.now() + 60 * 60 * 1000,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = (await request.json()) as WireframeRequest;

    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });

    // Create prompt based on request parameters
    const prompt = createGenerationPrompt(body);

    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;

    const generatedCode = response.text();

    return new Response(
      JSON.stringify({
        component: generatedCode,
        framework: body.framework,
        componentLibrary: body.componentLibrary || 'none',
        typescript: body.typescript ?? true,
        metadata: {
          model: 'gemini-3-flash-preview',
          generatedAt: new Date().toISOString(),
          tokens:
            (response.usageMetadata?.promptTokenCount || 0) +
            (response.usageMetadata?.candidatesTokenCount || 0),
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Generation error:', error);
    return new Response(
      JSON.stringify({
        error: 'Generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Create generation prompt for Google AI
function createGenerationPrompt(options: WireframeRequest): string {
  const framework = options.framework || 'react';
  const library = options.componentLibrary || 'tailwind';
  const typescript = options.typescript ? 'TypeScript' : 'JavaScript';

  return `Generate a ${framework} component for: ${options.description}

Requirements:
- Use ${library} for styling
- Write in ${typescript}
- Include proper imports
- Make it responsive
- Add appropriate props interface
- Include comments for clarity
- Follow modern best practices
- Export as default

The component should be production-ready and follow ${framework} conventions.`;
}

// Wireframe generation handler
async function handleWireframe(request: Request): Promise<Response> {
  try {
    if (!checkRateLimit(request, 5, 60 * 60 * 1000).allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetAt: Date.now() + 60 * 60 * 1000,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = (await request.json()) as WireframeRequest;
    const wireframe = generateSimpleWireframe(body);

    return new Response(JSON.stringify(wireframe), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Wireframe generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Wireframe templates handler
async function handleWireframeTemplates(): Promise<Response> {
  const templates = [
    {
      id: 'mobile-app',
      name: 'Mobile App Screen',
      description: 'Basic mobile app layout with header and content',
      framework: 'react',
      componentType: 'mobile',
    },
    {
      id: 'web-dashboard',
      name: 'Web Dashboard',
      description: 'Dashboard layout with sidebar and main content',
      framework: 'react',
      componentType: 'web',
    },
  ];

  return new Response(JSON.stringify({ templates }), {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Figma export handler
async function handleFigmaExport(request: Request, _env: Env): Promise<Response> {
  try {
    if (!checkRateLimit(request, 3, 60 * 60 * 1000).allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetAt: Date.now() + 60 * 60 * 1000,
        }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const body = (await request.json()) as { wireframe: GeneratedWireframe };

    // Convert wireframe to Figma format
    const figmaData = convertWireframeToFigma(body.wireframe, {
      includeStyles: true,
      scaleFactor: 1,
      useAutoLayout: true,
    });

    return new Response(JSON.stringify(figmaData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Figma export failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Simple wireframe generator (placeholder implementation)
function generateSimpleWireframe(options: WireframeRequest): WireframeResponse {
  const elements: WireframeElement[] = [
    {
      id: 'header',
      type: 'frame',
      name: 'Header',
      x: 0,
      y: 0,
      width: 375,
      height: 60,
      fills: [{ type: 'SOLID', color: { r: 59, g: 130, b: 246, a: 1 } }],
    },
    {
      id: 'content',
      type: 'frame',
      name: 'Content',
      x: 0,
      y: 60,
      width: 375,
      height: 600,
      fills: [{ type: 'SOLID', color: { r: 249, g: 250, b: 251, a: 1 } }],
    },
  ];

  const wireframe: GeneratedWireframe = {
    type: options.componentType,
    width: 375,
    height: 660,
    elements,
    styles: {
      colors: {
        primary: '#3B82F6',
        secondary: '#6B7280',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
        border: '#E5E7EB',
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
    },
  };

  return {
    wireframe,
    metadata: {
      version: '1.0.0',
      generatedAt: new Date().toISOString(),
      outputFormat: options.outputFormat || 'figma',
    },
  };
}

// Main fetch handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      switch (url.pathname) {
        case '/health':
          return handleHealth(env);

        case '/api/generate':
          if (request.method === 'POST') {
            return handleGenerate(request, env);
          }
          break;

        case '/api/wireframe':
          if (request.method === 'POST') {
            return handleWireframe(request);
          }
          break;

        case '/api/wireframe/templates':
          if (request.method === 'GET') {
            return handleWireframeTemplates();
          }
          break;

        case '/api/figma/export':
          if (request.method === 'POST') {
            return handleFigmaExport(request, env);
          }
          break;

        default:
          return new Response('Not found', { status: 404 });
      }

      return new Response('Method not allowed', { status: 405 });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  },
};
