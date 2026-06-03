import { useMemo, useRef, useState } from 'react';
import SitePreview from './components/SitePreview';
import { type Locale, type MessageKey, dictionaries, translate } from './lib/i18n';
import {
  type AnimationType,
  type BlockAnimation,
  type BlockStyle,
  type BlockType,
  type NavGroup,
  type NavItem,
  type PageContent,
  type PaddingSize,
  type SidebarWidget,
  type SiteBlock,
  type SiteContent,
  createBlock,
  initialSite,
  themes,
} from './lib/site';

const storageKey = 'astro-site-builder-content';
const localeStorageKey = 'astro-site-builder-locale';
const blockTypes: BlockType[] = ['hero', 'services', 'portfolio', 'gallery', 'video', 'testimonials', 'faq', 'form', 'contact', 'sidebar'];
const menuItems = ['content', 'design', 'seo', 'export'] as const;

type MenuItem = (typeof menuItems)[number];
type EditorTab = 'content' | 'style' | 'animation';

function loadSite(): SiteContent {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return initialSite;
  try {
    const parsed = JSON.parse(saved) as SiteContent;
    if (!parsed.pages?.length) {
      return { ...parsed, pages: [{ id: 'home', title: 'Home', slug: '/', blocks: parsed.blocks ?? [] }] };
    }
    if (!parsed.navGroups) {
      parsed.navGroups = initialSite.navGroups;
    }
    return parsed;
  } catch {
    return initialSite;
  }
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'page';
}

function Field({ label, value, onChange, textarea = false, placeholder }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <label className="field">
      <span>{label}</span>
      {textarea
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} />
        : <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      }
    </label>
  );
}

function ImageField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const isData = value.startsWith('data:');

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="field">
      <span>{label}</span>
      <div className="image-field-row">
        <input value={isData ? '' : value} onChange={(e) => onChange(e.target.value)} placeholder={isData ? '[local file]' : 'https://...'} readOnly={isData} />
        <button type="button" className="upload-btn" onClick={() => fileRef.current?.click()}>↑ Upload</button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
      </div>
      {value && (
        <div className="image-thumb-wrap">
          <img src={value} alt="" className="image-thumb" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          <div className="image-thumb-info"><span>{isData ? 'Local file (base64)' : value}</span></div>
          <button type="button" className="image-clear-btn" onClick={() => onChange('')}>×</button>
        </div>
      )}
    </div>
  );
}

function ColorField({ label, value, onChange, placeholder = 'default' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="field">
      <span>{label}</span>
      <div className="color-row">
        <input type="color" value={value || '#ffffff'} onChange={(e) => onChange(e.target.value)} />
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        {value && <button type="button" onClick={() => onChange('')}>×</button>}
      </div>
    </div>
  );
}

function StyleEditor({ block, updateBlock, t }: { block: SiteBlock; updateBlock: (id: string, patch: Partial<SiteBlock>) => void; t: (key: MessageKey) => string }) {
  const s: BlockStyle = block.style ?? {};
  function patch(p: Partial<BlockStyle>) { updateBlock(block.id, { style: { ...s, ...p } } as Partial<SiteBlock>); }
  return (
    <>
      <div className="editor-header"><h2>{t('tab.style')}</h2><p>Customize colors, background and spacing for this block.</p></div>
      <ColorField label={t('field.bgColor')} value={s.bgColor ?? ''} onChange={(bgColor) => patch({ bgColor })} />
      <ImageField label={t('field.bgImage')} value={s.bgImage ?? ''} onChange={(bgImage) => patch({ bgImage })} />
      <ColorField label={t('field.textColor')} value={s.textColor ?? ''} onChange={(textColor) => patch({ textColor })} placeholder="inherit" />
      <ColorField label={t('field.accentColor')} value={s.accentColor ?? ''} onChange={(accentColor) => patch({ accentColor })} placeholder="theme default" />
      <div className="field">
        <span>{t('field.paddingY')}</span>
        <select value={s.paddingY ?? 'normal'} onChange={(e) => patch({ paddingY: e.target.value as PaddingSize })}>
          <option value="compact">{t('padding.compact')}</option>
          <option value="normal">{t('padding.normal')}</option>
          <option value="spacious">{t('padding.spacious')}</option>
        </select>
      </div>
    </>
  );
}

function AnimationEditor({ block, updateBlock, t }: { block: SiteBlock; updateBlock: (id: string, patch: Partial<SiteBlock>) => void; t: (key: MessageKey) => string }) {
  const anim: BlockAnimation = block.animation ?? { type: 'none' };
  function patch(p: Partial<BlockAnimation>) { updateBlock(block.id, { animation: { ...anim, ...p } } as Partial<SiteBlock>); }
  const animTypes: AnimationType[] = ['none', 'fade', 'slide-up', 'slide-left', 'slide-right', 'zoom'];
  return (
    <>
      <div className="editor-header"><h2>{t('tab.animation')}</h2><p>Animate this block when it enters the viewport on scroll.</p></div>
      <div className="field">
        <span>{t('field.animType')}</span>
        <select value={anim.type} onChange={(e) => patch({ type: e.target.value as AnimationType })}>
          {animTypes.map((type) => <option key={type} value={type}>{t(`animType.${type}` as MessageKey)}</option>)}
        </select>
      </div>
      {anim.type !== 'none' && (
        <>
          <div className="field">
            <span>{t('field.animDuration')}</span>
            <input type="number" min={100} max={2000} step={50} value={anim.duration ?? 600} onChange={(e) => patch({ duration: Number(e.target.value) })} />
          </div>
          <div className="field">
            <span>{t('field.animDelay')}</span>
            <input type="number" min={0} max={2000} step={50} value={anim.delay ?? 0} onChange={(e) => patch({ delay: Number(e.target.value) })} />
          </div>
        </>
      )}
    </>
  );
}

function NavEditor({ site, updateSite, t }: { site: SiteContent; updateSite: (s: SiteContent) => void; t: (key: MessageKey) => string }) {
  const navGroups = site.navGroups ?? [];

  function addGroup() {
    const group: NavGroup = { id: `nav-${crypto.randomUUID().slice(0, 8)}`, name: 'New menu', position: 'header', items: [] };
    updateSite({ ...site, navGroups: [...navGroups, group] });
  }

  function updateGroup(id: string, patch: Partial<NavGroup>) {
    updateSite({ ...site, navGroups: navGroups.map((g) => (g.id === id ? { ...g, ...patch } : g)) });
  }

  function removeGroup(id: string) {
    updateSite({ ...site, navGroups: navGroups.filter((g) => g.id !== id) });
  }

  function addItem(groupId: string) {
    const item: NavItem = { id: `item-${crypto.randomUUID().slice(0, 8)}`, label: 'New item', href: '#' };
    updateSite({ ...site, navGroups: navGroups.map((g) => g.id === groupId ? { ...g, items: [...g.items, item] } : g) });
  }

  function updateItem(groupId: string, itemId: string, patch: Partial<NavItem>) {
    updateSite({ ...site, navGroups: navGroups.map((g) => g.id === groupId ? { ...g, items: g.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) } : g) });
  }

  function removeItem(groupId: string, itemId: string) {
    updateSite({ ...site, navGroups: navGroups.map((g) => g.id === groupId ? { ...g, items: g.items.filter((i) => i.id !== itemId) } : g) });
  }

  function moveItem(groupId: string, index: number, direction: -1 | 1) {
    const group = navGroups.find((g) => g.id === groupId);
    if (!group) return;
    const items = [...group.items];
    const next = index + direction;
    if (next < 0 || next >= items.length) return;
    [items[index], items[next]] = [items[next], items[index]];
    updateGroup(groupId, { items });
  }

  return (
    <div className="panel">
      <div className="mini-header">
        <h2>{t('section.nav')}</h2>
        <button onClick={addGroup}>{t('action.addNavGroup')}</button>
      </div>
      {navGroups.map((group) => (
        <div className="repeat-row" key={group.id}>
          <div className="nav-group-header-row">
            <Field label={t('field.navGroupName')} value={group.name} onChange={(name) => updateGroup(group.id, { name })} />
            <div className="field">
              <span>{t('field.navPosition')}</span>
              <select value={group.position} onChange={(e) => updateGroup(group.id, { position: e.target.value as NavGroup['position'] })}>
                <option value="header">{t('navPos.header')}</option>
                <option value="footer">{t('navPos.footer')}</option>
              </select>
            </div>
            <div className="nav-group-delete">
              <button className="danger-button" onClick={() => removeGroup(group.id)}>{t('action.delete')}</button>
            </div>
          </div>
          {group.items.map((item, index) => (
            <div key={item.id} className="nav-item-row">
              <Field label={t('field.navLabel')} value={item.label} onChange={(label) => updateItem(group.id, item.id, { label })} />
              <Field label={t('field.navHref')} value={item.href} onChange={(href) => updateItem(group.id, item.id, { href })} />
              <div className="nav-item-actions">
                <button onClick={() => moveItem(group.id, index, -1)} disabled={index === 0}>↑</button>
                <button onClick={() => moveItem(group.id, index, 1)} disabled={index === group.items.length - 1}>↓</button>
                <button className="danger-button" onClick={() => removeItem(group.id, item.id)}>×</button>
              </div>
            </div>
          ))}
          <button className="soft-button" onClick={() => addItem(group.id)}>{t('action.addNavItem')}</button>
        </div>
      ))}
    </div>
  );
}

function BlockEditor({ block, updateBlock, t }: { block: SiteBlock; updateBlock: (id: string, patch: Partial<SiteBlock>) => void; t: (key: MessageKey, params?: Record<string, string | number>) => string }) {
  const [tab, setTab] = useState<EditorTab>('content');
  return (
    <>
      <div className="editor-tabs">
        <button className={tab === 'content' ? 'active' : ''} onClick={() => setTab('content')}>{t('tab.content')}</button>
        <button className={tab === 'style' ? 'active' : ''} onClick={() => setTab('style')}>{t('tab.style')}</button>
        <button className={tab === 'animation' ? 'active' : ''} onClick={() => setTab('animation')}>{t('tab.animation')}</button>
      </div>
      {tab === 'style' && <StyleEditor block={block} updateBlock={updateBlock} t={t} />}
      {tab === 'animation' && <AnimationEditor block={block} updateBlock={updateBlock} t={t} />}
      {tab === 'content' && <BlockContentEditor block={block} updateBlock={updateBlock} t={t} />}
    </>
  );
}

function BlockContentEditor({ block, updateBlock, t }: { block: SiteBlock; updateBlock: (id: string, patch: Partial<SiteBlock>) => void; t: (key: MessageKey, params?: Record<string, string | number>) => string }) {
  if (block.type === 'hero') return (
    <>
      <EditorHeader title={t('editor.hero')} hint={t('editorHint.hero')} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      <Field label={t('field.subtitle')} value={block.subtitle} textarea onChange={(subtitle) => updateBlock(block.id, { subtitle })} />
      <Field label={t('field.cta')} value={block.cta} onChange={(cta) => updateBlock(block.id, { cta })} />
      <ImageField label={t('field.imageUrl')} value={block.image} onChange={(image) => updateBlock(block.id, { image })} />
    </>
  );

  if (block.type === 'contact') return (
    <>
      <EditorHeader title={t('editor.contact')} hint={t('editorHint.contact')} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      <Field label={t('field.text')} value={block.text} textarea onChange={(text) => updateBlock(block.id, { text })} />
      <Field label={t('field.email')} value={block.email} onChange={(email) => updateBlock(block.id, { email })} />
      <Field label={t('field.phone')} value={block.phone} onChange={(phone) => updateBlock(block.id, { phone })} />
      <Field label={t('field.address')} value={block.address} onChange={(address) => updateBlock(block.id, { address })} />
    </>
  );

  if (block.type === 'gallery') return (
    <>
      <EditorHeader title={t('editor.gallery')} hint={t('editorHint.gallery')} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      {block.images.map((image, index) => (
        <div className="repeat-row" key={index}>
          <ImageField label={t('field.imageUrl')} value={image.src} onChange={(src) => { const images = [...block.images]; images[index] = { ...image, src }; updateBlock(block.id, { images }); }} />
          <Field label={t('field.caption')} value={image.caption} onChange={(caption) => { const images = [...block.images]; images[index] = { ...image, caption }; updateBlock(block.id, { images }); }} />
        </div>
      ))}
      <button className="soft-button" onClick={() => updateBlock(block.id, { images: [...block.images, { src: '', caption: 'Image caption' }] })}>{t('action.addImage')}</button>
    </>
  );

  if (block.type === 'portfolio') return (
    <>
      <EditorHeader title={t('block.portfolio')} hint={t('editorHint.portfolio')} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      {block.items.map((item, index) => (
        <div className="repeat-row" key={index}>
          <Field label={t('field.title')} value={item.title} onChange={(title) => { const items = [...block.items]; items[index] = { ...item, title }; updateBlock(block.id, { items }); }} />
          <Field label={t('field.category')} value={item.category} onChange={(category) => { const items = [...block.items]; items[index] = { ...item, category }; updateBlock(block.id, { items }); }} />
          <ImageField label={t('field.imageUrl')} value={item.image} onChange={(image) => { const items = [...block.items]; items[index] = { ...item, image }; updateBlock(block.id, { items }); }} />
          <Field label={t('field.text')} value={item.text} textarea onChange={(text) => { const items = [...block.items]; items[index] = { ...item, text }; updateBlock(block.id, { items }); }} />
        </div>
      ))}
      <button className="soft-button" onClick={() => updateBlock(block.id, { items: [...block.items, { title: 'Project', category: 'Category', image: '', text: 'Short project story.' }] })}>{t('action.addProject')}</button>
    </>
  );

  if (block.type === 'video') return (
    <>
      <EditorHeader title={t('block.video')} hint={t('editorHint.video')} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      <Field label={t('field.text')} value={block.text} textarea onChange={(text) => updateBlock(block.id, { text })} />
      <Field label={t('field.videoUrl')} value={block.url} onChange={(url) => updateBlock(block.id, { url })} />
      <Field label={t('field.posterUrl')} value={block.poster} onChange={(poster) => updateBlock(block.id, { poster })} />
    </>
  );

  if (block.type === 'form') return (
    <>
      <EditorHeader title={t('block.form')} hint={t('editorHint.form')} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      <Field label={t('field.text')} value={block.text} textarea onChange={(text) => updateBlock(block.id, { text })} />
      <Field label={t('field.submitLabel')} value={block.submitLabel} onChange={(submitLabel) => updateBlock(block.id, { submitLabel })} />
      {block.fields.map((field, index) => (
        <div className="repeat-row form-field-row" key={index}>
          <Field label={t('field.label')} value={field.label} onChange={(label) => { const fields = [...block.fields]; fields[index] = { ...field, label }; updateBlock(block.id, { fields }); }} />
          <label className="field">
            <span>{t('field.type')}</span>
            <select value={field.kind} onChange={(e) => { const fields = [...block.fields]; fields[index] = { ...field, kind: e.target.value as typeof field.kind }; updateBlock(block.id, { fields }); }}>
              <option value="text">{t('formField.text')}</option>
              <option value="email">{t('formField.email')}</option>
              <option value="tel">{t('formField.tel')}</option>
              <option value="textarea">{t('formField.textarea')}</option>
            </select>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={field.required} onChange={(e) => { const fields = [...block.fields]; fields[index] = { ...field, required: e.target.checked }; updateBlock(block.id, { fields }); }} />
            {t('field.required')}
          </label>
        </div>
      ))}
      <button className="soft-button" onClick={() => updateBlock(block.id, { fields: [...block.fields, { label: 'New field', kind: 'text', required: false }] })}>{t('action.addField')}</button>
    </>
  );

  if (block.type === 'sidebar') return (
    <>
      <EditorHeader title={t('block.sidebar')} hint={t('editorHint.sidebar')} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      <div className="field">
        <span>{t('field.position')}</span>
        <select value={block.position} onChange={(e) => updateBlock(block.id, { position: e.target.value as 'left' | 'right' })}>
          <option value="right">{t('sidebar.right')}</option>
          <option value="left">{t('sidebar.left')}</option>
        </select>
      </div>
      {block.widgets.map((widget, index) => (
        <div className="repeat-row" key={widget.id}>
          <Field label={t('field.widgetHeading')} value={widget.heading} onChange={(heading) => { const widgets = [...block.widgets]; widgets[index] = { ...widget, heading }; updateBlock(block.id, { widgets }); }} />
          <div className="field">
            <span>{t('field.widgetKind')}</span>
            <select value={widget.kind} onChange={(e) => { const widgets = [...block.widgets]; widgets[index] = { ...widget, kind: e.target.value as SidebarWidget['kind'] }; updateBlock(block.id, { widgets }); }}>
              <option value="text">{t('sidebarWidget.text')}</option>
              <option value="links">{t('sidebarWidget.links')}</option>
            </select>
          </div>
          <Field label={widget.kind === 'links' ? `${t('field.widgetBody')} (Label | URL per line)` : t('field.widgetBody')} value={widget.body} textarea onChange={(body) => { const widgets = [...block.widgets]; widgets[index] = { ...widget, body }; updateBlock(block.id, { widgets }); }} />
        </div>
      ))}
      <button className="soft-button" onClick={() => { const w: SidebarWidget = { id: `w-${crypto.randomUUID().slice(0, 8)}`, kind: 'text', heading: 'Widget', body: 'Widget content.' }; updateBlock(block.id, { widgets: [...block.widgets, w] }); }}>{t('action.addWidget')}</button>
    </>
  );

  const itemLabels = block.type === 'services' ? [t('field.title'), t('field.text')] : block.type === 'testimonials' ? [t('field.name'), t('field.text')] : [t('field.question'), t('field.answer')];
  return (
    <>
      <EditorHeader title={t(`block.${block.type}` as MessageKey)} hint={t(`editorHint.${block.type}` as MessageKey)} />
      <Field label={t('field.title')} value={block.title} onChange={(title) => updateBlock(block.id, { title })} />
      {block.items.map((item, index) => (
        <div className="repeat-row" key={index}>
          {Object.entries(item).map(([key, value], fieldIndex) => (
            <Field key={key} label={itemLabels[fieldIndex]} value={value} textarea={fieldIndex === 1} onChange={(nextValue) => { const items = [...block.items] as Array<Record<string, string>>; items[index] = { ...items[index], [key]: nextValue }; updateBlock(block.id, { items } as Partial<SiteBlock>); }} />
          ))}
        </div>
      ))}
      <button className="soft-button" onClick={() => { const empty = block.type === 'services' ? { title: 'Service', text: 'Short description.' } : block.type === 'testimonials' ? { name: 'Client', text: 'A short review.' } : { q: 'Question?', a: 'Answer.' }; updateBlock(block.id, { items: [...block.items, empty] } as Partial<SiteBlock>); }}>{t('action.addItem')}</button>
    </>
  );
}

function EditorHeader({ title, hint }: { title: string; hint: string }) {
  return <div className="editor-header"><h2>{title}</h2><p>{hint}</p></div>;
}

function SeoCard({ site }: { site: SiteContent }) {
  return (
    <div className="panel search-card">
      <span>Search preview</span>
      <strong>{site.seo.title}</strong>
      <small>{site.baseUrl}</small>
      <p>{site.seo.description}</p>
    </div>
  );
}

export default function App() {
  const [site, setSite] = useState<SiteContent>(loadSite);
  const [locale, setLocale] = useState<Locale>(() => (localStorage.getItem(localeStorageKey) as Locale) || 'en');
  const [selectedId, setSelectedId] = useState(site.blocks[0]?.id ?? '');
  const [activePageId, setActivePageId] = useState(site.pages[0]?.id ?? 'home');
  const [activeMenu, setActiveMenu] = useState<MenuItem>('content');
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messages = dictionaries[locale];
  const t = (key: MessageKey, params: Record<string, string | number> = {}) => translate(messages, key, params);
  const activePage = useMemo(() => site.pages.find((p) => p.id === activePageId) ?? site.pages[0], [activePageId, site.pages]);
  const selectedBlock = useMemo(() => activePage?.blocks.find((b) => b.id === selectedId), [activePage?.blocks, selectedId]);
  const json = useMemo(() => JSON.stringify(site, null, 2), [site]);
  const currentBlocks = activePage?.blocks ?? [];

  function updateSite(next: SiteContent) {
    const homePage = next.pages.find((p) => p.id === 'home') ?? next.pages[0];
    const normalized = { ...next, blocks: homePage?.blocks ?? next.blocks };
    setSite(normalized);
    localStorage.setItem(storageKey, JSON.stringify(normalized));
  }

  function updateActivePage(patch: Partial<PageContent>) {
    updateSite({ ...site, pages: site.pages.map((p) => (p.id === activePageId ? { ...p, ...patch } : p)) });
  }

  function updateActivePageBlocks(blocks: SiteBlock[]) { updateActivePage({ blocks }); }

  function updateBlock(id: string, patch: Partial<SiteBlock>) {
    updateActivePageBlocks(currentBlocks.map((b) => (b.id === id ? ({ ...b, ...patch } as SiteBlock) : b)));
  }

  function addBlock(type: BlockType) {
    const block = createBlock(type);
    updateActivePageBlocks([...currentBlocks, block]);
    setSelectedId(block.id);
    setActiveMenu('content');
  }

  function addPage() {
    const title = `Page ${site.pages.length + 1}`;
    const page: PageContent = { id: `page-${crypto.randomUUID().slice(0, 8)}`, title, slug: slugify(title), blocks: [createBlock('hero'), createBlock('contact')] };
    updateSite({ ...site, pages: [...site.pages, page] });
    setActivePageId(page.id);
    setSelectedId(page.blocks[0].id);
  }

  function reorderBlocks(fromId: string, toId: string) {
    if (fromId === toId) return;
    const fromIndex = currentBlocks.findIndex((b) => b.id === fromId);
    const toIndex = currentBlocks.findIndex((b) => b.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const blocks = [...currentBlocks];
    const [block] = blocks.splice(fromIndex, 1);
    blocks.splice(toIndex, 0, block);
    updateActivePageBlocks(blocks);
  }

  function moveBlock(id: string, direction: -1 | 1) {
    const index = currentBlocks.findIndex((b) => b.id === id);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentBlocks.length) return;
    const blocks = [...currentBlocks];
    const [block] = blocks.splice(index, 1);
    blocks.splice(nextIndex, 0, block);
    updateActivePageBlocks(blocks);
  }

  function removeBlock(id: string) {
    const blocks = currentBlocks.filter((b) => b.id !== id);
    updateActivePageBlocks(blocks);
    setSelectedId(blocks[0]?.id ?? '');
  }

  function downloadJson() {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'site.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  function changeLocale(nextLocale: Locale) {
    setLocale(nextLocale);
    localStorage.setItem(localeStorageKey, nextLocale);
  }

  function restoreDemo() {
    updateSite(initialSite);
    setActivePageId(initialSite.pages[0]?.id ?? 'home');
    setSelectedId(initialSite.pages[0]?.blocks[0]?.id ?? '');
    setActiveMenu('content');
  }

  function closeSidebar() { setSidebarOpen(false); }

  return (
    <div className={previewCollapsed ? 'app-shell preview-collapsed' : 'app-shell'}>
      {sidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar} />}

      <aside className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <button className="sidebar-close-btn" onClick={closeSidebar}>✕</button>
        <div className="brand">
          <img src="/weblogo.jpg" className="brand-logo-img" alt="" />

        </div>
        <nav className="app-menu" aria-label="Builder sections">
          {menuItems.map((item) => (
            <button className={activeMenu === item ? 'active' : ''} key={item} onClick={() => { setActiveMenu(item); closeSidebar(); }}>
              {t(`menu.${item}` as MessageKey)}
            </button>
          ))}
        </nav>
        <section className="panel language-panel">
          <h2>{t('language.label')}</h2>
          <div className="segmented">
            <button className={locale === 'en' ? 'active' : ''} onClick={() => changeLocale('en')}>{t('language.en')}</button>
            <button className={locale === 'ru' ? 'active' : ''} onClick={() => changeLocale('ru')}>{t('language.ru')}</button>
          </div>
        </section>
      </aside>

      <main className="workspace">
        <section className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="hamburger-btn" onClick={() => setSidebarOpen(true)} aria-label="Open menu">☰</button>
            <div>
              <h2>{t(`menu.${activeMenu}` as MessageKey)}</h2>
              <p>{activeMenu === 'content' ? t('blocks.saved', { count: currentBlocks.length }) : t(`menuHelp.${activeMenu}` as MessageKey)}</p>
            </div>
          </div>
          <button className="ghost-button" onClick={() => setPreviewCollapsed((c) => !c)}>
            {previewCollapsed ? t('action.showPreview') : t('action.hidePreview')}
          </button>
        </section>

        {activeMenu === 'content' && (
          <section className="builder-grid">
            <div className="block-list">
              <div className="page-panel panel">
                <div className="mini-header">
                  <h2>{t('section.pages')}</h2>
                  <button onClick={addPage}>{t('action.addPage')}</button>
                </div>
                <div className="page-tabs">
                  {site.pages.map((page) => (
                    <button className={page.id === activePageId ? 'active' : ''} key={page.id} onClick={() => { setActivePageId(page.id); setSelectedId(page.blocks[0]?.id ?? ''); }}>
                      {page.title}
                    </button>
                  ))}
                </div>
                {activePage && (
                  <>
                    <div className="page-fields">
                      <Field label={t('field.pageTitle')} value={activePage.title} onChange={(title) => updateActivePage({ title })} />
                      <Field label={t('field.slug')} value={activePage.slug} onChange={(slug) => updateActivePage({ slug: slugify(slug) })} />
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <ColorField label={t('field.pageBgColor')} value={activePage.bgColor ?? ''} onChange={(bgColor) => updateActivePage({ bgColor })} />
                      <ImageField label={t('field.pageBgImage')} value={activePage.bgImage ?? ''} onChange={(bgImage) => updateActivePage({ bgImage })} />
                    </div>
                  </>
                )}
              </div>
              <div className="add-row">
                {blockTypes.map((type) => (
                  <button key={type} onClick={() => addBlock(type)}><span>+</span>{t(`block.${type}` as MessageKey)}</button>
                ))}
              </div>
              <div className="block-stack">
                {currentBlocks.map((block, index) => (
                  <article className={selectedId === block.id ? 'block-card active' : 'block-card'} draggable key={block.id} onDragStart={() => setDraggedId(block.id)} onDragEnd={() => setDraggedId(null)} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (draggedId) reorderBlocks(draggedId, block.id); }}>
                    <button className="drag-handle" aria-label={t('action.dragBlock')}>⠿</button>
                    <button className="block-main" onClick={() => setSelectedId(block.id)}>
                      <span>{index + 1}. {t(`block.${block.type}` as MessageKey)}</span>
                      <strong>{block.title}</strong>
                    </button>
                    <div className="block-actions">
                      <button onClick={() => moveBlock(block.id, -1)} disabled={index === 0}>{t('action.up')}</button>
                      <button onClick={() => moveBlock(block.id, 1)} disabled={index === currentBlocks.length - 1}>{t('action.down')}</button>
                      <button onClick={() => removeBlock(block.id)}>{t('action.delete')}</button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="editor-panel">
              {selectedBlock
                ? <BlockEditor key={selectedBlock.id} block={selectedBlock} updateBlock={updateBlock} t={t} />
                : <p style={{ color: 'var(--sb-muted)', fontSize: 13 }}>{t('empty.selectBlock')}</p>
              }
            </div>
          </section>
        )}

        {activeMenu === 'design' && (
          <section className="settings-grid">
            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div className="panel">
                <h2>{t('section.site')}</h2>
                <Field label={t('field.siteName')} value={site.name} onChange={(name) => updateSite({ ...site, name })} />
                <Field label={t('field.baseUrl')} value={site.baseUrl} onChange={(baseUrl) => updateSite({ ...site, baseUrl })} />
              </div>
              <div className="panel">
                <h2>{t('section.logo')}</h2>
                <ImageField label={t('field.logoUrl')} value={site.logo ?? ''} onChange={(logo) => updateSite({ ...site, logo })} />
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--sb-muted)' }}>{t('field.logoHint')}</p>
              </div>
              <div className="panel">
                <h2>{t('section.pageBg')}</h2>
                <ColorField label={t('field.bgColor')} value={site.bgColor ?? ''} onChange={(bgColor) => updateSite({ ...site, bgColor })} />
                <ImageField label={t('field.bgImage')} value={site.bgImage ?? ''} onChange={(bgImage) => updateSite({ ...site, bgImage })} />
              </div>
            </div>
            <div style={{ display: 'grid', gap: 12, alignContent: 'start' }}>
              <div className="panel">
                <h2>{t('section.theme')}</h2>
                <div className="theme-list">
                  {Object.entries(themes).map(([id, theme]) => (
                    <button className={site.theme === id ? 'theme-choice active' : 'theme-choice'} key={id} onClick={() => updateSite({ ...site, theme: id as SiteContent['theme'] })}>
                      <span><strong>{theme.name}</strong><small>{theme.description}</small></span>
                      <i>{theme.colors.map((color) => <b key={color} style={{ background: color }} />)}</i>
                    </button>
                  ))}
                </div>
              </div>
              <NavEditor site={site} updateSite={updateSite} t={t} />
            </div>
          </section>
        )}

        {activeMenu === 'seo' && (
          <section className="settings-grid">
            <div className="panel">
              <h2>{t('section.seo')}</h2>
              <Field label={t('field.title')} value={site.seo.title} onChange={(title) => updateSite({ ...site, seo: { ...site.seo, title } })} />
              <Field label={t('field.description')} value={site.seo.description} textarea onChange={(description) => updateSite({ ...site, seo: { ...site.seo, description } })} />
              <ImageField label={t('field.ogImage')} value={site.seo.image} onChange={(image) => updateSite({ ...site, seo: { ...site.seo, image } })} />
              <Field label={t('field.keywords')} value={site.seo.keywords} onChange={(keywords) => updateSite({ ...site, seo: { ...site.seo, keywords } })} />
            </div>
            <SeoCard site={site} />
          </section>
        )}

        {activeMenu === 'export' && (
          <section className="settings-grid">
            <div className="panel export-card">
              <h2>{t('export.title')}</h2>
              <p>{t('export.text')}</p>
              <button className="primary" onClick={downloadJson}>{t('action.downloadJson')}</button>
              <button className="soft-button" onClick={restoreDemo}>{t('action.restoreDemo')}</button>
            </div>
            <details className="panel json-panel">
              <summary>{t('section.advancedJson')}</summary>
              <textarea value={json} readOnly rows={12} />
              <p>{t('json.help')}</p>
            </details>
          </section>
        )}
      </main>

      <aside className="preview-pane">
        <div className="preview-toolbar">
          <div>
            <h2>{t('section.preview')}</h2>
            <span>{t('preview.help')}</span>
          </div>
          <button onClick={() => setPreviewCollapsed(true)}>{t('action.collapse')}</button>
        </div>
        {activePage && (
          <SitePreview
            site={{ ...site, blocks: activePage.blocks }}
            page={activePage}
            messages={messages}
            activeBlockId={selectedId}
            onSelectBlock={setSelectedId}
            onUpdateBlock={updateBlock}
            onUpdateSite={(patch) => updateSite({ ...site, ...patch })}
          />
        )}
      </aside>
    </div>
  );
}
