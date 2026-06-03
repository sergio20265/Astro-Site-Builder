import { useEffect, useRef, useState } from 'react';
import type { BlockAnimation, BlockStyle, PageContent, SiteBlock, SiteContent } from '../lib/site';
import type { MessageKey, Messages } from '../lib/i18n';
import { translate } from '../lib/i18n';

type Props = {
  site: SiteContent;
  page: PageContent;
  messages: Messages;
  activeBlockId: string;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (id: string, patch: Partial<SiteBlock>) => void;
  onUpdateSite: (patch: Partial<SiteContent>) => void;
};

function AnimationWrapper({ animation, children }: { animation?: BlockAnimation; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!animation || animation.type === 'none') return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setTriggered(true); observer.disconnect(); } },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [animation?.type]);

  if (!animation || animation.type === 'none') return <>{children}</>;

  return (
    <div
      ref={ref}
      className={triggered ? `anim-${animation.type}` : 'anim-waiting'}
      style={{ '--anim-dur': `${animation.duration ?? 600}ms`, '--anim-delay': `${animation.delay ?? 0}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

function getBlockInlineStyle(style?: BlockStyle): React.CSSProperties {
  if (!style) return {};
  const css: React.CSSProperties & Record<string, string> = {};
  if (style.bgColor) css.backgroundColor = style.bgColor;
  if (style.bgImage) { css.backgroundImage = `url(${style.bgImage})`; css.backgroundSize = 'cover'; css.backgroundPosition = 'center'; css.backgroundRepeat = 'no-repeat'; }
  if (style.textColor) css.color = style.textColor;
  if (style.accentColor) css['--preview-accent'] = style.accentColor;
  return css;
}

function getPaddingClass(paddingY?: string) {
  if (paddingY === 'compact') return 'padding-compact';
  if (paddingY === 'spacious') return 'padding-spacious';
  return '';
}

type EditableTextProps = { className?: string; multiline?: boolean; value: string; onChange: (v: string) => void };

function EditableText({ className, multiline = false, value, onChange }: EditableTextProps) {
  function commit(el: HTMLElement) {
    const next = multiline ? el.innerText.trim() : el.textContent?.trim() ?? '';
    if (next !== value) onChange(next);
  }
  return (
    <span
      className={className ? `inline-edit ${className}` : 'inline-edit'}
      contentEditable suppressContentEditableWarning role="textbox" aria-multiline={multiline}
      onBlur={(e) => commit(e.currentTarget)}
      onKeyDown={(e) => { if (!multiline && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
    >
      {value}
    </span>
  );
}

function ImageEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }
  return (
    <label className="preview-image-field" onClick={(e) => e.stopPropagation()}>
      <span>Image URL</span>
      <div className="preview-image-upload-row">
        <input value={value.startsWith('data:') ? '' : value} onChange={(e) => onChange(e.target.value)} placeholder={value.startsWith('data:') ? '[local file]' : 'https://...'} readOnly={value.startsWith('data:')} />
        <button type="button" className="preview-upload-btn" onClick={() => fileRef.current?.click()}>↑</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
    </label>
  );
}

function BlockView({ block, messages, active, onSelect, onUpdateBlock, onOpenLightbox }: { block: SiteBlock; messages: Messages; active: boolean; onSelect: () => void; onUpdateBlock: (id: string, patch: Partial<SiteBlock>) => void; onOpenLightbox: (img: { src: string; caption: string }) => void }) {
  const t = (key: MessageKey) => translate(messages, key);
  const shellClass = active ? 'preview-edit-block active' : 'preview-edit-block';
  const blockStyle = getBlockInlineStyle(block.style);
  const padClass = getPaddingClass(block.style?.paddingY);

  switch (block.type) {
    case 'hero': return (
      <section className={`${shellClass} preview-hero ${padClass}`} style={blockStyle} onClick={onSelect}>
        <div>
          <p className="eyebrow">{t('preview.eyebrow')}</p>
          <h1><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h1>
          <p><EditableText multiline value={block.subtitle} onChange={(subtitle) => onUpdateBlock(block.id, { subtitle })} /></p>
          <a href="#contact" onClick={(e) => e.preventDefault()}><EditableText value={block.cta} onChange={(cta) => onUpdateBlock(block.id, { cta })} /></a>
        </div>
        <div className="preview-media-editor">
          {block.image ? <img src={block.image} alt="" /> : <div className="image-placeholder" />}
          <ImageEditor value={block.image} onChange={(image) => onUpdateBlock(block.id, { image })} />
        </div>
      </section>
    );

    case 'services': return (
      <section className={`${shellClass} preview-section ${padClass}`} style={blockStyle} onClick={onSelect}>
        <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
        <div className="service-grid">
          {block.items.map((item, index) => (
            <article key={index}>
              <h3><EditableText value={item.title} onChange={(title) => { const items = [...block.items]; items[index] = { ...item, title }; onUpdateBlock(block.id, { items }); }} /></h3>
              <p><EditableText multiline value={item.text} onChange={(text) => { const items = [...block.items]; items[index] = { ...item, text }; onUpdateBlock(block.id, { items }); }} /></p>
            </article>
          ))}
        </div>
      </section>
    );

    case 'gallery': return (
      <section className={`${shellClass} preview-section ${padClass}`} style={blockStyle} onClick={onSelect}>
        <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
        <div className="gallery-grid">
          {block.images.map((image, index) => (
            <figure key={index}>
              <div className="preview-media-editor">
                {image.src ? <button className="image-button" onClick={(e) => { e.stopPropagation(); onOpenLightbox({ src: image.src, caption: image.caption }); }}><img src={image.src} alt={image.caption} /></button> : <div className="image-placeholder" />}
                <ImageEditor value={image.src} onChange={(src) => { const images = [...block.images]; images[index] = { ...image, src }; onUpdateBlock(block.id, { images }); }} />
              </div>
              <figcaption><EditableText value={image.caption} onChange={(caption) => { const images = [...block.images]; images[index] = { ...image, caption }; onUpdateBlock(block.id, { images }); }} /></figcaption>
            </figure>
          ))}
        </div>
      </section>
    );

    case 'portfolio': return (
      <section className={`${shellClass} preview-section ${padClass}`} style={blockStyle} onClick={onSelect}>
        <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
        <div className="portfolio-grid">
          {block.items.map((item, index) => (
            <article key={index}>
              <div className="preview-media-editor">
                {item.image ? <button className="image-button" onClick={(e) => { e.stopPropagation(); onOpenLightbox({ src: item.image, caption: item.title }); }}><img src={item.image} alt={item.title} /></button> : <div className="image-placeholder" />}
                <ImageEditor value={item.image} onChange={(image) => { const items = [...block.items]; items[index] = { ...item, image }; onUpdateBlock(block.id, { items }); }} />
              </div>
              <small><EditableText value={item.category} onChange={(category) => { const items = [...block.items]; items[index] = { ...item, category }; onUpdateBlock(block.id, { items }); }} /></small>
              <h3><EditableText value={item.title} onChange={(title) => { const items = [...block.items]; items[index] = { ...item, title }; onUpdateBlock(block.id, { items }); }} /></h3>
              <p><EditableText multiline value={item.text} onChange={(text) => { const items = [...block.items]; items[index] = { ...item, text }; onUpdateBlock(block.id, { items }); }} /></p>
            </article>
          ))}
        </div>
      </section>
    );

    case 'video': return (
      <section className={`${shellClass} preview-section video-section ${padClass}`} style={blockStyle} onClick={onSelect}>
        <div>
          <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
          <p><EditableText multiline value={block.text} onChange={(text) => onUpdateBlock(block.id, { text })} /></p>
          <ImageEditor value={block.url} onChange={(url) => onUpdateBlock(block.id, { url })} />
        </div>
        <div className="video-frame">
          {block.url ? <iframe src={block.url} title={block.title} allowFullScreen /> : <div className="image-placeholder" />}
        </div>
      </section>
    );

    case 'testimonials': return (
      <section className={`${shellClass} preview-section ${padClass}`} style={blockStyle} onClick={onSelect}>
        <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
        <div className="quote-grid">
          {block.items.map((item, index) => (
            <blockquote key={index}>
              <p><EditableText multiline value={item.text} onChange={(text) => { const items = [...block.items]; items[index] = { ...item, text }; onUpdateBlock(block.id, { items }); }} /></p>
              <cite><EditableText value={item.name} onChange={(name) => { const items = [...block.items]; items[index] = { ...item, name }; onUpdateBlock(block.id, { items }); }} /></cite>
            </blockquote>
          ))}
        </div>
      </section>
    );

    case 'form': return (
      <section className={`${shellClass} preview-section form-section ${padClass}`} style={blockStyle} onClick={onSelect}>
        <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
        <p><EditableText multiline value={block.text} onChange={(text) => onUpdateBlock(block.id, { text })} /></p>
        <form>
          {block.fields.map((field, index) => (
            <label key={index}>
              <span><EditableText value={field.label} onChange={(label) => { const fields = [...block.fields]; fields[index] = { ...field, label }; onUpdateBlock(block.id, { fields }); }} />{field.required ? ' *' : ''}</span>
              {field.kind === 'textarea' ? <textarea rows={3} /> : <input type={field.kind} />}
            </label>
          ))}
          <button type="button"><EditableText value={block.submitLabel} onChange={(submitLabel) => onUpdateBlock(block.id, { submitLabel })} /></button>
        </form>
      </section>
    );

    case 'faq': return (
      <section className={`${shellClass} preview-section ${padClass}`} style={blockStyle} onClick={onSelect}>
        <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
        <div className="faq-list">
          {block.items.map((item, index) => (
            <details key={index} open={index === 0}>
              <summary><EditableText value={item.q} onChange={(q) => { const items = [...block.items]; items[index] = { ...item, q }; onUpdateBlock(block.id, { items }); }} /></summary>
              <p><EditableText multiline value={item.a} onChange={(a) => { const items = [...block.items]; items[index] = { ...item, a }; onUpdateBlock(block.id, { items }); }} /></p>
            </details>
          ))}
        </div>
      </section>
    );

    case 'contact': return (
      <section className={`${shellClass} preview-section contact-band ${padClass}`} id="contact" style={blockStyle} onClick={onSelect}>
        <h2><EditableText value={block.title} onChange={(title) => onUpdateBlock(block.id, { title })} /></h2>
        <p><EditableText multiline value={block.text} onChange={(text) => onUpdateBlock(block.id, { text })} /></p>
        <div>
          <a href={`mailto:${block.email}`} onClick={(e) => e.preventDefault()}><EditableText value={block.email} onChange={(email) => onUpdateBlock(block.id, { email })} /></a>
          <span><EditableText value={block.phone} onChange={(phone) => onUpdateBlock(block.id, { phone })} /></span>
          <span><EditableText value={block.address} onChange={(address) => onUpdateBlock(block.id, { address })} /></span>
        </div>
      </section>
    );

    case 'sidebar': return (
      <div className={shellClass} style={blockStyle} onClick={onSelect}>
        {block.widgets.map((widget) => (
          <div key={widget.id} className="sidebar-widget">
            {widget.heading && <p className="sidebar-widget-heading">{widget.heading}</p>}
            {widget.kind === 'text' && <p className="sidebar-widget-text">{widget.body}</p>}
            {widget.kind === 'links' && (
              <ul className="sidebar-links-list">
                {widget.body.split('\n').filter(Boolean).map((line, i) => {
                  const parts = line.split('|').map((s) => s.trim());
                  const label = parts[0] ?? line.trim();
                  const href = parts[1] ?? '#';
                  return <li key={i}><a href={href} onClick={(e) => e.preventDefault()}>{label}</a></li>;
                })}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }
}

export default function SitePreview({ site, page, messages, activeBlockId, onSelectBlock, onUpdateBlock, onUpdateSite }: Props) {
  const [lightbox, setLightbox] = useState<{ src: string; caption: string } | null>(null);
  const logoUploadRef = useRef<HTMLInputElement>(null);

  const headerNav = site.navGroups?.find((g) => g.position === 'header');
  const footerNav = site.navGroups?.find((g) => g.position === 'footer');

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdateSite({ logo: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  function updateNavItem(groupId: string, itemId: string, label: string) {
    onUpdateSite({ navGroups: site.navGroups?.map((g) => g.id === groupId ? { ...g, items: g.items.map((i) => i.id === itemId ? { ...i, label } : i) } : g) });
  }

  const sidebarBlocks = site.blocks.filter((b): b is Extract<SiteBlock, { type: 'sidebar' }> => b.type === 'sidebar');
  const mainBlocks = site.blocks.filter((b) => b.type !== 'sidebar');
  const hasSidebar = sidebarBlocks.length > 0;
  const sidebarPosition = hasSidebar ? sidebarBlocks[0].position : 'right';

  const previewStyle: React.CSSProperties & Record<string, string> = {};
  const effectiveBgColor = page.bgColor || site.bgColor;
  const effectiveBgImage = page.bgImage || site.bgImage;
  if (effectiveBgColor) previewStyle.backgroundColor = effectiveBgColor;
  if (effectiveBgImage) {
    previewStyle.backgroundImage = `url(${effectiveBgImage})`;
    previewStyle.backgroundSize = 'cover';
    previewStyle.backgroundPosition = 'center';
    previewStyle.backgroundRepeat = 'no-repeat';
  }

  function renderBlock(block: SiteBlock) {
    return (
      <AnimationWrapper key={block.id} animation={block.animation}>
        <BlockView active={activeBlockId === block.id} block={block} messages={messages} onSelect={() => onSelectBlock(block.id)} onUpdateBlock={onUpdateBlock} onOpenLightbox={setLightbox} />
      </AnimationWrapper>
    );
  }

  return (
    <>
      <div className={`site-preview theme-${site.theme}`} style={previewStyle}>
        <header>
          <div className="preview-header-brand">
            {site.logo
              ? (
                <div className="preview-logo-group">
                  <img src={site.logo} alt={site.name} className="site-logo" />
                  <button className="preview-logo-clear" title="Remove logo" onClick={() => onUpdateSite({ logo: '' })}>×</button>
                </div>
              )
              : (
                <strong><EditableText value={site.name} onChange={(name) => onUpdateSite({ name })} /></strong>
              )
            }
            <button className="preview-logo-upload-btn" title="Upload logo" onClick={() => logoUploadRef.current?.click()}>↑ logo</button>
            <input ref={logoUploadRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
          </div>
          {headerNav && (
            <nav>
              {headerNav.items.map((item) => (
                <a key={item.id} href={item.href} onClick={(e) => e.preventDefault()}>
                  <EditableText value={item.label} onChange={(label) => updateNavItem(headerNav.id, item.id, label)} />
                </a>
              ))}
            </nav>
          )}
        </header>

        {hasSidebar ? (
          <div className={`site-content with-sidebar sidebar-${sidebarPosition}`}>
            <div className="main-col">{mainBlocks.map(renderBlock)}</div>
            <aside className="sidebar-col">{sidebarBlocks.map(renderBlock)}</aside>
          </div>
        ) : (
          <div className="site-content">{site.blocks.map(renderBlock)}</div>
        )}

        {footerNav && (
          <footer style={{ padding: '16px 20px', borderTop: `1px solid color-mix(in srgb, var(--preview-text), transparent 88%)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--preview-muted)' }}>{site.name}</span>
            <nav>
              {footerNav.items.map((item) => (
                <a key={item.id} href={item.href} onClick={(e) => e.preventDefault()}>
                  <EditableText value={item.label} onChange={(label) => updateNavItem(footerNav.id, item.id, label)} />
                </a>
              ))}
            </nav>
          </footer>
        )}
      </div>

      {lightbox && (
        <button className="lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.caption} />
          <span>{lightbox.caption}</span>
        </button>
      )}
    </>
  );
}
