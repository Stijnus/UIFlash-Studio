/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const MODELS = {
  FLASH: "gemini-3-flash-preview",
  PRO: "gemini-3.1-pro-preview",
  IMAGE: "gemini-3.1-flash-image-preview",
} as const;

export const INITIAL_PLACEHOLDERS = [
  "Design a minimalist weather card",
  "Show me a live stock ticker",
  "Create a futuristic login form",
  "Build a stock portfolio dashboard",
  "Make a brutalist music player",
  "Generate a sleek pricing table",
];

export const VARIATION_PACKS = [
  {
    id: "core",
    name: "Core Styles",
    styles: [
      {
        name: "Minimalist Organic",
        desc: "Warm off-white background, serif fonts (Cormorant Garamond), soft rounded corners, muted earth-tone accents (olive, cream).",
      },
      {
        name: "Bold Neo-Brutalism",
        desc: "High-energy contrast, neon accents (e.g., #00FF00) on black or white, thick borders, massive display sans-serif typography (Anton).",
      },
      {
        name: "Dark Technical",
        desc: "Professional-grade dark mode, monospace fonts for data, visible grid borders, muted secondary text, highly dense and precise.",
      },
    ],
  },
  {
    id: "luxury",
    name: "Premium & Luxury",
    styles: [
      {
        name: "Dark Luxury",
        desc: "Pure black background, extremely light font weights, thin pill borders, small uppercase micro-labels with wide tracking.",
      },
      {
        name: "Editorial Magazine",
        desc: "Massive typography, skewed transforms, tight line-height, stark contrast between enormous display type and tiny uppercase labels.",
      },
      {
        name: "Prestige Asset",
        desc: "Warm off-white backgrounds, serif fonts, oval-masked images, vertical text elements, systematic grid navigation with thin borders.",
      },
    ],
  },
  {
    id: "modern",
    name: "Modern App",
    styles: [
      {
        name: "Clean Utility",
        desc: "System fonts (SF Pro), light gray backgrounds, large rounded cards (24px+), simple percentage displays, data-focused without being clinical.",
      },
      {
        name: "SaaS Split Layout",
        desc: "Split 50/50 layout, extremely large headline text (112px), floating circular elements, vertical rail text, confident and modern.",
      },
      {
        name: "Atmospheric Glass",
        desc: "Layered radial gradients, heavy blur filters (60px+), glass morphism (backdrop-filter blur), floating UI elements, ethereal feel.",
      },
    ],
  },
  {
    id: "playful",
    name: "Playful & Creative",
    styles: [
      {
        name: "Retro Pop",
        desc: "Vibrant primary colors, thick black outlines, bold comic-style fonts, offset drop shadows, playful and energetic.",
      },
      {
        name: "Soft Pastel",
        desc: "Soft pastel color palette, pill-shaped buttons, bouncy animations, rounded sans-serif fonts (Quicksand), friendly and approachable.",
      },
      {
        name: "Cyberpunk",
        desc: "Dark background, glowing neon pink and cyan accents, glitch effects, angular cuts, futuristic tech fonts.",
      },
    ],
  },
  {
    id: "extended",
    name: "Extended Styles",
    styles: [
      {
        name: "Ethereal Soft-Focus",
        desc: "Layered background blur filters (40px+) with soft radial gradients in pastel tones (lavender, rose, ivory). Light, airy typography using thin-weight serif fonts (Cormorant Garamond 300). Floating card elements with heavy backdrop-filter blur and subtle white borders. Generous whitespace and padding. Muted CTA buttons with soft rounded corners.",
      },
      {
        name: "Kinetic Utility",
        desc: "Precise 12-column CSS grid layout with visible thin gray grid lines. System fonts (Inter, SF Pro) at multiple weight hierarchies. Animated counters and progress indicators using CSS transitions. Dense data presentation with compact spacing (8px grid). Accent color used sparingly for interactive elements. Subtle slide-in animations on scroll.",
      },
      {
        name: "High-Contrast Editorial",
        desc: "Dramatic scale contrast between massive display serif headings (Playfair Display, 80px+) and small uppercase sans-serif body text (10-12px, wide letter-spacing). Black and white primary palette with a single bold accent color. Generous asymmetric whitespace. Thin horizontal rules as section dividers. Text-heavy layouts with minimal imagery.",
      },
      {
        name: "Synthetic Cyber-Pop",
        desc: "Dark purple-black background (#0D0015) with vibrant neon accents (electric pink #FF2D78, cyan #00F0FF, lime #B8FF00). Bold geometric sans-serif fonts (Outfit, Space Grotesk). Saturated linear gradients on buttons and cards. Glowing box-shadows using neon colors. Pill-shaped interactive elements. High-energy, saturated visual identity.",
      },
      {
        name: "Raw Industrialism",
        desc: "Monospace typography throughout (JetBrains Mono, Fira Code). Exposed structural elements: visible borders, wireframe-style outlines, dashed separators. Neutral gray palette (#1A1A1A, #333, #666, #F0F0F0). Uppercase micro-labels with wide tracking. Terminal-inspired UI elements with blinking cursors. Raw, unpolished aesthetic with intentional roughness.",
      },
      {
        name: "Luxe Noir & Gold",
        desc: "Deep charcoal-black background with elegant gold accents (#D4AF37). High-contrast serif typography (Playfair Display) for headlines and minimalist sans-serif (Inter) for body. Sublte metallic gradients on borders and interactive elements. Refined, high-end aesthetic with spacious layouts and premium visual weight.",
      },
    ],
  },
];

export const DEVICE_PRESETS = {
  desktop: { width: 1280, height: 800, scale: 1, label: "Desktop" },
  mobile: { width: 375, height: 812, scale: 2, label: "Mobile" },
  tablet: { width: 768, height: 1024, scale: 2, label: "Tablet" },
} as const;
