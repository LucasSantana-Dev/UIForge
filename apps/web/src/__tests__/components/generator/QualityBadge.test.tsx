import { render, screen, fireEvent } from '@testing-library/react';
import { QualityBadge } from '@/components/generator/QualityBadge';
import type { QualityReport, QualityResult } from '@/lib/quality/gates';

jest.mock('@/components/generator/QualityPanel', () => ({
  QualityPanel: () => <div data-testid="quality-panel" />,
}));

function makeResult(
  gate: string,
  passed: boolean,
  severity: 'error' | 'warning' | 'info' = 'info',
  issues: string[] = []
): QualityResult {
  return { gate, passed, severity, issues };
}

function makeReport(overrides: Partial<QualityReport> = {}): QualityReport {
  return {
    passed: true,
    results: [],
    score: 1,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('QualityBadge', () => {
  it('renders null when report is null', () => {
    const { container } = render(<QualityBadge report={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('shows "Passed" when no errors or warnings', () => {
    const report = makeReport({
      results: [makeResult('security', true, 'info')],
    });
    render(<QualityBadge report={report} />);
    expect(screen.getByText('Passed')).toBeInTheDocument();
  });

  it('shows "Failed" when there are errors', () => {
    const report = makeReport({
      passed: false,
      results: [makeResult('security', false, 'error', ['XSS detected'])],
    });
    render(<QualityBadge report={report} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });

  it('shows "1 warning" when there is 1 warning', () => {
    const report = makeReport({
      passed: true,
      results: [makeResult('lint', false, 'warning', ['Missing semicolon'])],
    });
    render(<QualityBadge report={report} />);
    expect(screen.getByText('1 warning')).toBeInTheDocument();
  });

  it('shows "2 warnings" when there are 2 warnings', () => {
    const report = makeReport({
      passed: true,
      results: [
        makeResult('lint', false, 'warning', ['Missing semicolon']),
        makeResult('accessibility', false, 'warning', ['Missing alt text']),
      ],
    });
    render(<QualityBadge report={report} />);
    expect(screen.getByText('2 warnings')).toBeInTheDocument();
  });

  it('toggles quality panel on click', () => {
    const report = makeReport({
      results: [makeResult('security', true, 'info')],
    });
    render(<QualityBadge report={report} />);
    expect(screen.queryByTestId('quality-panel')).toBeNull();
    fireEvent.click(screen.getByText('Passed'));
    expect(screen.getByTestId('quality-panel')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Passed'));
    expect(screen.queryByTestId('quality-panel')).toBeNull();
  });

  it('shows postGenScore grade when provided', () => {
    const report = makeReport({
      results: [],
      postGenScore: {
        score: 85,
        grade: 'A',
        passed: true,
        checks: [],
      },
    });
    render(<QualityBadge report={report} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('shows postGenScore title attribute with score', () => {
    const report = makeReport({
      results: [],
      postGenScore: {
        score: 72,
        grade: 'B',
        passed: true,
        checks: [],
      },
    });
    render(<QualityBadge report={report} />);
    const gradeEl = screen.getByTitle('Post-gen score: 72/100');
    expect(gradeEl).toBeInTheDocument();
  });

  it('does not show postGenScore when not provided', () => {
    const report = makeReport({ results: [] });
    render(<QualityBadge report={report} />);
    expect(screen.queryByTitle(/Post-gen score/)).toBeNull();
  });
});
