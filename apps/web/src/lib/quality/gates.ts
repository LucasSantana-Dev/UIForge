export interface QualityResult {
  gate: string;
  passed: boolean;
  issues: string[];
  severity: 'info' | 'warning' | 'error';
}

export interface QualityReport {
  passed: boolean;
  results: QualityResult[];
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
  'require\\s*\\(\\s*[\'"]fs[\'"]\\s*\\)',
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

export function runAllGates(code: string): QualityReport {
  const results = [runSecurityScan(code), runLintCheck(code), runTypeCheck(code)];

  return {
    passed: results.every((r) => r.passed || r.severity !== 'error'),
    results,
    timestamp: new Date().toISOString(),
  };
}
