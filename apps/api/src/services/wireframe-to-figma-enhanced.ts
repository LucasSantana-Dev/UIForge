/**
 * Enhanced Wireframe to Figma Converter
 * Converts UIForge wireframe data structures to Figma-compatible formats
 * with Auto Layout, Components, and Variants support
 */

import type { FigmaFill, FigmaStroke } from './figma-client';

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
  document: any;
  components: any[];
  styles: {
    colors: Record<string, FigmaFill>;
    textStyles: Record<string, any>;
    effects: Record<string, any>;
  };
  metadata: {
    totalElements: number;
    componentsCreated: number;
    conversionTime: number;
    warnings: string[];
  };
}

/**
 * Convert wireframe to Figma with advanced features
 */
export function convertWireframeToFigma(
  wireframe: any,
  options: ConversionOptions = {}
): ConversionResult {
  const startTime = Date.now();
  const warnings: string[] = [];

  const {
    includeStyles = true,
    scaleFactor = 1,
    useAutoLayout = true,
    createVariants = true,
    optimizeForPrototype = true,
  } = options;

  // Extract elements from wireframe
  const elements = wireframe.elements || [];

  // Create component library first
  const compLibrary = createComponentLibrary(elements, {
    useAutoLayout,
    createVariants,
    optimizeForPrototype,
  });

  // Convert elements using component library
  const { nodes, components } = convertElementsWithComponents(elements, compLibrary, {
    scaleFactor,
    useAutoLayout,
    optimizeForPrototype,
  });

  // Extract and convert styles
  const styles = includeStyles
    ? extractEnhancedStyles(wireframe.styles || {}, compLibrary)
    : {
        colors: {},
        textStyles: {},
        effects: {},
      };

  // Create Figma document structure
  const document = createFigmaDocument(wireframe, nodes, {
    useAutoLayout,
    optimizeForPrototype,
  });

  return {
    document,
    components,
    styles,
    metadata: {
      totalElements: elements.length,
      componentsCreated: components.length,
      conversionTime: Date.now() - startTime,
      warnings,
    },
  };
}

/**
 * Create component library with variants
 */
function createComponentLibrary(
  elements: any[],
  options: {
    useAutoLayout: boolean;
    createVariants: boolean;
    optimizeForPrototype: boolean;
  }
) {
  const { useAutoLayout, createVariants, optimizeForPrototype } = options;
  const components: any[] = [];
  const componentMap = new Map();

  // Group similar elements for component creation
  const elementGroups = groupElementsByType(elements);

  Object.entries(elementGroups).forEach(([type, groupElements]) => {
    if (groupElements.length > 1 || createVariants) {
      const component = createComponentWithVariants(type, groupElements, {
        useAutoLayout,
        createVariants,
        optimizeForPrototype,
      });
      components.push(component);
      componentMap.set(type, component);
    }
  });

  return { components, componentMap };
}

/**
 * Group elements by type for component creation
 */
function groupElementsByType(elements: any[]) {
  const groups: Record<string, any[]> = {};

  elements.forEach((element) => {
    const key = getComponentKey(element);
    if (!groups[key]) groups[key] = [];
    groups[key].push(element);
  });

  return groups;
}

/**
 * Get component key for grouping
 */
function getComponentKey(element: any): string {
  const baseType = element.type;
  const hasText = element.textContent ? '-text' : '';
  const hasIcon = element.icon ? '-icon' : '';
  const size = getElementSizeCategory(element);

  return `${baseType}${hasText}${hasIcon}-${size}`;
}

/**
 * Get element size category
 */
function getElementSizeCategory(element: any): string {
  if (!element.width || !element.height) return 'unknown';

  const area = element.width * element.height;
  if (area < 1000) return 'small';
  if (area < 5000) return 'medium';
  return 'large';
}

/**
 * Create component with variants
 */
function createComponentWithVariants(
  type: string,
  elements: any[],
  options: {
    useAutoLayout: boolean;
    createVariants: boolean;
    optimizeForPrototype: boolean;
  }
) {
  const { useAutoLayout, createVariants, optimizeForPrototype } = options;

  const baseComponent: any = {
    id: `component-${type}`,
    name: `${toPascalCase(type)} Component`,
    type: 'COMPONENT',
    children: [],
    componentProperties: {},
  };

  if (createVariants && elements.length > 1) {
    // Create variants for different states
    const variants = createComponentVariants(elements);
    baseComponent.children = variants;
    baseComponent.variants = createVariants
      ? [
          {
            name: 'State',
            type: 'VARIANT',
            values: ['Default', 'Hover', 'Pressed', 'Disabled'],
            defaultValue: 'Default',
          },
        ]
      : undefined;
  } else {
    // Single component
    const mainElement = elements[0];
    baseComponent.children = [
      convertElementToNode(mainElement, 0, {
        scaleFactor: 1,
        useAutoLayout,
        optimizeForPrototype,
      }),
    ];
  }

  // Add Auto Layout if enabled
  if (useAutoLayout) {
    addAutoLayoutToComponent(baseComponent, elements[0]);
  }

  // Add prototype optimizations
  if (optimizeForPrototype) {
    addPrototypeOptimizations(baseComponent);
  }

  return baseComponent;
}

/**
 * Create component variants
 */
function createComponentVariants(elements: any[]): any[] {
  const variants: any[] = [];
  const states = ['Default', 'Hover', 'Pressed', 'Disabled'];

  states.forEach((state, index) => {
    const variantElement = { ...elements[0] };

    // Apply state-specific modifications
    switch (state) {
      case 'Hover':
        if (variantElement.fills) {
          variantElement.fills = variantElement.fills.map((fill: any) => ({
            ...fill,
            color: {
              ...fill.color,
              r: Math.min(255, fill.color.r + 20),
              g: Math.min(255, fill.color.g + 20),
              b: Math.min(255, fill.color.b + 20),
            },
          }));
        }
        break;
      case 'Pressed':
        if (variantElement.fills) {
          variantElement.fills = variantElement.fills.map((fill: any) => ({
            ...fill,
            color: {
              ...fill.color,
              r: Math.max(0, fill.color.r - 20),
              g: Math.max(0, fill.color.g - 20),
              b: Math.max(0, fill.color.b - 20),
            },
          }));
        }
        break;
      case 'Disabled':
        if (variantElement.fills) {
          variantElement.fills = variantElement.fills.map((fill: any) => ({
            ...fill,
            color: {
              ...fill.color,
              a: 0.5,
            },
          }));
        }
        break;
    }

    const variantNode = convertElementToNode(variantElement, index, {
      scaleFactor: 1,
      useAutoLayout: true,
      optimizeForPrototype: true,
    });

    variants.push({
      ...variantNode,
      name: state,
      type: 'INSTANCE',
    });
  });

  return variants;
}

/**
 * Add Auto Layout to component
 */
function addAutoLayoutToComponent(component: any, element: any) {
  component.layoutMode = 'HORIZONTAL';
  component.itemSpacing = 8;
  component.paddingLeft = element.padding?.left || 16;
  component.paddingRight = element.padding?.right || 16;
  component.paddingTop = element.padding?.top || 16;
  component.paddingBottom = element.padding?.bottom || 16;
  component.layoutAlign = 'STRETCH';
  component.layoutGrow = 0;

  // Responsive sizing
  if (element.responsive) {
    component.layoutAlign = 'STRETCH';
    component.layoutGrow = 1;
  }
}

/**
 * Add prototype optimizations
 */
function addPrototypeOptimizations(component: any) {
  // Add interaction hints
  component.interactions = [
    {
      eventType: 'ON_CLICK',
      action: {
        type: 'NAVIGATE_TO',
        destination: { name: 'Next Screen' },
      },
    },
  ];

  // Add smart animate
  component.transitionDuration = 0.3;
  component.transitionEasing = 'EASE_IN_OUT';
}

/**
 * Convert elements using component library
 */
function convertElementsWithComponents(
  elements: any[],
  componentLibrary: any,
  options: {
    scaleFactor: number;
    useAutoLayout: boolean;
    optimizeForPrototype: boolean;
  }
) {
  const { scaleFactor, useAutoLayout, optimizeForPrototype } = options;
  const { componentMap } = componentLibrary;
  const nodes: any[] = [];

  elements.forEach((element, index) => {
    const componentKey = getComponentKey(element);
    const component = componentMap.get(componentKey);

    if (component) {
      // Create instance of component
      const instance = createComponentInstance(component, element, index, {
        scaleFactor,
        useAutoLayout,
        optimizeForPrototype,
      });
      nodes.push(instance);
    } else {
      // Convert as regular element
      const node = convertElementToNode(element, index, {
        scaleFactor,
        useAutoLayout,
        optimizeForPrototype,
      });
      nodes.push(node);
    }
  });

  return { nodes, components: componentLibrary.components };
}

/**
 * Create component instance
 */
function createComponentInstance(
  component: any,
  element: any,
  index: number,
  options: {
    scaleFactor: number;
    useAutoLayout: boolean;
    optimizeForPrototype: boolean;
  }
) {
  const { scaleFactor } = options;

  return {
    id: element.id || `instance-${index}`,
    name: element.name || `${component.name} Instance`,
    type: 'INSTANCE',
    componentId: component.id,
    x: element.x ? element.x * scaleFactor : 0,
    y: element.y ? element.y * scaleFactor : 0,
    width: element.width ? element.width * scaleFactor : 100,
    height: element.height ? element.height * scaleFactor : 100,
    overrides: extractComponentOverrides(element, component),
  };
}

/**
 * Extract component overrides
 */
function extractComponentOverrides(element: any, component: any): any {
  const overrides: any = {};

  // Text overrides
  if (element.textContent) {
    overrides.text = element.textContent;
  }

  // Color overrides
  if (element.fills && element.fills.length > 0) {
    overrides.fills = element.fills;
  }

  // Size overrides
  if (element.width !== component.width || element.height !== component.height) {
    overrides.size = { width: element.width, height: element.height };
  }

  return overrides;
}

/**
 * Convert element to Figma node with enhanced features
 */
function convertElementToNode(
  element: any,
  index: number,
  options: {
    scaleFactor: number;
    useAutoLayout: boolean;
    optimizeForPrototype: boolean;
  }
): any {
  const { scaleFactor, useAutoLayout, optimizeForPrototype } = options;

  const node: any = {
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
    node.textAlignHorizontal = element.textAlign || 'LEFT';
    node.textAlignVertical = element.verticalAlign || 'TOP';
  }

  // Add Auto Layout
  if (useAutoLayout && (element.type === 'container' || element.type === 'frame')) {
    addAutoLayoutToNode(node, element);
  }

  // Add prototype optimizations
  if (optimizeForPrototype) {
    addNodePrototypeOptimizations(node, element);
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

  // Auto Layout constraints
  node.constraints = {
    horizontal: element.constraints?.horizontal || 'SCALE',
    vertical: element.constraints?.vertical || 'SCALE',
  };
}

/**
 * Add prototype optimizations to node
 */
function addNodePrototypeOptimizations(node: any, element: any) {
  // Add interaction hints
  if (element.interactive) {
    node.interactions = [
      {
        eventType: 'ON_CLICK',
        action: {
          type: 'NODE',
          destination: { id: element.linkTo },
        },
      },
    ];
  }

  // Add smart animate
  node.transitionDuration = element.transitionDuration || 0.2;
  node.transitionEasing = element.transitionEasing || 'EASE_IN_OUT';
}

/**
 * Create Figma document structure
 */
function createFigmaDocument(
  wireframe: any,
  nodes: any[],
  options: {
    useAutoLayout: boolean;
    optimizeForPrototype: boolean;
  }
) {
  const { useAutoLayout } = options;

  const document = {
    name: wireframe.name || 'UIForge Wireframe',
    type: 'DOCUMENT',
    children: [
      {
        name: 'Page 1',
        type: 'CANVAS',
        children: [
          {
            name: 'Main Frame',
            type: 'FRAME',
            width: wireframe.width || 375,
            height: wireframe.height || 812,
            x: 0,
            y: 0,
            fills: [
              {
                type: 'SOLID',
                color: { r: 0.98, g: 0.98, b: 0.98, a: 1 },
              },
            ],
            children: nodes,
            ...(useAutoLayout && {
              layoutMode: 'VERTICAL',
              itemSpacing: 16,
              padding: { left: 24, right: 24, top: 24, bottom: 24 },
            }),
          },
        ],
      },
    ],
  };

  return document;
}

/**
 * Extract enhanced styles
 */
function extractEnhancedStyles(_styles: any, _componentLibrary: any) {
  return {
    colors: extractColorStyles(),
    textStyles: extractTextStyles(),
    effects: extractEffectStyles(),
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
 * Extract effect styles
 */
function extractEffectStyles(): Record<string, any> {
  return {
    shadow: {
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 2 },
      radius: 4,
    },
    buttonShadow: {
      type: 'DROP_SHADOW',
      color: { r: 0, g: 0, b: 0, a: 0.15 },
      offset: { x: 0, y: 4 },
      radius: 8,
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
function mapTypeToFigma(type: string): string {
  const typeMap: Record<string, string> = {
    container: 'FRAME',
    frame: 'FRAME',
    rectangle: 'RECTANGLE',
    button: 'RECTANGLE',
    input: 'RECTANGLE',
    text: 'TEXT',
    group: 'GROUP',
    ellipse: 'ELLIPSE',
    line: 'LINE',
    vector: 'VECTOR',
  };
  return typeMap[type.toLowerCase()] || 'FRAME';
}

/**
 * Convert string to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split(/[-_\s]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}
