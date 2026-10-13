# Agustin Mendoza portfolio

Astro + Tailwind, static output, deployed on Cloudflare Pages.

## Run locally
    npm install
    npm run dev      # drafts and "To add" notes are visible here
    npm run build    # production build in dist/ (drafts and notes are hidden)

## Add or edit a case study
Create `src/content/work/<slug>.mdx`. Frontmatter fields: title, company, role, period, summary, metric (optional), order, draft.
Set `draft: false` when it is ready to publish. Use `<Todo>` for notes to self (dev only).

## Deploy on Cloudflare Pages
1. Push this folder to a GitHub repo.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git.
3. Framework preset: Astro. Build command: `npm run build`. Output directory: `dist`.
4. Every branch gets a preview URL. Merging to main publishes.
5. Add your custom domain under Custom domains, then set `site` in `astro.config.mjs` and the Sitemap line in `public/robots.txt`.
