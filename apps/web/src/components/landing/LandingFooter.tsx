import Image from 'next/image';
import { Github, Linkedin } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="border-t border-border/20 bg-surface">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image src="/monogram.svg" alt="Siza" width={20} height={20} />
              <span className="font-display font-bold text-lg text-foreground">Siza</span>
            </div>
            <p className="mt-2 text-sm text-subtle">The open full-stack AI workspace.</p>
            <div className="flex items-center gap-4 mt-4">
              <a
                href="https://github.com/Forge-Space"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Siza on GitHub"
                className="text-subtle hover:text-foreground transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/in/devlucassantana/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Lucas Santana on LinkedIn"
                className="text-subtle hover:text-foreground transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Product</h3>
            <a
              href="/"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Platform
            </a>
            <a
              href="/pricing"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Pricing
            </a>
            <a
              href="/templates"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Templates
            </a>
            <a
              href="/roadmap"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Roadmap
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Resources</h3>
            <a
              href="/docs"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Documentation
            </a>
            <a
              href="https://github.com/Forge-Space"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/Forge-Space/ui-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              MCP Tools
            </a>
            <a
              href="/docs"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              API Reference
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Company</h3>
            <a
              href="/about"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              About
            </a>
            <a
              href="/roadmap"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Roadmap
            </a>
            <a
              href="https://github.com/orgs/Forge-Space/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Community
            </a>
            <a
              href="https://github.com/Forge-Space/siza/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Changelog
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-medium text-foreground">Legal</h3>
            <a
              href="/legal/privacy"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Privacy
            </a>
            <a
              href="/legal/terms"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              Terms
            </a>
            <a
              href="https://github.com/Forge-Space/siza/blob/main/LICENSE"
              target="_blank"
              rel="noopener noreferrer"
              className="block py-1 text-sm text-subtle hover:text-foreground transition-colors"
            >
              License
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-border/20 pt-8">
          <p className="text-center text-xs text-subtle">&copy; 2026 Siza. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
