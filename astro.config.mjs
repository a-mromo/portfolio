import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Update `site` once the custom domain is live (needed for sitemap and canonical URLs).
export default defineConfig({
  site: 'https://portfolio.agustinoromo.workers.dev',
  output: 'static',
  integrations: [mdx(), sitemap()],
  vite: { plugins: [tailwindcss()] },
});
