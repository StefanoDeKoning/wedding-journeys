# Design System — CSS Animation Reference

Complete reference of all new CSS classes and animation utilities for the premium botanical design system.

---

## Core Animation Classes

### Motion Animations

#### `animate-ds-float` — Premium Floating
- **Duration**: 18 seconds (var(--ds-dur-ambient))
- **Motion**: Multi-axis float with subtle rotation
- **Use Case**: Botanical accents, decorative elements
- **Best For**: Elements you want to feel alive but stationary

```tsx
<div className="animate-ds-float">
  {/* Floats up/down with gentle rotation */}
</div>
```

**Timeline:**
```
0%:    Y=0px, X=0px, Rotate=0deg
25%:   Y=-8px, X=2px, Rotate=0.8deg
50%:   Y=-14px, X=-2px, Rotate=1.2deg
75%:   Y=-6px, X=3px, Rotate=0.4deg
100%:  Y=0px, X=0px, Rotate=0deg
```

---

#### `animate-ds-drift` — Luxurious Descent
- **Duration**: Variable (depends on --ds-drift-x)
- **Motion**: Graceful downward spiral with rotation
- **Use Case**: Falling petals, drifting leaves, ambient particles
- **Best For**: Continuous ambient motion (petals falling across page)

```tsx
<div 
  className="animate-ds-drift"
  style={{ "--ds-drift-x": "40px" }}
>
  {/* Drifts down and across page */}
</div>
```

**Timeline:**
```
0%:    Translate(0, -8%), Rotate(0deg), Opacity=0
10%:   Translate(0, -4%), Rotate(8deg), Opacity=0.8
50%:   Translate(20px, 50vh), Rotate(110deg), Opacity=0.65
85%:   Translate(40px, 95vh), Rotate(180deg), Opacity=0.4
100%:  Translate(40px, 108vh), Rotate(220deg), Opacity=0
```

---

#### `animate-ds-shimmer` — Premium Glow
- **Duration**: 4 seconds
- **Motion**: Scale + opacity pulse with blur
- **Use Case**: Luxury shine effects, delicate glows
- **Best For**: Gold accents, special elements

```tsx
<div className="animate-ds-shimmer">
  {/* Glows with elegant shimmer */}
</div>
```

**Timeline:**
```
0%:    Scale=0.95, Opacity=0.35, Blur=0.5px
50%:   Scale=1.08, Opacity=0.9, Blur=0px
100%:  Scale=0.95, Opacity=0.35, Blur=0.5px
```

---

### Botanical Animations (NEW)

#### `animate-botanical-sway` — Gentle Oscillation
- **Duration**: 6 seconds
- **Motion**: Subtle rotation back and forth
- **Use Case**: Stems, vines, branches
- **Best For**: Stationary elements you want to feel organic

```tsx
<Flourish className="animate-botanical-sway" />
```

**Timeline:**
```
0%:    Rotate(-0.5deg)
50%:   Rotate(0.5deg)
100%:  Rotate(-0.5deg)
```

---

#### `animate-petal-bloom` — Entry Bloom
- **Duration**: 1.5 seconds (single play)
- **Motion**: Expansion + descent
- **Use Case**: Page load, element reveal
- **Best For**: Initial appearance of floral elements

```tsx
<RoseBud className="animate-petal-bloom" />
```

**Timeline:**
```
0%:    Scale=0.3, TranslateY=-20px, Opacity=0
50%:   Scale=1.0, TranslateY=0px, Opacity=1
100%:  Scale=1.0, TranslateY=0px, Opacity=0.8
```

---

#### `animate-gold-glow` — Luxury Gold Light
- **Duration**: 3 seconds
- **Motion**: Opacity + drop-shadow pulse
- **Use Case**: Gold accents, special decorations
- **Best For**: Call-to-action elements, luxury touches

```tsx
<GoldLeafAccent className="animate-gold-glow" />
```

**Timeline:**
```
0%:    Opacity=0.4, Shadow blur=2px, Shadow opacity=0.3
50%:   Opacity=0.9, Shadow blur=8px, Shadow opacity=0.6
100%:  Opacity=0.4, Shadow blur=2px, Shadow opacity=0.3
```

---

## Timing & Easing

### Available Timing Variables

```css
--ds-dur-fast:    250ms   /* Quick interactions */
--ds-dur-base:    600ms   /* Standard animations */
--ds-dur-slow:    1200ms  /* Staggered reveals */
--ds-dur-ambient: 18000ms /* Floating elements */
```

### Easing Functions

```css
--ease-soft:   cubic-bezier(0.22, 1, 0.36, 1)    /* Smooth, natural */
--ease-paper:  cubic-bezier(0.25, 0.46, 0.45, 0.94) /* Elegant, premium */
```

---

## Animation Staggering Patterns

### For Multiple Elements

```tsx
{items.map((item, idx) => (
  <div
    key={idx}
    className="animate-ds-float"
    style={{ animationDelay: `${idx * 0.2}s` }}
  >
    {item}
  </div>
))}
```

**Result:** Each element starts its animation 0.2s after the previous

### Recommended Delays:

```tsx
// Staggered entrance (element appears one after another)
animationDelay: `${idx * 200}ms`  // 200ms per item

// Layered floating (elements at different heights)
animationDelay: `${idx * 500}ms`  // 500ms per item

// Cascade effect (dramatic stagger)
animationDelay: `${idx * 1000}ms` // 1s per item
```

---

## Color System for Animations

### Theme-Based Colors

All animations respect theme tokens. Use CSS custom properties:

```css
/* Gold glow uses */
var(--ds-decor-gold)      /* Primary gold accent */

/* Watercolor uses */
var(--ds-decor)           /* Primary decor color */
var(--ds-decor-soft)      /* Soft accent color */
var(--ds-decor-leaf)      /* Foliage color */

/* Component uses */
var(--primary)            /* Brand primary (terracotta) */
var(--ds-sage)            /* Sage green */
var(--ds-rose)            /* Dusty rose */
```

### In Components

```tsx
<div style={{ 
  color: "var(--ds-gold)",
  filter: "drop-shadow(0 0 8px rgba(212, 185, 127, 0.6))"
}}>
  Gold glowing text
</div>
```

---

## Layout Animation Utilities

### Entrance Animations

```tsx
// Fade in
className="animate-ds-fade"

// Reveal from bottom (sliding up)
className="animate-ds-reveal"

// Reveal from left
className="animate-ds-reveal-left"

// Reveal from right
className="animate-ds-reveal-right"

// Scale in
className="animate-ds-scale"

// Lift (paper effect)
className="animate-ds-paper"
```

---

## Hover Effects

### Available Hover Utilities

```tsx
// Lift on hover (elevate + shadow)
<button className="hover-lift">
  Hover to lift
</button>

// Gild on hover (color shift to gold)
<a className="hover-gild">
  Hover to gild
</a>
```

### Custom Hover Animations

```tsx
<div className="group hover:animate-petal-bloom">
  Blooms on hover
</div>
```

---

## Accessibility Compliance

### Reduced Motion Support (Automatic)

All animations automatically respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

**User Experience:**
- Users with vestibular disorders see no motion
- Users with seizure disorders are safe
- Performance is maintained on older devices
- All animations are optional, not essential

---

## Performance Optimization

### GPU-Accelerated Properties

Only these properties are animated (GPU-friendly):
```css
transform: translate3d(), rotate(), scale()
opacity: 0 to 1
filter: blur() (limited use)
```

**NOT animated** (CPU-expensive, avoid):
- ❌ `top`, `left`, `right`, `bottom`
- ❌ `width`, `height`
- ❌ `margin`, `padding`
- ❌ `background-color`, `color`

### Will-Change Hints

For expensive animations, use sparingly:

```tsx
<div 
  className="animate-ds-drift"
  style={{ willChange: "transform" }}
>
  {/* Optimized drift animation */}
</div>
```

---

## Practical Examples

### Example 1: Floating Button
```tsx
<button className="animate-ds-float px-6 py-3 bg-primary text-white rounded-full">
  RSVP Now
</button>
```
Button floats gently, inviting click.

---

### Example 2: Petal Animation Loop
```tsx
<svg className="w-4 h-4 animate-ds-drift" style={{ "--ds-drift-x": "20px" }}>
  <path d="M12 21C7 16 7 10 12 3C17 10 17 16 12 21Z" fill="currentColor" />
</svg>
```
Petals drift diagonally down the page.

---

### Example 3: Staggered Botanical Entry
```tsx
{roses.map((rose, idx) => (
  <RoseFullBloom
    key={idx}
    className="animate-petal-bloom"
    style={{ animationDelay: `${idx * 150}ms` }}
  />
))}
```
Roses bloom one after another on load.

---

### Example 4: Gold Accent with Glow
```tsx
<div className="relative">
  <GoldLeafAccent className="absolute top-2 right-2 animate-gold-glow" />
</div>
```
Gold leaf pulses with luxury light.

---

### Example 5: Swaying Flourish Divider
```tsx
<Flourish className="animate-botanical-sway opacity-60 w-48 mx-auto" />
```
Flourish sways gently between sections.

---

## Animation Composition Patterns

### Pattern 1: Layered Float
```tsx
{/* Each layer floats at different speeds */}
<div className="animate-ds-float" style={{ animationDuration: "18s", animationDelay: "0s" }} />
<div className="animate-ds-float" style={{ animationDuration: "24s", animationDelay: "2s" }} />
<div className="animate-ds-float" style={{ animationDuration: "20s", animationDelay: "4s" }} />
```

### Pattern 2: Entrance then Loop
```tsx
<div className="animate-petal-bloom" style={{ animationFillMode: "forwards" }}>
  {/* Blooms once, stays bloomed */}
</div>

<div className="animate-botanical-sway">
  {/* After bloom, starts swaying */}
</div>
```

### Pattern 3: Conditional Motion
```tsx
<div className={isHovering ? "animate-ds-shimmer" : "animate-ds-float"}>
  {/* Shimmer on hover, float otherwise */}
</div>
```

---

## Browser Support

All animations use standard CSS and are supported on:

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari 14+, Chrome Android)

### Fallback Behavior

Without animation support, elements still display correctly (graceful degradation).

---

## Debugging Tips

### Slow Down Animations (DevTools)
In Chrome DevTools > Animations panel:
1. Open DevTools (F12)
2. Go to Animations panel
3. Drag timeline scrubber to adjust speed
4. Set playback speed slider

### Inspect Animation Values
```css
/* In DevTools Console */
console.log(
  window.getComputedStyle(element).animation
)
```

### Disable Animations Temporarily
```css
* {
  animation: none !important;
}
```

---

## CSS Custom Properties (for Tweaking)

Override any timing values:

```tsx
<div 
  className="animate-ds-float"
  style={{
    "--ds-dur-ambient": "24s",    // Slower float
    "--ease-soft": "ease-in-out", // Different easing
    animationDelay: "1s"           // Delayed start
  }}
>
  Customized animation
</div>
```

---

## Best Practices

✅ **DO:**
- Use animations to guide attention
- Stagger animations for visual interest
- Respect `prefers-reduced-motion`
- Keep animations under 3 seconds (except ambient)
- Combine animations for richness

❌ **DON'T:**
- Animate on page load (too busy)
- Use many simultaneous animations
- Make essential info depend on animation
- Animate for more than 3s (unless ambient)
- Ignore accessibility

---

## Questions?

All animations are production-ready and tested across devices. Use this reference to enhance any page with premium motion!

🌹 **Ship it!**
