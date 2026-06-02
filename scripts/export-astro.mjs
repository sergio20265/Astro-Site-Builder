import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentPath = path.join(root, 'content', 'site.json');
const output = path.join(root, 'astro-export');
const site = JSON.parse(await readFile(contentPath, 'utf8'));

if (!site.pages?.length) {
  site.pages = [{ id: 'home', title: 'Home', slug: '/', blocks: site.blocks ?? [] }];
}

const themeCss = `
.theme-moss{--bg:#fbfaf6;--text:#123026;--muted:#5d7269;--card:#e8f3ee;--accent:#d7963b}
.theme-ink{--bg:#f0f0ec;--text:#111;--muted:#5f6268;--card:#fff;--accent:#2f6edb}
.theme-rose{--bg:#fff9f5;--text:#402039;--muted:#78606c;--card:#ffe8ef;--accent:#2f8269}
`;

const layout = `---
const { site, page } = Astro.props;
const schema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: site.name,
  url: site.baseUrl,
  image: site.seo.image,
  description: site.seo.description,
};

function hrefFor(slug) {
  return slug === '/' ? '/' : \`/\${slug.replace(/^\\\\//, '')}/\`;
}
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{page.title === 'Home' ? site.seo.title : \`\${page.title} - \${site.name}\`}</title>
    <meta name="description" content={site.seo.description} />
    <meta name="keywords" content={site.seo.keywords} />
    <meta property="og:title" content={site.seo.title} />
    <meta property="og:description" content={site.seo.description} />
    <meta property="og:image" content={site.seo.image} />
    <script type="application/ld+json" set:html={JSON.stringify(schema)} />
  </head>
  <body class={\`theme-\${site.theme}\`}>
    <header>
      <strong>{site.name}</strong>
      <nav>{site.pages.map((item) => <a href={hrefFor(item.slug)}>{item.title}</a>)}</nav>
    </header>
    <main>
      {page.blocks.map((block) => (
        <>
          {block.type === 'hero' && (
            <section class="hero"><div><p class="eyebrow">Static Astro site</p><h1>{block.title}</h1><p>{block.subtitle}</p><a class="cta" href="#contact">{block.cta}</a></div>{block.image && <img src={block.image} alt="" />}</section>
          )}
          {block.type === 'services' && (
            <section><h2>{block.title}</h2><div class="grid">{block.items.map((item) => <article><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
          )}
          {block.type === 'portfolio' && (
            <section><h2>{block.title}</h2><div class="portfolio">{block.items.map((item) => <article><img src={item.image} alt={item.title} /><small>{item.category}</small><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section>
          )}
          {block.type === 'gallery' && (
            <section><h2>{block.title}</h2><div class="gallery">{block.images.map((image) => <a href={image.src}><img src={image.src} alt={image.caption} /><span>{image.caption}</span></a>)}</div></section>
          )}
          {block.type === 'video' && (
            <section class="video"><div><h2>{block.title}</h2><p>{block.text}</p></div><iframe src={block.url} title={block.title} allowfullscreen></iframe></section>
          )}
          {block.type === 'testimonials' && (
            <section><h2>{block.title}</h2><div class="grid">{block.items.map((item) => <blockquote><p>{item.text}</p><cite>{item.name}</cite></blockquote>)}</div></section>
          )}
          {block.type === 'faq' && (
            <section><h2>{block.title}</h2><div class="faq">{block.items.map((item) => <details><summary>{item.q}</summary><p>{item.a}</p></details>)}</div></section>
          )}
          {block.type === 'form' && (
            <section class="form"><h2>{block.title}</h2><p>{block.text}</p><form>{block.fields.map((field) => <label><span>{field.label}{field.required ? ' *' : ''}</span>{field.kind === 'textarea' ? <textarea rows="4"></textarea> : <input type={field.kind} required={field.required} />}</label>)}<button type="submit">{block.submitLabel}</button></form></section>
          )}
          {block.type === 'contact' && (
            <section id="contact" class="contact"><h2>{block.title}</h2><p>{block.text}</p><a href={\`mailto:\${block.email}\`}>{block.email}</a><span>{block.phone}</span><span>{block.address}</span></section>
          )}
        </>
      ))}
    </main>
  </body>
</html>

<style>
${themeCss}
body{margin:0;color:var(--text);background:var(--bg);font-family:Inter,ui-sans-serif,system-ui,sans-serif}
header{display:flex;justify-content:space-between;gap:16px;padding:24px min(5vw,56px)}nav{display:flex;flex-wrap:wrap;gap:16px}a{color:inherit}.hero{display:grid;grid-template-columns:1.1fr .9fr;gap:28px;align-items:center;padding:36px min(5vw,56px) 56px}.hero h1{margin:0;font-size:clamp(36px,7vw,76px);line-height:1}.hero p{color:var(--muted);font-size:18px}.hero img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:8px}.cta{display:inline-flex;align-items:center;min-height:42px;border-radius:999px;padding:0 18px;color:white;background:var(--accent);text-decoration:none}.eyebrow{color:var(--accent);font-size:12px;font-weight:800;text-transform:uppercase}section{padding:36px min(5vw,56px)}h2{font-size:32px}.grid,.gallery,.portfolio{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}article,blockquote,.contact,.form{border-radius:8px;padding:18px;background:var(--card)}.gallery img,.portfolio img{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px}.gallery a{display:grid;gap:8px;text-decoration:none}.portfolio small,cite{color:var(--muted)}.video{display:grid;grid-template-columns:.8fr 1.2fr;gap:20px;align-items:center}.video iframe{width:100%;aspect-ratio:16/9;border:0;border-radius:8px;background:var(--card)}.faq{display:grid;gap:10px}details{border:1px solid color-mix(in srgb,var(--text),transparent 84%);border-radius:8px;padding:14px}.form form{display:grid;gap:12px}.form label{display:grid;gap:6px}.form input,.form textarea{border:1px solid color-mix(in srgb,var(--text),transparent 80%);border-radius:8px;padding:10px}.form button{justify-self:start;border:0;border-radius:999px;padding:12px 18px;color:white;background:var(--accent)}.contact{display:flex;flex-wrap:wrap;gap:14px;align-items:center}@media(max-width:760px){header,.hero,.grid,.gallery,.portfolio,.video{grid-template-columns:1fr}.hero{display:grid}}
</style>
`;

const indexPage = `---
import site from '../content/site.json';
import PageShell from '../layouts/PageShell.astro';

const pages = site.pages?.length ? site.pages : [{ id: 'home', title: 'Home', slug: '/', blocks: site.blocks ?? [] }];
const page = pages.find((item) => item.slug === '/') ?? pages[0];
---

<PageShell site={{ ...site, pages }} page={page} />
`;

const slugPage = `---
import site from '../content/site.json';
import PageShell from '../layouts/PageShell.astro';

const pages = site.pages?.length ? site.pages : [{ id: 'home', title: 'Home', slug: '/', blocks: site.blocks ?? [] }];

export function getStaticPaths() {
  return pages
    .filter((page) => page.slug !== '/')
    .map((page) => ({ params: { slug: page.slug.replace(/^\\\\//, '').replace(/\\\\/$/, '') }, props: { page } }));
}
---

<PageShell site={{ ...site, pages }} page={Astro.props.page} />
`;

const urls = site.pages
  .map((page) => `${site.baseUrl.replace(/\/$/, '')}${page.slug === '/' ? '/' : `/${page.slug.replace(/^\/|\/$/g, '')}/`}`)
  .map((loc) => `  <url><loc>${loc}</loc></url>`)
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'src', 'pages'), { recursive: true });
await mkdir(path.join(output, 'src', 'layouts'), { recursive: true });
await mkdir(path.join(output, 'src', 'content'), { recursive: true });
await mkdir(path.join(output, 'public'), { recursive: true });
await writeFile(path.join(output, 'package.json'), JSON.stringify({ scripts: { dev: 'astro dev', build: 'astro build', preview: 'astro preview' }, dependencies: { astro: '^5.0.0' }, devDependencies: {} }, null, 2));
await writeFile(path.join(output, 'astro.config.mjs'), "import { defineConfig } from 'astro/config';\n\nexport default defineConfig({ output: 'static' });\n");
await writeFile(path.join(output, 'src', 'layouts', 'PageShell.astro'), layout);
await writeFile(path.join(output, 'src', 'pages', 'index.astro'), indexPage);
await writeFile(path.join(output, 'src', 'pages', '[slug].astro'), slugPage);
await writeFile(path.join(output, 'src', 'content', 'site.json'), JSON.stringify(site, null, 2));
await writeFile(path.join(output, 'public', 'sitemap.xml'), sitemap);
await writeFile(path.join(output, 'README.md'), '# Exported Astro Site\n\nRun `npm install`, then `npm run build`.\n');

console.log(`Astro project exported to ${output}`);
