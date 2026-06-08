# Cybernetic Journal

A Next.js App Router portfolio, blog, and Supabase-backed admin dashboard for Mujeeburrahman. The app preserves the original terminal-inspired UI, live project/blog data, authentication flow, comments, likes, reviews, dashboard management tools, and responsive behavior.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/Radix UI
- Framer Motion
- Supabase Auth, database, realtime, and RPC calls
- TanStack Query

## Local Development

```sh
npm install
npm run dev
```

The development server runs at `http://localhost:3000` by default.

## Production Checks

```sh
npm run lint
npm run build
npm run start
```

The build script allocates a larger Node heap because this project can exceed the default memory limit during Next.js production optimization on Windows.

## Environment

Next.js exposes browser-side environment variables only when they use the `NEXT_PUBLIC_` prefix. Configure these values locally and in deployment:

```env
NEXT_PUBLIC_SUPABASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
```

## Architecture

- `app/` contains App Router layouts, metadata, loading, error, not-found, and route files.
- `src/views/` contains the migrated page-level React components from the old Vite app.
- `src/app-providers.tsx` composes client providers for auth, theme, Supabase-backed content, projects, blog state, React Query, and toasts.
- `src/components/` contains reusable UI, dashboard modules, terminal widgets, and visual effects.
- `src/contexts/` preserves the existing Supabase-backed business logic and session behavior.
- `docs/migration-notes.md` documents the Vite-to-Next migration details.

## Deployment

Deploy as a standard Next.js application. Ensure the `NEXT_PUBLIC_SUPABASE_*` variables are set in the hosting environment, then run:

```sh
npm run build
npm run start
```
