/**
 * Atomic Architecture Templates
 * Defines configurable React project structures for GitHub integration
 */

export interface ArchitectureTemplate {
  id: string;
  name: string;
  description: string;
  type: 'atomic' | 'fsd' | 'custom';
  structure: FolderStructure;
  defaultConfig: ArchitectureConfig;
}

export interface FolderStructure {
  [key: string]: FolderNode;
}

export interface FolderNode {
  type: 'folder' | 'file';
  path: string;
  description?: string;
  children?: FolderStructure;
  fileContent?: string;
  required?: boolean;
}

export interface ArchitectureConfig {
  fileExtension: string;
  componentNamingPattern: 'PascalCase' | 'camelCase' | 'kebab-case' | 'snake_case';
  generateIndexFiles: boolean;
  generateStyleFiles: boolean;
  generateTestFiles: boolean;
  generateStoryFiles: boolean;
  indexFilePattern: 'barrel' | 'named' | 'none';
  styleFileLocation: 'same' | 'separate' | 'css-modules';
}

export interface ComponentMapping {
  componentType: 'atom' | 'molecule' | 'organism' | 'template' | 'feature' | 'widget' | 'entity' | 'shared';
  folderPath: string;
}

class ArchitectureTemplateManager {
  private templates: Map<string, ArchitectureTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Get all available templates
   */
  getTemplates(): ArchitectureTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Get template by ID
   */
  getTemplate(id: string): ArchitectureTemplate | undefined {
    return this.templates.get(id);
  }

  /**
   * Get folder structure for a template
   */
  getFolderStructure(templateId: string): FolderStructure | undefined {
    const template = this.getTemplate(templateId);
    return template?.structure;
  }

  /**
   * Get component mapping for a template
   */
  getComponentMapping(templateId: string): ComponentMapping[] {
    const template = this.getTemplate(templateId);
    if (!template) return [];

    return this.extractComponentMappings(template.structure);
  }

  /**
   * Generate file path for a component
   */
  generateComponentPath(
    templateId: string,
    componentType: string,
    componentName: string,
    config: ArchitectureConfig
  ): string {
    const mapping = this.getComponentMapping(templateId)
      .find(m => m.componentType === componentType);

    if (!mapping) {
      throw new Error(`No mapping found for component type: ${componentType}`);
    }

    const formattedName = this.formatComponentName(componentName, config);
    return mapping.folderPath.replace('{componentName}', formattedName);
  }

  /**
   * Format component name according to naming pattern
   */
  formatComponentName(name: string, config: ArchitectureConfig): string {
    switch (config.componentNamingPattern) {
      case 'PascalCase':
        return this.toPascalCase(name);
      case 'camelCase':
        return this.toCamelCase(name);
      case 'kebab-case':
        return this.toKebabCase(name);
      case 'snake_case':
        return this.toSnakeCase(name);
      default:
        return name;
    }
  }

  /**
   * Validate folder structure
   */
  validateStructure(structure: FolderStructure): boolean {
    // Validate each node in the structure
    for (const node of Object.values(structure)) {
      if (!this.validateNode(node, '')) {
        return false;
      }
    }
    return true;
  }

  /**
   * Initialize built-in templates
   */
  private initializeTemplates(): void {
    // Atomic Design Template
    this.templates.set('atomic', {
      id: 'atomic',
      name: 'Atomic Design',
      description: 'Organizes components into atoms, molecules, organisms, and templates',
      type: 'atomic',
      structure: {
        'src': {
          type: 'folder',
          path: 'src',
          description: 'Source directory',
          children: {
            'components': {
              type: 'folder',
              path: 'src/components',
              description: 'Component library',
              children: {
                'atoms': {
                  type: 'folder',
                  path: 'src/components/atoms',
                  description: 'Basic UI elements (Button, Input, Icon)',
                  children: {}
                },
                'molecules': {
                  type: 'folder',
                  path: 'src/components/molecules',
                  description: 'Combined atoms (SearchBar, Card, FormField)',
                  children: {}
                },
                'organisms': {
                  type: 'folder',
                  path: 'src/components/organisms',
                  description: 'Complex sections (Header, Form, Navigation)',
                  children: {}
                },
                'templates': {
                  type: 'folder',
                  path: 'src/components/templates',
                  description: 'Layout templates',
                  children: {}
                }
              }
            },
            'pages': {
              type: 'folder',
              path: 'src/pages',
              description: 'Page-level components',
              children: {}
            },
            'assets': {
              type: 'folder',
              path: 'src/assets',
              description: 'Static assets',
              children: {}
            },
            'styles': {
              type: 'folder',
              path: 'src/styles',
              description: 'Global styles',
              children: {}
            },
            'utils': {
              type: 'folder',
              path: 'src/utils',
              description: 'Utility functions',
              children: {}
            },
            'hooks': {
              type: 'folder',
              path: 'src/hooks',
              description: 'Custom hooks',
              children: {}
            }
          }
        }
      },
      defaultConfig: {
        fileExtension: '.tsx',
        componentNamingPattern: 'PascalCase',
        generateIndexFiles: true,
        generateStyleFiles: true,
        generateTestFiles: false,
        generateStoryFiles: false,
        indexFilePattern: 'barrel',
        styleFileLocation: 'same'
      }
    });

    // Feature-Sliced Design Template
    this.templates.set('fsd', {
      id: 'fsd',
      name: 'Feature-Sliced Design',
      description: 'Organizes code by features and business domains',
      type: 'fsd',
      structure: {
        'src': {
          type: 'folder',
          path: 'src',
          description: 'Source directory',
          children: {
            'app': {
              type: 'folder',
              path: 'src/app',
              description: 'App-level configuration',
              children: {
                'providers': {
                  type: 'folder',
                  path: 'src/app/providers',
                  description: 'Context providers',
                  children: {}
                },
                'router': {
                  type: 'folder',
                  path: 'src/app/router',
                  description: 'Router configuration',
                  children: {}
                }
              }
            },
            'pages': {
              type: 'folder',
              path: 'src/pages',
              description: 'Page components',
              children: {}
            },
            'widgets': {
              type: 'folder',
              path: 'src/widgets',
              description: 'Complex UI blocks',
              children: {}
            },
            'features': {
              type: 'folder',
              path: 'src/features',
              description: 'Business features',
              children: {}
            },
            'entities': {
              type: 'folder',
              path: 'src/entities',
              description: 'Domain models',
              children: {}
            },
            'shared': {
              type: 'folder',
              path: 'src/shared',
              description: 'Shared utilities',
              children: {
                'ui': {
                  type: 'folder',
                  path: 'src/shared/ui',
                  description: 'Shared UI components',
                  children: {}
                },
                'lib': {
                  type: 'folder',
                  path: 'src/shared/lib',
                  description: 'Shared libraries',
                  children: {}
                },
                'api': {
                  type: 'folder',
                  path: 'src/shared/api',
                  description: 'Shared API utilities',
                  children: {}
                }
              }
            }
          }
        }
      },
      defaultConfig: {
        fileExtension: '.tsx',
        componentNamingPattern: 'PascalCase',
        generateIndexFiles: true,
        generateStyleFiles: true,
        generateTestFiles: false,
        generateStoryFiles: false,
        indexFilePattern: 'barrel',
        styleFileLocation: 'separate'
      }
    });

    // Custom Template (minimal structure)
    this.templates.set('custom', {
      id: 'custom',
      name: 'Custom Structure',
      description: 'User-configurable minimal structure',
      type: 'custom',
      structure: {
        'src': {
          type: 'folder',
          path: 'src',
          description: 'Source directory',
          children: {
            'components': {
              type: 'folder',
              path: 'src/components',
              description: 'All components',
              children: {}
            },
            'pages': {
              type: 'folder',
              path: 'src/pages',
              description: 'Page components',
              children: {}
            },
            'lib': {
              type: 'folder',
              path: 'src/lib',
              description: 'Utilities and helpers',
              children: {}
            },
            'styles': {
              type: 'folder',
              path: 'src/styles',
              description: 'Style files',
              children: {}
            }
          }
        }
      },
      defaultConfig: {
        fileExtension: '.tsx',
        componentNamingPattern: 'PascalCase',
        generateIndexFiles: false,
        generateStyleFiles: true,
        generateTestFiles: false,
        generateStoryFiles: false,
        indexFilePattern: 'none',
        styleFileLocation: 'same'
      }
    });
  }

  /**
   * Extract component mappings from folder structure
   */
  private extractComponentMappings(structure: FolderStructure): ComponentMapping[] {
    const mappings: ComponentMapping[] = [];

    for (const node of Object.values(structure)) {
      this.extractMappingsRecursive(node, '', mappings);
    }

    return mappings;
  }

  /**
   * Recursively extract component mappings
   */
  private extractMappingsRecursive(
    node: FolderNode,
    currentPath: string,
    mappings: ComponentMapping[]
  ): void {
    if (node.type === 'folder' && node.children) {
      // Check if this folder represents a component type
      const componentType = this.getComponentTypeFromPath(node.path);
      if (componentType) {
        mappings.push({
          componentType: componentType as ComponentMapping['componentType'],
          folderPath: node.path + '/{componentName}'
        });
      }

      // Recurse into children
      for (const child of Object.values(node.children)) {
        this.extractMappingsRecursive(child, currentPath, mappings);
      }
    }
  }

  /**
   * Get component type from folder path
   */
  private getComponentTypeFromPath(path: string): ComponentMapping['componentType'] | null {
    const pathParts = path.split('/');
    const lastPart = pathParts[pathParts.length - 1];

    switch (lastPart) {
      case 'atoms':
        return 'atom';
      case 'molecules':
        return 'molecule';
      case 'organisms':
        return 'organism';
      case 'templates':
        return 'template';
      case 'features':
        return 'feature';
      case 'widgets':
        return 'widget';
      case 'entities':
        return 'entity';
      case 'shared':
        return 'shared';
      default:
        return null;
    }
  }

  /**
   * Validate folder structure recursively
   */
  private validateNode(node: FolderNode, currentPath: string): boolean {
    if (node.type === 'folder' && node.children) {
      for (const child of Object.values(node.children)) {
        if (!this.validateNode(child, currentPath)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Convert string to PascalCase
   */
  private toPascalCase(str: string): string {
    return str
      .replace(/(?:^|[-_])+(\w)/g, (_, c) => c.toUpperCase())
      .replace(/^[a-z]/, c => c.toUpperCase());
  }

  /**
   * Convert string to camelCase
   */
  private toCamelCase(str: string): string {
    return str
      .replace(/(?:^|[-_])+(\w)/g, (_, c) => c.toUpperCase())
      .replace(/^[A-Z]/, c => c.toLowerCase());
  }

  /**
   * Convert string to kebab-case
   */
  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()
      .replace(/[_\s]+/g, '-');
  }

  /**
   * Convert string to snake_case
   */
  private toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .toLowerCase()
      .replace(/[-\s]+/g, '_');
  }
}

// Export singleton instance
export const architectureTemplateManager = new ArchitectureTemplateManager();
