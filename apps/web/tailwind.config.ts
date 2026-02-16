import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			purple: {
  				50: 'hsl(262, 80%, 85%)',
  				100: 'hsl(262, 75%, 80%)',
  				200: 'hsl(262, 70%, 75%)',
  				300: 'hsl(262, 70%, 70%)',
  				400: 'hsl(262, 70%, 65%)',
  				500: 'hsl(262, 70%, 60%)',
  				600: 'hsl(262, 65%, 55%)',
  				700: 'hsl(262, 60%, 45%)',
  				800: 'hsl(262, 55%, 35%)',
  				900: 'hsl(262, 50%, 25%)',
  				950: 'hsl(262, 45%, 18%)',
  			},
  			gray: {
  				50: 'hsl(240, 10%, 98%)',
  				100: 'hsl(240, 8%, 96%)',
  				200: 'hsl(240, 7%, 92%)',
  				300: 'hsl(240, 6%, 85%)',
  				400: 'hsl(240, 5%, 65%)',
  				500: 'hsl(240, 4%, 46%)',
  				600: 'hsl(240, 5%, 35%)',
  				700: 'hsl(240, 6%, 25%)',
  				800: 'hsl(240, 8%, 15%)',
  				900: 'hsl(240, 10%, 10%)',
  				950: 'hsl(240, 10%, 8%)',
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
