import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface WireframeRequest {
  framework: 'react' | 'vue' | 'angular' | 'svelte';
  componentType: 'mobile' | 'web' | 'desktop' | 'tablet';
  description: string;
  style: 'low-fidelity' | 'high-fidelity' | 'prototype';
  outputFormat: 'figma' | 'json' | 'svg' | 'png';
}

interface WireframeResponse {
  wireframe: {
    type: string;
    width: number;
    height: number;
    elements: any[];
    styles: any;
  };
  metadata: {
    framework: string;
    componentType: string;
    generatedAt: string;
    outputFormat: string;
  };
}

function getDimensions(componentType: string): [number, number] {
  switch (componentType) {
    case 'mobile':
      return [375, 812];
    case 'tablet':
      return [768, 1024];
    case 'web':
      return [1200, 800];
    case 'desktop':
      return [1440, 900];
    default:
      return [375, 812];
  }
}

function generateMockWireframe(request: WireframeRequest): WireframeResponse {
  const [width, height] = getDimensions(request.componentType);
  
  // Mock wireframe generation based on description
  const elements = [];
  
  if (request.description.toLowerCase().includes('login')) {
    elements.push(
      {
        id: 'email-input',
        type: 'input',
        x: 20,
        y: 200,
        width: width - 40,
        height: 40,
        label: 'Email',
        placeholder: 'you@example.com'
      },
      {
        id: 'password-input',
        type: 'input',
        x: 20,
        y: 260,
        width: width - 40,
        height: 40,
        label: 'Password',
        placeholder: '••••••••',
        inputType: 'password'
      },
      {
        id: 'login-button',
        type: 'button',
        x: 20,
        y: 320,
        width: width - 40,
        height: 48,
        text: 'Sign In',
        variant: 'primary'
      }
    );
  }
  
  if (request.description.toLowerCase().includes('header')) {
    elements.push(
      {
        id: 'header',
        type: 'container',
        x: 0,
        y: 0,
        width: width,
        height: 64,
        backgroundColor: '#121214',
        children: [
          {
            id: 'logo',
            type: 'text',
            x: 20,
            y: 20,
            width: 100,
            height: 24,
            text: 'Logo',
            fontSize: 18,
            color: '#ffffff'
          },
          {
            id: 'nav-items',
            type: 'container',
            x: width - 200,
            y: 20,
            width: 180,
            height: 24,
            children: [
              {
                id: 'nav-home',
                type: 'text',
                x: 0,
                y: 0,
                width: 40,
                height: 24,
                text: 'Home',
                fontSize: 14,
                color: '#ffffff'
              },
              {
                id: 'nav-about',
                type: 'text',
                x: 50,
                y: 0,
                width: 50,
                height: 24,
                text: 'About',
                fontSize: 14,
                color: '#ffffff'
              },
              {
                id: 'nav-contact',
                type: 'text',
                x: 110,
                y: 0,
                width: 60,
                height: 24,
                text: 'Contact',
                fontSize: 14,
                color: '#ffffff'
              }
            ]
          }
        ]
      }
    );
  }

  // Add some default elements if no specific patterns found
  if (elements.length === 0) {
    elements.push(
      {
        id: 'title',
        type: 'text',
        x: 20,
        y: 40,
        width: width - 40,
        height: 32,
        text: 'Component Title',
        fontSize: 24,
        fontWeight: 'bold'
      },
      {
        id: 'content',
        type: 'container',
        x: 20,
        y: 100,
        width: width - 40,
        height: height - 140,
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb'
      }
    );
  }

  return {
    wireframe: {
      type: request.componentType,
      width,
      height,
      elements,
      styles: {
        theme: request.style === 'low-fidelity' ? 'wireframe' : 
               request.style === 'high-fidelity' ? 'detailed' : 'interactive',
        colors: request.style === 'low-fidelity' ? ['#000000', '#ffffff'] : 
                ['#121214', '#3b82f6', '#10b981', '#f59e0b'],
        typography: {
          fontFamily: request.framework === 'react' ? 'Inter' : 
                     request.framework === 'vue' ? 'Inter' :
                     request.framework === 'angular' ? 'Roboto' : 'System',
          fontSize: '14px'
        }
      }
    },
    metadata: {
      framework: request.framework,
      componentType: request.componentType,
      generatedAt: new Date().toISOString(),
      outputFormat: request.outputFormat
    }
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WireframeRequest;

    // Validate request body
    if (!body.description || typeof body.description !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Description is required and must be a string' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (body.description.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Description must be at least 10 characters long' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate framework
    const validFrameworks = ['react', 'vue', 'angular', 'svelte'];
    if (!validFrameworks.includes(body.framework)) {
      return new Response(
        JSON.stringify({ error: `Invalid framework. Must be one of: ${validFrameworks.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate component type
    const validComponentTypes = ['mobile', 'web', 'desktop', 'tablet'];
    if (!validComponentTypes.includes(body.componentType)) {
      return new Response(
        JSON.stringify({ error: `Invalid component type. Must be one of: ${validComponentTypes.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate style
    const validStyles = ['low-fidelity', 'high-fidelity', 'prototype'];
    if (!validStyles.includes(body.style)) {
      return new Response(
        JSON.stringify({ error: `Invalid style. Must be one of: ${validStyles.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate output format
    const validOutputFormats = ['figma', 'json', 'svg', 'png'];
    if (!validOutputFormats.includes(body.outputFormat)) {
      return new Response(
        JSON.stringify({ error: `Invalid output format. Must be one of: ${validOutputFormats.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate wireframe (mock implementation for now)
    const wireframeData = generateMockWireframe(body);

    // In a real implementation, this would call an AI service
    // For now, we return a mock wireframe based on the description
    
    return new Response(
      JSON.stringify(wireframeData),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        } 
      }
    );

  } catch (error) {
    console.error('Wireframe generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      message: 'Wireframe API',
      version: '1.0.0',
      endpoints: {
        'POST /api/wireframe': {
          description: 'Generate a wireframe based on description',
          parameters: {
            framework: 'react | vue | angular | svelte',
            componentType: 'mobile | web | desktop | tablet',
            description: 'string (min 10 characters)',
            style: 'low-fidelity | high-fidelity | prototype',
            outputFormat: 'figma | json | svg | png'
          },
          example: {
            framework: 'react',
            componentType: 'mobile',
            description: 'A mobile app login screen with email input, password input, and login button',
            style: 'high-fidelity',
            outputFormat: 'json'
          }
        }
      }
    }),
    { 
      status: 200, 
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      } 
    }
  );
}
