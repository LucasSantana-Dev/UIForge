# Supabase Authentication Patterns

**When to apply:** When implementing authentication, authorization, or user session management.

## Client Setup

### Server-side Client (SSR)
```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Cookie setting in Server Component - ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Cookie removal in Server Component - ignore
          }
        },
      },
    }
  );
}
```

### Client-side Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

## Authentication Flows

### Email/Password Signup
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signup(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
```

### Email/Password Signin
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signin(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}
```

### OAuth Signin (Google, GitHub)
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';

export function OAuthButtons() {
  const supabase = createClient();

  const handleGoogleSignin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  const handleGithubSignin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };

  return (
    <>
      <button onClick={handleGoogleSignin}>Sign in with Google</button>
      <button onClick={handleGithubSignin}>Sign in with GitHub</button>
    </>
  );
}
```

### OAuth Callback Handler
```typescript
// app/auth/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
}
```

### Signout
```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function signout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}
```

## Getting Current User

### Server Component
```typescript
import { createClient } from '@/lib/supabase/server';

export default async function Page() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  return <div>Welcome {user.email}</div>;
}
```

### Client Component
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <div>{user?.email}</div>;
}
```

## Protected Routes

### Middleware Protection
```typescript
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

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/projects/:path*', '/settings/:path*'],
};
```

## Row Level Security (RLS) Integration

Authentication automatically provides `auth.uid()` for RLS policies:

```sql
-- projects table RLS policy
CREATE POLICY "Users can view own projects"
ON projects FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
ON projects FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
ON projects FOR DELETE
USING (auth.uid() = user_id);
```

## Session Management

### Check Session Status
```typescript
const { data: { session } } = await supabase.auth.getSession();
```

### Refresh Session
```typescript
const { data: { session }, error } = await supabase.auth.refreshSession();
```

### Set Session (after OAuth)
```typescript
const { data, error } = await supabase.auth.setSession({
  access_token,
  refresh_token,
});
```

## Error Handling

```typescript
const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  // Handle specific errors
  switch (error.message) {
    case 'Invalid login credentials':
      return { error: 'Invalid email or password' };
    case 'Email not confirmed':
      return { error: 'Please verify your email' };
    default:
      return { error: 'An error occurred. Please try again.' };
  }
}
```

## Conventions

- **Always** use `@supabase/ssr` for SSR auth
- **Never** store sensitive tokens in localStorage
- **Always** implement RLS policies for data access
- **Use** middleware for route protection
- **Handle** auth state changes in Client Components
- **Validate** user session on protected pages
- **Redirect** unauthenticated users appropriately
- **Test** all auth flows in E2E tests
