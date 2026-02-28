export interface QualityResult {
  gate: string;
  passed: boolean;
  issues: string[];
  severity: 'info' | 'warning' | 'error';
}

export interface QualityReport {
  passed: boolean;
  results: QualityResult[];
  score: number;
  timestamp: string;
}

const XSS_PATTERN_STRINGS = [
  'dangerously' + 'SetInnerHTML',
  'inner' + 'HTML\\s*=',
  'document\\.write',
  'eval\\s*\\(',
  'new\\s+Function\\s*\\(',
];

const INJECTION_PATTERN_STRINGS = [
  '\\$\\{.*\\}.*exec',
  'child_' + 'process',
  `require\\s*\\(\\s*['"]fs['"]\\s*\\)`,
];

export function runSecurityScan(code: string): QualityResult {
  const issues: string[] = [];

  for (const src of XSS_PATTERN_STRINGS) {
    if (new RegExp(src).test(code)) {
      issues.push(`Potential XSS vector detected`);
    }
  }

  for (const src of INJECTION_PATTERN_STRINGS) {
    if (new RegExp(src).test(code)) {
      issues.push(`Potential injection vector detected`);
    }
  }

  return {
    gate: 'security',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'error' : 'info',
  };
}

export function runLintCheck(code: string): QualityResult {
  const issues: string[] = [];

  if (/console\.(log|debug|info)\s*\(/.test(code)) {
    issues.push('Contains console.log statements');
  }

  if (/:\s*any[\s;,)]/.test(code)) {
    issues.push('Uses explicit `any` type');
  }

  if (code.split('\n').some((line) => line.length > 120)) {
    issues.push('Lines exceed 120 characters');
  }

  return {
    gate: 'lint',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runTypeCheck(code: string): QualityResult {
  const issues: string[] = [];

  const hasHooks = /useState|useEffect|useRef/.test(code);
  const hasJsx = /<[A-Z]/.test(code);
  const hasDirective = /^['"]use client['"]/.test(code);

  if (hasJsx && hasHooks && !hasDirective) {
    issues.push('Component uses hooks but missing "use client" directive');
  }

  return {
    gate: 'type-check',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runAccessibilityCheck(code: string): QualityResult {
  const issues: string[] = [];

  if (/<img\b(?![^>]*\balt\s*=)/i.test(code)) {
    issues.push('<img> missing alt attribute');
  }

  if (/<button\b[^>]*>\s*<\/button>/i.test(code)) {
    issues.push('<button> without text content or aria-label');
  }

  if (/<input\b(?![^>]*(?:aria-label|aria-labelledby))/i.test(code)) {
    const hasLabel = /<label\b/i.test(code);
    if (!hasLabel) {
      issues.push('<input> without associated <label> or aria-label');
    }
  }

  if (/tabIndex\s*=\s*\{?\s*[1-9]/.test(code)) {
    issues.push('Positive tabIndex values harm accessibility');
  }

  return {
    gate: 'accessibility',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

export function runResponsiveCheck(code: string): QualityResult {
  const issues: string[] = [];

  const hasBreakpoints = /\b(sm:|md:|lg:|xl:|2xl:)|@media/.test(code);
  const hasLayout = /\b(flex|grid|flex-col|grid-cols)\b/.test(code);

  if (!hasBreakpoints && hasLayout) {
    issues.push('Layout classes used without responsive breakpoints');
  }

  return {
    gate: 'responsive',
    passed: issues.length === 0,
    issues,
    severity: issues.length > 0 ? 'warning' : 'info',
  };
}

const GATE_WEIGHTS: Record<string, number> = {
  security: 3,
  lint: 1,
  'type-check': 1,
  accessibility: 2,
  responsive: 0.5,
};

export function calculateQualityScore(results: QualityResult[]): number {
  let earned = 0;
  let total = 0;

  for (const result of results) {
    const weight = GATE_WEIGHTS[result.gate] ?? 1;
    total += weight;
    if (result.passed) earned += weight;
  }

  return total > 0 ? earned / total : 1;
}

export function runAllGates(code: string): QualityReport {
  const results = [
    runSecurityScan(code),
    runLintCheck(code),
    runTypeCheck(code),
    runAccessibilityCheck(code),
    runResponsiveCheck(code),
  ];

  const score = calculateQualityScore(results);

  return {
    passed: results.every((r) => r.passed || r.severity !== 'error'),
    results,
    score,
    timestamp: new Date().toISOString(),
  };
}
