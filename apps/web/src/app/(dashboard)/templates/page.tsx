'use client';

import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { TemplateCard } from '@/components/templates/TemplateCard';
import { TemplatePreview } from '@/components/templates/TemplatePreview';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

// Template data structure
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

// Mock template data
const templates: Template[] = [
  {
    id: 'navigation-bar',
    name: 'Navigation Bar',
    description: 'Responsive navigation with logo, menu items, and mobile hamburger menu',
    category: 'Navigation',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'beginner',
    tags: ['responsive', 'mobile', 'navigation'],
    preview: '/templates/preview/navigation-bar.png',
    usage: 1250,
    rating: 4.8,
    createdAt: '2026-02-15'
  },
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Landing page hero with call-to-action buttons and gradient background',
    category: 'Layout',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'beginner',
    tags: ['landing', 'hero', 'cta'],
    preview: '/templates/preview/hero-section.png',
    usage: 980,
    rating: 4.7,
    createdAt: '2026-02-14'
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Multi-field contact form with validation and submission handling',
    category: 'Forms',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'intermediate',
    tags: ['form', 'validation', 'contact'],
    preview: '/templates/preview/contact-form.png',
    usage: 750,
    rating: 4.6,
    createdAt: '2026-02-13'
  },
  {
    id: 'pricing-card',
    name: 'Pricing Card',
    description: 'Tiered pricing cards with feature lists and highlight styles',
    category: 'E-commerce',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'intermediate',
    tags: ['pricing', 'cards', 'e-commerce'],
    preview: '/templates/preview/pricing-card.png',
    usage: 620,
    rating: 4.5,
    createdAt: '2026-02-12'
  },
  {
    id: 'modal-dialog',
    name: 'Modal Dialog',
    description: 'Accessible modal with overlay, close button, and escape key support',
    category: 'Overlay',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'intermediate',
    tags: ['modal', 'dialog', 'overlay'],
    preview: '/templates/preview/modal-dialog.png',
    usage: 580,
    rating: 4.4,
    createdAt: '2026-02-11'
  },
  {
    id: 'data-table',
    name: 'Data Table',
    description: 'Sortable data table with pagination and row selection',
    category: 'Data Display',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'advanced',
    tags: ['table', 'data', 'pagination'],
    preview: '/templates/preview/data-table.png',
    usage: 450,
    rating: 4.3,
    createdAt: '2026-02-10'
  },
  {
    id: 'sidebar-menu',
    name: 'Sidebar Menu',
    description: 'Collapsible sidebar navigation with nested menu items',
    category: 'Navigation',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'intermediate',
    tags: ['sidebar', 'navigation', 'collapsible'],
    preview: '/templates/preview/sidebar-menu.png',
    usage: 520,
    rating: 4.6,
    createdAt: '2026-02-09'
  },
  {
    id: 'loading-spinner',
    name: 'Loading Spinner',
    description: 'Animated loading spinner with multiple variants',
    category: 'Feedback',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'beginner',
    tags: ['loading', 'spinner', 'animation'],
    preview: '/templates/preview/loading-spinner.png',
    usage: 890,
    rating: 4.7,
    createdAt: '2026-02-08'
  },
  {
    id: 'card-grid',
    name: 'Card Grid',
    description: 'Responsive card grid with hover effects and animations',
    category: 'Layout',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'beginner',
    tags: ['cards', 'grid', 'responsive'],
    preview: '/templates/preview/card-grid.png',
    usage: 780,
    rating: 4.5,
    createdAt: '2026-02-07'
  },
  {
    id: 'search-bar',
    name: 'Search Bar',
    description: 'Search input with autocomplete and filtering capabilities',
    category: 'Forms',
    framework: 'react',
    componentLibrary: 'tailwind',
    difficulty: 'intermediate',
    tags: ['search', 'input', 'filter'],
    preview: '/templates/preview/search-bar.png',
    usage: 420,
    rating: 4.4,
    createdAt: '2026-02-06'
  }
];

const categories = [
  'All',
  'Navigation',
  'Layout',
  'Forms',
  'E-commerce',
  'Overlay',
  'Data Display',
  'Feedback'
];

const difficulties = ['All', 'beginner', 'intermediate', 'advanced'];

function TemplatesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('usage');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Sort templates
  const sortedTemplates = [...filteredTemplates].sort((a, b) => {
    switch (sortBy) {
      case 'usage':
        return b.usage - a.usage;
      case 'rating':
        return b.rating - a.rating;
      case 'name':
        return a.name.localeCompare(b.name);
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleUseTemplate = (template: Template) => {
    // Navigate to generate page with template pre-filled
    const params = new URLSearchParams({
      template: template.id,
      framework: template.framework,
      componentLibrary: template.componentLibrary,
      description: template.description
    });
    
    router.push(`/generate?${params.toString()}`);
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Component Templates</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose from our library of pre-built components to jumpstart your project
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
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

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {difficulties.map(difficulty => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="usage">Most Used</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name</option>
            <option value="recent">Recently Added</option>
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sortedTemplates.map(template => (
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
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>

      {/* Template Preview Dialog */}
      <TemplatePreview
        template={selectedTemplate}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        onUseTemplate={handleUseTemplate}
      />
    </div>
  );
}

export default TemplatesPage;