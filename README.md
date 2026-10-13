# Agustin Mendoza portfolio

Astro + Tailwind, static output, deployed on Cloudflare Pages.

## Run locally
    npm install
    npm run dev      # drafts and "To add" notes are visible here
    npm run build    # production build in dist/ (drafts and notes are hidden)

## Add or edit a case study
Create `src/content/work/<slug>.mdx`. Frontmatter fields: title, company, role, period, summary, metric (optional), order, draft.
Set `draft: false` when it is ready to publish. Use `<Todo>` for notes to self (dev only).

## Deploy on Cloudflare (Workers Static Assets)
Cloudflare recommends Workers Static Assets over Pages for new projects. Config lives in `wrangler.jsonc`.

1. Cloudflare dashboard > Workers & Pages > Create > Import a repository > connect `a-mromo/portfolio`.
2. Build command: `npm run build`. Deploy command: `npx wrangler deploy`.
3. Pushes to `main` publish. Pushes to other branches create preview builds.
4. Custom domain: Worker > Settings > Domains & Routes > Add > Custom Domain. Then set `site` in `astro.config.mjs` and the Sitemap line in `public/robots.txt`.

Manual deploy from your machine: `npm run deploy` (requires `npx wrangler login` once).
