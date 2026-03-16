'use client';

import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { CONTAINER, SECTION_PADDING } from './constants';

interface DiffEntry {
  path: string;
  prefix?: string;
  before?: string;
  after: string;
  highlight?: 'violet' | 'blue' | 'emerald' | 'amber';
  codePreview?: string;
}

const DIFF_ENTRIES: DiffEntry[] = [
  {
    path: 'my-saas/',
    before: 'my-app/',
    after: 'my-saas/',
    highlight: 'violet',
  },
  {
    path: 'src/app/',
    prefix: '├── src/app/',
    before: '(empty Next.js pages)',
    after: 'app/   # App Router + layouts',
    highlight: 'blue',
    codePreview: `// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}`,
  },
  {
    path: 'src/services/',
    prefix: '├── src/services/',
    before: undefined,
    after: 'services/   # Business logic',
    highlight: 'blue',
    codePreview: `// services/user.service.ts
export class UserService {
  constructor(private repo: UserRepository) {}

  async createUser(data: CreateUserDto) {
    const validated = await validateInput(data);
    const hashed = await hashPassword(validated.password);
    return this.repo.create({ ...validated, password: hashed });
  }
}`,
  },
  {
    path: 'src/repositories/',
    prefix: '├── src/repositories/',
    before: undefined,
    after: 'repositories/   # Data access',
    highlight: 'blue',
    codePreview: `// repositories/user.repository.ts
export class UserRepository {
  async create(data: CreateUserData) {
    const { data: user, error } = await supabase
      .from('users')
      .insert(data)
      .select()
      .single();
    if (error) throw new DatabaseError(error.message);
    return user;
  }
}`,
  },
  {
    path: 'lib/security/',
    prefix: '│   ├── lib/security/',
    before: undefined,
    after: 'security/   # BYOK, validation',
    highlight: 'emerald',
    codePreview: `// lib/security/encryption.ts
export class BYOKEncryption {
  async encrypt(data: string, userKey: string): Promise<EncryptedPayload> {
    const derivedKey = await deriveKey(userKey, this.salt);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      new TextEncoder().encode(data)
    );
    return { ciphertext, iv, salt: this.salt };
  }
}`,
  },
  {
    path: 'lib/quality/',
    prefix: '│   └── lib/quality/',
    before: undefined,
    after: 'quality/   # Anti-generic, a11y',
    highlight: 'emerald',
    codePreview: `// lib/quality/anti-generic.ts
export function scoreGenericness(component: ComponentDef): QualityScore {
  const checks = [
    hasDescriptiveNames(component),
    hasAccessibilityAttributes(component),
    avoidsBlandPlaceholders(component),
    hasInteractiveStates(component),
  ];
  return { score: checks.filter(Boolean).length / checks.length };
}`,
  },
  {
    path: 'tests/',
    prefix: '├── tests/',
    before: undefined,
    after: 'tests/   # 80%+ coverage target',
    highlight: 'amber',
    codePreview: `// tests/services/user.service.test.ts
describe('UserService', () => {
  it('creates user with hashed password', async () => {
    const svc = new UserService(mockRepo);
    const user = await svc.createUser({
      email: 'test@example.com',
      password: 'secret123'
    });
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'test@example.com' })
    );
    expect(user.password).not.toBe('secret123');
  });
});`,
  },
  {
    path: 'supabase/',
    prefix: '├── supabase/',
    before: undefined,
    after: 'supabase/   # Migrations, RLS',
    highlight: 'blue',
    codePreview: `-- supabase/migrations/20240101_rls.sql
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own data"
  ON user_data FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role bypass"
  ON user_data FOR ALL
  TO service_role
  USING (true);`,
  },
  {
    path: '.github/',
    prefix: '└── .github/',
    before: undefined,
    after: '.github/   # CI/CD, security scan',
    highlight: 'blue',
    codePreview: `# .github/workflows/ci.yml
jobs:
  validate:
    steps:
      - uses: actions/checkout@v4
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage
      - run: npm audit --audit-level=moderate
      - uses: github/codeql-action/analyze@v3`,
  },
];

const highlightClasses: Record<string, { bg: string; text: string; dimText: string }> = {
  violet: {
    bg: 'bg-violet-500/10',
    text: 'text-violet-300',
    dimText: 'text-violet-400/60',
  },
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-300',
    dimText: 'text-blue-400/60',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-300',
    dimText: 'text-emerald-400/60',
  },
  amber: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-300',
    dimText: 'text-amber-400/60',
  },
};

const FEATURES = [
  'Architecture patterns baked in — service layers, repositories, middleware',
  'Security from line one — BYOK encryption, RLS policies, input validation',
  'Quality gates included — anti-generic detection, accessibility audit',
  'Full CI/CD pipeline — lint, build, test, security scan, deploy',
];

function CodeTooltip({ entry }: { entry: DiffEntry }) {
  const hl = highlightClasses[entry.highlight ?? 'blue'];
  return (
    <div className="absolute left-full top-0 ml-3 z-50 w-80 rounded-lg border border-[#27272A] bg-[#0F0F11] shadow-2xl shadow-black/60 overflow-hidden pointer-events-none">
      <div className={`flex items-center gap-2 px-3 py-2 border-b border-[#27272A] ${hl.bg}`}>
        <ChevronRight className={`w-3 h-3 ${hl.text} flex-shrink-0`} />
        <span className={`text-[11px] font-mono font-medium ${hl.text}`}>{entry.path}</span>
      </div>
      <pre className="p-3 font-mono text-[11px] leading-[1.6] text-[#A1A1AA] overflow-x-auto whitespace-pre">
        {entry.codePreview}
      </pre>
    </div>
  );
}

export function CodeShowcase() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className={`${SECTION_PADDING} border-t border-[#27272A]`}>
      <div className={`${CONTAINER} grid grid-cols-1 lg:grid-cols-2 gap-12 items-center`}>
        <div>
          <div className="text-sm font-mono text-violet-400 mb-4">{'// npx create-siza-app'}</div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#FAFAFA] mb-6">
            Your next project.
            <br />
            Properly structured.
          </h2>
          <div>
            {FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3 mb-4">
                <Check className="w-5 h-5 text-[#22C55E] mt-0.5 flex-shrink-0" />
                <p className="text-[#A1A1AA] text-sm leading-relaxed">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[#27272A] bg-[#18181B] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#71717A] uppercase tracking-wider">
                before
              </span>
              <span className="text-[#3F3F46]">→</span>
              <span className="text-[11px] font-mono text-[#22C55E] uppercase tracking-wider">
                after siza
              </span>
            </div>
            <span className="text-[11px] font-mono text-[#52525B]">hover for code</span>
          </div>

          {/* Diff table */}
          <div className="overflow-x-auto">
            <div className="font-mono text-[12.5px] leading-none min-w-0">
              {DIFF_ENTRIES.map((entry, i) => {
                const isHovered = hoveredIndex === i;
                const hl = highlightClasses[entry.highlight ?? 'blue'];
                const isRoot = i === 0;

                return (
                  <div
                    key={entry.path}
                    className="relative"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div
                      className={`
                        flex items-stretch transition-colors duration-100 cursor-default
                        ${isHovered ? hl.bg : ''}
                        ${isHovered ? 'border-l-2' : 'border-l-2 border-transparent'}
                      `}
                      style={isHovered ? { borderLeftColor: 'rgb(139 92 246 / 0.5)' } : undefined}
                    >
                      {/* Before column */}
                      <div className="flex-1 px-4 py-[6px] border-r border-[#27272A] min-w-0">
                        {entry.before !== undefined ? (
                          <span className="text-[#52525B] line-through decoration-[#3F3F46]">
                            {entry.before}
                          </span>
                        ) : (
                          <span className="text-[#3F3F46] italic text-[11px]">{'—'}</span>
                        )}
                      </div>

                      {/* After column */}
                      <div className="flex-1 px-4 py-[6px] min-w-0 flex items-center gap-1.5">
                        {entry.before !== undefined && !isRoot && (
                          <span className="text-[#22C55E] text-[10px] font-bold flex-shrink-0">
                            +
                          </span>
                        )}
                        <span
                          className={`
                            ${isRoot ? 'text-violet-400 font-semibold' : hl.text}
                            ${isHovered ? 'brightness-110' : ''}
                            whitespace-pre transition-all duration-100
                          `}
                        >
                          {entry.after}
                        </span>
                        {entry.codePreview && isHovered && (
                          <ChevronRight className={`w-3 h-3 ml-auto flex-shrink-0 ${hl.dimText}`} />
                        )}
                      </div>
                    </div>

                    {/* Tooltip */}
                    {isHovered && entry.codePreview && <CodeTooltip entry={entry} />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
