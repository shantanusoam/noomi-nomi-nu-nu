# Repository Guidelines

## Project Structure & Module Organization
FamilyLink runs on the Next.js App Router. Routes and layouts live in `app/` (`app/auth/` handles sign-in, `app/share/` serves public views). Reusable UI lives in `components/`; shadcn blocks stay in `components/ui/`, domain widgets like `tree-canvas.tsx` remain at the top level. Server actions stay co-located in `actions/` (`family.ts`, `person.ts`, `relationship.ts`). Shared helpers (`lib/auth.ts`, `lib/prisma.ts`, `lib/tree-layout.ts`) centralize cross-cutting logic. Database schema and seeds live in `prisma/`, and static assets live in `public/`. Keep environment and tool config files at the root.

## Build, Test, and Development Commands
Use pnpm for consistency: `pnpm install` after cloning. `pnpm dev` serves http://localhost:3000. `pnpm build` compiles the production bundle, and `pnpm start` runs it. Quality gates: `pnpm lint` (ESLint 9 + Next rules), `pnpm typecheck` (`tsc --noEmit`), and `pnpm format` (Prettier 3). Database workflows rely on Prisma: `pnpm db:push` to sync schema, `pnpm db:seed` for demo content, and `pnpm db:studio` to inspect data.

## Coding Style & Naming Conventions
TypeScript and React 19 are the defaults. Author components as server components unless interactivity requires `"use client"`. Use PascalCase for React components, camelCase for utilities and hooks, and dash-case for route segments. Tailwind v4 powers styling—prefer semantic utility groupings and extract reusable variants into `components/ui/` or `lib/`. Run `pnpm format` before committing; Prettier enforces two-space indentation and trailing commas. Keep Prisma schema edits incremental and reflect new environment variables in `.env.example`.

## Testing Guidelines
An automated suite has not landed yet. When adding features, colocate tests near the feature (`app/<segment>/__tests__/` or `components/__tests__/`) with React Testing Library for UI and integration coverage for server actions. Seed data with `pnpm db:seed` before manual QA runs.

## Commit & Pull Request Guidelines
Existing history uses short, capitalized subjects (e.g. `Add person tagging workflow`). Keep commits focused, and include Prisma migrations alongside code that depends on them. Before opening a PR, run lint, typecheck, and build. Summarize functional changes, note database or environment impacts, and attach screenshots or recordings for UI updates. Link tracking issues and list follow-up tasks explicitly.

## Environment & Security
Clone `.env.example` to `.env.local`, populate secrets locally, and never commit credentials. Use provider-specific app passwords for email-based auth. When introducing new actions, enforce role checks in `lib/permissions.ts` and validate inputs with Zod schemas from `lib/validations.ts`.
