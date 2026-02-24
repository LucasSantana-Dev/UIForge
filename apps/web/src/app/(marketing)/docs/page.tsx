export const dynamic = 'force-dynamic';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Code,
  Zap,
  Shield,
  Rocket,
  Users,
  ArrowRight,
  Github,
  Twitter,
} from 'lucide-react';

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-950 to-purple-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center">
            <Badge className="mb-4">Documentation</Badge>
            <h1 className="text-5xl font-bold mb-6">Everything you need to build with Siza</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Comprehensive guides, API references, and examples to help you get the most out of
              Siza&apos;s AI-powered component generation.
            </p>
            <div className="flex gap-4 justify-center">
              <Button size="lg" className="gap-2">
                <BookOpen className="w-5 h-5" />
                Quick Start
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Rocket className="w-8 h-8 text-brand mb-4" />
              <h3 className="text-lg font-semibold mb-2">Getting Started</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn the basics and set up your first project
              </p>
              <Button variant="ghost" className="p-0 h-auto">
                Get Started <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Code className="w-8 h-8 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">API Reference</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Complete API documentation and examples
              </p>
              <Button variant="ghost" className="p-0 h-auto">
                View API <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Zap className="w-8 h-8 text-yellow-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Templates</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Explore our library of pre-built components
              </p>
              <Button variant="ghost" className="p-0 h-auto">
                Browse Templates <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <Shield className="w-8 h-8 text-purple-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Security</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Learn about our security practices and BYOK
              </p>
              <Button variant="ghost" className="p-0 h-auto">
                Security Guide <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Documentation</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Getting Started */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Getting Started</h3>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Installation</h4>
                  <p className="text-sm text-muted-foreground">
                    Set up Siza in your development environment
                  </p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">First Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Create your first AI-generated component
                  </p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Configuration</h4>
                  <p className="text-sm text-muted-foreground">
                    Configure AI providers and settings
                  </p>
                </Card>
              </div>
            </div>

            {/* Core Features */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Core Features</h3>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Component Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Generate components with natural language
                  </p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Template Library</h4>
                  <p className="text-sm text-muted-foreground">Use pre-built component templates</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Project Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Organize and manage your components
                  </p>
                </Card>
              </div>
            </div>

            {/* Advanced Topics */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Advanced Topics</h3>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Custom AI Providers</h4>
                  <p className="text-sm text-muted-foreground">Integrate your own AI models</p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Deployment</h4>
                  <p className="text-sm text-muted-foreground">
                    Deploy to production with Cloudflare
                  </p>
                </Card>
                <Card className="p-4">
                  <h4 className="font-medium mb-2">API Integration</h4>
                  <p className="text-sm text-muted-foreground">
                    Use Siza in your existing projects
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Code Examples</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Basic Component Generation</h3>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                <pre>{`// Generate a button component
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    description: 'Create a modern button with hover effects',
    framework: 'react',
    componentLibrary: 'tailwind'
  })
});`}</pre>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Using Templates</h3>
              <div className="bg-secondary rounded-lg p-4 font-mono text-sm">
                <pre>{`// Use a pre-built template
const template = await fetch('/api/templates/navigation-bar');
const component = instantiateTemplate(template, {
  brandName: 'My App',
  items: ['Home', 'About', 'Contact']
});`}</pre>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Community */}
      <section className="py-16 bg-brand/10 bg-brand-muted">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Community</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Connect with other developers, share your creations, and get help
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="gap-2">
              <Github className="w-5 h-5" />
              GitHub Discussions
            </Button>
            <Button size="lg" variant="outline" className="gap-2">
              <Twitter className="w-5 h-5" />
              Follow on Twitter
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start building?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers using Siza to build better UI components faster
          </p>
          <Button size="lg" className="gap-2">
            <Users className="w-5 h-5" />
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}
