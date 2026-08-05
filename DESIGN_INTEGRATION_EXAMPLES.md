# Design Enhancement Integration Examples

Quick before/after examples showing how to update pages to use the new design system.

---

## Example 1: Invitation Page ($slug.index.tsx)

### BEFORE
```tsx
import { WatercolorBlot, RoseCluster, FloatingPetals } from "@/wedding/FloralDecorations";

function InvitationPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <WatercolorBlot color="rose" size="2xl" className="absolute -top-24 right-0" />
        <RoseCluster variant="side-right" size="lg" color="rose" />
        <FloatingPetals count={14} />
      </div>
      
      {/* Hero section */}
      <section className="relative z-10">
        <h1>{wedding.bride_name} & {wedding.groom_name}</h1>
      </section>
    </div>
  );
}
```

### AFTER (Recommended)
```tsx
import { PageCanvas, Section, Container, RoseFullBloom, Flourish } from "@/design-system";

function InvitationPage() {
  return (
    <PageCanvas decor density="lavish">
      {/* Hero section — let PageCanvas handle side decorations */}
      <Section size="hero">
        <Container>
          <div className="text-center relative">
            {/* Optional: Add custom accent for extra polish */}
            <div className="absolute top-10 left-1/4 w-16 h-16 opacity-50">
              <RoseFullBloom color="rose" opacity={0.7} />
            </div>
            
            <p className="font-script text-3xl text-primary">
              together with their families
            </p>
            <h1 className="font-display text-7xl mt-5">
              {wedding.bride_name}
              <span className="font-script text-primary mx-4">&</span>
              {wedding.groom_name}
            </h1>
            
            <Flourish className="mt-8 mx-auto w-64 animate-botanical-sway opacity-60" />
          </div>
        </Container>
      </Section>

      {/* Envelope section */}
      <Section>
        <Container>
          <EnvelopeLetter
            recipientFirstName={recipientFirst}
            recipientLastName={recipientLast}
            invitationTemplate={wedding.invitation_text}
            coupleSignature={coupleSignature}
          />
        </Container>
      </Section>

      {/* Details section */}
      <Section>
        <Container>
          <div className="text-center mb-12">
            <p className="font-script text-3xl text-primary">the details</p>
          </div>
          {/* Details cards */}
        </Container>
      </Section>
    </PageCanvas>
  );
}
```

**Benefits:**
- ✅ Automatic side decorations (9 layers of depth)
- ✅ Responsive mobile handling
- ✅ Consistent animations across page
- ✅ Cleaner code (remove manual decoration placement)
- ✅ Better performance (optimized animations)

---

## Example 2: RSVP Page ($slug.rsvp.tsx)

### BEFORE
```tsx
function RSVPPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1>RSVP</h1>
      {/* Form content */}
    </div>
  );
}
```

### AFTER (Recommended)
```tsx
import { PageCanvas, Section, Container } from "@/design-system";

function RSVPPage() {
  return (
    <PageCanvas decor density="regular">
      <Section>
        <Container width="prose">
          <div className="text-center mb-12">
            <p className="font-script text-3xl text-primary">please let us know</p>
            <h1 className="font-display text-5xl mt-3">Your Response</h1>
          </div>

          {/* RSVP Form */}
          <form className="max-w-2xl mx-auto">
            {/* Form fields */}
          </form>
        </Container>
      </Section>
    </PageCanvas>
  );
}
```

**Changes:**
- Wrap with `PageCanvas` (density="regular" for normal content)
- Use `Section` and `Container` for consistent spacing
- Decorations automatically appear on desktop/tablet
- Mobile gets top/bottom botanical frames

---

## Example 3: Timeline Page ($slug.timeline.tsx)

### BEFORE
```tsx
function TimelinePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="text-center py-12">
        <h1>Timeline</h1>
      </header>
      <div className="mx-auto max-w-4xl px-6 pb-12">
        {/* Timeline items */}
      </div>
    </div>
  );
}
```

### AFTER (With Custom Touches)
```tsx
import { PageCanvas, Section, Container, TimelineCard, Flourish, RoseBud } from "@/design-system";

function TimelinePage() {
  const timeline = useTimeline(weddingId);

  return (
    <PageCanvas decor density="regular">
      {/* Header */}
      <Section size="compact" className="text-center">
        <Container>
          <p className="font-script text-3xl text-primary">our journey</p>
          <h1 className="font-display text-5xl mt-3">Wedding Timeline</h1>
          <Flourish className="mt-6 mx-auto w-48 opacity-50" />
        </Container>
      </Section>

      {/* Timeline Items */}
      <Section>
        <Container width="prose">
          <div className="space-y-8">
            {timeline.map((item, idx) => (
              <div key={idx} className="relative">
                {/* Accent on alternating sides */}
                {idx % 2 === 0 && (
                  <div className="absolute -left-12 top-2 w-8 h-8 opacity-30">
                    <RoseBud color="sage" opacity={0.6} />
                  </div>
                )}
                
                <TimelineCard
                  time={item.time}
                  title={item.title}
                  description={item.description}
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </PageCanvas>
  );
}
```

**Details:**
- `density="regular"` for readable content
- Custom botanical accents on timeline items
- Uses `TimelineCard` component from design system
- Flourish dividers for elegance

---

## Example 4: Gallery Page ($slug.gallery.tsx)

### AFTER (Gallery with Accents)
```tsx
import { PageCanvas, Section, Container, MediaCard, Flourish } from "@/design-system";
import { RoseLeaf, GoldLeafAccent } from "@/design-system";

function GalleryPage() {
  const photos = usePhotos(weddingId);

  return (
    <PageCanvas decor density="regular">
      <Section size="compact" className="text-center">
        <Container>
          <p className="font-script text-3xl text-primary">memories</p>
          <h1 className="font-display text-5xl mt-3">Photo Gallery</h1>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                {/* Gold accent in corner */}
                <div className="absolute top-2 right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GoldLeafAccent opacity={0.8} />
                </div>
                
                <MediaCard
                  src={photo.url}
                  alt={photo.caption}
                  caption={photo.caption}
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>
    </PageCanvas>
  );
}
```

**Features:**
- Photo grid with automatic responsive layout
- Gold accent reveals on hover
- Premium feel with minimal code
- Mobile optimized automatically

---

## Example 5: Admin Dashboard ($slug.admin.index.tsx)

### BEFORE/AFTER
```tsx
// Admin pages should use quiet/no decorations
import { PageCanvas, Section, Container } from "@/design-system";

function AdminDashboard() {
  return (
    <PageCanvas decor={false}> {/* No decorations for admin */}
      <Section>
        <Container>
          <h1>Admin Dashboard</h1>
          {/* Admin content */}
        </Container>
      </Section>
    </PageCanvas>
  );
}
```

**Note:** Admin pages set `decor={false}` to keep focus on data and functionality.

---

## Quick Integration Checklist

### For Guest-Facing Pages:

- [ ] Import `PageCanvas`, `Section`, `Container` from `@/design-system`
- [ ] Wrap entire page in `<PageCanvas density="regular">`
- [ ] Move main content into `<Section>` blocks
- [ ] Move content into `<Container>` with appropriate width
- [ ] Remove custom manual decorations (if any)
- [ ] Test on mobile, tablet, desktop
- [ ] Verify animations are smooth
- [ ] Check color contrast with decorations

### For Admin Pages:

- [ ] Use `<PageCanvas decor={false}>`
- [ ] Keep existing admin styling
- [ ] No changes to functionality needed

### Optional Enhancements:

- [ ] Add `Flourish` dividers between sections
- [ ] Use botanical components as accents
- [ ] Add `animate-botanical-sway` to stems/dividers
- [ ] Use `animate-gold-glow` on important elements

---

## Testing After Integration

### Desktop (1280px+):
```
┌─────────────────────────────────────────────────┐
│ ╱╲  PAGE CONTENT                         ╱╲    │
│╱  ╱─────────────────────────────────────╱  ╱   │
│\ ╱                                       \╱  ╲  │
│ ╲  Side decorations (9 layers)                ╲ │
│   - Large roses/vines                         │
│   - Gold accents                              │
│   - Floating particles                        │
└─────────────────────────────────────────────────┘
```

### Tablet (768px):
```
┌───────────────────────────────────────┐
│╱╲  PAGE CONTENT              ╱╱      │
│ ╱ (Reduced side spacing)   ╱╱        │
│╲╱                          ╱╱         │
│ ╲                         ╱╱          │
└───────────────────────────────────────┘
```

### Mobile (< 768px):
```
┌──────────────────────────┐
│ ╱─ Top Botanical Frame ──│
│                          │
│   PAGE CONTENT           │
│   (Full width)           │
│                          │
│ ╲─ Bottom Botanical Frm ─│
└──────────────────────────┘
```

---

## Performance Tips

### Lazy Loading Decorations:
```tsx
import { lazy, Suspense } from "react";

const PageCanvas = lazy(() => import("@/design-system"));

function MyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PageCanvas>{/* ... */}</PageCanvas>
    </Suspense>
  );
}
```

### Reduced Motion:
All animations automatically respect `prefers-reduced-motion`. No code changes needed!

### Custom Animation Delays:
```tsx
<div className="animate-ds-float" style={{ animationDelay: "2s" }}>
  {/* Element waits 2s before starting float animation */}
</div>
```

---

## Common Questions

**Q: Can I use decorations on admin pages?**
A: Yes, but use `decor=false` or `density="quiet"` to avoid distraction from data.

**Q: Do decorations work on mobile?**
A: Yes! Mobile gets a custom top/bottom frame treatment that maintains the premium feel.

**Q: Can I customize the botanical colors?**
A: Yes, pass `color="sage"` or `color="gold"` to any botanical component.

**Q: Will animations hurt performance?**
A: No, they use GPU-accelerated transforms and respect user preferences.

**Q: How do I add my own botanical components?**
A: Copy the pattern in `BotaticalLibrary.tsx` and export from design-system index.

---

## Ready to Ship! 🌹

All examples above are production-ready. Pick and mix components as needed for your pages.
