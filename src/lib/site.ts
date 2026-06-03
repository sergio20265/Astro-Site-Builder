export type ThemeId = 'moss' | 'ink' | 'rose' | 'night' | 'cream' | 'ocean';
export type BlockType = 'hero' | 'services' | 'portfolio' | 'gallery' | 'video' | 'testimonials' | 'faq' | 'form' | 'contact' | 'sidebar';
export type AnimationType = 'none' | 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom';
export type PaddingSize = 'compact' | 'normal' | 'spacious';

export type BlockStyle = {
  bgColor?: string;
  bgImage?: string;
  textColor?: string;
  accentColor?: string;
  paddingY?: PaddingSize;
};

export type BlockAnimation = {
  type: AnimationType;
  duration?: number;
  delay?: number;
};

export type SidebarWidget = {
  id: string;
  kind: 'text' | 'links';
  heading: string;
  body: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
};

export type NavGroup = {
  id: string;
  name: string;
  position: 'header' | 'footer';
  items: NavItem[];
};

export type PageContent = {
  id: string;
  title: string;
  slug: string;
  blocks: SiteBlock[];
  bgColor?: string;
  bgImage?: string;
};

export type SiteBlock =
  | { id: string; type: 'hero'; title: string; subtitle: string; cta: string; image: string; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'services'; title: string; items: Array<{ title: string; text: string }>; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'portfolio'; title: string; items: Array<{ title: string; category: string; image: string; text: string }>; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'gallery'; title: string; images: Array<{ src: string; caption: string }>; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'video'; title: string; text: string; url: string; poster: string; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'testimonials'; title: string; items: Array<{ name: string; text: string }>; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'faq'; title: string; items: Array<{ q: string; a: string }>; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'form'; title: string; text: string; submitLabel: string; fields: Array<{ label: string; kind: 'text' | 'email' | 'tel' | 'textarea'; required: boolean }>; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'contact'; title: string; text: string; email: string; phone: string; address: string; style?: BlockStyle; animation?: BlockAnimation }
  | { id: string; type: 'sidebar'; title: string; position: 'left' | 'right'; widgets: SidebarWidget[]; style?: BlockStyle; animation?: BlockAnimation };

export type SiteContent = {
  name: string;
  logo?: string;
  baseUrl: string;
  theme: ThemeId;
  bgColor?: string;
  bgImage?: string;
  navGroups?: NavGroup[];
  seo: {
    title: string;
    description: string;
    image: string;
    keywords: string;
  };
  pages: PageContent[];
  blocks: SiteBlock[];
};

export const themes: Record<ThemeId, { name: string; colors: string[]; description: string }> = {
  moss: {
    name: 'Moss Studio',
    colors: ['#123026', '#d7efe3', '#f4b860', '#fbfaf6'],
    description: 'Quiet editorial mood for studios, cafes, florists.',
  },
  ink: {
    name: 'Ink Bold',
    colors: ['#111111', '#ffffff', '#e94f37', '#f0f0ec'],
    description: 'High contrast with a red punch — portfolios, agencies.',
  },
  rose: {
    name: 'Rose Room',
    colors: ['#402039', '#ffe8ef', '#80b8a2', '#fff9f5'],
    description: 'Warm boutique palette for beauty, events and craft.',
  },
  night: {
    name: 'Dark Night',
    colors: ['#0d1117', '#161b22', '#58a6ff', '#e6edf3'],
    description: 'Sleek dark mode — tech products, apps, dev portfolios.',
  },
  cream: {
    name: 'Warm Cream',
    colors: ['#2d1f0e', '#f5e6d0', '#c0392b', '#fdf8f0'],
    description: 'Rustic warmth for food, craft, artisan and local brands.',
  },
  ocean: {
    name: 'Ocean Blue',
    colors: ['#0a2540', '#dbeeff', '#0077cc', '#f0f7ff'],
    description: 'Clean coastal palette for travel, wellness and lifestyle.',
  },
};

const defaultNavGroups: NavGroup[] = [
  {
    id: 'header-nav',
    name: 'Header',
    position: 'header',
    items: [
      { id: 'nav-services', label: 'Services', href: '#services' },
      { id: 'nav-gallery', label: 'Gallery', href: '#gallery' },
      { id: 'nav-contact', label: 'Contact', href: '#contact' },
    ],
  },
];

export const initialSite: SiteContent = {
  name: 'Moon Fern Studio',
  logo: '',
  baseUrl: 'https://example.com',
  theme: 'moss',
  bgColor: '',
  bgImage: '',
  navGroups: defaultNavGroups,
  seo: {
    title: 'Moon Fern Studio - atmospheric floral workshops',
    description: 'Small botanical studio with floral workshops, styling and quiet seasonal events.',
    image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946',
    keywords: 'floral studio, workshops, flowers, local business',
  },
  blocks: [
    { id: 'hero-1', type: 'hero', title: 'Atmospheric sites for small places with a soul', subtitle: 'Build a polished static website from simple blocks, JSON content and a theme.', cta: 'Book a visit', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946' },
    { id: 'services-1', type: 'services', title: 'Services', items: [{ title: 'Workshops', text: 'Seasonal classes for small groups.' }, { title: 'Styling', text: 'Atmospheric corners for events and stores.' }, { title: 'Bouquets', text: 'Textured arrangements by pre-order.' }] },
    { id: 'gallery-1', type: 'gallery', title: 'Gallery', images: [{ src: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d', caption: 'Table details' }, { src: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321', caption: 'Seasonal flowers' }, { src: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9', caption: 'Studio corner' }] },
    { id: 'portfolio-1', type: 'portfolio', title: 'Portfolio', items: [{ title: 'Evening workshop', category: 'Events', image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9', text: 'A soft botanical setup for a small seasonal gathering.' }, { title: 'Boutique corner', category: 'Retail', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d', text: 'Window and table styling for a neighborhood shop.' }] },
    { id: 'video-1', type: 'video', title: 'Studio mood', text: 'Show visitors a short walkthrough, client story, or atmosphere reel.', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', poster: '' },
    { id: 'testimonials-1', type: 'testimonials', title: 'Kind words', items: [{ name: 'Alina', text: 'The site feels handmade and very easy to update.' }, { name: 'Mika', text: 'A calm visual style without losing useful details.' }] },
    { id: 'faq-1', type: 'faq', title: 'FAQ', items: [{ q: 'Can I edit content later?', a: 'Yes, content is stored in JSON and can be changed from the admin UI.' }, { q: 'Is the result static?', a: 'Yes, export creates a static Astro project ready for deployment.' }] },
    { id: 'form-1', type: 'form', title: 'Request a booking', text: 'Leave a few details and we will reply with available dates.', submitLabel: 'Send request', fields: [{ label: 'Name', kind: 'text', required: true }, { label: 'Email', kind: 'email', required: true }, { label: 'Message', kind: 'textarea', required: false }] },
    { id: 'contact-1', type: 'contact', title: 'Contact', text: 'Tell us about your place and the mood you want visitors to feel.', email: 'hello@example.com', phone: '+1 555 0100', address: '12 Garden Lane' },
  ],
  pages: [],
};

initialSite.pages = [
  { id: 'home', title: 'Home', slug: '/', blocks: initialSite.blocks },
  { id: 'portfolio-page', title: 'Portfolio', slug: 'portfolio', blocks: [initialSite.blocks.find((b) => b.type === 'hero')!, initialSite.blocks.find((b) => b.type === 'portfolio')!, initialSite.blocks.find((b) => b.type === 'contact')!] },
];

export function createBlock(type: BlockType): SiteBlock {
  const id = `${type}-${crypto.randomUUID().slice(0, 8)}`;
  switch (type) {
    case 'hero': return { id, type, title: 'New hero', subtitle: 'A short atmospheric intro.', cta: 'Contact us', image: '' };
    case 'services': return { id, type, title: 'Services', items: [{ title: 'Service', text: 'Short description.' }] };
    case 'portfolio': return { id, type, title: 'Portfolio', items: [{ title: 'Project', category: 'Category', image: '', text: 'Short project story.' }] };
    case 'gallery': return { id, type, title: 'Gallery', images: [{ src: '', caption: 'Image caption' }] };
    case 'video': return { id, type, title: 'Video', text: 'Add a YouTube, Vimeo, or direct video URL.', url: '', poster: '' };
    case 'testimonials': return { id, type, title: 'Reviews', items: [{ name: 'Client', text: 'A short review.' }] };
    case 'faq': return { id, type, title: 'FAQ', items: [{ q: 'Question?', a: 'Answer.' }] };
    case 'form': return { id, type, title: 'Contact form', text: 'Ask visitors for the details you need.', submitLabel: 'Send', fields: [{ label: 'Name', kind: 'text', required: true }, { label: 'Email', kind: 'email', required: true }] };
    case 'contact': return { id, type, title: 'Contact', text: 'Write to us.', email: '', phone: '', address: '' };
    case 'sidebar': return { id, type, title: 'Sidebar', position: 'right', widgets: [{ id: `w-${crypto.randomUUID().slice(0, 8)}`, kind: 'text', heading: 'About', body: 'A short description for this sidebar.' }, { id: `w-${crypto.randomUUID().slice(0, 8)}`, kind: 'links', heading: 'Quick links', body: 'Home | /\nAbout | /about\nContact | /contact' }] };
  }
}
