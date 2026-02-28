import {
  runSecurityScan,
  runLintCheck,
  runTypeCheck,
  runAccessibilityCheck,
  runResponsiveCheck,
  calculateQualityScore,
  runAllGates,
} from '@/lib/quality/gates';

describe('runSecurityScan', () => {
  it('passes for clean code', () => {
    const result = runSecurityScan('const x = 1;');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('security');
    expect(result.issues).toHaveLength(0);
    expect(result.severity).toBe('info');
  });

  it('detects dangerouslySetInnerHTML', () => {
    const result = runSecurityScan('<div dangerouslySetInnerHTML={{__html: x}} />');
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Potential XSS vector detected');
    expect(result.severity).toBe('error');
  });

  it('detects document.write', () => {
    const result = runSecurityScan('document.write("<script>")');
    expect(result.passed).toBe(false);
  });

  it('detects eval', () => {
    const result = runSecurityScan('eval("alert(1)")');
    expect(result.passed).toBe(false);
  });

  it('detects new Function', () => {
    const result = runSecurityScan('new Function("return 1")');
    expect(result.passed).toBe(false);
  });

  it('detects child_process injection', () => {
    const result = runSecurityScan('require("child_process").exec("ls")');
    expect(result.passed).toBe(false);
  });

  it('detects fs require injection', () => {
    const result = runSecurityScan("require('fs')");
    expect(result.passed).toBe(false);
  });
});

describe('runLintCheck', () => {
  it('passes for clean code', () => {
    const result = runLintCheck('const x: string = "hello";');
    expect(result.passed).toBe(true);
    expect(result.gate).toBe('lint');
  });

  it('detects console.log', () => {
    const result = runLintCheck('console.log("debug");');
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Contains console.log statements');
  });

  it('ignores console.error', () => {
    const result = runLintCheck('console.error("err");');
    expect(result.passed).toBe(true);
  });

  it('detects explicit any type', () => {
    const result = runLintCheck('const x: any = 1;');
    expect(result.passed).toBe(false);
    expect(result.issues).toContain('Uses explicit `any` type');
  });

  it('detects long lines', () => {
    const result = runLintCheck('a'.repeat(130) + ' const x = 1;');
    expect(result.passed).toBe(false);
  });

  it('reports warning severity', () => {
    const result = runLintCheck('console.log("x"); const y: any = 1;');
    expect(result.severity).toBe('warning');
  });
});

describe('runTypeCheck', () => {
  it('passes for JSX without hooks', () => {
    const result = runTypeCheck('<Button onClick={handleClick}>Click</Button>');
    expect(result.passed).toBe(true);
  });

  it('passes with use client directive', () => {
    const code =
      '"use client"\nimport { useState } from "react";\nconst [c, s] = useState(0);\nreturn <Button>{c}</Button>;';
    const result = runTypeCheck(code);
    expect(result.passed).toBe(true);
  });

  it('fails for hooks + JSX without use client', () => {
    const code =
      'import { useState } from "react";\nconst [c, s] = useState(0);\nreturn <Button>{c}</Button>;';
    const result = runTypeCheck(code);
    expect(result.passed).toBe(false);
  });
});

describe('runAccessibilityCheck', () => {
  it('passes for accessible code', () => {
    const code = '<img alt="Photo" src="x.jpg" /><button>Click me</button>';
    const result = runAccessibilityCheck(code);
    expect(result.passed).toBe(true);
  });

  it('detects img without alt', () => {
    const result = runAccessibilityCheck('<img src="photo.jpg" />');
    expect(result.passed).toBe(false);
  });

  it('detects empty button', () => {
    const result = runAccessibilityCheck('<button></button>');
    expect(result.passed).toBe(false);
  });

  it('detects input without label', () => {
    const result = runAccessibilityCheck('<input type="text" />');
    expect(result.passed).toBe(false);
  });

  it('passes input with label element', () => {
    const result = runAccessibilityCheck('<label>Name</label><input type="text" />');
    expect(result.passed).toBe(true);
  });

  it('passes input with aria-label', () => {
    const result = runAccessibilityCheck('<input aria-label="Search" type="text" />');
    expect(result.passed).toBe(true);
  });

  it('detects positive tabIndex', () => {
    const result = runAccessibilityCheck('<div tabIndex={5}>Focusable</div>');
    expect(result.passed).toBe(false);
  });
});

describe('runResponsiveCheck', () => {
  it('passes with responsive breakpoints', () => {
    const code = '<div className="flex md:flex-row flex-col">Content</div>';
    const result = runResponsiveCheck(code);
    expect(result.passed).toBe(true);
  });

  it('warns for layout without breakpoints', () => {
    const code = '<div className="flex flex-col gap-4">Content</div>';
    const result = runResponsiveCheck(code);
    expect(result.passed).toBe(false);
  });

  it('passes for non-layout code', () => {
    const code = '<p className="text-lg font-bold">Hello</p>';
    const result = runResponsiveCheck(code);
    expect(result.passed).toBe(true);
  });
});

describe('calculateQualityScore', () => {
  it('returns 1 for all passed', () => {
    const results = [
      { gate: 'security', passed: true, issues: [] as string[], severity: 'info' as const },
      { gate: 'lint', passed: true, issues: [] as string[], severity: 'info' as const },
    ];
    expect(calculateQualityScore(results)).toBe(1);
  });

  it('returns 0 for all failed', () => {
    const results = [
      { gate: 'security', passed: false, issues: ['xss'], severity: 'error' as const },
      { gate: 'lint', passed: false, issues: ['log'], severity: 'warning' as const },
    ];
    expect(calculateQualityScore(results)).toBe(0);
  });

  it('weights security higher than lint', () => {
    const results = [
      { gate: 'security', passed: true, issues: [] as string[], severity: 'info' as const },
      { gate: 'lint', passed: false, issues: ['log'], severity: 'warning' as const },
    ];
    expect(calculateQualityScore(results)).toBe(0.75);
  });

  it('returns 1 for empty results', () => {
    expect(calculateQualityScore([])).toBe(1);
  });
});

describe('runAllGates', () => {
  it('returns report with all 5 gates', () => {
    const report = runAllGates('const x = 1;');
    expect(report.results).toHaveLength(5);
    expect(report.results.map((r) => r.gate)).toEqual([
      'security',
      'lint',
      'type-check',
      'accessibility',
      'responsive',
    ]);
    expect(report.timestamp).toBeDefined();
  });

  it('reports passed=true for clean code', () => {
    const report = runAllGates('const x: string = "hello";');
    expect(report.passed).toBe(true);
    expect(report.score).toBe(1);
  });

  it('reports passed=false when security fails', () => {
    const report = runAllGates('eval("alert(1)")');
    expect(report.passed).toBe(false);
    expect(report.score).toBeLessThan(1);
  });

  it('reports passed=true when only warnings present', () => {
    const report = runAllGates('console.log("test");');
    expect(report.passed).toBe(true);
    expect(report.score).toBeLessThan(1);
  });
});
