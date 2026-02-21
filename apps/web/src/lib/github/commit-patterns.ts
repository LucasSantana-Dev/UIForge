/**
 * GitHub Commit Pattern Generator
 * Generates semantic commit messages for UIForge component operations
 */

export interface CommitMetadata {
  projectId: string;
  projectName: string;
  framework: string;
  componentLibrary?: string;
  componentType?: string;
  timestamp: string;
  userId: string;
  operationType: 'add' | 'update' | 'delete' | 'migrate' | 'import';
  componentsCount?: number;
  architectureType?: 'atomic' | 'fsd' | 'custom';
}

export interface CommitPattern {
  type: string;
  scope: string;
  subject: string;
  body?: string;
  footer?: string;
}

export interface ComponentChange {
  name: string;
  path: string;
  operation: 'add' | 'update' | 'delete';
  type: 'atom' | 'molecule' | 'organism' | 'template' | 'feature' | 'widget' | 'entity' | 'shared';
  description?: string;
}

class CommitPatternGenerator {
  /**
   * Generate commit message for component addition
   */
  generateComponentAddCommit(
    components: ComponentChange[],
    metadata: CommitMetadata
  ): CommitPattern {
    const componentNames = components.map(c => c.name).join(', ');
    const componentTypes = this.getComponentTypes(components);

    return {
      type: 'feat',
      scope: this.getScope(components),
      subject: `add ${componentNames}`,
      body: this.generateComponentBody(components, metadata),
      footer: this.generateFooter(metadata)
    };
  }

  /**
   * Generate commit message for component updates
   */
  generateComponentUpdateCommit(
    components: ComponentChange[],
    metadata: CommitMetadata
  ): CommitPattern {
    const componentNames = components.map(c => c.name).join(', ');

    return {
      type: 'fix',
      scope: this.getScope(components),
      subject: `update ${componentNames}`,
      body: this.generateComponentBody(components, metadata),
      footer: this.generateFooter(metadata)
    };
  }

  /**
   * Generate commit message for component deletion
   */
  generateComponentDeleteCommit(
    components: ComponentChange[],
    metadata: CommitMetadata
  ): CommitPattern {
    const componentNames = components.map(c => c.name).join(', ');

    return {
      type: 'feat',
      scope: this.getScope(components),
      subject: `remove ${componentNames}`,
      body: this.generateComponentBody(components, metadata),
      footer: this.generateFooter(metadata)
    };
  }

  /**
   * Generate commit message for multi-component batch operations
   */
  generateBatchCommit(
    components: ComponentChange[],
    metadata: CommitMetadata
  ): CommitPattern {
    const operation = this.getOperationType(components);
    const componentCount = components.length;
    const componentTypes = this.getComponentTypes(components);

    return {
      type: this.getCommitType(operation),
      scope: this.getScope(components),
      subject: this.generateBatchSubject(operation, componentCount, componentTypes),
      body: this.generateBatchBody(components, metadata),
      footer: this.generateFooter(metadata)
    };
  }

  /**
   * Generate commit message for architecture migration
   */
  generateArchitectureMigrationCommit(
    fromArchitecture: string,
    toArchitecture: string,
    metadata: CommitMetadata
  ): CommitPattern {
    return {
      type: 'refactor',
      scope: 'architecture',
      subject: `migrate from ${fromArchitecture} to ${toArchitecture}`,
      body: this.generateArchitectureBody(fromArchitecture, toArchitecture, metadata),
      footer: this.generateFooter(metadata)
    };
  }

  /**
   * Generate commit message for project import from GitHub
   */
  generateImportCommit(
    importCount: number,
    metadata: CommitMetadata
  ): CommitPattern {
    return {
      type: 'feat',
      scope: 'import',
      subject: `import ${importCount} components from GitHub`,
      body: this.generateImportBody(importCount, metadata),
      footer: this.generateFooter(metadata)
    };
  }

  /**
   * Format commit message according to conventional commits
   */
  formatCommitMessage(pattern: CommitPattern): string {
    let message = `${pattern.type}(${pattern.scope}): ${pattern.subject}`;

    if (pattern.body) {
      message += `\n\n${pattern.body}`;
    }

    if (pattern.footer) {
      message += `\n\n${pattern.footer}`;
    }

    return message;
  }

  /**
   * Get the appropriate scope for components
   */
  private getScope(components: ComponentChange[]): string {
    const types = components.map(c => c.type);

    // If all components are the same type, use that as scope
    if (types.every(t => t === types[0])) {
      return types[0] + 's';
    }

    // Otherwise use 'components'
    return 'components';
  }

  /**
   * Get component types for display
   */
  private getComponentTypes(components: ComponentChange[]): string[] {
    return [...new Set(components.map(c => c.type))];
  }

  /**
   * Get operation type from components
   */
  private getOperationType(components: ComponentChange[]): string {
    const operations = components.map(c => c.operation);

    if (operations.every(op => op === 'add')) return 'add';
    if (operations.every(op => op === 'update')) return 'update';
    if (operations.every(op => op === 'delete')) return 'delete';

    return 'mixed';
  }

  /**
   * Get commit type based on operation
   */
  private getCommitType(operation: string): string {
    switch (operation) {
      case 'add':
        return 'feat';
      case 'update':
        return 'fix';
      case 'delete':
        return 'feat';
      default:
        return 'feat';
    }
  }

  /**
   * Generate subject for batch operations
   */
  private generateBatchSubject(
    operation: string,
    count: number,
    types: string[]
  ): string {
    const typeStr = types.length > 1 ? `${types.join('/')} ` : '';
    return `${operation} ${count} ${typeStr}components`;
  }

  /**
   * Generate body for component changes
   */
  private generateComponentBody(components: ComponentChange[], metadata: CommitMetadata): string {
    const lines: string[] = [];

    // Group components by operation
    const grouped = this.groupComponentsByOperation(components);

    for (const [operation, comps] of Object.entries(grouped)) {
      if (operation === 'add') {
        lines.push('### Added');
      } else if (operation === 'update') {
        lines.push('### Updated');
      } else if (operation === 'delete') {
        lines.push('### Removed');
      }

      comps.forEach(comp => {
        const line = `- Add ${comp.path}/${comp.name}`;
        if (comp.description) {
          lines.push(`  ${comp.description}`);
        }
        lines.push(line);
      });

      lines.push(''); // Add blank line between groups
    }

    // Add framework and library information
    if (metadata.framework) {
      lines.push(`**Framework**: ${metadata.framework}`);
    }

    if (metadata.componentLibrary) {
      lines.push(`**Component Library**: ${metadata.componentLibrary}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate body for batch operations
   */
  private generateBatchBody(components: ComponentChange[], metadata: CommitMetadata): string {
    const lines: string[] = [];

    lines.push(`Batch ${this.getOperationType(components)} operation:`);
    lines.push('');

    // List all components
    components.forEach(comp => {
      const icon = this.getOperationIcon(comp.operation);
      lines.push(`${icon} ${comp.path}/${comp.name} (${comp.type})`);
      if (comp.description) {
        lines.push(`  ${comp.description}`);
      }
    });

    lines.push('');
    lines.push(`**Total Components**: ${components.length}`);
    lines.push(`**Framework**: ${metadata.framework}`);

    if (metadata.componentLibrary) {
      lines.push(`**Component Library**: ${metadata.componentLibrary}`);
    }

    return lines.join('\n');
  }

  /**
   * Generate body for architecture migration
   */
  private generateArchitectureBody(
    fromArchitecture: string,
    toArchitecture: string,
    metadata: CommitMetadata
  ): string {
    const lines: string[] = [];

    lines.push(`Migrated project structure from ${fromArchitecture} to ${toArchitecture}`);
    lines.push('');

    lines.push('### Changes:');
    lines.push('- Reorganized component folders');
    lines.push('- Updated import paths');
    lines.push('- Added index files for better exports');
    lines.push('- Updated component exports');

    lines.push('');
    lines.push(`**Project**: ${metadata.projectName}`);
    lines.push(`**Framework**: ${metadata.framework}`);

    return lines.join('\n');
  }

  /**
   * Generate body for import operations
   */
  private generateImportBody(importCount: number, metadata: CommitMetadata): string {
    const lines: string[] = [];

    lines.push(`Imported ${importCount} components from GitHub repository`);
    lines.push('');

    lines.push('### Imported Components:');
    lines.push('- Analyzed repository structure');
    lines.push('- Extracted component files');
    lines.push('- Preserved component metadata');
    lines.push('- Added to UIForge project');

    lines.push('');
    lines.push(`**Source**: GitHub repository`);
    lines.push(`**Framework**: ${metadata.framework}`);

    return lines.join('\n');
  }

  /**
   * Generate footer with metadata
   */
  private generateFooter(metadata: CommitMetadata): string {
    const lines: string[] = [];

    lines.push(`UIForge-Project-ID: ${metadata.projectId}`);
    lines.push(`UIForge-User: ${metadata.userId}`);
    lines.push(`UIForge-Timestamp: ${metadata.timestamp}`);

    if (metadata.architectureType) {
      lines.push(`UIForge-Architecture: ${metadata.architectureType}`);
    }

    return lines.join('\n');
  }

  /**
   * Group components by operation type
   */
  private groupComponentsByOperation(components: ComponentChange[]): Record<string, ComponentChange[]> {
    return components.reduce((groups, component) => {
      const operation = component.operation;
      if (!groups[operation]) {
        groups[operation] = [];
      }
      groups[operation].push(component);
      return groups;
    }, {} as Record<string, ComponentChange[]>);
  }

  /**
   * Get operation icon for display
   */
  private getOperationIcon(operation: string): string {
    switch (operation) {
      case 'add':
        return '+';
      case 'update':
        return '~';
      case 'delete':
        return '-';
      default:
        return '•';
    }
  }
}

// Export singleton instance
export const commitPatternGenerator = new CommitPatternGenerator();
