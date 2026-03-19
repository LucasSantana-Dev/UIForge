import { render, screen, fireEvent } from '@testing-library/react';
import { QualityPanel } from '@/components/generator/QualityPanel';
import type { QualityReport, QualityResult } from '@/lib/quality/gates';

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
    score: 0.8,
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

describe('QualityPanel', () => {
  it('renders null when open=false', () => {
    const report = makeReport({ results: [] });
    const { container } = render(
      <QualityPanel report={report} open={false} onOpenChange={jest.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders "Quality Gates" heading when open=true', () => {
    const report = makeReport({ results: [] });
    render(<QualityPanel report={report} open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText('Quality Gates')).toBeInTheDocument();
  });

  it('shows passed/failed check counts', () => {
    const report = makeReport({
      results: [
        makeResult('security', true, 'info'),
        makeResult('lint', false, 'error', ['issue']),
        makeResult('accessibility', true, 'info'),
      ],
    });
    render(<QualityPanel report={report} open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText('2/3 checks passed')).toBeInTheDocument();
  });

  it('clicking X button calls onOpenChange(false)', () => {
    const onOpenChange = jest.fn();
    const report = makeReport({ results: [] });
    render(<QualityPanel report={report} open={true} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: /close quality panel/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('shows score gauge percentage', () => {
    const report = makeReport({ score: 0.85, results: [] });
    render(<QualityPanel report={report} open={true} onOpenChange={jest.fn()} />);
    // ScoreGauge renders Math.round(0.85 * 100) = 85
    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('shows gate labels for known gates', () => {
    const report = makeReport({
      results: [
        makeResult('security', true),
        makeResult('lint', true),
        makeResult('accessibility', true),
        makeResult('responsive', true),
        makeResult('type-check', true),
      ],
    });
    render(<QualityPanel report={report} open={true} onOpenChange={jest.fn()} />);
    expect(screen.getByText('Security')).toBeInTheDocument();
    expect(screen.getByText('Lint')).toBeInTheDocument();
    expect(screen.getByText('Accessibility')).toBeInTheDocument();
    expect(screen.getByText('Responsive')).toBeInTheDocument();
    expect(screen.getByText('Type Check')).toBeInTheDocument();
  });

  it('clicking a gate row with issues expands issues list', () => {
    const report = makeReport({
      results: [
        makeResult('security', false, 'error', ['XSS vector detected', 'eval() usage found']),
      ],
    });
    render(<QualityPanel report={report} open={true} onOpenChange={jest.fn()} />);
    expect(screen.queryByText('XSS vector detected')).toBeNull();
    // Click the gate row button
    fireEvent.click(screen.getByText('Security').closest('button')!);
    expect(screen.getByText('XSS vector detected')).toBeInTheDocument();
    expect(screen.getByText('eval() usage found')).toBeInTheDocument();
  });

  it('collapsing an expanded gate row hides issues', () => {
    const report = makeReport({
      results: [makeResult('lint', false, 'warning', ['Missing semicolon'])],
    });
    render(<QualityPanel report={report} open={true} onOpenChange={jest.fn()} />);
    const gateButton = screen.getByText('Lint').closest('button')!;
    fireEvent.click(gateButton);
    expect(screen.getByText('Missing semicolon')).toBeInTheDocument();
    fireEvent.click(gateButton);
    expect(screen.queryByText('Missing semicolon')).toBeNull();
  });

  it('gate rows without issues are not expandable', () => {
    const report = makeReport({
      results: [makeResult('security', true, 'info', [])],
    });
    render(<QualityPanel report={report} open={true} onOpenChange={jest.fn()} />);
    const gateButton = screen.getByText('Security').closest('button')!;
    // Clicking should not crash and produce no issues list
    fireEvent.click(gateButton);
    expect(screen.queryByRole('listitem')).toBeNull();
  });
});
