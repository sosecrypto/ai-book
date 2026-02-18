# AI Book - Project Guidelines

## Overview

AI multi-agent book writing platform. Users input a topic and style, and 5 AI agents collaborate to produce a complete book.

### Tech Stack
- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5
- **Styling**: Tailwind CSS 4, Tailwind Typography (dark mode required)
- **Editor**: TipTap (rich text), InDesign-style page editor
- **AI**: Anthropic Claude API (@anthropic-ai/sdk)
- **DB**: Prisma + SQLite
- **State**: Zustand
- **3D**: Three.js + React Three Fiber (landing page)
- **Export**: PDF (@react-pdf/renderer), EPUB (epub-gen-memory)
- **Testing**: Vitest (80% coverage threshold)

## Project Structure

```
ai-book/
├── src/
│   ├── agents/          # AI agents (research, outliner, writer, editor, critic)
│   ├── app/
│   │   ├── api/         # API Routes (generate, cover, projects/[id]/*)
│   │   ├── new/         # New project creation
│   │   ├── project/[id]/ # 5-step writing workflow
│   │   └── preview/[id]/ # Book preview
│   ├── components/
│   │   ├── ai-chat/     # Per-chapter AI chat
│   │   ├── bible/       # Genre/style context builder
│   │   ├── outline/     # Drag-and-drop TOC editor
│   │   ├── page-editor/ # TipTap-based page editor
│   │   └── cover/       # Cover design
│   ├── lib/
│   │   ├── claude.ts    # Claude API client
│   │   ├── bible-context.ts # Genre/context builder
│   │   ├── epub.ts      # EPUB generation
│   │   ├── pdf.ts       # PDF export
│   │   ├── isbn.ts      # ISBN validation + barcode
│   │   └── db/          # Prisma client
│   └── types/book.ts    # Domain type definitions
├── prisma/schema.prisma # DB schema (13 models)
└── vitest.config.ts     # Test configuration
```

## Multi-Agent Pipeline

```
[Research] → Generate questions / collect answers → research data
    ↓
[Outliner] → Design TOC / chapter structure
    ↓
[Writer]   → Write chapters/pages (streaming)
    ↓
[Editor]   → Spelling / consistency review
    ↓
[Critic]   → Quality evaluation (Pass/Revise) → export on pass
```

## Commands (Allowed)

```bash
npm run dev           # Dev server
npm run build         # Production build
npm test              # Vitest watch mode
npm run test:run      # Single test run
npm run test:coverage # Coverage report
npx prisma studio     # DB GUI
npx prisma db push    # Push schema
npx prisma generate   # Generate client
```

## Environment Variables

```env
ANTHROPIC_API_KEY=    # Claude API key (required)
DATABASE_URL=file:./prisma/dev.db
```

## Dark/Light Mode Rules (CRITICAL)

**Every text and background MUST have both light and dark mode color pairs.**

```tsx
// ❌ Single mode only
className="text-white"
className="bg-gray-900"

// ✅ Both modes specified
className="text-neutral-900 dark:text-white"
className="bg-white dark:bg-neutral-900"
```

**Prose usage (TipTap, HTML rendering):**
```tsx
className="prose prose-neutral dark:prose-invert
  text-neutral-900 dark:text-neutral-100
  prose-headings:text-neutral-900 dark:prose-headings:text-white
  prose-p:text-neutral-800 dark:prose-p:text-neutral-200
  prose-strong:text-neutral-900 dark:prose-strong:text-white
  prose-li:text-neutral-800 dark:prose-li:text-neutral-200"
```

**Checklist:**
- Every `text-*` has a `dark:text-*` pair?
- Every `bg-*` has a `dark:bg-*` pair?
- Every `border-*` has a `dark:border-*` pair?
- Prose headings, p, strong, li colors explicitly set?

## Supported Formats

Paper sizes: A4, A5, B5, Letter, Shinguk-pan

## Book Types

Fiction, Non-fiction, Self-help, Technical, Essay, Children's, Poetry
