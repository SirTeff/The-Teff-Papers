# The Teff Papers

The permanent home for ideas before they become products. This repository contains the first working foundation for a calm, reading-first public archive.

## Stack

- Next.js with the App Router
- TypeScript
- Plain responsive CSS
- Markdown content with YAML front matter
- `gray-matter` and `remark` for content processing
- Vercel-ready deployment

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production build

```bash
npm run build
npm start
```

## Structure

```text
src/
  app/                 Routes, metadata, sitemap, and global styles
  components/
    layout/            Header, footer, and page container
    papers/            Paper cards, metadata, and related papers
    shared/            Small reusable interface elements
  content/papers/      Markdown papers
  lib/                 Content loading and site metadata
```

## Add a paper

Create a `.md` file in `src/content/papers`. The filename can match the slug for clarity. Papers appear in the local archive unless marked `status: "hidden"`; the launch drafts retain their approved `Draft` status without showing a public-facing draft badge.

```yaml
---
title: "Why Personal AI Needs Memory"
slug: "why-personal-ai-needs-memory"
date: "2026-07-12"
category: "The Future Is Personal"
tags:
  - "Personal Digital Intelligence"
  - "Fred+Teff"
  - "Automation"
excerpt: "A short summary for cards and metadata."
readingTime: "5 min"
status: "published"
relatedProject: "Fred+Teff"
version: "1.0"
author: "Teff"
featured: false
---

The paper body begins here in Markdown.
```

Supported categories and the initial tag vocabulary are defined in `src/lib/papers.ts`. Use those values consistently so future filtering can be added without changing existing content.

## Deployment

Import the repository into Vercel. The framework and build settings should be detected automatically:

- Build command: `npm run build`
- Output: Next.js default
- Node.js: use the version supported by the installed Next.js release

Before production deployment, complete the final editorial review of all launch drafts, verify `https://teffpapers.com` in `src/lib/metadata.ts`, and connect the final domain.

## Principles

- Document first. Build second. Publish with structure from day one.
- Reading comes first. Everything else supports reading.
- Never write to impress. Always write to clarify.
- Share the philosophy. Protect the mechanism.
- Keep the archive portable, understandable, and easy to maintain.

## Deliberate v1 limits

This foundation does not include search, filtering controls, comments, accounts, subscriptions, a CMS, AI features, dashboards, payment systems, or newsletter automation. Those features require a documented need before they are added.
