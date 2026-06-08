# Next.js Migration Notes

## Summary

The project has been migrated from React + Vite to Next.js using the App Router. The migration preserves the existing Supabase-backed content, authentication, dashboard workflows, public portfolio pages, Tailwind theme, shadcn/Radix components, Framer Motion animations, and client-side state providers.

## Major Changes

- Replaced Vite entry files with `app/` route segments, `app/layout.tsx`, route metadata, loading UI, error UI, and not-found handling.
- Moved former Vite route components from `src/pages` to `src/views` so Next.js does not treat them as a legacy Pages Router directory.
- Replaced `react-router-dom` navigation with `next/link`, `next/navigation`, and App Router dynamic route params.
- Centralized client providers in `src/app-providers.tsx` so React Query, Supabase auth, theme, content, project, and blog contexts remain available across routes.
- Updated Supabase browser client to use `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, with guarded browser storage for SSR-safe imports.
- Added `next.config.mjs` with image optimization allowlists for Supabase and GitHub avatar assets.
- Updated scripts from Vite commands to `next dev`, `next build`, and `next start`.
- Removed unused React 18-only dependencies and wrappers (`next-themes`, `react-day-picker`, `vaul`) after confirming the app does not use the related shadcn calendar/drawer runtime paths.
- Added a PostCSS override to keep the resolved dependency tree on the patched `8.5.10+` line.

## Environment Variables

Next.js only exposes browser variables prefixed with `NEXT_PUBLIC_`. Keep these values configured locally and in deployment:

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
NEXT_PUBLIC_SUPABASE_PROJECT_ID="your-project-id"
```

The old `VITE_*` variables are no longer used by the application runtime.

## Routing Map

- `/` -> `app/(site)/page.tsx`
- `/about` -> `app/(site)/about/page.tsx`
- `/projects` -> `app/(site)/projects/page.tsx`
- `/blog` -> `app/(site)/blog/page.tsx`
- `/blog/[slug]` -> `app/(site)/blog/[slug]/page.tsx`
- `/contact` -> `app/(site)/contact/page.tsx`
- `/login` -> `app/login/page.tsx`
- `/dashboard` -> `app/dashboard/page.tsx`

## Notes

- The dashboard remains a client-rendered admin experience because it depends on Supabase auth state, browser shortcuts, local storage preferences, portals, and realtime updates.
- Public pages still consume the existing context providers to preserve live Supabase data, likes, comments, project reviews, and dashboard-managed content.
- Further optimization can move read-only public data fetching to server components once Supabase server cookies and deployment auth policies are finalized.
- `npm run build` includes a larger Node heap allocation because the migrated production build exceeded the default heap on this Windows environment.
