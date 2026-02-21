'use client';

import { useState } from 'react';
import { Star, Eye, Code } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export interface Template {
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

interface TemplateCardProps {
  template: Template;
  onUseTemplate: (template: Template) => void;
  onPreview: (template: Template) => void;
}

// Template code snippets
const templateCodes: Record<string, string> = {
  'navigation-bar': `import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function NavigationBar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold">Logo</span>
          </div>

          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600">Home</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">About</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Services</a>
            <a href="#" className="text-gray-700 hover:text-blue-600">Contact</a>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Home</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">About</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Services</a>
              <a href="#" className="block px-3 py-2 text-gray-700 hover:text-blue-600">Contact</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}`,
  'hero-section': `import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-600 to-purple-600 flex items-center">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold text-white mb-6">
          Welcome to Your Next Project
        </h1>
        <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
          Build beautiful, responsive web applications with modern tools and best practices.
        </p>
        <div className="space-x-4">
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
}`,
  'contact-form': `import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Contact Us</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            required
            rows={4}
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <Button type="submit" className="w-full">
          Send Message
        </Button>
      </form>
    </div>
  );
}`,
  'pricing-card': `import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingCard() {
  const plans = [
    {
      name: 'Basic',
      price: '$9',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      highlighted: false
    },
    {
      name: 'Pro',
      price: '$29',
      features: ['All Basic features', 'Feature 4', 'Feature 5', 'Feature 6'],
      highlighted: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      features: ['All Pro features', 'Feature 7', 'Feature 8', 'Priority Support'],
      highlighted: false
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={\`p-8 rounded-lg border-2 \${
              plan.highlighted
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white'
            }\`}
          >
            <h3 className="text-2xl font-bold text-center mb-4">{plan.name}</h3>
            <div className="text-4xl font-bold text-center mb-6">
              {plan.price}
              <span className="text-lg text-gray-600">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className={\`w-full \${
                plan.highlighted
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }\`}
            >
              Choose Plan
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'modal-dialog': `import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ModalDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-4">Modal Title</h2>
            <p className="text-gray-600 mb-6">
              This is a modal dialog with overlay, close button, and escape key support.
            </p>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`,
  'data-table': `import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export default function DataTable() {
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Admin' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User' },
  ];

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleRowSelect = (id: number) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const sortedData = [...data].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-3">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(data.map(row => row.id));
                    } else {
                      setSelectedRows([]);
                    }
                  }}
                />
              </th>
              <th
                className="border border-gray-300 p-3 cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name {sortField === 'name' && (
                  sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </th>
              <th
                className="border border-gray-300 p-3 cursor-pointer"
                onClick={() => handleSort('email')}
              >
                Email {sortField === 'email' && (
                  sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </th>
              <th
                className="border border-gray-300 p-3 cursor-pointer"
                onClick={() => handleSort('role')}
              >
                Role {sortField === 'role' && (
                  sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowSelect(row.id)}
                  />
                </td>
                <td className="border border-gray-300 p-3">{row.name}</td>
                <td className="border border-gray-300 p-3">{row.email}</td>
                <td className="border border-gray-300 p-3">{row.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {selectedRows.length} rows selected
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded text-sm">
            Previous
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}`,
  'sidebar-menu': `import { useState } from 'react';
import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react';

export default function SidebarMenu() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(['products']);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      children: []
    },
    {
      id: 'products',
      label: 'Products',
      icon: '📦',
      children: [
        { id: 'all-products', label: 'All Products' },
        { id: 'add-product', label: 'Add Product' },
        { id: 'categories', label: 'Categories' }
      ]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: '🛒',
      children: [
        { id: 'all-orders', label: 'All Orders' },
        { id: 'pending', label: 'Pending' },
        { id: 'completed', label: 'Completed' }
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: '👥',
      children: []
    }
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className={\`bg-gray-800 text-white transition-all duration-300 \${
        isCollapsed ? 'w-16' : 'w-64'
      }\`}>
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className={\`font-bold text-lg \${
              isCollapsed ? 'hidden' : 'block'
            }\`}>Menu</h2>
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-white hover:bg-gray-700 p-1 rounded"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        <nav className="mt-4">
          {menuItems.map(item => (
            <div key={item.id}>
              <button
                onClick={() => toggleExpanded(item.id)}
                className={\`w-full flex items-center px-4 py-2 hover:bg-gray-700 \${
                  isCollapsed ? 'justify-center' : 'justify-between'
                }\`}
              >
                <div className="flex items-center">
                  <span className="mr-2">{item.icon}</span>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>
                {!isCollapsed && item.children.length > 0 && (
                  <ChevronDown
                    size={16}
                    className={\`transition-transform \${
                      expandedItems.includes(item.id) ? 'rotate-180' : ''
                    }\`}
                  />
                )}
              </button>

              {!isCollapsed && expandedItems.includes(item.id) && item.children.length > 0 && (
                <div className="ml-4">
                  {item.children.map(child => (
                    <button
                      key={child.id}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Main Content</h1>
        <p className="text-gray-600">
          This is the main content area with a collapsible sidebar navigation.
        </p>
      </div>
    </div>
  );
}`,
  'loading-spinner': `export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen space-x-4">
      {/* Simple Spinner */}
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>

      {/* Pulse Spinner */}
      <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>

      {/* Bouncing Dots */}
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>

      {/* Rotating Square */}
      <div className="w-8 h-8 bg-blue-600 animate-spin" style={{ animationDuration: '2s' }}></div>
    </div>
  );
}`,
  'card-grid': `export default function CardGrid() {
  const cards = [
    { id: 1, title: 'Card 1', description: 'Description for card 1', image: '🖼️' },
    { id: 2, title: 'Card 2', description: 'Description for card 2', image: '🎨' },
    { id: 3, title: 'Card 3', description: 'Description for card 3', image: '📱' },
    { id: 4, title: 'Card 4', description: 'Description for card 4', image: '💻' },
    { id: 5, title: 'Card 5', description: 'Description for card 5', image: '🎮' },
    { id: 6, title: 'Card 6', description: 'Description for card 6', image: '🎵' },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <div
            key={card.id}
            className="bg-white rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >
            <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-6xl">
              {card.image}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">{card.title}</h3>
              <p className="text-gray-600 mb-4">{card.description}</p>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors">
                Learn More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  'search-bar': `import { useState } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const allSuggestions = [
    'React Components',
    'TypeScript Tutorial',
    'Tailwind CSS',
    'Next.js Guide',
    'JavaScript Tips',
    'CSS Grid Layout',
    'Node.js Basics',
    'Database Design'
  ];

  const handleInputChange = (value: string) => {
    setQuery(value);

    if (value.length > 0) {
      const filtered = allSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setIsOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {isOpen && suggestions.length > 0 && (
          <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-4 py-3 hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center">
                  <Search className="w-4 h-4 text-gray-400 mr-3" />
                  <span>{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {query && (
        <div className="mt-4 text-sm text-gray-600">
          Searching for: <strong>{query}</strong>
        </div>
      )}
    </div>
  );
}`,
};

export function TemplateCard({ template, onUseTemplate, onPreview }: TemplateCardProps) {
  const [imageError] = useState(false);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const templateWithCode = {
    ...template,
    code:
      templateCodes[template.id] ||
      `// Template code for ${template.name}\\nexport default function ${template.name.replace(/\\s+/g, '')}() {\\n  return <div>Template implementation</div>;\\n}`,
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{template.name}</CardTitle>
            <CardDescription className="text-sm mt-1 line-clamp-2">
              {template.description}
            </CardDescription>
          </div>
          {!imageError && template.preview ? (
            <div className="ml-3 flex-shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center text-2xl">
                🎨
              </div>
            </div>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{template.framework}</Badge>
            <Badge variant="outline">{template.componentLibrary}</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(template.difficulty)}>{template.difficulty}</Badge>
            <span className="text-xs text-muted-foreground">{template.category}</span>
          </div>

          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>{template.rating}</span>
            </div>
            <span>{template.usage} uses</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <div className="flex gap-2 w-full">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPreview(templateWithCode)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" onClick={() => onUseTemplate(templateWithCode)} className="flex-1">
            <Code className="w-4 h-4 mr-1" />
            Use Template
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
