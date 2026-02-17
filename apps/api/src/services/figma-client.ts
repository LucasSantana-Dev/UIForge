/**
 * Figma API Client
 * Handles all interactions with the Figma REST API
 */

export interface FigmaFile {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  lastModified: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: 'FRAME' | 'RECTANGLE' | 'TEXT' | 'GROUP' | 'COMPONENT';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  cornerRadius?: number;
  characters?: string;
  fontSize?: number;
  fontFamily?: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface FigmaFill {
  type: 'SOLID' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
}

export interface FigmaStroke {
  type: 'SOLID';
  color: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  weight: number;
}

export interface CreateFileOptions {
  name: string;
  teamId?: string;
}

export interface CreateFrameOptions {
  fileId: string;
  nodes: FigmaNode[];
}

export class FigmaClient {
  private accessToken: string;
  private baseUrl = 'https://api.figma.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Create a new Figma file
   */
  async createFile(options: CreateFileOptions): Promise<FigmaFile> {
    const response = await fetch(`${this.baseUrl}/files`, {
      method: 'POST',
      headers: {
        'X-Figma-Token': this.accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: options.name,
        ...(options.teamId && { team_id: options.teamId }),
      }),
    });

    if (!response.ok) {
      let error: { message?: string };
      try {
        error = await response.json() as { message?: string };
      } catch {
        error = { message: response.statusText };
      }
      throw new Error(`Figma API error: ${error.message || response.statusText}`);
    }

    const data = await response.json() as { key: string; name: string };

    return {
      id: data.key,
      name: data.name,
      url: `https://www.figma.com/file/${data.key}`,
      lastModified: new Date().toISOString(),
    };
  }

  /**
   * Add frames to an existing Figma file
   */
  async createFrames(_options: CreateFrameOptions): Promise<void> {
    // Figma API doesn't support direct frame creation via REST API
    // We'll use the plugin API approach or file duplication
    // For now, we'll document this limitation
    throw new Error('Frame creation requires Figma Plugin API - use exportToFigmaPlugin instead');
  }

  /**
   * Get file information
   */
  async getFile(fileId: string): Promise<FigmaFile> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      headers: {
        'X-Figma-Token': this.accessToken,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma file: ${response.statusText}`);
    }

    const data = await response.json() as {
      name: string;
      thumbnailUrl?: string;
      lastModified: string;
    };

    return {
      id: fileId,
      name: data.name,
      url: `https://www.figma.com/file/${fileId}`,
      thumbnailUrl: data.thumbnailUrl,
      lastModified: data.lastModified,
    };
  }

  /**
   * Generate a share link for a Figma file
   */
  getShareLink(fileId: string): string {
    return `https://www.figma.com/file/${fileId}`;
  }

  /**
   * Create Figma nodes from wireframe data
   * This generates the JSON structure that can be imported into Figma
   */
  createNodesFromWireframe(wireframeElements: any[]): FigmaNode[] {
    return wireframeElements.map((element, index) => {
      const node: FigmaNode = {
        id: element.id || `node-${index}`,
        name: element.name || `Element ${index}`,
        type: this.mapElementTypeToFigma(element.type),
        ...(element.x !== undefined && { x: element.x }),
        ...(element.y !== undefined && { y: element.y }),
        ...(element.width !== undefined && { width: element.width }),
        ...(element.height !== undefined && { height: element.height }),
      };

      // Add fills if present
      if (element.fills && element.fills.length > 0) {
        node.fills = element.fills.map((fill: any) => ({
          type: fill.type || 'SOLID',
          color: fill.color || { r: 1, g: 1, b: 1, a: 1 },
        }));
      }

      // Add strokes if present
      if (element.strokes && element.strokes.length > 0) {
        node.strokes = element.strokes.map((stroke: any) => ({
          type: 'SOLID',
          color: stroke.color || { r: 0, g: 0, b: 0, a: 1 },
          weight: stroke.weight || 1,
        }));
      }

      // Add corner radius if present
      if (element.cornerRadius !== undefined) {
        node.cornerRadius = element.cornerRadius;
      }

      // Add text content if present
      if (element.textContent) {
        node.characters = element.textContent;
        node.fontSize = element.fontSize || 16;
        node.fontFamily = element.fontFamily || 'Inter';
      }

      // Add bounding box
      if (element.x !== undefined && element.y !== undefined &&
          element.width !== undefined && element.height !== undefined) {
        node.absoluteBoundingBox = {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        };
      }

      return node;
    });
  }

  /**
   * Map wireframe element types to Figma node types
   */
  private mapElementTypeToFigma(type: string): FigmaNode['type'] {
    const typeMap: Record<string, FigmaNode['type']> = {
      'container': 'FRAME',
      'frame': 'FRAME',
      'rectangle': 'RECTANGLE',
      'button': 'RECTANGLE',
      'input': 'RECTANGLE',
      'text': 'TEXT',
      'group': 'GROUP',
      'component': 'COMPONENT',
    };

    return typeMap[type.toLowerCase()] || 'FRAME';
  }

  /**
   * Export wireframe data to Figma-compatible JSON
   * This can be imported into Figma manually or via plugin
   */
  exportToFigmaJSON(wireframe: any): string {
    const figmaNodes = this.createNodesFromWireframe(wireframe.elements || []);

    const figmaDocument = {
      name: 'UIForge Wireframe',
      type: 'CANVAS',
      children: [{
        id: 'main-frame',
        name: wireframe.type || 'Wireframe',
        type: 'FRAME',
        width: wireframe.width || 375,
        height: wireframe.height || 812,
        x: 0,
        y: 0,
        children: figmaNodes,
        fills: [{
          type: 'SOLID',
          color: { r: 1, g: 1, b: 1, a: 1 }
        }],
      }],
    };

    return JSON.stringify(figmaDocument, null, 2);
  }

  /**
   * Validate Figma access token
   */
  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: {
          'X-Figma-Token': this.accessToken,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Create a Figma client instance
 */
export function createFigmaClient(accessToken: string): FigmaClient {
  if (!accessToken) {
    throw new Error('Figma access token is required');
  }

  return new FigmaClient(accessToken);
}
