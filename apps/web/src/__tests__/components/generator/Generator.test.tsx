/**
 * Generator Component Tests
 * Tests for the main component generation interface
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Generator } from '@/components/generator/Generator';
import { useGeneration } from '@/hooks/use-generation';
import { useAIKeyStore } from '@/stores/ai-keys';
import { TEST_CONFIG } from '../../../../../../test-config';

// Mock dependencies
jest.mock('@/hooks/use-generation');
jest.mock('@/stores/ai-keys');
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <h2 {...props}>{children}</h2>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <p {...props}>{children}</p>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, placeholder, ...props }: any) => (
    <input
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value, ...props }: any) => (
    <div onChange={(e) => onValueChange?.(e.target.value)} value={value} {...props}>
      {children}
    </div>
  ),
  SelectContent: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  SelectItem: ({ children, value, ...props }: any) => (
    <option value={value} {...props}>{children}</option>
  ),
  SelectTrigger: ({ children, ...props }: any) => (
    <div {...props}>{children}</div>
  ),
  SelectValue: ({ placeholder, ...props }: any) => (
    <span {...props}>{placeholder}</span>
  ),
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, placeholder, ...props }: any) => (
    <textarea
      onChange={onChange}
      value={value}
      placeholder={placeholder}
      {...props}
    />
  ),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, ...props }: any) => (
    <div role="progressbar" aria-valuenow={value} {...props}>
      {value}%
    </div>
  ),
}));

const mockUseGeneration = useGeneration as jest.MockedFunction<typeof useGeneration>;
const mockUseAIKeyStore = useAIKeyStore as jest.MockedFunction<typeof useAIKeyStore>;

describe('Generator Component', () => {
  const mockGeneration = {
    isGenerating: false,
    progress: 0,
    code: '',
    error: null,
    events: [],
    startGeneration: jest.fn(),
    stopGeneration: jest.fn(),
    reset: jest.fn(),
  };

  const mockStore = {
    apiKeys: [
      {
        provider: 'openai',
        keyId: 'key_openai_123',
        encryptedKey: 'encrypted_openai',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: true,
      },
    ],
    isLoading: false,
    error: null,
    isInitialized: true,
    encryptionKey: TEST_CONFIG.ENCRYPTION.TEST_KEY,
    hasApiKeys: true,
    keysByProvider: { openai: 1, anthropic: 0, google: 0 },
    defaultKeys: {
      openai: {
        provider: 'openai',
        keyId: 'key_openai_123',
        encryptedKey: 'encrypted_openai',
        createdAt: '2026-02-17T00:00:00.000Z',
        lastUsed: '2026-02-17T12:00:00.000Z',
        isDefault: true,
      },
      anthropic: null,
      google: null,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGeneration.mockReturnValue(mockGeneration);
    mockUseAIKeyStore.mockReturnValue(mockStore);
  });

  it('should render generator interface', () => {
    render(<Generator />);

    expect(screen.getByText(/component generator/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/component name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/describe your component/i)).toBeInTheDocument();
  });

  it('should show API key status', () => {
    render(<Generator />);

    expect(screen.getByText(/api keys configured/i)).toBeInTheDocument();
    expect(screen.getByText(/openai/i)).toBeInTheDocument();
  });

  it('should disable generation when no API keys', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...mockStore,
      hasApiKeys: false,
      apiKeys: [],
    });

    render(<Generator />);

    const generateButton = screen.getByRole('button', { name: /generate/i });
    expect(generateButton).toBeDisabled();
  });

  describe('form validation', () => {
    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      expect(screen.getByText(/component name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });

    it('should show validation error for invalid component name', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const nameInput = screen.getByPlaceholderText(/component name/i);
      await user.type(nameInput, '123 Invalid');

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      expect(screen.getByText(/invalid component name/i)).toBeInTheDocument();
    });

    it('should show validation error for short description', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);

      await user.type(nameInput, 'ValidComponent');
      await user.type(descriptionInput, 'Too short');

      const generateButton = screen.getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      expect(screen.getByText(/description must be at least/i)).toBeInTheDocument();
    });
  });

  describe('generation process', () => {
    it('should start generation with valid form', async () => {
      const user = userEvent.setup();
      mockGeneration.startGeneration.mockResolvedValue(undefined);

      render(<Generator />);

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component with modern styling');

      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith({
        componentName: 'TestButton',
        prompt: 'A test button component with modern styling',
        framework: 'react',
        componentLibrary: 'tailwind',
        style: 'modern',
        typescript: false,
      });
    });

    it('should show loading state during generation', async () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        isGenerating: true,
        progress: 45,
      });

      render(<Generator />);

      expect(screen.getByText(/generating/i)).toBeInTheDocument();
      expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');
      expect(screen.getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });

    it('should display generated code', async () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        code: 'export default function Button() {\n  return <button>Click me</button>;\n}',
      });

      render(<Generator />);

      expect(screen.getByText(/generated code/i)).toBeInTheDocument();
      expect(screen.getByText(/export default function Button/)).toBeInTheDocument();
    });

    it('should display generation errors', async () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        error: 'Generation failed: API error',
      });

      render(<Generator />);

      expect(screen.getByText(/generation failed/i)).toBeInTheDocument();
      expect(screen.getByText(/api error/i)).toBeInTheDocument();
    });

    it('should allow stopping generation', async () => {
      const user = userEvent.setup();
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        isGenerating: true,
      });

      render(<Generator />);

      const stopButton = screen.getByRole('button', { name: /stop/i });
      await user.click(stopButton);

      expect(mockGeneration.stopGeneration).toHaveBeenCalled();
    });

    it('should allow resetting form', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      // Fill form
      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button');

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(mockGeneration.reset).toHaveBeenCalled();
      expect(nameInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  describe('framework and library selection', () => {
    it('should allow framework selection', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const frameworkSelect = screen.getByLabelText(/framework/i);
      await user.selectOptions(frameworkSelect, 'vue');

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({ framework: 'vue' })
      );
    });

    it('should allow component library selection', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const librarySelect = screen.getByLabelText(/component library/i);
      await user.selectOptions(librarySelect, 'mui');

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({ componentLibrary: 'mui' })
      );
    });

    it('should allow style selection', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const styleSelect = screen.getByLabelText(/style/i);
      await user.selectOptions(styleSelect, 'minimal');

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({ style: 'minimal' })
      );
    });

    it('should toggle TypeScript option', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const typescriptCheckbox = screen.getByLabelText(/typescript/i);
      await user.click(typescriptCheckbox);

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({ typescript: true })
      );
    });
  });

  describe('code display and actions', () => {
    it('should show copy code button when code is generated', () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        code: 'export default function Button() {\n  return <button>Click me</button>;\n}',
      });

      render(<Generator />);

      expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    });

    it('should show download code button when code is generated', () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        code: 'export default function Button() {\n  return <button>Click me</button>;\n}',
      });

      render(<Generator />);

      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('should show export options when code is generated', () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        code: 'export default function Button() {\n  return <button>Click me</button>;\n}',
      });

      render(<Generator />);

      expect(screen.getByText(/export options/i)).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<Generator />);

      // Should stack form elements vertically on mobile
      const form = screen.getByRole('form');
      expect(form).toHaveClass('mobile-layout');
    });

    it('should show simplified interface on small screens', () => {
      // Mock small viewport
      global.innerWidth = 320;
      global.dispatchEvent(new Event('resize'));

      render(<Generator />);

      // Should hide some advanced options on small screens
      expect(screen.queryByLabelText(/component library/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<Generator />);

      expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'component generation form');
      expect(screen.getByPlaceholderText(/component name/i)).toHaveAttribute('aria-required', 'true');
      expect(screen.getByPlaceholderText(/describe your component/i)).toHaveAttribute('aria-required', 'true');
    });

    it('should announce generation progress to screen readers', () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        isGenerating: true,
        progress: 50,
      });

      render(<Generator />);

      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-live', 'polite');
      expect(progressbar).toHaveAttribute('aria-label', 'generation progress 50%');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      // Tab through form fields
      await user.tab();
      expect(screen.getByPlaceholderText(/component name/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByPlaceholderText(/describe your component/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /generate/i })).toHaveFocus();
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockGeneration.startGeneration.mockRejectedValue(new Error('Network error'));

      render(<Generator />);

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should handle API rate limiting', async () => {
      const user = userEvent.setup();
      mockGeneration.startGeneration.mockRejectedValue(new Error('Rate limit exceeded'));

      render(<Generator />);

      const nameInput = screen.getByPlaceholderText(/component name/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your component/i);
      const generateButton = screen.getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/rate limit exceeded/i)).toBeInTheDocument();
        expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
      });
    });
  });

  describe('performance', () => {
    it('should debounce form validation', async () => {
      const user = userEvent.setup();
      render(<Generator />);

      const nameInput = screen.getByPlaceholderText(/component name/i);

      // Type rapidly
      await user.type(nameInput, 'Test');
      await user.type(nameInput, 'Component');

      // Should only validate once after typing stops
      expect(screen.queryByText(/invalid component name/i)).not.toBeInTheDocument();
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<Generator />);

      // Re-render with same props
      rerender(<Generator />);

      // Should not cause unnecessary re-renders
      expect(mockUseGeneration).toHaveBeenCalledTimes(2);
    });
  });
});
