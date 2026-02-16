/**
 * Unit Tests for Validation Schemas
 */

import {
  createProjectSchema,
  updateProjectSchema,
  projectQuerySchema,
} from '../validation/projects';
import {
  createComponentSchema,
  updateComponentSchema,
  componentQuerySchema,
} from '../validation/components';

describe('Project Validation Schemas', () => {
  describe('createProjectSchema', () => {
    it('should validate valid project data', () => {
      const validData = {
        name: 'Test Project',
        description: 'A test project',
        framework: 'react',
        component_library: 'shadcn',
        is_public: false,
      };

      const result = createProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should apply defaults for optional fields', () => {
      const minimalData = {
        name: 'Test Project',
        framework: 'nextjs',
      };

      const result = createProjectSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.component_library).toBe('none');
        expect(result.data.is_public).toBe(false);
      }
    });

    it('should reject invalid framework', () => {
      const invalidData = {
        name: 'Test',
        framework: 'invalid-framework',
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject name that is too long', () => {
      const invalidData = {
        name: 'a'.repeat(101),
        framework: 'react',
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject description that is too long', () => {
      const invalidData = {
        name: 'Test',
        framework: 'react',
        description: 'a'.repeat(501),
      };

      const result = createProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProjectSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        name: 'Updated Name',
      };

      const result = updateProjectSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });

    it('should allow empty updates', () => {
      const result = updateProjectSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe('projectQuerySchema', () => {
    it('should apply defaults for query parameters', () => {
      const result = projectQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(10);
        expect(result.data.sort).toBe('updated_at');
        expect(result.data.order).toBe('desc');
      }
    });

    it('should coerce string numbers to integers', () => {
      const result = projectQuerySchema.safeParse({
        page: '2',
        limit: '20',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(2);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject invalid page number', () => {
      const result = projectQuerySchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it('should reject limit exceeding maximum', () => {
      const result = projectQuerySchema.safeParse({ limit: 101 });
      expect(result.success).toBe(false);
    });

    it('should validate search parameter', () => {
      const result = projectQuerySchema.safeParse({ search: 'test query' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe('test query');
      }
    });
  });
});

describe('Component Validation Schemas', () => {
  describe('createComponentSchema', () => {
    it('should validate valid component data', () => {
      const validData = {
        project_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Button',
        description: 'A button component',
        component_type: 'button',
        framework: 'react',
        code_content: 'export const Button = () => <button>Click</button>',
        props: { variant: 'primary' },
      };

      const result = createComponentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should apply default props', () => {
      const minimalData = {
        project_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Card',
        component_type: 'card',
        framework: 'react',
        code_content: 'export const Card = () => <div>Card</div>',
      };

      const result = createComponentSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.props).toEqual({});
      }
    });

    it('should reject invalid UUID', () => {
      const invalidData = {
        project_id: 'not-a-uuid',
        name: 'Button',
        component_type: 'button',
        framework: 'react',
        code_content: 'code',
      };

      const result = createComponentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid component type', () => {
      const invalidData = {
        project_id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test',
        component_type: 'invalid-type',
        framework: 'react',
        code_content: 'code',
      };

      const result = createComponentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateComponentSchema', () => {
    it('should allow partial updates', () => {
      const partialData = {
        name: 'Updated Button',
        code_content: 'new code',
      };

      const result = updateComponentSchema.safeParse(partialData);
      expect(result.success).toBe(true);
    });
  });

  describe('componentQuerySchema', () => {
    it('should validate project_id', () => {
      const validData = {
        project_id: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = componentQuerySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUID', () => {
      const result = componentQuerySchema.safeParse({ project_id: 'invalid' });
      expect(result.success).toBe(false);
    });
  });
});
