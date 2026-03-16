import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { SkillSelector } from '@/components/skills/SkillSelector';

// Mock sub-components
jest.mock('@/components/skills/SkillCard', () => ({
  SkillCard: ({
    skill,
    selected,
    onToggle,
    disabled,
  }: {
    skill: { id: string; name: string };
    selected: boolean;
    onToggle: (id: string) => void;
    disabled?: boolean;
  }) => (
    <button
      type="button"
      data-testid={`skill-card-${skill.id}`}
      data-selected={String(selected)}
      data-disabled={String(disabled ?? false)}
      onClick={() => !disabled && onToggle(skill.id)}
    >
      {skill.name}
    </button>
  ),
}));

jest.mock('@/components/skills/SkillParameterForm', () => ({
  SkillParameterForm: ({ onChange }: { onChange: (params: Record<string, string>) => void }) => (
    <button
      type="button"
      data-testid="skill-param-form"
      onClick={() => onChange({ paramA: 'value' })}
    />
  ),
}));

jest.mock('lucide-react', () => ({
  WandSparklesIcon: () => <span data-testid="wand-icon" />,
  SearchIcon: () => <span data-testid="search-icon" />,
}));

const makeSkill = (
  id: string,
  name: string,
  category = 'component',
  paramSchema: unknown = null
) => ({
  id,
  name,
  category,
  description: `${name} description`,
  parameter_schema: paramSchema,
  is_featured: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
});

const mockFetch = (skills: ReturnType<typeof makeSkill>[]) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ data: skills }),
  } as Response);
};

const defaultProps = {
  selectedSkillIds: [],
  onSelectedChange: jest.fn(),
  skillParams: {},
  onParamsChange: jest.fn(),
};

describe('SkillSelector', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders category filter buttons', async () => {
    mockFetch([]);
    render(<SkillSelector {...defaultProps} />);
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Components')).toBeInTheDocument();
    expect(screen.getByText('Forms')).toBeInTheDocument();
    expect(screen.getByText('Dashboards')).toBeInTheDocument();
    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('A11y')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    mockFetch([]);
    render(<SkillSelector {...defaultProps} />);
    expect(screen.getByPlaceholderText('Search skills...')).toBeInTheDocument();
  });

  it('shows skills after fetch', async () => {
    const skills = [makeSkill('s1', 'Skill One'), makeSkill('s2', 'Skill Two')];
    mockFetch(skills);
    render(<SkillSelector {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('Skill One')).toBeInTheDocument();
      expect(screen.getByText('Skill Two')).toBeInTheDocument();
    });
  });

  it('shows "No skills found" when fetch returns empty array', async () => {
    mockFetch([]);
    render(<SkillSelector {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('No skills found')).toBeInTheDocument();
    });
  });

  it('shows "No skills found" when fetch fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
    render(<SkillSelector {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText('No skills found')).toBeInTheDocument();
    });
  });

  it('fetches with category param when category is changed', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as unknown as Response);
    global.fetch = fetchMock;

    render(<SkillSelector {...defaultProps} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      fireEvent.click(screen.getByText('Forms'));
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const lastCall = fetchMock.mock.calls[1][0] as string;
      expect(lastCall).toContain('category=form');
    });
  });

  it('fetches with search param when search input changes', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as unknown as Response);
    global.fetch = fetchMock;

    render(<SkillSelector {...defaultProps} />);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Search skills...'), {
        target: { value: 'button' },
      });
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
      const lastCall = fetchMock.mock.calls[1][0] as string;
      expect(lastCall).toContain('search=button');
    });
  });

  it('calls onSelectedChange when a skill is toggled on', async () => {
    const skills = [makeSkill('s1', 'Skill One')];
    mockFetch(skills);
    const onSelectedChange = jest.fn();
    render(<SkillSelector {...defaultProps} onSelectedChange={onSelectedChange} />);
    await waitFor(() => expect(screen.getByTestId('skill-card-s1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('skill-card-s1'));
    expect(onSelectedChange).toHaveBeenCalledWith(['s1']);
  });

  it('calls onSelectedChange to remove skill when toggled off', async () => {
    const skills = [makeSkill('s1', 'Skill One')];
    mockFetch(skills);
    const onSelectedChange = jest.fn();
    const onParamsChange = jest.fn();
    render(
      <SkillSelector
        {...defaultProps}
        selectedSkillIds={['s1']}
        onSelectedChange={onSelectedChange}
        onParamsChange={onParamsChange}
      />
    );
    await waitFor(() => expect(screen.getByTestId('skill-card-s1')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('skill-card-s1'));
    expect(onSelectedChange).toHaveBeenCalledWith([]);
    expect(onParamsChange).toHaveBeenCalledWith({});
  });

  it('disables skills at limit (3 selected)', async () => {
    const skills = [makeSkill('s4', 'Skill Four')];
    mockFetch(skills);
    render(<SkillSelector {...defaultProps} selectedSkillIds={['s1', 's2', 's3']} />);
    await waitFor(() => expect(screen.getByTestId('skill-card-s4')).toBeInTheDocument());
    expect(screen.getByTestId('skill-card-s4')).toHaveAttribute('data-disabled', 'true');
  });

  it('shows selected count badge when skills are selected', async () => {
    mockFetch([]);
    render(<SkillSelector {...defaultProps} selectedSkillIds={['s1', 's2']} />);
    await waitFor(() => expect(screen.getByText('(2/3)')).toBeInTheDocument());
  });

  it('does not show count badge when nothing selected', async () => {
    mockFetch([]);
    render(<SkillSelector {...defaultProps} />);
    await waitFor(() => expect(screen.queryByText(/\/3/)).not.toBeInTheDocument());
  });

  it('shows SkillParameterForm for selected skill with parameter_schema', async () => {
    const schema = { type: 'object', properties: { paramA: { type: 'string' } } };
    const skills = [makeSkill('s1', 'Skill One', 'component', schema)];
    mockFetch(skills);
    render(<SkillSelector {...defaultProps} selectedSkillIds={['s1']} skillParams={{ s1: {} }} />);
    await waitFor(() => expect(screen.getByTestId('skill-param-form')).toBeInTheDocument());
  });

  it('calls onParamsChange when SkillParameterForm changes', async () => {
    const schema = { type: 'object', properties: { paramA: { type: 'string' } } };
    const skills = [makeSkill('s1', 'Skill One', 'component', schema)];
    mockFetch(skills);
    const onParamsChange = jest.fn();
    render(
      <SkillSelector
        {...defaultProps}
        selectedSkillIds={['s1']}
        skillParams={{ s1: {} }}
        onParamsChange={onParamsChange}
      />
    );
    await waitFor(() => expect(screen.getByTestId('skill-param-form')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId('skill-param-form'));
    expect(onParamsChange).toHaveBeenCalledWith({ s1: { paramA: 'value' } });
  });
});
