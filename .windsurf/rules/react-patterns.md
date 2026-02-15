# React Best Practices & Patterns

**When to apply:** When writing React components, hooks, or managing component state.

## Component Organization

### File Structure
```
components/
  ui/                      # shadcn/ui components
    button.tsx
    card.tsx
  features/
    ProjectCard.tsx        # Feature-specific components
    ProjectList.tsx
  layouts/
    DashboardLayout.tsx    # Layout components
```

### Component Naming
- PascalCase for component files and names
- Descriptive names that indicate purpose
- Suffix with component type if helpful (e.g., `ProjectCard`, `UserAvatar`)

## Client Component Patterns

### useState for Local State
```tsx
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### useEffect for Side Effects
```tsx
'use client';

import { useEffect, useState } from 'react';

export function DataFetcher({ id }: { id: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`/api/data/${id}`)
      .then(res => res.json())
      .then(setData);
  }, [id]); // Re-run when id changes

  return <div>{data?.name}</div>;
}
```

### Custom Hooks
```tsx
// hooks/useLocalStorage.ts
'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}
```

## Performance Optimization

### React.memo
Prevent unnecessary re-renders for components with same props:

```tsx
import { memo } from 'react';

interface ProjectCardProps {
  project: Project;
  onSelect: (id: string) => void;
}

export const ProjectCard = memo(function ProjectCard({ 
  project, 
  onSelect 
}: ProjectCardProps) {
  return (
    <div onClick={() => onSelect(project.id)}>
      {project.name}
    </div>
  );
});
```

### useMemo
Memoize expensive calculations:

```tsx
import { useMemo } from 'react';

export function ProjectStats({ projects }: { projects: Project[] }) {
  const stats = useMemo(() => {
    // Expensive calculation
    return projects.reduce((acc, p) => {
      acc.total++;
      if (p.status === 'active') acc.active++;
      return acc;
    }, { total: 0, active: 0 });
  }, [projects]); // Only recalculate when projects change

  return <div>Total: {stats.total}, Active: {stats.active}</div>;
}
```

### useCallback
Memoize functions to prevent child re-renders:

```tsx
import { useCallback, useState } from 'react';

export function ParentComponent() {
  const [count, setCount] = useState(0);

  // Without useCallback, this creates new function on every render
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // Empty deps = function never changes

  return <MemoizedChild onClick={handleClick} />;
}
```

## State Management

### Zustand for Global State
```tsx
// stores/useProjectStore.ts
import { create } from 'zustand';

interface ProjectStore {
  projects: Project[];
  selectedId: string | null;
  setProjects: (projects: Project[]) => void;
  selectProject: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  selectedId: null,
  setProjects: (projects) => set({ projects }),
  selectProject: (id) => set({ selectedId: id }),
}));

// Usage in component
'use client';

import { useProjectStore } from '@/stores/useProjectStore';

export function ProjectSelector() {
  const { projects, selectedId, selectProject } = useProjectStore();

  return (
    <div>
      {projects.map(p => (
        <button 
          key={p.id}
          onClick={() => selectProject(p.id)}
          className={selectedId === p.id ? 'active' : ''}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
```

### TanStack Query for Server State
```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export function ProjectList() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  // Query
  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*');
      if (error) throw error;
      return data;
    },
  });

  // Mutation
  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <button onClick={() => createMutation.mutate('New Project')}>
        Create
      </button>
      {projects?.map(p => <div key={p.id}>{p.name}</div>)}
    </div>
  );
}
```

## Component Composition

### Compound Components Pattern
```tsx
interface TabsProps {
  children: React.ReactNode;
  defaultValue: string;
}

export function Tabs({ children, defaultValue }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="tabs-list">{children}</div>;
};

Tabs.Trigger = function TabsTrigger({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab, setActiveTab } = useTabsContext();
  return (
    <button 
      onClick={() => setActiveTab(value)}
      className={activeTab === value ? 'active' : ''}
    >
      {children}
    </button>
  );
};

Tabs.Content = function TabsContent({ value, children }: { value: string; children: React.ReactNode }) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;
  return <div>{children}</div>;
};

// Usage
<Tabs defaultValue="tab1">
  <Tabs.List>
    <Tabs.Trigger value="tab1">Tab 1</Tabs.Trigger>
    <Tabs.Trigger value="tab2">Tab 2</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="tab1">Content 1</Tabs.Content>
  <Tabs.Content value="tab2">Content 2</Tabs.Content>
</Tabs>
```

### Render Props Pattern
```tsx
interface DataLoaderProps<T> {
  url: string;
  render: (data: T | null, loading: boolean, error: Error | null) => React.ReactNode;
}

export function DataLoader<T>({ url, render }: DataLoaderProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, [url]);

  return <>{render(data, loading, error)}</>;
}

// Usage
<DataLoader 
  url="/api/projects"
  render={(data, loading, error) => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error!</div>;
    return <div>{data?.name}</div>;
  }}
/>
```

## Error Boundaries

```tsx
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>Something went wrong</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## TypeScript Patterns

### Props with Children
```tsx
interface CardProps {
  children: React.ReactNode;
  title: string;
}

export function Card({ children, title }: CardProps) {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
```

### Generic Components
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

export function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <div>
      {items.map(item => (
        <div key={keyExtractor(item)}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}
```

## Conventions

- **Always** use TypeScript for type safety
- **Prefer** function components over class components
- **Use** React.memo for expensive components with stable props
- **Use** useMemo for expensive calculations
- **Use** useCallback when passing functions to memoized children
- **Avoid** prop drilling - use context or state management
- **Handle** loading and error states explicitly
- **Test** components with React Testing Library
- **Follow** accessibility best practices (ARIA labels, keyboard navigation)
