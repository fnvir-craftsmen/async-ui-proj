# Async UI Project

A small React + TypeScript app that shows Hacker News stories.

## What it does

- Lists top Hacker News stories.
- Lets you search stories by keyword.
- Opens a story details page.
- Supports two data-loading modes:
  - `fetch` (manual async state handling)
  - `react-query` (TanStack Query)

## Tech stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- Tailwind CSS

## Getting started

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start the dev server

```bash
pnpm dev
```

### 3) Build for production

```bash
pnpm build
```

### 4) Preview production build

```bash
pnpm preview
```

## Scripts

- `pnpm dev` - run local dev server
- `pnpm build` - type-check and create production build
- `pnpm preview` - preview the production build locally
- `pnpm lint` - run ESLint

## Project structure

- `src/pages/` - app pages (`HomePage`, `StoryDetailPage`)
- `src/components/` - reusable UI (`Navbar`, `SearchBox`, `StoryCard`)
- `src/api/hackerNews.ts` - Hacker News API calls
- `src/context/QueryModeContext.tsx` - fetch vs react-query mode state
