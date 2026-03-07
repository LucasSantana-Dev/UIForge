import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        elevated: 'var(--forge-bg-elevated)',
        'surface-alt': 'var(--forge-surface-alt)',
        subtle: 'var(--forge-text-subtle)',
        'primary-hover': 'var(--forge-primary-hover)',
        'primary-pressed': 'var(--forge-primary-pressed)',
        surface: {
          DEFAULT: 'var(--forge-surface)',
          0: 'var(--surface-0)',
          1: 'var(--surface-1)',
          2: 'var(--surface-2)',
          3: 'var(--surface-3)',
          4: 'var(--surface-4)',
        },
        brand: {
          DEFAULT: 'rgb(var(--forge-primary-rgb) / <alpha-value>)',
          light: '#a78bfa',
          dark: '#6d28d9',
          muted: '#4c1d95',
        },
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'text-brand': 'var(--text-brand)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
        primary: {
          DEFAULT: 'rgb(var(--forge-primary-rgb) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-plus-jakarta)', 'var(--font-dm-sans)', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        xl: 'var(--forge-radius-xl)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: { height: '0' },
        },
        'siza-fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(4px)',
          },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'siza-scale-in': {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 12px rgba(139,92,246,0.2)',
          },
          '50%': {
            boxShadow: '0 0 24px rgba(139,92,246,0.4)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'siza-fade-in': 'siza-fade-in 0.3s var(--forge-ease) forwards',
        'siza-scale-in': 'siza-scale-in 0.2s var(--forge-ease) forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      transitionTimingFunction: {
        siza: 'var(--forge-ease)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
