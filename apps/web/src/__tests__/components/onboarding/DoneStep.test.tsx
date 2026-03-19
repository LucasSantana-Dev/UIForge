import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DoneStep } from '@/components/onboarding/DoneStep';
import { trackEvent } from '@/components/analytics/AnalyticsProvider';

const mockPush = jest.fn();
const mockCreateProject = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock('@/hooks/use-projects', () => ({
  useCreateProject: () => ({
    mutateAsync: mockCreateProject,
  }),
}));

jest.mock('@/components/analytics/AnalyticsProvider', () => ({
  trackEvent: jest.fn(),
}));

describe('DoneStep', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateProject.mockResolvedValue({ id: 'starter-1', name: 'My First Project' });
    globalThis.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    }) as jest.Mock;
  });

  it('routes to project-aware generate flow when project exists', async () => {
    const user = userEvent.setup();
    render(<DoneStep project={{ id: 'p-1', name: 'Project One' }} />);

    await user.click(screen.getByRole('button', { name: 'Continue to Generate' }));

    await waitFor(() => {
      expect(globalThis.fetch).toHaveBeenCalledWith('/api/onboarding/complete', { method: 'POST' });
      expect(mockPush).toHaveBeenCalledWith(
        '/generate?projectId=p-1&source=onboarding&entry=done_primary&step=project'
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_cta_clicked',
          label: 'done',
          params: expect.objectContaining({
            cta: 'continue_to_generate',
          }),
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'activation_route_to_generate',
          category: 'Activation',
          label: 'done_primary',
          params: expect.objectContaining({
            source: 'onboarding',
            step: 'project',
            hasProjectBefore: true,
            projectId: 'p-1',
          }),
        })
      );
    });
  });

  it('routes to project creation when no project exists', async () => {
    const user = userEvent.setup();
    render(<DoneStep project={null} />);

    await user.click(screen.getByRole('button', { name: 'Create Project and Generate' }));

    await waitFor(() => {
      expect(mockCreateProject).toHaveBeenCalledWith({
        name: 'My First Project',
        framework: 'react',
      });
      expect(mockPush).toHaveBeenCalledWith(
        '/generate?projectId=starter-1&source=onboarding&entry=done_primary&step=project'
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'onboarding_cta_clicked',
          label: 'done',
          params: expect.objectContaining({
            cta: 'create_project_and_generate',
          }),
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'activation_starter_project_confirmed',
          category: 'Activation',
          label: 'done_primary',
          params: expect.objectContaining({
            source: 'onboarding',
            step: 'project',
            hasProjectBefore: false,
          }),
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'activation_starter_project_created',
          category: 'Activation',
          label: 'done_primary',
          params: expect.objectContaining({
            projectId: 'starter-1',
          }),
        })
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'activation_route_to_generate',
          category: 'Activation',
          label: 'done_primary',
          params: expect.objectContaining({
            projectId: 'starter-1',
          }),
        })
      );
    });
  });

  it('falls back to project creation page when starter project creation fails', async () => {
    const user = userEvent.setup();
    mockCreateProject.mockRejectedValueOnce(new Error('failed'));
    render(<DoneStep project={null} />);

    await user.click(screen.getByRole('button', { name: 'Create Project and Generate' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/projects/new?source=onboarding&entry=done_primary&step=project'
      );
      expect(trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'activation_starter_project_fallback',
          category: 'Activation',
          label: 'done_primary',
          params: expect.objectContaining({
            fallback: true,
          }),
        })
      );
    });
  });

  it('routes no-project secondary links through dashboard conversion intent', async () => {
    const user = userEvent.setup();
    render(<DoneStep project={null} />);

    await user.click(screen.getByRole('button', { name: 'Create your first project' }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        '/dashboard?source=onboarding&entry=done_create_project&intent=create_project'
      );
    });
  });
});
