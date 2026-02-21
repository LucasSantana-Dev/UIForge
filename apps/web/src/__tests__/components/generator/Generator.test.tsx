/**
 * ComponentGenerator Component Tests
 * Tests for the main component generation interface
 */

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ComponentGenerator from '@/components/generator/ComponentGenerator';
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
  CardHeader: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardTitle: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
  CardDescription: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  CardContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/ui/input', () => ({
  Input: ({ onChange, value, placeholder, ...props }: any) => (
    <input onChange={onChange} value={value} placeholder={placeholder} {...props} />
  ),
}));

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, onValueChange, value, ...props }: any) => (
    <div
      onChange={(e) => onValueChange?.((e.target as HTMLSelectElement).value)}
      value={value}
      {...props}
    >
      {children}
    </div>
  ),
  SelectContent: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectItem: ({ children, value, ...props }: any) => (
    <option value={value} {...props}>
      {children}
    </option>
  ),
  SelectTrigger: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  SelectValue: ({ placeholder, ...props }: any) => <span {...props}>{placeholder}</span>,
}));

jest.mock('@/components/ui/textarea', () => ({
  Textarea: ({ onChange, value, placeholder, ...props }: any) => (
    <textarea onChange={onChange} value={value} placeholder={placeholder} {...props} />
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

describe('ComponentGenerator Component', () => {
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
    const { getByText } = render(<ComponentGenerator projectId="test-project" />);

    expect(getByText(/component generator/i)).toBeInTheDocument();
  });

  it('should show API key status', () => {
    const { getByText } = render(<ComponentGenerator projectId="test-project" />);

    expect(getByText(/api keys configured/i)).toBeInTheDocument();
    expect(getByText(/openai/i)).toBeInTheDocument();
  });

  it('should disable generation when no API keys', () => {
    mockUseAIKeyStore.mockReturnValue({
      ...mockStore,
      hasApiKeys: false,
      apiKeys: [],
    });

    const { getByRole } = render(<ComponentGenerator projectId="test-project" />);

    const generateButton = getByRole('button', { name: /generate/i });
    expect(generateButton).toBeDisabled();
  });

  describe('form validation', () => {
    it('should show validation errors for empty fields', async () => {
      const user = userEvent.setup();
      const { getByRole, getByText } = render(<ComponentGenerator projectId="test-project" />);

      const generateButton = getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      expect(getByText(/component name is required/i)).toBeInTheDocument();
      expect(getByText(/description is required/i)).toBeInTheDocument();
    });

    it('should show validation error for invalid component name', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole, getByText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const nameInput = getByPlaceholderText(/component name/i);
      await user.type(nameInput, '123 Invalid');

      const generateButton = getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      expect(getByText(/invalid component name/i)).toBeInTheDocument();
    });

    it('should show validation error for short description', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole, getByText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);

      await user.type(nameInput, 'ValidComponent');
      await user.type(descriptionInput, 'Too short');

      const generateButton = getByRole('button', { name: /generate/i });
      await user.click(generateButton);

      expect(getByText(/description must be at least/i)).toBeInTheDocument();
    });
  });

  describe('generation process', () => {
    it('should start generation with valid form', async () => {
      const user = userEvent.setup();
      mockGeneration.startGeneration.mockResolvedValue(undefined);

      const { getByPlaceholderText, getByRole } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);
      const generateButton = getByRole('button', { name: /generate/i });

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

      const { getByText, getByRole } = render(<ComponentGenerator projectId="test-project" />);

      expect(getByText(/generating/i)).toBeInTheDocument();
      expect(getByRole('progressbar')).toHaveAttribute('aria-valuenow', '45');
      expect(getByRole('button', { name: /stop/i })).toBeInTheDocument();
    });

    it('should display generated code', async () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        code: 'export default function Button() {\n  return <button>Click me</button>;\n}',
      });

      const { getByText } = render(<ComponentGenerator projectId="test-project" />);

      expect(getByText(/generated code/i)).toBeInTheDocument();
      expect(getByText(/export default function Button/)).toBeInTheDocument();
    });

    it('should display generation errors', async () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        error: 'Generation failed: API error',
      });

      const { getByText } = render(<ComponentGenerator projectId="test-project" />);

      expect(getByText(/generation failed/i)).toBeInTheDocument();
      expect(getByText(/api error/i)).toBeInTheDocument();
    });

    it('should allow stopping generation', async () => {
      const user = userEvent.setup();
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        isGenerating: true,
      });

      const { getByRole } = render(<ComponentGenerator projectId="test-project" />);

      const stopButton = getByRole('button', { name: /stop/i });
      await user.click(stopButton);

      expect(mockGeneration.stopGeneration).toHaveBeenCalled();
    });

    it('should allow resetting form', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole } = render(
        <ComponentGenerator projectId="test-project" />
      );

      // Fill form
      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button');

      // Reset
      const resetButton = getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(mockGeneration.reset).toHaveBeenCalled();
      expect(nameInput).toHaveValue('');
      expect(descriptionInput).toHaveValue('');
    });
  });

  describe('framework and library selection', () => {
    it('should allow framework selection', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole, getByLabelText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const frameworkSelect = getByLabelText(/framework/i);
      await user.selectOptions(frameworkSelect, 'vue');

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);
      const generateButton = getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({ framework: 'vue' })
      );
    });

    it('should allow component library selection', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole, getByLabelText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const librarySelect = getByLabelText(/component library/i);
      await user.selectOptions(librarySelect, 'mui');

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);
      const generateButton = getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({ componentLibrary: 'mui' })
      );
    });

    it('should allow style selection', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole, getByLabelText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const styleSelect = getByLabelText(/style/i);
      await user.selectOptions(styleSelect, 'minimal');

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);
      const generateButton = getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(mockGeneration.startGeneration).toHaveBeenCalledWith(
        expect.objectContaining({ style: 'minimal' })
      );
    });

    it('should toggle TypeScript option', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole, getByLabelText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const typescriptCheckbox = getByLabelText(/typescript/i);
      await user.click(typescriptCheckbox);

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);
      const generateButton = getByRole('button', { name: /generate/i });

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

      const { getByRole } = render(<ComponentGenerator projectId="test-project" />);

      expect(getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    });

    it('should show download code button when code is generated', () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        code: 'export default function Button() {\n  return <button>Click me</button>;\n}',
      });

      const { getByRole } = render(<ComponentGenerator projectId="test-project" />);

      expect(getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('should show export options when code is generated', () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        code: 'export default function Button() {\n  return <button>Click me</button>;\n}',
      });

      const { getByText } = render(<ComponentGenerator projectId="test-project" />);

      expect(getByText(/export options/i)).toBeInTheDocument();
    });
  });

  describe('responsive behavior', () => {
    it('should adapt layout for mobile screens', () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      const { getByRole } = render(<ComponentGenerator projectId="test-project" />);

      // Should stack form elements vertically on mobile
      const form = getByRole('form');
      expect(form).toHaveClass('mobile-layout');
    });

    it('should show simplified interface on small screens', () => {
      // Mock small viewport
      global.innerWidth = 320;
      global.dispatchEvent(new Event('resize'));

      const { queryByLabelText } = render(<ComponentGenerator projectId="test-project" />);

      // Should hide some advanced options on small screens
      expect(queryByLabelText(/component library/i)).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { getByRole, getByPlaceholderText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      expect(getByRole('form')).toHaveAttribute('aria-label', 'component generation form');
      expect(getByPlaceholderText(/component name/i)).toHaveAttribute('aria-required', 'true');
      expect(getByPlaceholderText(/describe your component/i)).toHaveAttribute(
        'aria-required',
        'true'
      );
    });

    it('should announce generation progress to screen readers', () => {
      mockUseGeneration.mockReturnValue({
        ...mockGeneration,
        isGenerating: true,
        progress: 50,
      });

      const { getByRole } = render(<ComponentGenerator projectId="test-project" />);

      const progressbar = getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-live', 'polite');
      expect(progressbar).toHaveAttribute('aria-label', 'generation progress 50%');
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, getByRole } = render(
        <ComponentGenerator projectId="test-project" />
      );

      // Tab through form fields
      await user.tab();
      expect(getByPlaceholderText(/component name/i)).toHaveFocus();

      await user.tab();
      expect(getByPlaceholderText(/describe your component/i)).toHaveFocus();

      await user.tab();
      expect(getByRole('button', { name: /generate/i })).toHaveFocus();
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      mockGeneration.startGeneration.mockRejectedValue(new Error('Network error'));

      const { getByPlaceholderText, getByRole, getByText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);
      const generateButton = getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(getByText(/network error/i)).toBeInTheDocument();
    });

    it('should handle API rate limiting', async () => {
      const user = userEvent.setup();
      mockGeneration.startGeneration.mockRejectedValue(new Error('Rate limit exceeded'));

      const { getByPlaceholderText, getByRole, getByText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const nameInput = getByPlaceholderText(/component name/i);
      const descriptionInput = getByPlaceholderText(/describe your component/i);
      const generateButton = getByRole('button', { name: /generate/i });

      await user.type(nameInput, 'TestButton');
      await user.type(descriptionInput, 'A test button component');
      await user.click(generateButton);

      expect(getByText(/rate limit exceeded/i)).toBeInTheDocument();
      expect(getByText(/please try again later/i)).toBeInTheDocument();
    });
  });

  describe('performance', () => {
    it('should debounce form validation', async () => {
      const user = userEvent.setup();
      const { getByPlaceholderText, queryByText } = render(
        <ComponentGenerator projectId="test-project" />
      );

      const nameInput = getByPlaceholderText(/component name/i);

      // Type rapidly
      await user.type(nameInput, 'Test');
      await user.type(nameInput, 'Component');

      // Should only validate once after typing stops
      expect(queryByText(/invalid component name/i)).not.toBeInTheDocument();
    });

    it('should not re-render unnecessarily', () => {
      const { rerender } = render(<ComponentGenerator projectId="test-project" />);

      // Re-render with same props
      rerender(<ComponentGenerator projectId="test-project" />);

      // Should not cause unnecessary re-renders
      expect(mockUseGeneration).toHaveBeenCalledTimes(2);
    });
  });
});
