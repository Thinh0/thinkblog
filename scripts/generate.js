#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Site configuration
const SITE_CONFIG = {
  title: 'ThinkBlog',
  description: 'A clean, fast blog built with mdBook',
  url: 'https://thinh0.github.io/thinkblog/', // Update this with your actual URL
  author: 'Thinh Nguyen', // Update this
  language: 'en'
};

// Paths
const POSTS_DIR = path.join(__dirname, '../src/posts');
const SRC_DIR = path.join(__dirname, '../src');
const ROOT_DIR = path.join(__dirname, '..');

/**
 * Parse YAML front matter from markdown content
 * @param {string} content - The markdown content
 * @returns {object} - { frontMatter: object, content: string }
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return { frontMatter: {}, content };
  }
  
  const yamlContent = match[1];
  const markdownContent = match[2];
  const frontMatter = {};
  
  // Simple YAML parser for basic key: value pairs
  yamlContent.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
      frontMatter[key] = value;
    }
  });
  
  return { frontMatter, content: markdownContent };
}

/**
 * Extract title from markdown content (first H1)
 * @param {string} content - The markdown content
 * @returns {string|null} - The title or null
 */
function extractTitleFromContent(content) {
  const h1Match = content.match(/^#\s+(.+)$/m);
  return h1Match ? h1Match[1].trim() : null;
}

/**
 * Generate slug from filename
 * @param {string} filename - The filename
 * @returns {string} - The slug
 */
function generateSlug(filename) {
  return path.basename(filename, '.md');
}

/**
 * Convert date to RFC-1123 format for RSS
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @returns {string} - RFC-1123 formatted date
 */
function toRFC1123(dateString) {
  if (!dateString) return new Date().toUTCString();
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toUTCString();
}

/**
 * Read and process all posts
 * @returns {Array} - Array of post objects
 */
function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.log('No posts directory found, creating empty one...');
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    return [];
  }
  
  const files = fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort();
  
  const posts = [];
  
  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontMatter, content: markdownContent } = parseFrontMatter(content);
    
    const slug = generateSlug(file);
    const title = frontMatter.title || extractTitleFromContent(markdownContent) || slug;
    const date = frontMatter.date || null;
    const description = frontMatter.description || '';
    
    if (!frontMatter.title) {
      console.warn(`Warning: Post ${file} missing title in front matter`);
    }
    if (!frontMatter.date) {
      console.warn(`Warning: Post ${file} missing date in front matter`);
    }
    
    posts.push({
      title,
      date,
      description,
      slug,
      filename: file,
      content: markdownContent
    });
  }
  
  // Sort by date (newest first), then by filename
  posts.sort((a, b) => {
    if (a.date && b.date) {
      return new Date(b.date) - new Date(a.date);
    }
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    return a.filename.localeCompare(b.filename);
  });
  
  return posts;
}

/**
 * Generate the index.md file
 * @param {Array} posts - Array of post objects
 */
function generateIndex(posts) {
  let content = `# ${SITE_CONFIG.title}

Welcome to my blog! This is a clean, fast blog built with mdBook. Here you'll find my latest thoughts, tutorials, and musings.

## Latest Posts

`;
  
  if (posts.length === 0) {
    content += '*No posts yet. Check back soon!*\n';
  } else {
    for (const post of posts) {
      content += `### [${post.title}](./posts/${post.slug}.md)\n`;
      if (post.date || post.description) {
        const datePart = post.date ? `*${post.date}*` : '';
        const descPart = post.description ? ` — ${post.description}` : '';
        content += `${datePart}${descPart}\n`;
      }
      content += '\n';
    }
  }
  
  const indexPath = path.join(SRC_DIR, 'index.md');
  fs.writeFileSync(indexPath, content);
  console.log(`Generated ${indexPath}`);
}

/**
 * Generate the SUMMARY.md file
 * @param {Array} posts - Array of post objects
 */
function generateSummary(posts) {
  let content = `# Summary

- [Home](index.md)
- [Posts]()
`;
  
  for (const post of posts) {
    content += `  - [${post.title}](posts/${post.slug}.md)\n`;
  }
  
  const summaryPath = path.join(SRC_DIR, 'SUMMARY.md');
  fs.writeFileSync(summaryPath, content);
  console.log(`Generated ${summaryPath}`);
}

/**
 * Escape HTML entities
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Generate RSS feed
 * @param {Array} posts - Array of post objects
 */
function generateRSS(posts) {
  const now = new Date().toUTCString();
  
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeHtml(SITE_CONFIG.title)}</title>
    <description>${escapeHtml(SITE_CONFIG.description)}</description>
    <link>${SITE_CONFIG.url}</link>
    <language>${SITE_CONFIG.language}</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${SITE_CONFIG.url}/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>mdBook Blog Generator</generator>
`;
  
  for (const post of posts.slice(0, 20)) { // Limit to 20 most recent posts
    const postUrl = `${SITE_CONFIG.url}/posts/${post.slug}.html`;
    const pubDate = toRFC1123(post.date);
    const guid = crypto.createHash('md5').update(postUrl).digest('hex');
    
    rss += `
    <item>
      <title>${escapeHtml(post.title)}</title>
      <link>${postUrl}</link>
      <guid isPermaLink="false">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeHtml(post.description || post.title)}</description>
    </item>`;
  }
  
  rss += `
  </channel>
</rss>
`;
  
  const rssPath = path.join(ROOT_DIR, 'feed.xml');
  fs.writeFileSync(rssPath, rss);
  console.log(`Generated ${rssPath}`);
}

/**
 * Main function
 */
function main() {
  console.log('🚀 Generating blog files...');
  
  // Ensure src directory exists
  if (!fs.existsSync(SRC_DIR)) {
    fs.mkdirSync(SRC_DIR, { recursive: true });
  }
  
  // Read and process posts
  const posts = readPosts();
  console.log(`Found ${posts.length} posts`);
  
  // Generate files
  generateIndex(posts);
  generateSummary(posts);
  generateRSS(posts);
  
  console.log('✅ Blog files generated successfully!');
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main, readPosts, generateIndex, generateSummary, generateRSS };
