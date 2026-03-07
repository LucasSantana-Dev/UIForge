import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateCard, Template } from '@/components/templates/TemplateCard';

const mockOnUseTemplate = jest.fn();
const mockOnPreview = jest.fn();

describe('TemplateCard', () => {
  const baseTemplate: Template = {
    id: 'template-1',
    name: 'Dashboard Layout',
    description: 'A modern dashboard layout with sidebar navigation and charts',
    category: 'Dashboard',
    framework: 'react',
    componentLibrary: 'shadcn',
    difficulty: 'intermediate',
    tags: ['dashboard', 'layout', 'charts'],
    preview: 'https://example.com/preview.png',
    usage: 42,
    rating: 4.5,
    createdAt: '2026-03-01T00:00:00.000Z',
    isOfficial: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render template name', () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.getByText('Dashboard Layout')).toBeInTheDocument();
  });

  it('should render template description', () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(
      screen.getByText('A modern dashboard layout with sidebar navigation and charts')
    ).toBeInTheDocument();
  });

  it('should render framework badge', () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('should render difficulty badge', () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.getByText('intermediate')).toBeInTheDocument();
  });

  it('should show Official badge when isOfficial is true', () => {
    const officialTemplate = { ...baseTemplate, isOfficial: true };
    render(
      <TemplateCard
        template={officialTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.getByText('Official')).toBeInTheDocument();
  });

  it('should not show Official badge when isOfficial is false', () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.queryByText('Official')).not.toBeInTheDocument();
  });

  it('should call onPreview when Preview button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );

    const previewButton = screen.getByRole('button', { name: /preview/i });
    await user.click(previewButton);

    expect(mockOnPreview).toHaveBeenCalledTimes(1);
    expect(mockOnPreview).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'template-1',
        name: 'Dashboard Layout',
        code: expect.stringContaining('Dashboard Layout'),
      })
    );
  });

  it('should call onUseTemplate with code-enriched template when Use Template button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );

    const useButton = screen.getByRole('button', { name: /use template/i });
    await user.click(useButton);

    expect(mockOnUseTemplate).toHaveBeenCalledTimes(1);
    expect(mockOnUseTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'template-1',
        name: 'Dashboard Layout',
        code: expect.stringContaining('DashboardLayout'),
      })
    );
  });

  it('should show star rating when rating > 0', () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.getByText('4.5')).toBeInTheDocument();
  });

  it('should hide star rating when rating is 0', () => {
    const noRatingTemplate = { ...baseTemplate, rating: 0 };
    render(
      <TemplateCard
        template={noRatingTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('should fall back to default code when template.code is undefined', async () => {
    const user = userEvent.setup();
    render(
      <TemplateCard
        template={baseTemplate}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );

    const useButton = screen.getByRole('button', { name: /use template/i });
    await user.click(useButton);

    expect(mockOnUseTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        code: `// Dashboard Layout
export default function DashboardLayout() {
  return <div>Dashboard Layout</div>;
}`,
      })
    );
  });

  it('should use provided code when template.code is defined', async () => {
    const user = userEvent.setup();
    const customCode = 'export default function Custom() { return <div>Custom</div>; }';
    const templateWithCode = { ...baseTemplate, code: customCode };

    render(
      <TemplateCard
        template={templateWithCode}
        onUseTemplate={mockOnUseTemplate}
        onPreview={mockOnPreview}
      />
    );

    const useButton = screen.getByRole('button', { name: /use template/i });
    await user.click(useButton);

    expect(mockOnUseTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        code: customCode,
      })
    );
  });
});
