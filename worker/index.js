// Password gate for protected case studies. Everything else is served straight
// from static assets (see run_worker_first in wrangler.jsonc).
// Set the password with:  npx wrangler secret put CASE_STUDY_PASSWORD
const PROTECTED = ['/work/member-portal'];
const COOKIE = 'cs_access';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const isProtected = (path) => PROTECTED.some((p) => path === p || path.startsWith(p + '/'));

async function token(password) {
  const data = new TextEncoder().encode('case-study:' + password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.split(/;\s*/).find((c) => c.startsWith(name + '='));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function loginPage(next, error) {
  return new Response(`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex"><title>Protected case study · Agustin Mendoza</title>
<style>
  :root { --ink:#16181d; --muted:#5b6270; --line:#e6e8ec; --accent:#2f5bea; --paper:#fbfbfa; --err:#b42318; }
  * { box-sizing: border-box; }
  body { margin:0; min-height:100vh; display:grid; place-items:center; padding:24px 16px; background:var(--paper); color:var(--ink);
    font: 17px/1.6 Inter, ui-sans-serif, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
  main { width:100%; max-width:400px; }
  a { color: var(--accent); }
  h1 { font-size: 1.75rem; line-height:1.2; letter-spacing:-.01em; margin: 24px 0 8px; font-weight:600; }
  p { color: var(--muted); margin: 0 0 24px; }
  label { display:block; font-weight:500; margin-bottom:6px; }
  input { width:100%; font:inherit; padding:12px 14px; border:1px solid #c9cdd4; border-radius:10px; background:#fff; color:var(--ink); }
  input:focus-visible, button:focus-visible { outline:2px solid var(--accent); outline-offset:3px; }
  button { margin-top:16px; width:100%; font:inherit; font-weight:500; padding:12px; border:0; border-radius:10px; background:var(--ink); color:#fff; cursor:pointer; }
  .err { color: var(--err); margin: 8px 0 0; font-size: .95rem; }
  .back { font-size:.95rem; text-decoration:none; color: var(--muted); }
</style></head>
<body><main>
  <a class="back" href="/#work">← All work</a>
  <h1>This case study is password protected</h1>
  <p>It includes client work under NDA. If you don't have the password, <a href="/#contact">get in touch</a> and I'll send it.</p>
  <form method="post" action="/__case-study-login">
    <input type="hidden" name="next" value="${esc(next)}">
    <label for="pw">Password</label>
    <input id="pw" name="password" type="password" autocomplete="current-password" required autofocus
      ${error ? 'aria-invalid="true" aria-describedby="pw-err"' : ''}>
    ${error ? '<p class="err" id="pw-err" role="alert">That password didn\'t work. Try again.</p>' : ''}
    <button type="submit">View case study</button>
  </form>
</main></body></html>`, {
    status: error ? 401 : 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const password = env.CASE_STUDY_PASSWORD;

    if (url.pathname === '/__case-study-login' && request.method === 'POST') {
      const form = await request.formData();
      const next = String(form.get('next') || '/');
      const safeNext = isProtected(new URL(next, url).pathname) && next.startsWith('/') && !next.startsWith('//') ? next : '/';
      if (!password || !safeEqual(String(form.get('password') || ''), password)) return loginPage(safeNext, true);
      return new Response(null, {
        status: 303,
        headers: {
          Location: safeNext,
          'Set-Cookie': `${COOKIE}=${await token(password)}; Path=/work; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
        },
      });
    }

    if (isProtected(url.pathname)) {
      // No password configured: fail closed instead of exposing the page.
      if (!password) return new Response('Not available', { status: 503 });
      const cookie = readCookie(request, COOKIE);
      if (!cookie || !safeEqual(cookie, await token(password))) return loginPage(url.pathname + url.search, false);
      const res = await env.ASSETS.fetch(request);
      const headers = new Headers(res.headers);
      headers.set('Cache-Control', 'private, no-store');
      headers.set('X-Robots-Tag', 'noindex');
      return new Response(res.body, { status: res.status, headers });
    }

    return env.ASSETS.fetch(request);
  },
};
