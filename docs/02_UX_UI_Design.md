# Mirror — UX and UI Design Specification
*Creative Design Language · Motion · 3D · Liquid · v2.0*

---

## 0. Design Manifesto

Mirror is not software. Mirror is a **cognitive experience** — and the interface must feel like entering a different mental space, not opening another SaaS app.

The design language is built on one central metaphor: **the surface of water at night**. Dark, deep, reflective. Still at rest. When you speak, something ripples. The ripple reveals patterns hidden beneath the surface. The surface remembers.

Everything in Mirror's UI comes from this metaphor — the liquid animations, the dark depth, the fluid transitions, the 3D reflective surfaces, the way information rises up from the darkness rather than being placed on top of it.

This is not decoration. The design *is* the product position. The moment a user opens Mirror, before they type a word, they feel they are in a serious, beautiful, precise instrument.

---

## 1. Design Identity

### 1.1 Core Aesthetic Pillars

```
+------------------------------------------------------------------+
|                    MIRROR DESIGN IDENTITY                         |
+------------------------------------------------------------------+
|                                                                  |
|  DARK DEPTH       LIQUID MOTION      3D PRESENCE                |
|  The interface    Everything that    Cards, panels, and          |
|  has physical     responds to the    data visualisations         |
|  depth — layers   user feels like    exist in three-             |
|  recede into      fluid, not         dimensional space,          |
|  darkness         mechanical         not flat surfaces           |
|                                                                  |
|  COGNITIVE CALM   PRECISION GLASS    LIVING BACKGROUND           |
|  Nothing competes A glassmorphism    The background is           |
|  with thinking.   that feels like    never static — it          |
|  UI recedes when  still water, not   breathes, pulses,           |
|  Mirror speaks.   frosted plastic    shifts slowly               |
|                                                                  |
+------------------------------------------------------------------+
```

### 1.2 The Colour System — Reimagined

The new palette is built around deep ocean bioluminescence:

```
FOUNDATIONAL DEPTHS (background layer — never pure black)
  --void:         #050508   The deepest dark — used sparingly
  --abyss:        #080810   Page background — has blue-black character
  --deep:         #0d0d1a   Primary surface — a dark navy-black
  --depth:        #12121f   Card backgrounds — perceptible depth
  --surface:      #17172b   Elevated surfaces — where content lives
  --lifted:       #1e1e35   Highlighted states — cards on hover

BIOLUMINESCENT ACCENTS (glow, not flat colour)
  --aurora:       #7c6bff   Primary purple — the Mirror signature
  --aurora-glow:  rgba(124,107,255,0.15)  Ambient glow around active elements
  --liquid-teal:  #00e5c4   Secondary teal — growth, positive change
  --teal-glow:    rgba(0,229,196,0.12)    Teal ambient light
  --neural:       #ff6b6b   Alert coral — used for high-stakes moments
  --cognite:      #4d9fff   Data blue — evidence, facts, citations
  --amber-pulse:  #ffb84d   Warm amber — reasoning engine states

TEXT
  --text-primary:  #f0eee8  Warm white with slight warmth
  --text-body:     #b8b5ad  Muted body copy
  --text-ghost:    #565450  Faint labels, timestamps
  --text-data:     #4d9fff  All numeric data — blue to signal objectivity
```

### 1.3 Typography — Fluid and Expressive

```
DISPLAY (Hero + Mirror voice)
  Font: "Playfair Display" — serif, italics enabled
  Role: Hero titles, Mirror's reflection text
  Feel: Gravitas, intelligence, warmth
  Sizes: clamp(2.8rem, 6vw, 5rem) for hero; 1.4rem for Mirror voice

INTERFACE (Navigation, labels, UI chrome)
  Font: "DM Sans" — geometric sans, 300/400/500/600 weights
  Role: All UI text, headings, navigation
  Feel: Clean, modern, invisible when right

MONOSPACE (Data, citations, code)
  Font: "JetBrains Mono" — ligatures enabled
  Role: DNA scores, calibration numbers, citations, timestamps
  Feel: Technical precision, trustworthy data
```

---

## 2. Background Animation System

The background is a **living entity**, not a static screen. It is one of the most important design elements in Mirror.

### 2.1 The Void Canvas (Base Layer)

The page background is a full-viewport canvas element (`<canvas>`) running at 60fps. It renders three layered systems simultaneously:

```
LAYER 1: Deep Nebula Drift
  - 6-8 large radial gradients (radius 40–80% viewport width)
  - Colours: aurora purple, deep teal, dark navy — at 3–8% opacity
  - Motion: each gradient drifts on an independent Lissajous path
  - Speed: extremely slow — full cycle takes 25–40 seconds
  - Effect: the background feels like slow-moving cosmic gas
  - Implementation: requestAnimationFrame + Math.sin/cos with phase offsets

LAYER 2: Particle Field
  - 120–180 particles of varying sizes (1px to 4px)
  - Particles glow faintly in aurora purple or liquid teal
  - Each particle has: position, velocity, opacity, pulse phase
  - Behaviour:
      * Drift slowly downward and sideways (gravity-lite)
      * Pulse opacity: 0.1 -> 0.6 -> 0.1 on random sine cycles
      * When user types: particles near cursor repel gently (mouse proximity repulsion)
      * When Mirror responds: particles converge toward the response card, then disperse
  - Implementation: Canvas 2D API, batched drawCircle calls

LAYER 3: Neural Connection Lines
  - Particles within 120px of each other draw faint connection lines
  - Line opacity: proportional to (120 - distance) / 120
  - Line colour: rgba(124, 107, 255, 0.06) - very subtle
  - Effect: creates a living neural network feel in the background
  - Only rendered when particle count > threshold (performance guard)
```

### 2.2 Liquid Surface Effect (On Interaction)

When the user submits a message, a **liquid ripple** emanates from the send button:

```
Ripple Animation Sequence:
  t=0ms:   Ring begins at send button (radius 0, opacity 0.8)
  t=0-400ms: Ring expands outward (radius 0 -> 100vw)
             Opacity decays: 0.8 -> 0, with ease-out-cubic
             Ring colour: aurora purple gradient to transparent
  t=200ms: Second ring starts (delayed, different speed, teal colour)
  t=350ms: Third ring starts (slowest, most subtle, white at 15% opacity)
  
  While rings expand: background particles begin drifting
  toward center (the response card area) — as if being summoned

  Implementation: CSS clip-path radial animation or
  Canvas radial gradient with animated radius
```

### 2.3 Breathing Effect (Idle State)

When Mirror is idle (no user interaction for >5 seconds), the background enters a breathing state:

```
Breathing Cycle (6-second period):
  Inhale (0-3s): Background gradients expand 8% in scale, brighten 10%
  Exhale (3-6s): Background gradients contract, dim back to normal
  
  Easing: cubic-bezier(0.4, 0, 0.6, 1) — slow in, slow out
  
  This is called "breathing" intentionally — Mirror feels alive, aware,
  waiting for the user. It subtly communicates presence without noise.
```

---

## 3. Hero Section Design

The landing page / app open state is the most important first impression.

### 3.1 Hero Animation Concept

```
HERO LAYOUT (above the fold):

+--------------------------------------------------------------------+
|                     [LIVING BACKGROUND — see section 2]            |
|                                                                    |
|                                                                    |
|              ·  ·    *        ·     ·    *    ·                   |
|                                                                    |
|              *    ·     ·          *      ·                        |
|                                                                    |
|          [ 3D MIRROR ORB — animated, reflective ]                 |
|                        M I R R O R                                 |
|                  [ subtitle fades in after 600ms ]                |
|                                                                    |
|           See how you think.                                       |
|           Not what to think.                                       |
|                                                                    |
|              [ Begin a session ]   [ See how it works ]            |
|                                                                    |
+--------------------------------------------------------------------+
```

### 3.2 The 3D Mirror Orb

The central hero element is a **3D reflective sphere** rendered in WebGL (Three.js or a lightweight alternative):

```
MIRROR ORB SPECIFICATIONS:

Geometry:
  SphereGeometry(radius=1, widthSegments=64, heightSegments=64)
  Perfectly smooth — no visible polygons at standard display sizes

Material (MeshPhysicalMaterial):
  roughness: 0.0          (perfectly smooth — mirror-like)
  metalness: 1.0          (fully metallic)
  envMapIntensity: 1.8    (strong environment reflection)
  clearcoat: 1.0          (glossy clear coat layer)
  iridescence: 0.6        (shifts colour based on viewing angle)
  iridescenceIOR: 1.8

Environment Map:
  Custom HDR environment created from:
    - Deep purple aurora gradients
    - Soft teal glows at the poles
    - Sparse white star points
  Result: the orb reflects a cosmic environment that matches the
  background — making it feel like a window into the background

Animation States:
  IDLE: Slow rotation (0.003 rad/frame on Y-axis, 0.001 on X)
        Subtle breathing: scale pulses 1.0 -> 1.02 -> 1.0 (4s cycle)
  
  HOVER: Rotation accelerates (3x speed), blue shift in environment
         Faint aurora glow ring appears around the orb (CSS box-shadow)
  
  ACTIVE SESSION: Orb minimises to 40px icon in top-left corner
                  This transition uses GSAP flip animation:
                  orb "drops" into the topbar position
  
  MIRROR RESPONDING: Orb pulses with the aurora colour
                     Environment map shifts — more light, more activity

Fallback for no WebGL: CSS border-radius sphere with
  gradient background + radial shine overlay, animated with CSS transforms
```

### 3.3 Hero Text Animation

```
Title "Mirror" animation sequence:
  t=0ms:    Page loads. Background canvas fades in (400ms, opacity 0->1)
  t=300ms:  Orb appears — drops in from above (translateY -100px -> 0)
            Scale: 0.6 -> 1.0. Easing: spring(mass=1, stiffness=120)
  t=800ms:  "Mirror" title fades in, letter by letter
            Each letter: opacity 0->1, translateY 20px->0
            Stagger: 60ms between letters
  t=1200ms: Tagline "See how you think." types in (typewriter effect)
            Cursor blinks 3 times, then disappears
  t=1800ms: Subtitle "Not what to think." fades in (400ms)
  t=2200ms: CTA buttons slide up (translateY 30px -> 0, opacity 0 -> 1)
            Stagger: 150ms between the two buttons

Scroll-responsive parallax:
  As user scrolls down, the orb moves up at 0.5x scroll speed
  The hero text moves up at 1x scroll speed (normal)
  The background particles drift upward at 0.3x scroll speed
  Result: strong depth perception — 3 distinct parallax layers
```

---

## 4. Liquid Glass UI Components

All interactive UI elements use a **liquid glass** aesthetic — not the flat glassmorphism of 2021, but a deeper, more physical version:

### 4.1 The Glass Card System

```
GLASS CARD SPECIFICATIONS (CSS):

Base glass card:
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.04) 0%,
    rgba(124,107,255,0.03) 50%,
    rgba(0,229,196,0.02) 100%
  );
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: 20px;
  box-shadow:
    0 8px 32px rgba(0,0,0,0.4),
    0 2px 8px rgba(0,0,0,0.3),
    inset 0 1px 0 rgba(255,255,255,0.08),  <- top edge highlight
    inset 0 -1px 0 rgba(0,0,0,0.2);        <- bottom edge shadow

HOVER STATE:
  border-color: rgba(124,107,255,0.25)
  box-shadow:
    0 12px 40px rgba(0,0,0,0.5),
    0 0 0 1px rgba(124,107,255,0.15),      <- outer glow ring
    inset 0 1px 0 rgba(255,255,255,0.12)
  transform: translateY(-2px)
  transition: all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)
              (slight spring overshoot — feels physical)

ACTIVE/FOCUSED STATE:
  border-color: rgba(124,107,255,0.5)
  box-shadow:
    0 0 0 3px rgba(124,107,255,0.15),     <- focus ring
    0 12px 40px rgba(124,107,255,0.3),    <- colour-matched shadow
    inset 0 1px 0 rgba(255,255,255,0.15)
```

### 4.2 Liquid Input Field

The session input field is Mirror's most important UI element. It must feel alive:

```
INPUT FIELD STATES:

DEFAULT:
  Large, centred, generous padding (20px vertical)
  Placeholder text fades in and out slightly (opacity pulse)
  Bottom border only — single thin line in --text-ghost colour
  Very subtle background: rgba(255,255,255,0.02)

FOCUSED:
  Liquid fill animation:
    - A gradient wave sweeps up from the bottom of the field
    - Wave uses aurora purple at 4% opacity
    - Wave animation: 600ms, ease-out
  Border transforms: bottom line extends to full border (all 4 sides)
  Border colour: aurora purple at 40% opacity
  Subtle outer glow: rgba(124,107,255,0.1) spread radius 8px
  Placeholder text slides upward and shrinks (floating label pattern)

TYPING (active):
  Character-by-character cursor is aurora purple
  Trailing subtle glow behind cursor position
  Text appears in --text-primary (warm white)

ON SEND:
  Field contents dissolve: opacity fades to 0 over 300ms
  Field scales down slightly (98%) then back to 100%
  Liquid ripple expands from the send button (see section 2.2)
  After 500ms: placeholder returns with fade-in
```

### 4.3 3D Flip Card Effect — Mirror Response

When Mirror's response arrives, the response card performs a **3D flip** from blank to filled:

```
3D CARD FLIP ANIMATION:

Pre-response state:
  Card exists but shows a "thinking" state:
  - Rotating aurora gradient (CSS conic-gradient, animated)
  - "Mirror is reflecting..." text with pulsing dots
  - Card is slightly tilted: rotateX(-2deg) rotateY(1deg)
    (gives it a physical, present feeling even while loading)

Response arrives (streaming starts):
  Step 1 (0-600ms):
    Card rotates on Y axis: rotateY(0deg) -> rotateY(90deg)
    Card scales down slightly during rotation (0.95 at midpoint)
    Background: thinking state fades out at 90deg
  
  Step 2 (600ms-1200ms):
    Back face renders (response content)
    Card rotates: rotateY(90deg) -> rotateY(0deg)
    Card returns to full scale (1.0)
    Card settles to:
      transform-style: preserve-3d
      transform: perspective(1200px) rotateX(-1deg) rotateY(0.5deg)
      (subtle 3D tilt — card feels physically present, not flat)
  
  Step 3 (1200ms+):
    Response content streams in (text appears character by character)
    DNA bars animate independently: each bar fills left-to-right
    with a 150ms stagger between bars
    Choice cards slide up from below with spring animation

Transform: preserve-3d environment creates parallax within the
card itself — scroll the card off-screen and it tilts as it goes
```

---

## 5. Thought DNA — 3D Data Visualisation

The Thought DNA chart is reimagined from simple bars to a **3D radar / orb form**:

### 5.1 The DNA Orb (Alternative to Bar Chart)

```
THOUGHT DNA — 3D VISUALISATION:

Option A: 3D Radar (Primary)
  Five axes extending from center, representing:
    Assumption Load, Emotional Signal, Evidence Cited,
    Alternatives Considered, Uncertainty Tolerance
  
  Rendered in Three.js:
    - Axis lines: thin, aurora purple, glowing
    - Data polygon: filled with gradient (aurora to teal) at 40% opacity
    - Data polygon outline: bright aurora purple, 2px line
    - Each vertex: small glowing sphere (10px radius, aurora colour)
    
  Animation on mount:
    - Radar shape draws from center outward (0 -> full values, 800ms)
    - After draw: subtle breathing (overall scale 1.0 -> 1.02, 3s cycle)
    - On hover any axis: that axis label highlights, vertex pulses

Option B: Horizontal Bars (Compact mode / mobile)
  Each bar is a 3D extruded rectangle:
    CSS perspective + rotateX(-2deg) on the bar track
    Bar fill is a gradient: solid aurora at start -> liquid teal at end
    Fill animation: width 0 -> value over 600ms with stagger
    After fill: shimmer animation sweeps across (500ms, once)

The DNA section is labeled:
  "THOUGHT DNA" in small monospace caps, aurora coloured, letter-spaced
  Followed by 5 bars or the 3D radar
  Below: "What does this mean?" expandable section
    (clicking reveals natural language interpretation of DNA scores)
```

---

## 6. Screen Designs — Detailed

### 6.1 The Session Screen (Core Experience)

```
LAYOUT:
  Full-viewport dark canvas with living background (always present)
  
  TOP BAR (glass, sticky):
    Left: Mirror orb icon (40px, still animated) + session module indicator
    Centre: Empty — breathing room
    Right: Profile avatar + calibration score badge + Module switch

  CONTENT AREA (scrollable):
    Max-width: 720px, centered
    Padding: 32px horizontal
    
    [Previous turns above, fading upward as user scrolls]
    
  ACTIVE RESPONSE CARD (glass, 3D):
    Position: Pinned to ~60% viewport height for new responses
    Width: 100% of content area
    
    Anatomy from top to bottom:
    ┌─────────────────────────────────────────────────────┐
    │  PATTERN DETECTED BANNER (full width, aurora glow)  │
    │  "Certainty Surge + Urgency Compression"            │
    │  Kahneman, 2011 · System 1 overreach               │
    ├─────────────────────────────────────────────────────┤
    │  THOUGHT DNA (3D radar chart or animated bars)      │
    │  [Assumption Load] [Emotional Signal] [etc]         │
    ├─────────────────────────────────────────────────────┤
    │  MIRROR REFLECTION (Playfair Display, streaming)    │
    │  "Four weeks ago you described..."                  │
    ├─────────────────────────────────────────────────────┤
    │  THE QUESTION (highlighted box, amber glow)         │
    │  "What would have to be true for this to fail?"    │
    ├─────────────────────────────────────────────────────┤
    │  CHOICE CARDS [2×2 grid]                            │
    │  Each card is a smaller glass card                  │
    │  All 4 animate in with staggered spring (150ms gap) │
    └─────────────────────────────────────────────────────┘
    
  BOTTOM INPUT (floating glass bar):
    Position: fixed bottom 0, full width
    Height: 80px (collapsed) / 200px (expanded for long input)
    Glass effect: backdrop-filter blur(40px), stronger than cards
    Voice input button: aurora pulse animation on idle (signals readiness)
    Send button: glows aurora when input is not empty
```

### 6.2 The Pattern Detected Banner

This is Mirror's signature moment — when the pattern surfaces. It must feel like a revelation:

```
PATTERN DETECTED BANNER — ANIMATION:

Pre-reveal (Mirror is composing):
  Banner area shows: [pulsing dots at 3% opacity]

Reveal sequence:
  t=0ms: Banner background floods with aurora purple (left -> right wipe)
         Duration: 400ms, ease-in-out
  t=200ms: Pattern name types in (typewriter), all caps, large, bold
  t=500ms: Citation appears below, smaller, monospace, fades in
  t=700ms: A thin aurora glow line expands below the banner (separator)

Visual design:
  Background: from rgba(124,107,255,0.12) to rgba(0,229,196,0.08) gradient
  Left border: 3px solid --aurora (solid accent line)
  Pattern name: text-primary, font-weight 700, size 1.1rem
  Citation: --cognite colour (blue), monospace, 0.8rem, slight letter-spacing
  Right side: small 3D icon representing the pattern type (optional)

HOVER on banner:
  Expands to show a 2-sentence description of the pattern
  Height animation: auto-height with overflow hidden trick
  Background brightens slightly
```

### 6.3 Choice Cards — Liquid Hover

```
CHOICE CARDS:

Layout: 2×2 grid, equal size cards
Size: approximately 44% of card width × 80px each

Default state:
  Glass card (see section 4.1)
  Faint left-border accent (2px, aurora at 30% opacity)
  Choice text in body weight, left-aligned
  Arrow icon (→) at far right, ghost colour

HOVER state — liquid fill effect:
  A liquid gradient fills the card from bottom-left to top-right
  Fill uses: aurora purple at 6% opacity gradient to teal at 3%
  Animation: clip-path on a gradient pseudo-element
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)
    -> polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)
    Duration: 300ms, ease-out
  Border brightens to aurora at 60% opacity
  Arrow icon slides right by 4px (translateX)
  Text brightens to text-primary if not already

SELECTED state (choice tapped):
  Card pulses once (scale 1.0 -> 1.03 -> 1.0, 200ms)
  Background fills fully with aurora at 15% opacity
  Border becomes aurora at 80% opacity
  Left border thickens to 4px
  A checkmark fades in at top-right
  Other 3 cards fade to 40% opacity (selected one stays full opacity)
  After 400ms: all cards animate out (slide up, opacity 0)
  The selected choice text appears in the input field (auto-typed)
  Ripple effect triggers (section 2.2) as if user sent a message
```

### 6.4 Cognitive Profile Page — Data as Art

```
PROFILE PAGE CONCEPT:
  Not a dashboard. A personal map of the mind.

LAYOUT:
  Hero area (full-width):
    Large ambient background: user-specific colour mix based on their
    dominant bias. If certainty surge dominant: more amber in background.
    If confirmation bias: more coral. Subtle personalisation.
    
    Centred: Calibration Orb
      Large version of the 3D orb from the hero (150px radius)
      Surface texture: iridescent, shifts colour with mouse
      Number inside (via CSS clip — not inside WebGL):
        "0.74" in large monospace, aurora colour
      Below: "Calibration Score — how often you're right when certain"
      
  BIAS FINGERPRINT (3D radar):
    The main data section. Full-width or 2/3 width card.
    Uses the Three.js radar from the DNA orb (section 5)
    But personalised: filled with the user's actual bias data
    Axes: Confirmation, Certainty Surge, Urgency, Overconfidence, Availability
    On mount: shape draws slowly, each axis one at a time, clockwise
    
  GROWTH TIMELINE:
    An animated line chart (SVG with path animation)
    The SVG path draws from left to right on page load (stroke-dashoffset trick)
    Data points: small glowing circles (aurora colour, pulse animation)
    On hover any data point: tooltip in glass style shows session details
    Y-axis: calibration score. X-axis: session dates.
    Background of chart: very subtle grid lines (rgba white, 3% opacity)
    Fill below the line: gradient from aurora (15% opacity) to transparent
    
  DOMINANT PATTERNS (cards):
    3 cards in a row, each representing a dominant cognitive pattern
    Each card:
      - Pattern name in display serif
      - Small inline chart (sparkline) of frequency over time
      - Aurora glow intensity proportional to pattern strength
      - "Last seen: X days ago" in ghost text
```

---

## 7. Animation System — Full Reference

### 7.1 Motion Principles

```
ALL ANIMATIONS FOLLOW THESE RULES:

1. Natural physics — spring animations preferred over linear
   Use: cubic-bezier(0.34, 1.56, 0.64, 1) for spring-like feel
   Avoid: linear, ease-in (feels mechanical)

2. Intentional timing
   < 150ms: Micro-interactions (hover, check state)
   150–400ms: Component transitions (cards in/out)
   400–800ms: Page transitions, major reveals
   800ms–2000ms: Dramatic sequences (hero, first session open)

3. Directional logic
   New content: enters from below (y: 30px -> 0)
   Dismissed content: exits to above (y: 0 -> -30px)
   Choices dismissed: exit sideways (x: 0 -> +40px, opacity 0)
   Errors: shake horizontal (x: 0 -> 8px -> -8px -> 0, 400ms)

4. Reduce motion mode
   All animations behind prefers-reduced-motion media query
   In reduced motion: opacity transitions only (no transforms)
   Background canvas: paused (requestAnimationFrame stops)
   3D orb: static (no rotation)
```

### 7.2 Page Transition System

```
Route changes use a shared transition:

OUTGOING PAGE:
  Content area: opacity 1 -> 0, translateY 0 -> -20px (300ms)
  Background: remains stable (no transition — continuity)

INCOMING PAGE:
  Content area: opacity 0 -> 1, translateY 20px -> 0 (400ms)
  Delay: 100ms after outgoing completes

SPECIAL CASE — entering an active session:
  The session input field expands from the input wherever it sits
  (shared element transition via FLIP animation)
  The background deepens slightly (background gradients shift
  to more aurora purple, signalling entering Mirror's space)
```

### 7.3 The Loading State — Constellation

When Mirror is processing (the period between user input and first token of response), instead of a spinner, show:

```
CONSTELLATION LOADING:
  3–5 dots appear near the top of where the response card will be
  Each dot pulses at slightly different rates (async sine curves)
  Lines connect them briefly before dissolving
  They slowly drift apart and reconnect — a small animated constellation
  Text beneath: "Mirror is reflecting..." in ghost text, italic
  Duration: happens during LLM call (typically 0.5–2 seconds)
  
  When first token arrives: constellation dissolves (opacity 0, 300ms)
  Response card flips in (section 4.3)
```

---

## 8. Onboarding Flow — Cinematic

### 8.1 First Launch Sequence

```
FRAME 1 — THE VOID (t=0 to t=1500ms):
  Background canvas starts black. Completely dark.
  Single particle appears at centre — pulses once.
  More particles appear, slowly — like stars igniting.
  Background gradients fade in slowly (3% opacity start).

FRAME 2 — EMERGENCE (t=1500 to t=3000ms):
  3D orb emerges from the centre — scale 0 -> 1.0 with spring
  Orb surface: completely dark at first, then environment map loads
  and it becomes reflective — the user sees the background in the orb.
  Particle field reorganises — all particles drift toward orb then away.
  Like the orb breathing them in and releasing them.

FRAME 3 — THE INTRODUCTION (t=3000ms):
  Standard hero fade-in sequence (section 3.3).
  But with one addition: the word "Mirror" fades in with a
  faint echo — same word, 2px offset, 10% opacity, that fades out.
  Like the word itself is a reflection.

FRAME 4 — INVITATION (t=4500ms):
  "Mirror helps you see how you think. Not what to think — how."
  This appears below the hero text, in a different style:
  Handwritten-feel font (Caveat or similar), cursive, aurora coloured.
  Like Mirror wrote it by hand.
  CTA appears: [Begin your first session]
```

### 8.2 First Session — Guided

```
The first session has special visual treatments:

1. Gentle prompt appears (not mandatory, dismissable):
   "Start anywhere. Tell Mirror about something on your mind."
   Floats above input, fades after user starts typing.
   
2. As user types their first message:
   The background particles become slightly more active
   (particle velocity increases 20%) — Mirror is "listening"

3. First Mirror response:
   Before the response, a brief moment:
   All particles pause. Background dims slightly (10%).
   Then: the 3D card flip (most dramatic timing — 1200ms instead of 800ms)
   Then: response streams in.
   
   The first response is specially paced — slightly slower stream speed
   to let the user absorb what just happened.

4. After first response:
   A small tooltip appears near the pattern name:
   "Mirror just surfaced a pattern in your thinking →"
   Dissolves after 4 seconds.
```

---

## 9. Mobile Design Considerations

### 9.1 Mobile Layout Adaptations

```
Mobile (<768px) layout changes:

BACKGROUND:
  Canvas still runs but particle count reduced to 60 (battery saving)
  Neural connection lines disabled on mobile
  3D orb: reduced segment count (32x32 instead of 64x64)

NAVIGATION:
  Top bar collapses to hamburger menu
  Session module indicator shown as a pill below the topbar
  Swipe left/right to switch between Canvas, X-ray, Devil's Advocate

SESSION VIEW:
  Full-viewport input on load (no scrollable history shown)
  History accessible by swiping up
  Response card: full width, no side padding
  DNA chart: switches to compact horizontal bars (not 3D radar on mobile)
  Choice cards: stack vertically (1 column, not 2×2)

CHOICE CARDS on mobile:
  Swipe-to-select interaction supported (in addition to tap)
  Swipe right = select that choice
  Swipe left = dismiss / see next option
  Haptic feedback on selection (navigator.vibrate API)

3D ORB on mobile:
  Rendered at 80px in the topbar when in active session
  Device orientation controls gentle tilt (DeviceOrientation API)
  Tilting phone tilts the orb — feels like holding a physical object
```

---

## 10. Design Tokens — Complete Reference

```css
:root {
  /* DEPTHS */
  --void:           #050508;
  --abyss:          #080810;
  --deep:           #0d0d1a;
  --depth:          #12121f;
  --surface:        #17172b;
  --lifted:         #1e1e35;

  /* ACCENTS */
  --aurora:         #7c6bff;
  --aurora-glow:    rgba(124, 107, 255, 0.15);
  --aurora-pulse:   rgba(124, 107, 255, 0.3);
  --liquid-teal:    #00e5c4;
  --teal-glow:      rgba(0, 229, 196, 0.12);
  --neural:         #ff6b6b;
  --cognite:        #4d9fff;
  --amber-pulse:    #ffb84d;

  /* TEXT */
  --text-primary:   #f0eee8;
  --text-body:      #b8b5ad;
  --text-ghost:     #565450;
  --text-data:      #4d9fff;

  /* GLASS SURFACES */
  --glass-base:     rgba(255, 255, 255, 0.03);
  --glass-border:   rgba(255, 255, 255, 0.07);
  --glass-active:   rgba(124, 107, 255, 0.08);
  --glass-blur:     24px;

  /* MOTION */
  --spring:         cubic-bezier(0.34, 1.56, 0.64, 1);
  --smooth:         cubic-bezier(0.4, 0, 0.2, 1);
  --fast:           cubic-bezier(0.4, 0, 1, 1);
  --slow:           cubic-bezier(0, 0, 0.2, 1);

  /* TIMING */
  --t-micro:        120ms;
  --t-fast:         200ms;
  --t-base:         300ms;
  --t-slow:         500ms;
  --t-dramatic:     800ms;
  --t-cinematic:    1200ms;

  /* SPACE (8pt grid) */
  --space-1:        4px;
  --space-2:        8px;
  --space-3:        12px;
  --space-4:        16px;
  --space-6:        24px;
  --space-8:        32px;
  --space-12:       48px;
  --space-16:       64px;
  --space-24:       96px;

  /* RADIUS */
  --radius-sm:      8px;
  --radius-md:      16px;
  --radius-lg:      24px;
  --radius-xl:      32px;
  --radius-full:    9999px;
}
```

---

## 11. Implementation Notes

### Key Libraries

```
THREE.js (or @react-three/fiber for React)
  -> 3D mirror orb, radar chart, environment maps

GSAP (GreenSock Animation Platform) — free for non-profit
  -> Hero sequence, FLIP animations, complex timelines

Framer Motion (if using React/Next.js)
  -> Component animations, layout transitions, gesture handling

Canvas API (vanilla)
  -> Background particle system, liquid ripple effects

Lottie
  -> Small icon animations (not used for large-scale motion)

CSS Houdini / Paint Worklet (progressive enhancement)
  -> Advanced glass effects where supported
```

### Performance Targets

```
Background canvas: 60fps on desktop, 30fps acceptable on mobile (battery mode)
3D orb: 60fps on desktop, switches to CSS fallback on low-end mobile
First Contentful Paint: < 1.5s (hero loads before orb completes initialisation)
Time to Interactive: < 3s (input field is usable even if 3D is still loading)
Bundle size budget: Three.js tree-shaken < 150KB, GSAP < 60KB
Animation total memory: < 50MB (canvas + WebGL)
```

---

*Mirror · UX and UI Design Specification · v2.0 · March 2026*
*RootedAI — Metacognition AI · Liquid Glass · 3D · Living Background · Cinematic Motion*
