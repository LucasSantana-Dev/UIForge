'use client';

import { useState, useMemo } from 'react';
import { RefreshCwIcon, MaximizeIcon, Smartphone, Tablet, Monitor } from 'lucide-react';

interface LivePreviewProps {
  code: string;
  framework: string;
}

type Viewport = 'mobile' | 'tablet' | 'desktop';

const VIEWPORT_WIDTHS: Record<Viewport, string> = {
  mobile: '375px',
  tablet: '768px',
  desktop: '100%',
};

const SHADCN_CSS_VARS = `
  :root {
    --background: 224 71% 4%;
    --foreground: 213 31% 91%;
    --card: 224 71% 4%;
    --card-foreground: 213 31% 91%;
    --popover: 224 71% 4%;
    --popover-foreground: 213 31% 91%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 222.2 47.4% 11.2%;
    --secondary-foreground: 210 40% 98%;
    --muted: 223 47% 11%;
    --muted-foreground: 215.4 16.3% 56.9%;
    --accent: 216 34% 17%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;
    --border: 216 34% 17%;
    --input: 216 34% 17%;
    --ring: 216 34% 17%;
    --radius: 0.5rem;
  }
`;

const TAILWIND_SHADCN_CONFIG = `
  tailwind.config = {
    theme: {
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
      },
    },
  };
`;

const LIBRARY_SHIMS = `
      // === cn() utility ===
      function cn() {
        var args = Array.prototype.slice.call(arguments);
        return args.flat(Infinity).filter(function(x) {
          return typeof x === 'string' && x.length > 0;
        }).join(' ');
      }

      // === Lucide icon shim ===
      var _iconPaths = {
        Check: [{ type: 'polyline', points: '20 6 9 17 4 12' }],
        X: [{ type: 'path', d: 'M18 6 6 18' }, { type: 'path', d: 'm6 6 12 12' }],
        AlertCircle: [
          { type: 'circle', cx: '12', cy: '12', r: '10' },
          { type: 'line', x1: '12', y1: '8', x2: '12', y2: '12' },
          { type: 'line', x1: '12', y1: '16', x2: '12.01', y2: '16' },
        ],
        Loader2: [{ type: 'path', d: 'M21 12a9 9 0 1 1-6.219-8.56' }],
        ExternalLink: [
          { type: 'path', d: 'M15 3h6v6' },
          { type: 'path', d: 'M10 14 21 3' },
          { type: 'path', d: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6' },
        ],
        ChevronDown: [{ type: 'path', d: 'm6 9 6 6 6-6' }],
        ChevronUp: [{ type: 'path', d: 'm18 15-6-6-6 6' }],
        ChevronLeft: [{ type: 'path', d: 'm15 18-6-6 6-6' }],
        ChevronRight: [{ type: 'path', d: 'm9 18 6-6-6-6' }],
        ArrowLeft: [{ type: 'path', d: 'm12 19-7-7 7-7' }, { type: 'path', d: 'M19 12H5' }],
        ArrowRight: [{ type: 'path', d: 'M5 12h14' }, { type: 'path', d: 'm12 5 7 7-7 7' }],
        Search: [
          { type: 'circle', cx: '11', cy: '11', r: '8' },
          { type: 'path', d: 'm21 21-4.3-4.3' },
        ],
        Plus: [{ type: 'path', d: 'M5 12h14' }, { type: 'path', d: 'M12 5v14' }],
        Minus: [{ type: 'path', d: 'M5 12h14' }],
        Star: [{ type: 'polygon', points: '12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' }],
        Heart: [{ type: 'path', d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' }],
        Home: [
          { type: 'path', d: 'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8' },
          { type: 'path', d: 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
        ],
        Menu: [
          { type: 'line', x1: '4', x2: '20', y1: '12', y2: '12' },
          { type: 'line', x1: '4', x2: '20', y1: '6', y2: '6' },
          { type: 'line', x1: '4', x2: '20', y1: '18', y2: '18' },
        ],
        Bell: [
          { type: 'path', d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' },
          { type: 'path', d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' },
        ],
        User: [
          { type: 'path', d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' },
          { type: 'circle', cx: '12', cy: '7', r: '4' },
        ],
        Mail: [
          { type: 'rect', width: '20', height: '16', x: '2', y: '4', rx: '2' },
          { type: 'path', d: 'm22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7' },
        ],
        Eye: [
          { type: 'path', d: 'M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0' },
          { type: 'circle', cx: '12', cy: '12', r: '3' },
        ],
        EyeOff: [
          { type: 'path', d: 'M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49' },
          { type: 'path', d: 'M14.084 14.158a3 3 0 0 1-4.242-4.242' },
          { type: 'path', d: 'M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143' },
          { type: 'path', d: 'm2 2 20 20' },
        ],
        Copy: [
          { type: 'rect', width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' },
          { type: 'path', d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' },
        ],
        Trash2: [
          { type: 'path', d: 'M3 6h18' },
          { type: 'path', d: 'M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6' },
          { type: 'path', d: 'M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2' },
          { type: 'line', x1: '10', x2: '10', y1: '11', y2: '17' },
          { type: 'line', x1: '14', x2: '14', y1: '11', y2: '17' },
        ],
      };

      var _fallbackPaths = [
        { type: 'rect', width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' },
        { type: 'path', d: 'M9 9h6v6H9z' },
      ];

      function _createIcon(paths) {
        return function IconComponent(props) {
          var size = props && props.size || 24;
          var strokeWidth = props && props.strokeWidth || 2;
          var className = props && props.className || '';
          var rest = {};
          if (props) {
            for (var k in props) {
              if (k !== 'size' && k !== 'strokeWidth' && k !== 'className' && k !== 'children') {
                rest[k] = props[k];
              }
            }
          }
          return React.createElement('svg', Object.assign({
            xmlns: 'http://www.w3.org/2000/svg',
            width: size,
            height: size,
            viewBox: '0 0 24 24',
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: strokeWidth,
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            className: className,
          }, rest), paths.map(function(p, i) {
            return React.createElement(p.type, Object.assign({ key: i }, (function() {
              var cp = {};
              for (var pk in p) { if (pk !== 'type') cp[pk] = p[pk]; }
              return cp;
            })()));
          }));
        };
      }

      var _iconCache = {};
      var _icons = new Proxy({}, {
        get: function(target, name) {
          if (typeof name !== 'string') return undefined;
          if (_iconCache[name]) return _iconCache[name];
          _iconCache[name] = _createIcon(_iconPaths[name] || _fallbackPaths);
          return _iconCache[name];
        }
      });

      var Check = _createIcon(_iconPaths.Check);
      var X = _createIcon(_iconPaths.X);
      var AlertCircle = _createIcon(_iconPaths.AlertCircle);
      var Loader2 = _createIcon(_iconPaths.Loader2);
      var ExternalLink = _createIcon(_iconPaths.ExternalLink);
      var ChevronDown = _createIcon(_iconPaths.ChevronDown);
      var ChevronUp = _createIcon(_iconPaths.ChevronUp);
      var ChevronLeft = _createIcon(_iconPaths.ChevronLeft);
      var ChevronRight = _createIcon(_iconPaths.ChevronRight);
      var ArrowLeft = _createIcon(_iconPaths.ArrowLeft);
      var ArrowRight = _createIcon(_iconPaths.ArrowRight);
      var Search = _createIcon(_iconPaths.Search);
      var Plus = _createIcon(_iconPaths.Plus);
      var Minus = _createIcon(_iconPaths.Minus);
      var Star = _createIcon(_iconPaths.Star);
      var Heart = _createIcon(_iconPaths.Heart);
      var Home = _createIcon(_iconPaths.Home);
      var Menu = _createIcon(_iconPaths.Menu);
      var Bell = _createIcon(_iconPaths.Bell);
      var User = _createIcon(_iconPaths.User);
      var Mail = _createIcon(_iconPaths.Mail);
      var Eye = _createIcon(_iconPaths.Eye);
      var EyeOff = _createIcon(_iconPaths.EyeOff);
      var Copy = _createIcon(_iconPaths.Copy);
      var Trash2 = _createIcon(_iconPaths.Trash2);
      var RefreshCw = _createIcon(_iconPaths.Check);
      var Settings = _createIcon(_iconPaths.Menu);
      var Info = _createIcon(_iconPaths.AlertCircle);
      var Clock = _createIcon(_iconPaths.AlertCircle);
      var Calendar = _createIcon(_iconPaths.AlertCircle);
      var Download = _createIcon(_fallbackPaths);
      var Upload = _createIcon(_fallbackPaths);
      var Filter = _createIcon(_iconPaths.Search);
      var Edit = _createIcon(_iconPaths.Check);
      var Save = _createIcon(_iconPaths.Check);
      var Close = _createIcon(_iconPaths.X);
      var Delete = _createIcon(_iconPaths.Trash2);
      var Add = _createIcon(_iconPaths.Plus);
      var Remove = _createIcon(_iconPaths.Minus);
      var ArrowDown = _createIcon([{ type: 'path', d: 'M12 5v14' }, { type: 'path', d: 'm19 12-7 7-7-7' }]);
      var ArrowUp = _createIcon([{ type: 'path', d: 'M12 19V5' }, { type: 'path', d: 'm5 12 7-7 7 7' }]);
      var MoreHorizontal = _createIcon([
        { type: 'circle', cx: '12', cy: '12', r: '1' },
        { type: 'circle', cx: '19', cy: '12', r: '1' },
        { type: 'circle', cx: '5', cy: '12', r: '1' },
      ]);
      var MoreVertical = _createIcon([
        { type: 'circle', cx: '12', cy: '12', r: '1' },
        { type: 'circle', cx: '12', cy: '5', r: '1' },
        { type: 'circle', cx: '12', cy: '19', r: '1' },
      ]);
      var ShoppingCart = _createIcon([
        { type: 'circle', cx: '8', cy: '21', r: '1' },
        { type: 'circle', cx: '19', cy: '21', r: '1' },
        { type: 'path', d: 'M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12' },
      ]);
      var Package = _createIcon([
        { type: 'path', d: 'M16.5 9.4 7.55 4.24' },
        { type: 'path', d: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
        { type: 'path', d: 'M3.27 6.96 12 12.01l8.73-5.05' },
        { type: 'path', d: 'M12 22.08V12' },
      ]);
      var Zap = _createIcon([{ type: 'path', d: 'M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z' }]);
      var Globe = _createIcon([
        { type: 'circle', cx: '12', cy: '12', r: '10' },
        { type: 'path', d: 'M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20' },
        { type: 'path', d: 'M2 12h20' },
      ]);
      var Lock = _createIcon([
        { type: 'rect', width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' },
        { type: 'path', d: 'M7 11V7a5 5 0 0 1 10 0v4' },
      ]);
      var Unlock = _createIcon([
        { type: 'rect', width: '18', height: '11', x: '3', y: '11', rx: '2', ry: '2' },
        { type: 'path', d: 'M7 11V7a5 5 0 0 1 9.9-1' },
      ]);
      var Shield = _createIcon([{ type: 'path', d: 'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z' }]);
      var Image = _createIcon([
        { type: 'rect', width: '18', height: '18', x: '3', y: '3', rx: '2', ry: '2' },
        { type: 'circle', cx: '9', cy: '9', r: '2' },
        { type: 'path', d: 'm21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' },
      ]);
      var Video = _createIcon([
        { type: 'path', d: 'm16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.934a.5.5 0 0 0-.777-.416L16 11' },
        { type: 'rect', x: '2', y: '6', width: '14', height: '12', rx: '2' },
      ]);
      var Music = _createIcon([
        { type: 'path', d: 'M9 18V5l12-2v13' },
        { type: 'circle', cx: '6', cy: '18', r: '3' },
        { type: 'circle', cx: '18', cy: '16', r: '3' },
      ]);
      var FileText = _createIcon([
        { type: 'path', d: 'M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z' },
        { type: 'path', d: 'M14 2v4a2 2 0 0 0 2 2h4' },
        { type: 'path', d: 'M10 9H8' },
        { type: 'path', d: 'M16 13H8' },
        { type: 'path', d: 'M16 17H8' },
      ]);

      // === shadcn/ui component stubs ===
      var _btnVariants = {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      };
      var _btnSizes = {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      };

      function Button(props) {
        var variant = props.variant || 'default';
        var size = props.size || 'default';
        var className = props.className || '';
        var children = props.children;
        var rest = {};
        for (var k in props) {
          if (!{ variant:1, size:1, className:1, children:1, asChild:1 }[k]) rest[k] = props[k];
        }
        return React.createElement('button', Object.assign({
          className: cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
            _btnVariants[variant] || _btnVariants.default,
            _btnSizes[size] || _btnSizes.default,
            className
          ),
        }, rest), children);
      }

      function Card(props) {
        return React.createElement('div', {
          className: cn('rounded-lg border bg-card text-card-foreground shadow-sm', props.className),
        }, props.children);
      }
      function CardHeader(props) {
        return React.createElement('div', {
          className: cn('flex flex-col space-y-1.5 p-6', props.className),
        }, props.children);
      }
      function CardTitle(props) {
        return React.createElement('h3', {
          className: cn('text-2xl font-semibold leading-none tracking-tight', props.className),
        }, props.children);
      }
      function CardDescription(props) {
        return React.createElement('p', {
          className: cn('text-sm text-muted-foreground', props.className),
        }, props.children);
      }
      function CardContent(props) {
        return React.createElement('div', {
          className: cn('p-6 pt-0', props.className),
        }, props.children);
      }
      function CardFooter(props) {
        return React.createElement('div', {
          className: cn('flex items-center p-6 pt-0', props.className),
        }, props.children);
      }

      function Badge(props) {
        var variant = props.variant || 'default';
        var variants = {
          default: 'border-transparent bg-primary text-primary-foreground',
          secondary: 'border-transparent bg-secondary text-secondary-foreground',
          destructive: 'border-transparent bg-destructive text-destructive-foreground',
          outline: 'text-foreground',
        };
        return React.createElement('div', {
          className: cn(
            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            variants[variant] || variants.default,
            props.className
          ),
        }, props.children);
      }

      function Input(props) {
        var className = props.className || '';
        var rest = {};
        for (var k in props) {
          if (k !== 'className') rest[k] = props[k];
        }
        return React.createElement('input', Object.assign({
          className: cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          ),
        }, rest));
      }

      function Label(props) {
        return React.createElement('label', {
          className: cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', props.className),
          htmlFor: props.htmlFor,
        }, props.children);
      }

      function Textarea(props) {
        var className = props.className || '';
        var rest = {};
        for (var k in props) {
          if (k !== 'className') rest[k] = props[k];
        }
        return React.createElement('textarea', Object.assign({
          className: cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          ),
        }, rest));
      }

      function Separator(props) {
        var orientation = props.orientation || 'horizontal';
        return React.createElement('div', {
          role: 'separator',
          className: cn(
            'shrink-0 bg-border',
            orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
            props.className
          ),
        });
      }

      function Alert(props) {
        var variant = props.variant || 'default';
        var variants = {
          default: 'bg-background text-foreground',
          destructive: 'border-destructive/50 text-destructive [&>svg]:text-destructive',
        };
        return React.createElement('div', {
          role: 'alert',
          className: cn(
            'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
            variants[variant] || variants.default,
            props.className
          ),
        }, props.children);
      }
      function AlertTitle(props) {
        return React.createElement('h5', {
          className: cn('mb-1 font-medium leading-none tracking-tight', props.className),
        }, props.children);
      }
      function AlertDescription(props) {
        return React.createElement('div', {
          className: cn('text-sm [&_p]:leading-relaxed', props.className),
        }, props.children);
      }

      function Avatar(props) {
        return React.createElement('span', {
          className: cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', props.className),
        }, props.children);
      }
      function AvatarImage(props) {
        return React.createElement('img', {
          className: cn('aspect-square h-full w-full', props.className),
          src: props.src,
          alt: props.alt || '',
        });
      }
      function AvatarFallback(props) {
        return React.createElement('span', {
          className: cn('flex h-full w-full items-center justify-center rounded-full bg-muted', props.className),
        }, props.children);
      }

      function Switch(props) {
        var checked = props.checked || false;
        return React.createElement('button', {
          role: 'switch',
          'aria-checked': checked,
          onClick: props.onCheckedChange ? function() { props.onCheckedChange(!checked); } : props.onClick,
          className: cn(
            'peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            checked ? 'bg-primary' : 'bg-input',
            props.className
          ),
        }, React.createElement('span', {
          className: cn(
            'pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0'
          ),
        }));
      }

      function Progress(props) {
        var value = props.value || 0;
        return React.createElement('div', {
          role: 'progressbar',
          'aria-valuenow': value,
          className: cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', props.className),
        }, React.createElement('div', {
          className: 'h-full w-full flex-1 bg-primary transition-all',
          style: { transform: 'translateX(-' + (100 - value) + '%)' },
        }));
      }

      function Skeleton(props) {
        return React.createElement('div', {
          className: cn('animate-pulse rounded-md bg-muted', props.className),
        });
      }

      function Tabs(props) {
        return React.createElement('div', { className: cn('', props.className) }, props.children);
      }
      function TabsList(props) {
        return React.createElement('div', {
          className: cn('inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground', props.className),
        }, props.children);
      }
      function TabsTrigger(props) {
        return React.createElement('button', {
          className: cn('inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm', props.className),
          onClick: props.onClick,
        }, props.children);
      }
      function TabsContent(props) {
        return React.createElement('div', {
          className: cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', props.className),
        }, props.children);
      }

      function ScrollArea(props) {
        return React.createElement('div', {
          className: cn('relative overflow-auto', props.className),
          style: props.style,
        }, props.children);
      }

      function Dialog(props) { return React.createElement(Fragment, null, props.children); }
      function DialogTrigger(props) { return React.createElement(Fragment, null, props.children); }
      function DialogContent(props) {
        return React.createElement('div', {
          className: cn('fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg', props.className),
        }, props.children);
      }
      function DialogHeader(props) {
        return React.createElement('div', {
          className: cn('flex flex-col space-y-1.5 text-center sm:text-left', props.className),
        }, props.children);
      }
      function DialogTitle(props) {
        return React.createElement('h2', {
          className: cn('text-lg font-semibold leading-none tracking-tight', props.className),
        }, props.children);
      }
      function DialogDescription(props) {
        return React.createElement('p', {
          className: cn('text-sm text-muted-foreground', props.className),
        }, props.children);
      }
      function DialogFooter(props) {
        return React.createElement('div', {
          className: cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', props.className),
        }, props.children);
      }

      function Table(props) {
        return React.createElement('div', { className: 'relative w-full overflow-auto' },
          React.createElement('table', {
            className: cn('w-full caption-bottom text-sm', props.className),
          }, props.children)
        );
      }
      function TableHeader(props) {
        return React.createElement('thead', { className: cn('[&_tr]:border-b', props.className) }, props.children);
      }
      function TableBody(props) {
        return React.createElement('tbody', { className: cn('[&_tr:last-child]:border-0', props.className) }, props.children);
      }
      function TableRow(props) {
        return React.createElement('tr', {
          className: cn('border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted', props.className),
        }, props.children);
      }
      function TableHead(props) {
        return React.createElement('th', {
          className: cn('h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0', props.className),
        }, props.children);
      }
      function TableCell(props) {
        return React.createElement('td', {
          className: cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', props.className),
        }, props.children);
      }

      function Select(props) { return React.createElement(Fragment, null, props.children); }
      function SelectTrigger(props) {
        return React.createElement('button', {
          className: cn('flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', props.className),
        }, props.children, React.createElement(ChevronDown, { className: 'h-4 w-4 opacity-50' }));
      }
      function SelectValue(props) {
        return React.createElement('span', null, props.placeholder || props.children || '');
      }
      function SelectContent(props) {
        return React.createElement('div', {
          className: cn('relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md', props.className),
        }, props.children);
      }
      function SelectItem(props) {
        return React.createElement('div', {
          className: cn('relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground', props.className),
        }, props.children);
      }

      function Tooltip(props) { return React.createElement(Fragment, null, props.children); }
      function TooltipTrigger(props) { return React.createElement(Fragment, null, props.children); }
      function TooltipContent(props) { return React.createElement(Fragment, null); }
      function TooltipProvider(props) { return React.createElement(Fragment, null, props.children); }

      function Accordion(props) {
        return React.createElement('div', { className: cn('', props.className) }, props.children);
      }
      function AccordionItem(props) {
        return React.createElement('div', {
          className: cn('border-b', props.className),
        }, props.children);
      }
      function AccordionTrigger(props) {
        return React.createElement('div', {
          className: cn('flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline cursor-pointer', props.className),
          onClick: props.onClick,
        }, props.children, React.createElement(ChevronDown, { className: 'h-4 w-4 shrink-0 transition-transform duration-200' }));
      }
      function AccordionContent(props) {
        return React.createElement('div', {
          className: cn('overflow-hidden text-sm transition-all pb-4 pt-0', props.className),
        }, props.children);
      }

      function Checkbox(props) {
        var checked = props.checked || false;
        return React.createElement('button', {
          role: 'checkbox',
          'aria-checked': checked,
          onClick: props.onCheckedChange ? function() { props.onCheckedChange(!checked); } : props.onClick,
          className: cn(
            'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            checked ? 'bg-primary text-primary-foreground' : '',
            props.className
          ),
        }, checked ? React.createElement(Check, { className: 'h-3 w-3' }) : null);
      }

      function RadioGroup(props) {
        return React.createElement('div', {
          role: 'radiogroup',
          className: cn('grid gap-2', props.className),
        }, props.children);
      }
      function RadioGroupItem(props) {
        return React.createElement('button', {
          role: 'radio',
          className: cn(
            'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            props.className
          ),
        }, React.createElement('span', {
          className: 'flex items-center justify-center',
        }, props.checked ? React.createElement('span', { className: 'h-2.5 w-2.5 rounded-full bg-current' }) : null));
      }

      function Popover(props) { return React.createElement(Fragment, null, props.children); }
      function PopoverTrigger(props) { return React.createElement(Fragment, null, props.children); }
      function PopoverContent(props) {
        return React.createElement('div', {
          className: cn('z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none', props.className),
        }, props.children);
      }

      function DropdownMenu(props) { return React.createElement(Fragment, null, props.children); }
      function DropdownMenuTrigger(props) { return React.createElement(Fragment, null, props.children); }
      function DropdownMenuContent(props) {
        return React.createElement('div', {
          className: cn('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md', props.className),
        }, props.children);
      }
      function DropdownMenuItem(props) {
        return React.createElement('div', {
          className: cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground hover:bg-accent', props.className),
          onClick: props.onClick,
        }, props.children);
      }
      function DropdownMenuSeparator() {
        return React.createElement('div', { className: '-mx-1 my-1 h-px bg-muted' });
      }
      function DropdownMenuLabel(props) {
        return React.createElement('div', {
          className: cn('px-2 py-1.5 text-sm font-semibold', props.className),
        }, props.children);
      }
`;

export default function LivePreview({ code, framework }: LivePreviewProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewport, setViewport] = useState<Viewport>('desktop');

  const previewHTML = useMemo(() => {
    if (!code) return '';
    if (framework === 'react') return createReactPreviewHTML(code);
    if (framework === 'vue') return createVuePreviewHTML(code);
    return createFallbackHTML(code, framework);
  }, [code, framework]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((k) => k + 1);
    setTimeout(() => setIsRefreshing(false), 300);
  };

  const viewportButtons: Array<{
    key: Viewport;
    icon: typeof Smartphone;
    label: string;
  }> = [
    { key: 'mobile', icon: Smartphone, label: 'Mobile' },
    { key: 'tablet', icon: Tablet, label: 'Tablet' },
    { key: 'desktop', icon: Monitor, label: 'Desktop' },
  ];

  return (
    <div className="h-full flex flex-col bg-surface-0">
      <div className="flex items-center justify-between px-4 py-2 bg-surface-0 border-b border-surface-3">
        <h3 className="text-sm font-medium text-text-primary">Live Preview</h3>
        <div className="flex items-center space-x-1">
          {viewportButtons.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setViewport(key)}
              className={`inline-flex items-center px-2 py-1 text-xs rounded ${
                viewport === key
                  ? 'bg-primary text-primary-foreground'
                  : 'text-text-secondary hover:bg-surface-2'
              }`}
              aria-label={label}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}

          <div className="w-px h-4 bg-surface-3 mx-1" />

          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !code}
            className="inline-flex items-center px-3 py-1 text-xs font-medium text-text-primary bg-surface-1 border border-surface-3 rounded hover:bg-surface-0 disabled:opacity-50"
            aria-label="Refresh preview"
          >
            <RefreshCwIcon className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      <div className="flex-1 relative overflow-auto">
        {!code ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-text-secondary">
              <MaximizeIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Generate a component to see preview</p>
            </div>
          </div>
        ) : (
          <div
            className="h-full flex justify-center"
            style={{
              padding: viewport !== 'desktop' ? '0 16px' : undefined,
            }}
          >
            <iframe
              key={refreshKey}
              srcDoc={previewHTML}
              className="h-full border-0 bg-surface-1 transition-all duration-200"
              style={{
                width: VIEWPORT_WIDTHS[viewport],
                maxWidth: '100%',
                boxShadow: viewport !== 'desktop' ? '0 0 0 1px rgba(0,0,0,0.1)' : undefined,
              }}
              sandbox="allow-scripts"
              title="Component Preview"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function stripImportsAndExports(code: string): string {
  return code
    .replace(/^import\s+.*$/gm, '')
    .replace(/^export\s+default\s+/gm, 'const __DefaultExport__ = ')
    .replace(/^export\s+/gm, '');
}

function extractComponentName(code: string): string | null {
  const defaultExport = code.match(/export\s+default\s+(?:function\s+)?(\w+)/);
  if (defaultExport) return defaultExport[1];

  const namedFunction = code.match(/(?:function|const|class)\s+([A-Z]\w+)/);
  return namedFunction ? namedFunction[1] : null;
}

function createReactPreviewHTML(code: string): string {
  const componentName = extractComponentName(code) || '__DefaultExport__';
  const strippedCode = stripImportsAndExports(code);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
  ${TAILWIND_SHADCN_CONFIG}
  </script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    ${SHADCN_CSS_VARS}
    * { margin: 0; box-sizing: border-box; }
    body { background: hsl(var(--background)); color: hsl(var(--foreground)); padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
    #error-display { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; font-size: 13px; font-family: monospace; white-space: pre-wrap; display: none; margin: 16px; }
    #root { min-height: 40px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="error-display"></div>
  <script>
    window.onerror = function(msg, src, line, col) {
      var el = document.getElementById('error-display');
      el.style.display = 'block';
      el.textContent = msg + (line ? ' (line ' + line + ')' : '');
      document.getElementById('root').style.display = 'none';
      return true;
    };
  </script>
  <script type="text/babel" data-type="module">
    try {
      const { useState, useEffect, useRef, useCallback, useMemo, useContext, createContext, forwardRef, memo, Fragment } = React;

${LIBRARY_SHIMS}

      ${strippedCode}

      const App = ${componentName};
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(App));
    } catch (err) {
      const errorDiv = document.getElementById('error-display');
      errorDiv.style.display = 'block';
      errorDiv.textContent = err.message;
      document.getElementById('root').style.display = 'none';
    }
  </script>
</body>
</html>`;
}

function createVuePreviewHTML(code: string): string {
  const processed = code
    .replace(/^import\s+.*$/gm, '')
    .replace(/export\s+default\s+/gm, 'const __VueComponent__ = ');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, -apple-system, sans-serif; }
    #error-display { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; font-size: 13px; font-family: monospace; white-space: pre-wrap; display: none; margin: 16px; }
    #app { min-height: 40px; }
  </style>
</head>
<body>
  <div id="app"></div>
  <div id="error-display"></div>
  <script>
    window.onerror = function(msg, src, line, col) {
      var el = document.getElementById('error-display');
      el.style.display = 'block';
      el.textContent = msg + (line ? ' (line ' + line + ')' : '');
      document.getElementById('app').style.display = 'none';
      return true;
    };

    try {
      const { createApp, ref, reactive, computed, watch, watchEffect, onMounted, onUnmounted, defineComponent, h, toRefs, nextTick } = Vue;

      ${processed}

      var component = (typeof __VueComponent__ !== 'undefined') ? __VueComponent__ : null;

      if (component) {
        var app = createApp(component);
        app.config.errorHandler = function(err) {
          var el = document.getElementById('error-display');
          el.style.display = 'block';
          el.textContent = err.message || String(err);
          document.getElementById('app').style.display = 'none';
        };
        app.mount('#app');
      } else {
        document.getElementById('error-display').style.display = 'block';
        document.getElementById('error-display').textContent = 'No default export found. Use "export default { ... }" or "export default defineComponent({ ... })"';
      }
    } catch (err) {
      var errorDiv = document.getElementById('error-display');
      errorDiv.style.display = 'block';
      errorDiv.textContent = err.message;
      document.getElementById('app').style.display = 'none';
    }
  </script>
</body>
</html>`;
}

function createFallbackHTML(code: string, framework: string): string {
  const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
    pre { background: #f8f9fa; padding: 16px; border-radius: 8px; overflow: auto; font-size: 13px; }
    .badge { display: inline-block; background: #e5e7eb; color: #374151; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-bottom: 8px; }
  </style>
</head>
<body>
  <span class="badge">${framework} preview</span>
  <pre><code>${escaped}</code></pre>
</body>
</html>`;
}
