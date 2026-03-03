/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export const INITIAL_PLACEHOLDERS = [
    "Design a minimalist weather card",
    "Show me a live stock ticker",
    "Create a futuristic login form",
    "Build a stock portfolio dashboard",
    "Make a brutalist music player",
    "Generate a sleek pricing table",
    "Ask for anything"
];

export const VARIATION_PACKS = [
  {
    id: 'core',
    name: 'Core Styles',
    styles: [
      { name: 'Minimalist Organic', desc: 'Warm off-white background, serif fonts (Cormorant Garamond), soft rounded corners, muted earth-tone accents (olive, cream).' },
      { name: 'Bold Neo-Brutalism', desc: 'High-energy contrast, neon accents (e.g., #00FF00) on black or white, thick borders, massive display sans-serif typography (Anton).' },
      { name: 'Dark Technical', desc: 'Professional-grade dark mode, monospace fonts for data, visible grid borders, muted secondary text, highly dense and precise.' }
    ]
  },
  {
    id: 'luxury',
    name: 'Premium & Luxury',
    styles: [
      { name: 'Dark Luxury', desc: 'Pure black background, extremely light font weights, thin pill borders, small uppercase micro-labels with wide tracking.' },
      { name: 'Editorial Magazine', desc: 'Massive typography, skewed transforms, tight line-height, stark contrast between enormous display type and tiny uppercase labels.' },
      { name: 'Prestige Asset', desc: 'Warm off-white backgrounds, serif fonts, oval-masked images, vertical text elements, systematic grid navigation with thin borders.' }
    ]
  },
  {
    id: 'modern',
    name: 'Modern App',
    styles: [
      { name: 'Clean Utility', desc: 'System fonts (SF Pro), light gray backgrounds, large rounded cards (24px+), simple percentage displays, data-focused without being clinical.' },
      { name: 'SaaS Split Layout', desc: 'Split 50/50 layout, extremely large headline text (112px), floating circular elements, vertical rail text, confident and modern.' },
      { name: 'Atmospheric Glass', desc: 'Layered radial gradients, heavy blur filters (60px+), glass morphism (backdrop-filter blur), floating UI elements, ethereal feel.' }
    ]
  },
  {
    id: 'playful',
    name: 'Playful & Creative',
    styles: [
      { name: 'Retro Pop', desc: 'Vibrant primary colors, thick black outlines, bold comic-style fonts, offset drop shadows, playful and energetic.' },
      { name: 'Soft Pastel', desc: 'Soft pastel color palette, pill-shaped buttons, bouncy animations, rounded sans-serif fonts (Quicksand), friendly and approachable.' },
      { name: 'Cyberpunk', desc: 'Dark background, glowing neon pink and cyan accents, glitch effects, angular cuts, futuristic tech fonts.' }
    ]
  },
  {
    id: 'extended',
    name: 'Extended Styles',
    styles: [
      { name: 'Ethereal Soft-Focus', desc: 'Blur, gradients, dreamy lighting. Best for: Luxury, wellness, beauty.' },
      { name: 'Kinetic Utility', desc: 'Motion, grids, clear hierarchy. Best for: SaaS tools, dashboards, data viz.' },
      { name: 'High-Contrast Editorial', desc: 'Serif typography, whitespace, grit. Best for: Branding, portfolios, print.' },
      { name: 'Synthetic Cyber-Pop', desc: 'Neon accents, saturated gradients. Best for: Gaming, Gen-Z apps, lifestyle.' },
      { name: 'Raw Industrialism', desc: 'Monospace fonts, wireframe accents. Best for: Dev tools, web3, architecture.' }
    ]
  }
];