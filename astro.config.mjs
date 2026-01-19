// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://simonbukin.com',
  adapter: vercel(),
  redirects: {
    '/blog': '/writing',
    '/blog/[...slug]': '/writing/[...slug]',
    '/bits': '/writing',
    '/bits/[...slug]': '/writing/[...slug]',
  },
  integrations: [
    mdx(),
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'catppuccin-mocha',
      wrap: true,
    },
  },
});
