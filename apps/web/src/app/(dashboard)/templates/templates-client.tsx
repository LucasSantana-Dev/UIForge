'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Loader2 } from 'lucide-react';
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

const categories = [
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

export function TemplatesClient() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      !searchTerm ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      template.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

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
        <h1 className="text-3xl font-bold">Component Templates</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose from our library of pre-built components to jumpstart your project
        </p>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recent">Recently Added</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-red-600 mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-primary underline"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onUseTemplate={handleUseTemplate}
                  onPreview={handlePreview}
                />
              ))}
            </div>

            {sortedTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="text-muted-foreground mb-4">
                  <Search className="w-12 h-12 mx-auto mb-2" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No templates found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <TemplatePreview
        template={selectedTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}
