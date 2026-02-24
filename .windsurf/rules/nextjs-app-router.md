# Next.js 15 App Router Patterns

**When to apply:** When working with Next.js pages, layouts, routing, or data fetching.

## Server vs Client Components

### Default: Server Components
All components in `app/` are Server Components by default.

**Use Server Components for:**
- Data fetching
- Accessing backend resources directly
- Sensitive information (API keys, tokens)
- Large dependencies that don't need client-side JS
- SEO-critical content

```tsx
// app/projects/page.tsx - Server Component (default)
import { createClient } from '@/lib/supabase/server';

export default async function ProjectsPage() {
  const supabase = createClient();
  const { data: projects } = await supabase.from('projects').select();
  
  return <ProjectsList projects={projects} />;
}
```

### Client Components
Mark with `'use client'` directive at the top.

**Use Client Components for:**
- Interactivity (onClick, onChange, etc.)
- Browser APIs (localStorage, navigator, window)
- React hooks (useState, useEffect, useContext)
- Event listeners

```tsx
// components/ProjectCard.tsx - Client Component
'use client';

import { useState } from 'react';

export function ProjectCard({ project }) {
  const [isLiked, setIsLiked] = useState(false);
  
  return (
    <div onClick={() => setIsLiked(!isLiked)}>
      {project.name}
    </div>
  );
}
```

## Data Fetching Patterns

### Server Component async/await
```tsx
// Fetch at component level
async function getData() {
  const res = await fetch('https://api.example.com/data', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  return res.json();
}

export default async function Page() {
  const data = await getData();
  return <div>{data.title}</div>;
}
```

### Parallel Data Fetching
```tsx
async function Page() {
  // Fetch in parallel
  const [projects, user] = await Promise.all([
    getProjects(),
    getUser()
  ]);
  
  return <Dashboard projects={projects} user={user} />;
}
```

### Sequential Data Fetching
```tsx
async function Page({ params }) {
  // Fetch sequentially when data depends on previous fetch
  const project = await getProject(params.id);
  const comments = await getComments(project.id);
  
  return <ProjectDetail project={project} comments={comments} />;
}
```

## Route Handlers (API Routes)

```tsx
// app/api/projects/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createClient();
  const { data, error } = await supabase.from('projects').select();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('projects')
    .insert(body)
    .select()
    .single();
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  
  return NextResponse.json(data, { status: 201 });
}
```

## Server Actions

```tsx
// app/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createProject(formData: FormData) {
  const name = formData.get('name') as string;
  const supabase = createClient();
  
  const { error } = await supabase
    .from('projects')
    .insert({ name });
    
  if (error) {
    return { error: error.message };
  }
  
  revalidatePath('/projects');
  return { success: true };
}
```

## Loading and Error States

### loading.tsx
```tsx
// app/projects/loading.tsx
export default function Loading() {
  return <div>Loading projects...</div>;
}
```

### error.tsx
```tsx
// app/projects/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### not-found.tsx
```tsx
// app/projects/not-found.tsx
export default function NotFound() {
  return <div>Project not found</div>;
}
```

## Layouts

### Root Layout (Required)
```tsx
// app/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Siza',
  description: 'Zero-cost UI component generator',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### Nested Layouts
```tsx
// app/(dashboard)/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  );
}
```

## Route Groups
Use parentheses to organize routes without affecting URL:

```
app/
  (auth)/
    signin/page.tsx     → /signin
    signup/page.tsx     → /signup
  (dashboard)/
    projects/page.tsx   → /projects
    settings/page.tsx   → /settings
```

## Dynamic Routes

```tsx
// app/projects/[id]/page.tsx
export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const project = await getProject(params.id);
  return <div>{project.name}</div>;
}

// Generate static params for static export
export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}
```

## Middleware

```tsx
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          response.cookies.set({ name, value, ...options });
        },
        remove: (name, options) => {
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to signin if not authenticated
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

## Conventions

- **Always** use async Server Components for data fetching
- **Never** fetch data in Client Components (use TanStack Query if needed)
- **Always** handle loading and error states
- **Use** route groups for organization without URL impact
- **Implement** proper TypeScript typing for params and searchParams
- **Follow** file-system based routing conventions
- **Cache** appropriately with `revalidate` or `tags`
