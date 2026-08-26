---
name: frontend-design
description: Use when the user asks to design, style, create UI components, build pages, or any task involving visual/front-end work. Trigger on keywords like: design, style, UI, component, page, layout, theme, color, typography, animation, responsive, RTL, Arabic, hero, section, card, form, modal, header, footer, navigation, sidebar, dashboard, landing. Use ONLY for design and frontend tasks, not for backend/database/API work.
---

# Frontend Design Skill — ذاكرة المناصير

## Project Design System

This project uses **Tailwind CSS v4** + **shadcn/ui (Radix primitives)** + **custom Arabic editorial design tokens**. Every new UI must follow these conventions exactly.

## 1. Color System (oklch)

All colors are defined as oklch in `src/styles.css`. NEVER use raw hex/rgb — always use CSS variables:

| Token | Light | Usage |
|-------|-------|-------|
| `--primary` | `oklch(0.52 0.126 48)` | Main accent (ochre/warm) |
| `--foreground` | `oklch(0.205 0.006 60)` | Body text |
| `--background` | `oklch(0.968 0.008 85)` | Page background (paper ivory) |
| `--card` | `oklch(0.985 0.005 85)` | Card background |
| `--muted` | `oklch(0.94 0.01 82)` | Subtle backgrounds |
| `--muted-foreground` | `oklch(0.485 0.012 68)` | Secondary text |
| `--border` | `oklch(0.885 0.012 82)` | Borders, rules |
| `--gold` | `oklch(0.66 0.095 68)` | Accent highlights |
| `--ink` | `oklch(0.185 0.006 60)` | Dark sections (hero, footer) |
| `--sand` | `oklch(0.905 0.026 80)` | Textured backgrounds |

**Use Tailwind classes**: `bg-primary`, `text-foreground`, `border-border`, `text-muted-foreground`, `bg-ink`, `text-gold`, etc.

## 2. Typography

```css
--font-sans: "IBM Plex Sans Arabic", "Noto Sans Arabic", system-ui, sans-serif;
--font-display: "Noto Kufi Arabic", "IBM Plex Sans Arabic", system-ui, sans-serif;
```

- **Body text**: `font-sans` (IBM Plex Sans Arabic) — use class `font-sans` or default
- **Headings/Display**: `font-display` (Noto Kufi Arabic) — use class `font-display`
- **Always use `text-balance`** for headings longer than 4 words
- **RTL first**: All text is Arabic. Never use `dir="ltr"` except for embedded Latin content

## 3. Component Patterns

### Cards
```tsx
<div className="rounded-lg border border-border bg-card p-4">
  <h3 className="font-display text-lg text-foreground">{title}</h3>
  <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
</div>
```

### Buttons (shadcn/ui)
```tsx
import { Button } from "@/components/ui/button";
<Button variant="default" size="default">نص</Button>
<Button variant="outline" size="sm">صغير</Button>
<Button variant="secondary">ثانوي</Button>
```

### Section Layout
```tsx
<section className="border-b border-border py-20 md:py-28">
  <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
    {/* content */}
  </div>
</section>
```

### Editorial Eyebrow Label
```tsx
<p className="eyebrow mb-4">النص العلوي</p>
```
The `eyebrow` utility renders a small caps-like label with a hairline rule.

### Editorial Page Header
```tsx
import { PageHeader } from "@/components/site/SiteLayout";
<PageHeader eyebrow="التصنيف" title="العنوان الرئيسي" description="وصف مختصر" />
```

### Cards Grid
```tsx
<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

### Hero Section Pattern
```tsx
<section className="relative overflow-hidden bg-ink text-ink-foreground">
  <div className="mx-auto flex min-h-[86vh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-40">
    <p className="eyebrow mb-6 text-gold before:bg-gold">النص العلوي</p>
    <h1 className="font-display text-[18vw] leading-[0.88] tracking-tight text-ink-foreground">
      العنوان الكبير
    </h1>
  </div>
</section>
```

### Reveal Animation (Scroll)
```tsx
import { Reveal } from "@/components/site/Reveal";
<Reveal delay={80}>
  <div>يظهر عند التمرير</div>
</Reveal>
```

### Images
```tsx
import { MediaImage } from "@/components/site/MediaImage";
<MediaImage path={url} alt="وصف" ratio="aspect-[4/3]" />
<MediaImage path={url} alt="وصف" ratio="aspect-square" className="w-28 shrink-0" />
```

### Forms (shadcn/ui)
```tsx
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

<div className="grid gap-3">
  <Label>العنوان</Label>
  <Input value={val} onChange={e => setVal(e.target.value)} />
</div>
```

### Modal / Dialog
```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader><DialogTitle>العنوان</DialogTitle></DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

### Tabs
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
<Tabs defaultValue="tab1" dir="rtl">
  <TabsList>
    <TabsTrigger value="tab1"> aba</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">المحتوى</TabsContent>
</Tabs>
```

## 4. Responsive Breakpoints

- Mobile first: base styles are mobile
- `sm:` = 640px, `md:` = 768px, `lg:` = 1024px, `xl:` = 1280px
- Max content width: `max-w-[1400px]`
- Horizontal padding: `px-5 lg:px-10`
- Section vertical padding: `py-20 md:py-28`

## 5. Spacing & Layout Rules

- **Hairline rules**: Use `border-b border-border` or the `rule` utility
- **Editorial spacing**: Section padding is generous — `py-20 md:py-28`
- **Grid gaps**: `gap-6` to `gap-8` for card grids
- **Stacking**: `grid gap-3` for forms, `grid gap-5` for lists
- **Aspect ratios**: `aspect-[4/3]` for landscape, `aspect-square` for thumbnails, `aspect-[3/4]` for portraits

## 6. Animation Conventions

- **Scroll reveal**: Always wrap sections in `<Reveal>` component
- **Route transitions**: Built-in via `route-fade` utility
- **Image hover**: `group-hover:scale-[1.03]` or `group-hover:scale-[1.05]`
- **Reduced motion**: All animations respect `prefers-reduced-motion: reduce`
- **Duration**: Use `duration-[900ms]` with `ease-[cubic-bezier(0.22,1,0.36,1)]`

## 7. RTL / Arabic Rules

- **Always design RTL-first** — never flip with `ltr` unless embedding English
- **Text alignment**: Use `text-start` or default (no `text-left` or `text-right`)
- **Arrow direction**: Use `ArrowLeft` icon for "forward/next" actions (RTL)
- **Flex direction**: `flex-row` naturally reverses in RTL
- **Padding/Margin**: Use `pl-*` for leading, `pr-*` for trailing in logical properties where possible

## 8. Available shadcn/ui Components

All in `src/components/ui/`:
`accordion`, `alert`, `alert-dialog`, `aspect-ratio`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `collapsible`, `command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `form`, `hover-card`, `input`, `input-otp`, `label`, `menubar`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `toggle`, `toggle-group`, `tooltip`

## 9. Custom Project Components

| Component | Path | Purpose |
|-----------|------|---------|
| `SiteLayout` | `src/components/site/SiteLayout.tsx` | Page wrapper with header/footer |
| `PageHeader` | same | Editorial masthead |
| `MediaImage` | `src/components/site/MediaImage.tsx` | Signed URL images |
| `Reveal` | `src/components/site/Reveal.tsx` | Scroll animations |
| `SiteHeader` | `src/components/site/SiteHeader.tsx` | Navigation |
| `SiteFooter` | `src/components/site/SiteFooter.tsx` | Footer |
| `MemoryMapButton` | `src/components/site/MemoryMapButton.tsx` | Map overlay trigger |
| `CommentsSection` | `src/components/site/CommentsSection.tsx` | Threaded comments |
| `MosaicImage` | `src/components/site/MosaicImage.tsx` | Editorial image layout |

## 10. File Naming Conventions

- **Routes**: `src/routes/page-name.tsx` (kebab-case, matches URL)
- **Components**: `PascalCase.tsx` in appropriate directory
- **Services**: `kebab-case.ts` in `src/lib/services/`
- **Types**: inline or in `src/lib/services/types.ts`

## 11. When Creating New Pages

Always follow this template:

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/page-name")({
  head: () => ({
    meta: [
      { title: "عنوان الصفحة | ذاكرة المناصير" },
      { name: "description", content: "وصف الصفحة" },
      { property: "og:title", content: "عنوان الصفحة | ذاكرة المناصير" },
      { property: "og:description", content: "وصف الصفحة" },
    ],
  }),
  component: PageName,
});

function PageName() {
  return (
    <SiteLayout>
      <PageHeader eyebrow="التصنيف" title="عنوان الصفحة" description="الوصف" />
      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
        {/* محتوى الصفحة */}
      </div>
    </SiteLayout>
  );
}
```

## 12. Accessibility Checklist

- Use semantic HTML: `<section>`, `<article>`, `<nav>`, `<main>`, `<header>`, `<footer>`
- All images must have meaningful `alt` text
- Form inputs must have `<Label>` or `aria-label`
- Interactive elements must be keyboard accessible
- Color contrast: foreground on background must meet WCAG AA (4.5:1)
- Use `focus-visible:outline-2 focus-visible:outline-primary` for focus states
- Add `aria-expanded` to toggle buttons
- Dialog/Modal must trap focus (Radix does this automatically)

## 13. Performance Rules

- Use `loading="lazy"` on images (MediaImage does this by default)
- Use `fetchPriority="high"` only on above-the-fold hero images
- Use `decoding="async"` on all images
- Wrap expensive computations in `useMemo`
- Use `React.lazy()` for route-level code splitting
- Avoid inline styles — use Tailwind classes
- Keep component files under 300 lines — split into subcomponents
