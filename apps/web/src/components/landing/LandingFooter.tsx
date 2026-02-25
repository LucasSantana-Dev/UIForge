import Link from 'next/link';
import { Github, Linkedin } from 'lucide-react';

export function LandingFooter() {
  return (
    <footer className="bg-[#18181B] border-t border-[#27272A]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-20 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display font-bold text-lg text-[#FAFAFA]">siza</div>
            <p className="text-sm text-[#71717A] mt-2">The open full-stack AI workspace.</p>
            <div className="flex items-center gap-4 mt-4">
              <Link
                href="https://github.com/Forge-Space"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Siza on GitHub"
                className="text-[#71717A] hover:text-[#FAFAFA] transition-colors"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/devlucassantana/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Lucas Santana on LinkedIn"
                className="text-[#71717A] hover:text-[#FAFAFA] transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#FAFAFA] mb-4">Platform</h3>
            <Link
              href="/generate"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Generate
            </Link>
            <Link
              href="/generate"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Components
            </Link>
            <Link
              href="/generate"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Templates
            </Link>
            <Link
              href="/pricing"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Pricing
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#FAFAFA] mb-4">Developers</h3>
            <Link
              href="/docs"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Documentation
            </Link>
            <Link
              href="https://github.com/Forge-Space"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              GitHub
            </Link>
            <Link
              href="https://github.com/Forge-Space/ui-mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              MCP Tools
            </Link>
            <Link
              href="/docs"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              API Reference
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#FAFAFA] mb-4">Company</h3>
            <Link
              href="/about"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              About
            </Link>
            <Link
              href="/roadmap"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Roadmap
            </Link>
            <Link
              href="#"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Blog
            </Link>
            <Link
              href="/docs"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Changelog
            </Link>
          </div>

          <div>
            <h3 className="text-sm font-medium text-[#FAFAFA] mb-4">Legal</h3>
            <Link
              href="#"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="block text-sm text-[#71717A] hover:text-[#A1A1AA] transition-colors py-1"
            >
              License
            </Link>
          </div>
        </div>

        <div className="border-t border-[#27272A] mt-10 pt-8">
          <p className="text-center text-xs text-[#71717A]">&copy; 2026 Siza. MIT License.</p>
        </div>
      </div>
    </footer>
  );
}
