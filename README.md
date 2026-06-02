# Astro Site Builder MVP

Admin app for small atmospheric static sites.

## Included

- React block editor with live preview
- JSON content storage
- English and Russian interface locale files
- SEO fields
- Theme system with three themes
- Astro export script
- Sitemap and schema.org output in the exported Astro project
- Capacitor config for APK packaging

## Commands

```bash
npm run dev
npm run build
npm run export:astro
npm run android:add
npm run android:apk
```

The editor saves content in browser localStorage. Use **Download JSON** and place it into `content/site.json` before running `npm run export:astro`.
