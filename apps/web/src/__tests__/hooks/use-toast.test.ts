import { useToast, toast } from '@/hooks/use-toast';

jest.mock('@siza/ui', () => ({
  useToast: jest.fn(() => ({ toast: jest.fn(), toasts: [] })),
  toast: jest.fn(),
}));

describe('use-toast re-exports', () => {
  it('exports useToast from @siza/ui', () => {
    expect(useToast).toBeDefined();
    expect(typeof useToast).toBe('function');
  });

  it('exports toast from @siza/ui', () => {
    expect(toast).toBeDefined();
    expect(typeof toast).toBe('function');
  });
});
