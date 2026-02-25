'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeftIcon, ChevronRightIcon, SortAscIcon } from 'lucide-react';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { useRouter } from 'next/navigation';

interface DBTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  framework: string;
  code: { files: Array<{ path: string; content: string }> };
  is_official: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  componentLibrary: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  preview: string;
  usage: number;
  rating: number;
  createdAt: string;
  code?: string;
}

function mapDBTemplate(t: DBTemplate): Template {
  const firstFile = t.code?.files?.[0];
  const categoryTags: Record<string, string[]> = {
    landing: ['landing', 'marketing', 'hero'],
    dashboard: ['dashboard', 'admin', 'analytics'],
    auth: ['auth', 'login', 'security'],
    ecommerce: ['e-commerce', 'shop', 'product'],
    blog: ['blog', 'content', 'article'],
    portfolio: ['portfolio', 'showcase', 'personal'],
    admin: ['admin', 'management', 'panel'],
    other: ['component', 'utility'],
  };

  return {
    id: t.id,
    name: t.name,
    description: t.description || '',
    category: t.category.charAt(0).toUpperCase() + t.category.slice(1),
    framework: t.framework,
    componentLibrary: 'tailwind',
    difficulty: t.is_official ? 'beginner' : 'intermediate',
    tags: categoryTags[t.category] || ['component'],
    preview: '',
    usage: 0,
    rating: t.is_official ? 4.5 : 0,
    createdAt: t.created_at,
    code: firstFile?.content,
  };
}

const CATEGORIES = [
  'All',
  'Landing',
  'Dashboard',
  'Auth',
  'Ecommerce',
  'Blog',
  'Portfolio',
  'Admin',
  'Other',
];

const ITEMS_PER_PAGE = 12;

function useDebounce(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function TemplatesClient() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    async function fetchTemplates() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/templates?limit=100');
        if (!res.ok) throw new Error('Failed to load templates');
        const json = await res.json();
        const dbTemplates: DBTemplate[] = json.data?.templates || [];
        setTemplates(dbTemplates.map(mapDBTemplate));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    }
    fetchTemplates();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, sortBy]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        !debouncedSearch ||
        template.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        template.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        template.tags.some((tag) =>
          tag.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'All' ||
        template.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [templates, debouncedSearch, selectedCategory]);

  const sortedTemplates = useMemo(() => {
    return [...filteredTemplates].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });
  }, [filteredTemplates, sortBy]);

  const totalPages = Math.ceil(sortedTemplates.length / ITEMS_PER_PAGE);
  const paginatedTemplates = sortedTemplates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleUseTemplate = (template: Template) => {
    const params = new URLSearchParams({
      template: template.id,
      framework: template.framework,
      componentLibrary: template.componentLibrary,
      description: template.description,
    });
    router.push(`/generate?${params.toString()}`);
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Component Templates</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Choose from our library of pre-built components to jumpstart your project
        </p>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates by name, description, or tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-surface-3 rounded-lg bg-surface-1 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              selectedCategory === category
                ? 'border-brand bg-brand/10 text-brand-light font-medium'
                : 'border-surface-3 text-text-secondary hover:border-surface-3 hover:text-text-primary'
            }`}
          >
            {category}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <SortAscIcon className="w-4 h-4 text-text-muted" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 border border-surface-3 rounded-md text-sm bg-surface-1 text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border border-surface-3 bg-surface-1 p-4 animate-pulse"
              >
                <div className="h-4 bg-surface-2 rounded w-3/4 mb-3" />
                <div className="h-3 bg-surface-2 rounded w-full mb-2" />
                <div className="h-3 bg-surface-2 rounded w-2/3 mb-4" />
                <div className="flex gap-2 mb-3">
                  <div className="h-5 bg-surface-2 rounded-full w-16" />
                  <div className="h-5 bg-surface-2 rounded-full w-20" />
                </div>
                <div className="h-8 bg-surface-2 rounded w-full mt-4" />
              </div>
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-brand underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-text-secondary">
                {sortedTemplates.length} template{sortedTemplates.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {paginatedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUseTemplate={handleUseTemplate}
                  onPreview={handlePreview}
                />
              ))}
            </div>

            {sortedTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Search className="w-12 h-12 text-text-muted mb-4" />
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  No templates found
                </h3>
                <p className="text-sm text-text-secondary">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-surface-3 pt-4 mt-4">
          <p className="text-sm text-text-secondary">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-2 rounded-md border border-surface-3 disabled:opacity-50 hover:bg-surface-2"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    currentPage === page
                      ? 'bg-brand text-white'
                      : 'border border-surface-3 hover:bg-surface-2'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-md border border-surface-3 disabled:opacity-50 hover:bg-surface-2"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <TemplatePreview
        template={selectedTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
