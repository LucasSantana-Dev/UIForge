/**
 * Wireframe to Figma Converter
 * Converts Siza wireframe data structures to Figma-compatible formats
 */

import type { FigmaNode, FigmaFill, FigmaStroke } from './figma-client';

export interface ConversionOptions {
  includeStyles?: boolean;
  addAutoLayout?: boolean;
  generateComponents?: boolean;
  scaleFactor?: number;
  useAutoLayout?: boolean;
  createVariants?: boolean;
  optimizeForPrototype?: boolean;
}

export interface ConversionResult {
  nodes: FigmaNode[];
  styles: {
    colors: Record<string, FigmaFill>;
    textStyles: Record<string, any>;
  };
  metadata: {
    totalElements: number;
    conversionTime: number;
    warnings: string[];
  };
}

/**
 * Convert wireframe elements to Figma nodes
 */
export function convertWireframeToFigma(
  wireframe: any,
  options: ConversionOptions = {}
): ConversionResult {
  const startTime = Date.now();
  const warnings: string[] = [];

  const { includeStyles = true, scaleFactor = 1, useAutoLayout = true } = options;

  // Extract elements from wireframe
  const elements = wireframe.elements || [];

  // Convert elements to Figma nodes
  const nodes = elements.map((element: any, index: number) =>
    convertElementToNode(element, index, { scaleFactor, useAutoLayout })
  );

  // Extract styles
  const styles = includeStyles
    ? extractStyles(wireframe.styles || {})
    : {
        colors: {},
        textStyles: {},
      };

  return {
    nodes,
    styles,
    metadata: {
      totalElements: elements.length,
      conversionTime: Date.now() - startTime,
      warnings,
    },
  };
}

/**
 * Convert element to Figma node
 */
function convertElementToNode(
  element: any,
  index: number,
  options: {
    scaleFactor: number;
    useAutoLayout: boolean;
  }
): FigmaNode {
  const { scaleFactor, useAutoLayout } = options;

  const node: FigmaNode = {
    id: element.id || `element-${index}`,
    name: element.name || `Element ${index + 1}`,
    type: mapTypeToFigma(element.type),
  };

  // Apply scaling
  if (element.x !== undefined) node.x = element.x * scaleFactor;
  if (element.y !== undefined) node.y = element.y * scaleFactor;
  if (element.width !== undefined) node.width = element.width * scaleFactor;
  if (element.height !== undefined) node.height = element.height * scaleFactor;

  // Convert fills
  if (element.fills && element.fills.length > 0) {
    node.fills = element.fills.map(convertFill);
  }

  // Convert strokes
  if (element.strokes && element.strokes.length > 0) {
    node.strokes = element.strokes.map(convertStroke);
  }

  // Corner radius
  if (element.cornerRadius !== undefined) {
    node.cornerRadius = element.cornerRadius;
  }

  // Text properties
  if (element.textContent) {
    node.characters = element.textContent;
    node.fontSize = element.fontSize ? element.fontSize * scaleFactor : 16;
    node.fontFamily = element.fontFamily || 'Inter';
  }

  // Add Auto Layout
  if (useAutoLayout && (element.type === 'container' || element.type === 'frame')) {
    addAutoLayoutToNode(node, element);
  }

  return node;
}

/**
 * Add Auto Layout to node
 */
function addAutoLayoutToNode(node: any, element: any) {
  node.layoutMode = element.layoutMode || 'VERTICAL';
  node.itemSpacing = element.spacing || 8;
  node.paddingLeft = element.padding?.left || 16;
  node.paddingRight = element.padding?.right || 16;
  node.paddingTop = element.padding?.top || 16;
  node.paddingBottom = element.padding?.bottom || 16;
  node.layoutAlign = element.layoutAlign || 'STRETCH';
  node.layoutGrow = element.layoutGrow || 0;
}

/**
 * Extract styles from wireframe
 */
function extractStyles(_styles: any) {
  return {
    colors: extractColorStyles(),
    textStyles: extractTextStyles(),
  };
}

/**
 * Extract color styles
 */
function extractColorStyles(): Record<string, FigmaFill> {
  const colors: Record<string, FigmaFill> = {};

  // Define design system colors
  const designSystemColors = {
    primary: { type: 'SOLID', color: { r: 59, g: 130, b: 246, a: 1 } },
    secondary: { type: 'SOLID', color: { r: 107, g: 114, b: 128, a: 1 } },
    success: { type: 'SOLID', color: { r: 34, g: 197, b: 94, a: 1 } },
    warning: { type: 'SOLID', color: { r: 251, g: 146, b: 60, a: 1 } },
    error: { type: 'SOLID', color: { r: 239, g: 68, b: 68, a: 1 } },
    background: { type: 'SOLID', color: { r: 249, g: 250, b: 251, a: 1 } },
    surface: { type: 'SOLID', color: { r: 255, g: 255, b: 255, a: 1 } },
  };

  Object.assign(colors, designSystemColors);

  return colors;
}

/**
 * Extract text styles
 */
function extractTextStyles(): Record<string, any> {
  return {
    heading: {
      fontFamily: 'Inter',
      fontWeight: 700,
      fontSize: 24,
      lineHeight: 32,
    },
    body: {
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: 16,
      lineHeight: 24,
    },
    caption: {
      fontFamily: 'Inter',
      fontWeight: 400,
      fontSize: 12,
      lineHeight: 16,
    },
  };
}

/**
 * Convert fill to Figma format
 */
function convertFill(fill: any): FigmaFill {
  return {
    type: fill.type || 'SOLID',
    color: fill.color || { r: 0, g: 0, b: 0, a: 1 },
  };
}

/**
 * Convert stroke to Figma format
 */
function convertStroke(stroke: any): FigmaStroke {
  return {
    type: stroke.type || 'SOLID',
    color: stroke.color || { r: 0, g: 0, b: 0, a: 1 },
    weight: stroke.weight || 1,
  };
}

/**
 * Map element type to Figma type
 */
function mapTypeToFigma(type: string): FigmaNode['type'] {
  const typeMap: Record<string, FigmaNode['type']> = {
    container: 'FRAME',
    frame: 'FRAME',
    rectangle: 'RECTANGLE',
    button: 'RECTANGLE',
    input: 'RECTANGLE',
    text: 'TEXT',
    group: 'GROUP',
    component: 'COMPONENT',
  };
  return typeMap[type.toLowerCase()] || 'FRAME';
}
