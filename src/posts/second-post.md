---
title: Building a Simple mdBook Blog
date: 2025-01-10
description: A quick guide to setting up an automated blog with mdBook and a simple Node.js script.
---

# Building a Simple mdBook Blog

Setting up this blog was surprisingly straightforward. Here's a quick overview of the architecture.

## The Setup

The entire blog runs on three main components:

1. **mdBook** - Handles the static site generation
2. **Node.js script** - Automates index generation and RSS feeds
3. **GitHub Actions** - Deploys to GitHub Pages

## Key Features

- ✅ Automatic post indexing
- ✅ RSS feed generation
- ✅ Responsive design
- ✅ Dark/light mode support
- ✅ Fast search
- ✅ Zero-config deployment

## The Magic Script

The `scripts/generate.js` file does all the heavy lifting:

```bash
npm run prebuild  # Generates index.md, SUMMARY.md, and feed.xml
npm run build     # Builds the static site
npm run serve     # Serves locally for development
```

That's it! No complex build pipelines or heavy dependencies.

## Next Steps

In future posts, I'll dive deeper into:

- Customizing the mdBook theme
- Advanced front matter options
- SEO optimization
- Analytics integration

Simple is better. 🚀

