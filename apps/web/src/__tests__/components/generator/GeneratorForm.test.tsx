import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeneratorForm from '@/components/generator/GeneratorForm';
import { useGeneration } from '@/hooks/use-generation';

const mockUseGeneration = useGeneration as jest.MockedFunction<typeof useGeneration>;

// --- Heavy mock layer ---

jest.mock('@/hooks/use-generation', () => ({
  useGeneration: jest.fn(() => ({
    startGeneration: jest.fn(),
    isGenerating: false,
    progress: 0,
    events: [],
    error: null,
    code: null,
    qualityReport: null,
    parentGenerationId: null,
  })),
}));

jest.mock('@/stores/ai-keys', () => ({
  useAIKeyStore: (selector: any) => {
    const state = { encryptionKey: null, loadApiKeys: jest.fn() };
    return selector(state);
  },
  useAIKeys: jest.fn(() => []),
}));

jest.mock('@/lib/encryption', () => ({
  decryptApiKey: jest.fn(() => 'decrypted-key'),
}));

jest.mock('@/lib/services/generation', () => ({
  PROVIDER_MODELS: {
    google: [{ id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' }],
    openai: [{ id: 'gpt-4o', label: 'GPT-4o' }],
  },
}));

jest.mock('@/lib/features/flags', () => ({
  isFeatureEnabled: jest.fn((flag: string) => {
    const flags: Record<string, boolean> = {
      ENABLE_SIZA_AI: false,
      ENABLE_SKILLS: false,
      ENABLE_DESIGN_CONTEXT: false,
      ENABLE_PROMPT_AUTOCOMPLETE: false,
      ENABLE_DESIGN_ANALYSIS: false,
    };
    return flags[flag] ?? false;
  }),
}));

jest.mock('@/stores/theme-store', () => ({
  useThemeStore: (selector: any) => {
    const state = { getActiveTheme: () => () => null };
    return selector(state);
  },
}));

jest.mock('@/hooks/use-subscription', () => ({
  useSubscription: jest.fn(() => ({ usage: null })),
}));

jest.mock('@/components/generator/GenerationProgress', () => ({
  __esModule: true,
  default: () => <div data-testid="generation-progress" />,
}));

jest.mock('@/components/generator/DesignContext', () => ({
  DesignContext: () => <div data-testid="design-context" />,
  DESIGN_DEFAULTS: {
    colorMode: 'dark',
    primaryColor: '#8B5CF6',
    secondaryColor: '#3B82F6',
    accentColor: '#22C55E',
    animation: 'subtle',
    spacing: 'default',
    borderRadius: 'medium',
    typography: 'system',
  },
}));

jest.mock('@/components/generator/PromptAutocomplete', () => ({
  PromptAutocomplete: ({ value, onChange, ...rest }: any) => (
    <textarea
      data-testid="prompt-autocomplete"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  ),
}));

jest.mock('@/components/generator/ImageUpload', () => ({
  ImageUpload: () => <div data-testid="image-upload" />,
}));

jest.mock('@/components/generator/DesignAnalysisPanel', () => ({
  __esModule: true,
  default: () => <div data-testid="design-analysis-panel" />,
}));

jest.mock('@/components/generator/QuotaGuard', () => ({
  QuotaGuard: () => <div data-testid="quota-guard" />,
}));

jest.mock('@/components/generator/SizaAICard', () => ({
  SizaAICard: () => <div data-testid="siza-ai-card" />,
}));

jest.mock('@/components/generator/BYOKProviderGrid', () => ({
  BYOKProviderGrid: () => <div data-testid="byok-provider-grid" />,
}));

jest.mock('@/components/skills/SkillSelector', () => ({
  SkillSelector: () => <div data-testid="skill-selector" />,
}));

jest.mock('@/components/skills/SkillBadge', () => ({
  SkillBadge: ({ count }: any) => <span data-testid="skill-badge">{count}</span>,
}));

// --- Tests ---

describe('GeneratorForm', () => {
  const defaultProps = {
    projectId: null,
    framework: 'react',
    onGenerate: jest.fn(),
    onGenerating: jest.fn(),
    isGenerating: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<GeneratorForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
  });

  it('renders Component Name field', () => {
    render(<GeneratorForm {...defaultProps} />);
    expect(screen.getByLabelText('Component Name')).toBeInTheDocument();
  });

  it('renders Describe Your Component field', () => {
    render(<GeneratorForm {...defaultProps} />);
    expect(screen.getByLabelText('Describe Your Component')).toBeInTheDocument();
  });

  it('pre-fills scratch mode defaults for null projectId', () => {
    render(<GeneratorForm {...defaultProps} />);
    const nameInput = screen.getByLabelText('Component Name') as HTMLInputElement;
    expect(nameInput.value).not.toBe('');
  });

  it('uses initialDescription when provided', () => {
    render(<GeneratorForm {...defaultProps} initialDescription="A red button" />);
    const promptField = screen.getByLabelText('Describe Your Component') as HTMLTextAreaElement;
    expect(promptField.value).toBe('A red button');
  });

  it('shows validation error when component name is missing on submit', async () => {
    render(<GeneratorForm {...defaultProps} />);
    const nameInput = screen.getByLabelText('Component Name');
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders AI Provider collapsible section', () => {
    render(<GeneratorForm {...defaultProps} />);
    expect(screen.getByText('AI Provider')).toBeInTheDocument();
  });

  it('renders Advanced collapsible section', () => {
    render(<GeneratorForm {...defaultProps} />);
    expect(screen.getByRole('button', { name: /advanced/i })).toBeInTheDocument();
  });

  it('shows quota guard', () => {
    render(<GeneratorForm {...defaultProps} />);
    expect(screen.getByTestId('quota-guard')).toBeInTheDocument();
  });

  it('disables generate button when isGenerating is true via hook', () => {
    mockUseGeneration.mockReturnValue({
      startGeneration: jest.fn(),
      isGenerating: true,
      progress: 50,
      events: [],
      error: null,
      code: null,
      qualityReport: null,
      parentGenerationId: null,
    } as any);
    render(<GeneratorForm {...defaultProps} />);
    const btn = screen.getByRole('button', { name: /generating/i });
    expect(btn).toBeDisabled();
  });

  it('renders component library select inside Advanced section when opened', () => {
    render(<GeneratorForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));
    expect(screen.getByLabelText('Component Library')).toBeInTheDocument();
  });

  it('renders design style select inside Advanced section when opened', () => {
    render(<GeneratorForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));
    expect(screen.getByLabelText('Design Style')).toBeInTheDocument();
  });

  it('renders TypeScript checkbox inside Advanced section when opened', () => {
    render(<GeneratorForm {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /advanced/i }));
    expect(screen.getByLabelText('Use TypeScript')).toBeInTheDocument();
  });
});
