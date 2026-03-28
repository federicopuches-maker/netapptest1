# Net — Project Conventions

## Tech Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Supabase (auth + database via `@supabase/ssr`)
- PWA: `@ducanh2912/next-pwa`

---

## File & Folder Naming

- All files and folders use **kebab-case** (e.g., `bottom-nav.tsx`, `auth-context.tsx`)
- React components use **PascalCase exports** inside kebab-case files
- All component files use the `.tsx` extension
- Non-component TypeScript files use `.ts`

---

## Component Conventions

- All components are **named exports**, not default exports — EXCEPT `page.tsx` and `layout.tsx` files
  - Good: `export function BottomNav()`
  - Good (page): `export default function CardsPage()`
- Client components must have `"use client"` as the very first line
- Server components have no directive — they are server by default
- Props interfaces are defined inline above the component, named `[ComponentName]Props`

---

## Import Order

1. React / Next.js built-ins (`react`, `next/*`)
2. Third-party packages
3. Internal absolute imports (`@/lib/...`, `@/components/...`, `@/contexts/...`)
4. Relative imports (`./`, `../`)
5. Type-only imports — always use `import type` for type-only imports

---

## Route Groups

| Group | Purpose | Has bottom nav? |
|---|---|---|
| `app/(app)/` | Authenticated routes | Yes |
| `app/(auth)/` | Login, signup, etc. | No |

Route groups are invisible in URLs: `/cards` not `/(app)/cards`.

---

## Supabase Client Usage

| Context | Import from |
|---|---|
| Client Component | `@/lib/supabase/client` |
| Server Component | `@/lib/supabase/server` |
| Route Handler | `@/lib/supabase/server` |
| Server Action | `@/lib/supabase/server` |
| Middleware | `@/lib/supabase/middleware` |

**Never** import the server client (`lib/supabase/server`) in a Client Component — it calls `cookies()` from `next/headers` which is not available on the client.

---

## Design System

### Colors
| Token | Hex | Tailwind utility |
|---|---|---|
| Background | `#ffffff` | `bg-white` |
| Text | `#000000` | `text-black` |
| Accent | `#1a2744` | `text-accent` / `bg-accent` |
| Muted text | — | `text-black/40` or `text-black/60` |
| Borders | — | `border-black/10` |

### Typography
- Font: **Inter** (loaded via `next/font/google` with CSS variable `--font-inter`)
- Weights: 400 (regular), 500 (medium), 600 (semibold)
- Do not use bold (700) — use semibold instead

### Spacing & Sizing
- Use Tailwind spacing scale only — no arbitrary pixel values in layout
- Standard page padding: `p-4` (16px)
- Bottom nav height: `h-16` (64px) — always add `pb-16` to page content so it isn't obscured

### Rules
- **No shadows** — do not use any `shadow-*` utilities. Use borders to separate: `border-black/10`
- **No gradients** — do not use `bg-gradient-*` or any gradient utilities
- **No arbitrary values** — only use `[...]` syntax for design token colors that lack a Tailwind alias

---

## TypeScript

- Strict mode is enabled in `tsconfig.json`
- Use `import type` for all type-only imports
- Prefer `interface` over `type` for object shapes
- Avoid `any` — use `unknown` and narrow with type guards

---

## Environment Variables

- `NEXT_PUBLIC_` prefix = available in browser + server
- No prefix = server-only (never expose to client)
- Never commit `.env.local` — it is gitignored
- Keep `.env.local.example` up to date whenever new vars are added

---

## PWA Notes

- Service worker is **disabled in development** (`NODE_ENV === "development"`)
- To test PWA locally: `npm run build && npm run start`
- Icons must exist at `public/icons/icon-192x192.png` and `public/icons/icon-512x512.png` before `next build`
- After changing `public/manifest.json`: verify with Chrome DevTools > Application > Manifest

---

## Git Conventions

- Branch naming: `feature/description`, `fix/description`, `chore/description`
- Commit messages: imperative mood, present tense ("add bottom nav", not "added bottom nav")
