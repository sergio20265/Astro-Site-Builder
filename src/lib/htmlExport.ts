import type { PageContent, SiteAnalytics, SiteBlock, SiteContent } from './site';
import { socialPlatforms } from './site';

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function blockInlineStyle(style?: SiteBlock['style']): string {
  if (!style) return '';
  const p: string[] = [];
  if (style.bgColor) p.push(`background-color:${style.bgColor}`);
  if (style.bgImage) p.push(`background-image:url('${style.bgImage}');background-size:cover;background-position:center`);
  if (style.textColor) p.push(`color:${style.textColor}`);
  if (style.accentColor) p.push(`--preview-accent:${style.accentColor}`);
  return p.length ? ` style="${p.join(';')}"` : '';
}

function padClass(style?: SiteBlock['style']): string {
  if (style?.paddingY === 'compact') return ' compact';
  if (style?.paddingY === 'spacious') return ' spacious';
  return '';
}

function renderBlock(block: SiteBlock): string {
  const si = blockInlineStyle(block.style);
  const pc = padClass(block.style);
  switch (block.type) {
    case 'hero': {
      const img = block.image ? `<img src="${escHtml(block.image)}" alt="${escHtml(block.title)}" loading="lazy" />` : '';
      return `<section class="preview-hero${pc}"${si}><div>
  <p class="eyebrow">&nbsp;</p>
  <h1>${escHtml(block.title)}</h1>
  <p>${escHtml(block.subtitle)}</p>
  ${block.cta ? `<a href="#contact" class="hero-cta">${escHtml(block.cta)}</a>` : ''}
</div><div>${img}</div></section>`;
    }
    case 'services':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="service-grid">${block.items.map((it) => `<article><h3>${escHtml(it.title)}</h3><p>${escHtml(it.text)}</p></article>`).join('')}</div>
</section>`;
    case 'gallery':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="gallery-grid">${block.images.map((im) => `<figure>${im.src ? `<img src="${escHtml(im.src)}" alt="${escHtml(im.caption)}" loading="lazy" />` : '<div class="img-ph"></div>'}<figcaption>${escHtml(im.caption)}</figcaption></figure>`).join('')}</div>
</section>`;
    case 'portfolio':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="portfolio-grid">${block.items.map((it) => `<article>${it.image ? `<img src="${escHtml(it.image)}" alt="${escHtml(it.title)}" loading="lazy" />` : '<div class="img-ph"></div>'}<small>${escHtml(it.category)}</small><h3>${escHtml(it.title)}</h3><p>${escHtml(it.text)}</p></article>`).join('')}</div>
</section>`;
    case 'video':
      return `<section class="video-section${pc}"${si}>
  <div><h2>${escHtml(block.title)}</h2><p>${escHtml(block.text)}</p></div>
  <div class="video-frame">${block.url ? `<iframe src="${escHtml(block.url)}" title="${escHtml(block.title)}" allowfullscreen loading="lazy"></iframe>` : ''}</div>
</section>`;
    case 'testimonials':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="quote-grid">${block.items.map((it) => `<blockquote><p>${escHtml(it.text)}</p><cite>— ${escHtml(it.name)}</cite></blockquote>`).join('')}</div>
</section>`;
    case 'faq':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="faq-list">${block.items.map((it, i) => `<details${i === 0 ? ' open' : ''}><summary>${escHtml(it.q)}</summary><p>${escHtml(it.a)}</p></details>`).join('')}</div>
</section>`;
    case 'form': {
      const formAttrs = block.action
        ? ` action="${escHtml(block.action)}" method="${block.method ?? 'POST'}" data-sb-form`
        : '';
      const successMsg = block.successMessage || "Thank you! We'll be in touch soon.";
      return `<section class="preview-section form-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <p>${escHtml(block.text)}</p>
  <form${formAttrs}>${block.fields.map((f) => `<label>${escHtml(f.label)}${f.required ? ' *' : ''}${f.kind === 'textarea' ? `<textarea name="${escHtml(f.label.toLowerCase().replace(/\s+/g, '_'))}" rows="3"${f.required ? ' required' : ''}></textarea>` : `<input type="${f.kind}" name="${escHtml(f.label.toLowerCase().replace(/\s+/g, '_'))}"${f.required ? ' required' : ''} />`}</label>`).join('')}
  <button type="submit">${escHtml(block.submitLabel)}</button></form>
  <div class="form-success" style="display:none;padding:16px;background:color-mix(in srgb,var(--preview-accent),transparent 88%);border-radius:8px;color:var(--preview-accent);font-weight:600">${escHtml(successMsg)}</div>
</section>`;
    }
    case 'contact':
      return `<section class="preview-section contact-band${pc}" id="contact"${si}>
  <h2>${escHtml(block.title)}</h2>
  <p>${escHtml(block.text)}</p>
  <div class="contact-details">
    ${block.email ? `<a href="mailto:${escHtml(block.email)}">${escHtml(block.email)}</a>` : ''}
    ${block.phone ? `<span>${escHtml(block.phone)}</span>` : ''}
    ${block.address ? `<span>${escHtml(block.address)}</span>` : ''}
  </div>
</section>`;
    case 'sidebar':
      return `<aside class="sidebar-col-standalone${pc}"${si}>${block.widgets.map((w) => {
        if (w.kind === 'links') {
          const links = w.body.split('\n').filter(Boolean).map((line) => {
            const parts = line.split('|').map((s) => s.trim());
            return `<li><a href="${escHtml(parts[1] ?? '#')}">${escHtml(parts[0])}</a></li>`;
          }).join('');
          return `<div class="sidebar-widget"><p class="sidebar-widget-heading">${escHtml(w.heading)}</p><ul class="sidebar-links-list">${links}</ul></div>`;
        }
        return `<div class="sidebar-widget"><p class="sidebar-widget-heading">${escHtml(w.heading)}</p><p class="sidebar-widget-text">${escHtml(w.body)}</p></div>`;
      }).join('')}</aside>`;
    case 'pricing':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="pricing-grid">${block.items.map((it) => `<div class="pricing-card${it.highlight ? ' featured' : ''}">
    <div class="pricing-name">${escHtml(it.name)}</div>
    <div><span class="pricing-amount">${escHtml(it.price)}</span><span class="pricing-period">${escHtml(it.period)}</span></div>
    <ul class="pricing-features">${it.features.split('\n').filter(Boolean).map((f) => `<li>${escHtml(f.trim())}</li>`).join('')}</ul>
  </div>`).join('')}</div>
</section>`;
    case 'team':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="team-grid">${block.items.map((it) => `<div class="team-card">${it.image ? `<img class="team-avatar" src="${escHtml(it.image)}" alt="${escHtml(it.name)}" loading="lazy" />` : '<div class="team-avatar img-ph"></div>'}<h3>${escHtml(it.name)}</h3><p class="team-role">${escHtml(it.role)}</p><p class="team-bio">${escHtml(it.bio)}</p></div>`).join('')}</div>
</section>`;
    case 'cta':
      return `<section class="preview-cta${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <p>${escHtml(block.text)}</p>
  <a href="${escHtml(block.buttonHref)}" class="cta-btn">${escHtml(block.buttonLabel)}</a>
</section>`;
    case 'html':
      return `<section class="preview-section${pc}"${si}>${block.title ? `<h2>${escHtml(block.title)}</h2>` : ''}${block.code}</section>`;
    case 'stats':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="stats-grid">${block.items.map((it) => `<div class="stats-item"><div class="stats-value" data-target="${escHtml(it.value)}" data-suffix="${escHtml(it.suffix)}">${escHtml(it.value)}${escHtml(it.suffix)}</div><div class="stats-label">${escHtml(it.label)}</div></div>`).join('')}</div>
</section>`;
    case 'social':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="social-bar">${block.items.map((it) => {
    const plat = socialPlatforms.find((p) => p.value === it.platform);
    return `<a href="${escHtml(it.url)}" class="social-link" target="_blank" rel="noopener"><span class="social-short">${escHtml(plat?.short ?? '?')}</span>${escHtml(it.label || plat?.label || it.platform)}</a>`;
  }).join('')}</div>
</section>`;
    case 'timeline':
      return `<section class="preview-section${pc}"${si}>
  <h2>${escHtml(block.title)}</h2>
  <div class="timeline-list">${block.items.map((it) => `<div class="timeline-item"><div class="timeline-year">${escHtml(it.year)}</div><div class="timeline-title">${escHtml(it.title)}</div><div class="timeline-text">${escHtml(it.text)}</div></div>`).join('')}</div>
</section>`;
  }
}

function getAnalyticsScripts(analytics?: SiteAnalytics): string {
  if (!analytics) return '';
  const s: string[] = [];
  if (analytics.gtm) s.push(`<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analytics.gtm}');</script>`);
  if (analytics.ga4) s.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${analytics.ga4}"></script><script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.ga4}');</script>`);
  if (analytics.metrika) s.push(`<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t);a=e.getElementsByTagName(t)[0];k.async=1;k.src=r;a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${analytics.metrika},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});</script>`);
  if (analytics.vkPixel) s.push(`<script>!function(){var t=document.createElement("script");t.type="text/javascript",t.async=!0,t.src="https://vk.com/js/api/openapi.js?169",t.onload=function(){VK.Retargeting.Init("${analytics.vkPixel}"),VK.Retargeting.Hit()},document.head.appendChild(t)}();</script>`);
  if (analytics.fbPixel) s.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analytics.fbPixel}');fbq('track','PageView');</script>`);
  return s.join('\n');
}

const themeVarsMap: Record<string, { bg: string; text: string; muted: string; card: string; accent: string }> = {
  moss:  { bg: '#fbfaf6', text: '#123026', muted: '#5d7269', card: '#e8f3ee', accent: '#d7963b' },
  ink:   { bg: '#f0f0ec', text: '#111111', muted: '#5a5a5a', card: '#ffffff', accent: '#e94f37' },
  rose:  { bg: '#fff9f5', text: '#402039', muted: '#78606c', card: '#ffe8ef', accent: '#2f8269' },
  night: { bg: '#0d1117', text: '#e6edf3', muted: '#8b949e', card: '#161b22', accent: '#58a6ff' },
  cream: { bg: '#fdf8f0', text: '#2d1f0e', muted: '#8b6f47', card: '#f5e6d0', accent: '#c0392b' },
  ocean: { bg: '#f0f7ff', text: '#0a2540', muted: '#446b8e', card: '#dbeeff', accent: '#0077cc' },
};

function getPreviewCss(): string {
  return `*,*::before,*::after{box-sizing:border-box}
html,body{margin:0;padding:0;font-family:var(--body-font,ui-sans-serif,system-ui,sans-serif);color:var(--preview-text);background:var(--preview-bg);font-size:16px;line-height:1.5;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:var(--heading-font,var(--body-font,inherit));margin:0 0 .75em;line-height:1.15}
p{margin:0 0 1em}a{color:var(--preview-accent)}img{max-width:100%}
.site-wrapper{min-height:100vh}
header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 24px;border-bottom:1px solid color-mix(in srgb,var(--preview-text),transparent 88%)}
.site-logo{max-height:40px;max-width:160px;object-fit:contain}
.brand-name{font-size:16px;font-weight:700}
nav{display:flex;flex-wrap:wrap;gap:6px 16px}
nav a{color:var(--preview-muted);text-decoration:none;font-size:14px}
nav a:hover{color:var(--preview-accent)}
footer{padding:16px 24px;border-top:1px solid color-mix(in srgb,var(--preview-text),transparent 88%);display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--preview-muted)}
.preview-section{padding:40px 24px}
.preview-section.compact{padding:20px 24px}
.preview-section.spacious{padding:72px 24px}
.preview-section h2{font-size:26px;margin-bottom:20px}
.preview-hero{display:grid;grid-template-columns:1fr .75fr;gap:24px;align-items:center;padding:40px 24px}
.preview-hero.compact{padding:20px 24px}
.preview-hero.spacious{padding:72px 24px}
.preview-hero h1{font-size:42px;line-height:1.05;margin-bottom:16px}
.preview-hero>div:first-child p{color:var(--preview-muted);margin-bottom:20px}
.preview-hero img{width:100%;aspect-ratio:4/5;object-fit:cover;border-radius:12px}
.hero-cta{display:inline-flex;align-items:center;height:44px;padding:0 20px;border-radius:999px;background:var(--preview-accent);color:#fff;text-decoration:none;font-weight:600;font-size:14px}
.eyebrow{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;color:var(--preview-accent);margin-bottom:12px}
.service-grid,.gallery-grid,.quote-grid,.portfolio-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.service-grid article,.portfolio-grid article,.quote-grid blockquote{margin:0;padding:18px;border-radius:10px;background:var(--preview-card)}
.service-grid h3{margin:0 0 8px;font-size:15px}
.service-grid p,.portfolio-grid p{color:var(--preview-muted);font-size:14px;margin:0}
.gallery-grid figure{margin:0}
.gallery-grid img,.portfolio-grid img,.img-ph{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:8px;display:block;background:var(--preview-card)}
.gallery-grid figcaption,.portfolio-grid small{display:block;color:var(--preview-muted);font-size:13px;margin-top:6px}
.portfolio-grid h3{margin:8px 0 4px;font-size:15px}
.quote-grid blockquote{margin:0}
.quote-grid p{color:var(--preview-muted);font-size:14px;margin:0 0 8px}
.quote-grid cite{display:block;font-style:normal;color:var(--preview-muted);font-size:13px}
.video-section{display:grid;grid-template-columns:.8fr 1.2fr;gap:20px;align-items:center;padding:40px 24px}
.video-section h2{margin-bottom:8px}
.video-section p{color:var(--preview-muted)}
.video-frame{aspect-ratio:16/9;border-radius:10px;overflow:hidden;background:var(--preview-card)}
.video-frame iframe{width:100%;height:100%;border:0}
.faq-list{display:grid;gap:8px}
.faq-list details{border:1px solid color-mix(in srgb,var(--preview-text),transparent 84%);border-radius:8px;padding:14px}
.faq-list summary{cursor:pointer;font-weight:700;font-size:15px;list-style:disclosure-closed}
.faq-list p{color:var(--preview-muted);margin-top:8px}
.contact-band{padding:22px;border-radius:10px;background:var(--preview-card)}
.contact-band h2{margin-bottom:8px}
.contact-band>p{color:var(--preview-muted);margin-bottom:12px}
.contact-details{display:flex;flex-wrap:wrap;gap:12px}
.contact-band a{color:var(--preview-text)}
.form-section{max-width:720px;margin-inline:auto}
.form-section>p{color:var(--preview-muted)}
.form-section form{display:grid;gap:12px;margin-top:12px}
.form-section label{display:grid;gap:5px;font-size:13px;font-weight:700;color:var(--preview-muted)}
.form-section input,.form-section textarea{width:100%;border:1px solid color-mix(in srgb,var(--preview-text),transparent 80%);border-radius:6px;padding:10px;color:var(--preview-text);background:transparent;font:inherit;font-size:14px}
.form-section button{padding:10px 22px;border:none;border-radius:6px;background:var(--preview-accent);color:#fff;font-weight:600;cursor:pointer;font:inherit;font-size:14px}
.sidebar-col-standalone{padding:22px 16px;border-radius:10px;background:color-mix(in srgb,var(--preview-bg),var(--preview-card) 45%);margin:0 24px 24px}
.sidebar-widget{margin-bottom:20px}
.sidebar-widget-heading{margin:0 0 10px;font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--preview-muted);padding-bottom:6px;border-bottom:1px solid color-mix(in srgb,var(--preview-text),transparent 84%)}
.sidebar-widget-text{color:var(--preview-muted);font-size:14px;line-height:1.65}
.sidebar-links-list{list-style:none;padding:0;margin:0}
.sidebar-links-list li{border-bottom:1px solid color-mix(in srgb,var(--preview-text),transparent 92%)}
.sidebar-links-list a{display:block;padding:6px 0;color:var(--preview-accent);text-decoration:none}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.pricing-card{padding:22px;border-radius:10px;background:var(--preview-card);border:1px solid color-mix(in srgb,var(--preview-text),transparent 90%)}
.pricing-card.featured{background:var(--preview-accent);color:#fff;border-color:transparent}
.pricing-name{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;opacity:.75;margin-bottom:10px}
.pricing-amount{font-size:40px;font-weight:800;line-height:1}
.pricing-period{font-size:14px;opacity:.6;margin-left:4px}
.pricing-features{list-style:none;padding:0;margin:14px 0 0;border-top:1px solid color-mix(in srgb,currentColor,transparent 84%);padding-top:14px;display:grid;gap:7px;font-size:14px}
.pricing-features li::before{content:'✓  ';font-weight:700}
.team-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.team-card{text-align:center}
.team-avatar{width:100%;aspect-ratio:1/1;object-fit:cover;border-radius:50%;margin-bottom:12px;display:block}
.team-card h3{margin-bottom:4px;font-size:15px}
.team-role{color:var(--preview-accent);font-size:13px;font-weight:600;margin-bottom:6px}
.team-bio{color:var(--preview-muted);font-size:13px;line-height:1.55}
.preview-cta{padding:60px 24px;text-align:center;background:var(--preview-accent)}
.preview-cta.compact{padding:28px 24px}
.preview-cta.spacious{padding:96px 24px}
.preview-cta h2{color:#fff;font-size:30px;margin-bottom:12px}
.preview-cta>p{color:rgba(255,255,255,.82);margin-bottom:24px}
.cta-btn{display:inline-flex;align-items:center;height:44px;padding:0 28px;border-radius:999px;background:#fff;color:var(--preview-accent);text-decoration:none;font-weight:700;font-size:14px}
.stats-grid{display:flex;flex-wrap:wrap;justify-content:center;gap:20px 48px;padding:8px 0}
.stats-item{text-align:center}
.stats-value{font-size:52px;font-weight:800;color:var(--preview-accent);line-height:1}
.stats-label{font-size:12px;color:var(--preview-muted);margin-top:6px;text-transform:uppercase;letter-spacing:.05em;font-weight:600}
.social-bar{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.social-link{display:inline-flex;align-items:center;gap:8px;padding:8px 18px;border-radius:999px;border:1.5px solid color-mix(in srgb,var(--preview-accent),transparent 60%);color:var(--preview-accent);text-decoration:none;font-size:14px;font-weight:600;transition:all .15s}
.social-link:hover{background:var(--preview-accent);color:#fff}
.social-short{font-size:11px;font-weight:800;background:var(--preview-accent);color:#fff;border-radius:50%;width:26px;height:26px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.timeline-list{padding-left:20px;border-left:2px solid color-mix(in srgb,var(--preview-accent),transparent 55%);display:grid;gap:0}
.timeline-item{padding:0 0 28px 22px;position:relative}
.timeline-item::before{content:'';position:absolute;left:-27px;top:6px;width:10px;height:10px;border-radius:50%;background:var(--preview-accent);border:2px solid var(--preview-bg)}
.timeline-year{font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--preview-accent);margin-bottom:4px}
.timeline-title{font-size:16px;font-weight:700;margin-bottom:4px}
.timeline-text{color:var(--preview-muted);font-size:14px;line-height:1.6}
@media(max-width:768px){
  .preview-hero,.video-section{display:block}
  .preview-hero h1{font-size:30px}
  .service-grid,.gallery-grid,.quote-grid,.portfolio-grid,.pricing-grid,.team-grid{grid-template-columns:1fr}
  header{flex-wrap:wrap}
  .stats-value{font-size:40px}
}`;
}

const formScript = `<script>
(function(){
  document.querySelectorAll('form[data-sb-form]').forEach(function(form){
    var success=form.parentNode.querySelector('.form-success');
    form.addEventListener('submit',function(e){
      e.preventDefault();
      if(!form.action||form.action.indexOf('#')>-1)return;
      fetch(form.action,{method:form.method||'POST',body:new FormData(form),headers:{Accept:'application/json'}})
        .then(function(r){if(r.ok){form.style.display='none';if(success)success.style.display='block';}})
        .catch(function(){});
    });
  });
})();
</script>`;

const countUpScript = `<script>
(function(){
  var els=document.querySelectorAll('.stats-value[data-target]');
  if(!els.length)return;
  els.forEach(function(el){
    var target=parseInt(el.dataset.target,10)||0;
    var suffix=el.dataset.suffix||'';
    var started=false;
    var obs=new IntersectionObserver(function(entries){
      if(entries[0].isIntersecting&&!started){
        started=true;obs.disconnect();
        var start=0,dur=1200,inc=target/(dur/16);
        (function step(){start=Math.min(start+inc,target);el.textContent=Math.round(start)+suffix;if(start<target)requestAnimationFrame(step);})();
      }
    },{threshold:.1});
    obs.observe(el);
  });
})();
</script>`;

export function generateHtml(site: SiteContent, page: PageContent): string {
  const tv = themeVarsMap[site.theme] ?? themeVarsMap.moss;
  const effectiveBg = page.bgColor || site.bgColor || tv.bg;
  const effectiveBgImage = page.bgImage || site.bgImage;

  const cssVars = [
    `--preview-bg:${effectiveBg}`,
    `--preview-text:${tv.text}`,
    `--preview-muted:${tv.muted}`,
    `--preview-card:${tv.card}`,
    `--preview-accent:${tv.accent}`,
    site.fonts?.body ? `--body-font:'${site.fonts.body}',sans-serif` : '',
    site.fonts?.heading ? `--heading-font:'${site.fonts.heading}',sans-serif` : '',
  ].filter(Boolean).join(';');

  const bgStyle = effectiveBgImage ? `;background-image:url('${effectiveBgImage}');background-size:cover;background-position:center` : '';

  const fontLinks: string[] = [];
  if (site.fonts?.body || site.fonts?.heading) {
    fontLinks.push('<link rel="preconnect" href="https://fonts.googleapis.com" />');
    fontLinks.push('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />');
    const families = [site.fonts?.body, site.fonts?.heading].filter(Boolean) as string[];
    const combined = families.map((f) => `family=${f.replace(/ /g, '+')}:wght@400;600;700`).join('&');
    fontLinks.push(`<link href="https://fonts.googleapis.com/css2?${combined}&display=swap" rel="stylesheet" />`);
  }

  const headerNav = site.navGroups?.find((g) => g.position === 'header');
  const footerNav = site.navGroups?.find((g) => g.position === 'footer');
  const hasStats = page.blocks.some((b) => b.type === 'stats');
  const hasForms = page.blocks.some((b) => b.type === 'form' && (b as Extract<SiteBlock, { type: 'form' }>).action);

  const sidebarBlocks = page.blocks.filter((b): b is Extract<SiteBlock, { type: 'sidebar' }> => b.type === 'sidebar');
  const mainBlocks = page.blocks.filter((b) => b.type !== 'sidebar');

  const seo = {
    title: page.seo?.title || site.seo.title,
    description: page.seo?.description || site.seo.description,
    image: page.seo?.image || site.seo.image,
    keywords: page.seo?.keywords || site.seo.keywords,
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escHtml(seo.title)}</title>
<meta name="description" content="${escHtml(seo.description)}" />
${seo.keywords ? `<meta name="keywords" content="${escHtml(seo.keywords)}" />` : ''}
${seo.image ? `<meta property="og:image" content="${escHtml(seo.image)}" />` : ''}
${fontLinks.join('\n')}
${getAnalyticsScripts(site.analytics)}
<style>:root{${cssVars}}</style>
<style>${getPreviewCss()}</style>
</head>
<body>
<div class="site-wrapper" style="${bgStyle.replace(/^;/, '')}">
<header>
  <div class="preview-header-brand">
    ${site.logo ? `<img src="${escHtml(site.logo)}" alt="${escHtml(site.name)}" class="site-logo" />` : `<span class="brand-name">${escHtml(site.name)}</span>`}
  </div>
  ${headerNav ? `<nav>${headerNav.items.map((i) => `<a href="${escHtml(i.href)}">${escHtml(i.label)}</a>`).join('')}</nav>` : ''}
</header>
${mainBlocks.map(renderBlock).join('\n')}
${sidebarBlocks.map(renderBlock).join('\n')}
${footerNav ? `<footer><span>${escHtml(site.name)}</span><nav>${footerNav.items.map((i) => `<a href="${escHtml(i.href)}">${escHtml(i.label)}</a>`).join('')}</nav></footer>` : ''}
</div>
${hasForms ? formScript : ''}
${hasStats ? countUpScript : ''}
</body>
</html>`;
}
