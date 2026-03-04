# UIFlash Studio

A powerful AI-driven UI prototyping tool designed to rapidly generate, iterate, and analyze user interfaces using **Gemini 3 Flash**. Transform natural language descriptions and reference images into functional, responsive UIs in seconds.

## 🚀 Features

- **Instant UI Generation**: Describe your UI in natural language and watch it come to life with high-fidelity components.
- **Device-Aware Design**: Optimized generation for **Desktop**, **Tablet**, and **Mobile** viewports with specific design rules for each.
- **Image-to-UI (Vision)**: Upload screenshots, sketches, or reference images to guide the AI's design process.
- **Asset Generation**: Built-in generator for custom icons, logos, and UI assets using **Gemini Flash Image (2.5)**.
- **Design Analysis & Feedback**: Get professional AI feedback on layout, typography, accessibility, and color harmony powered by **Gemini 3.1 Pro**.
- **Variation Packs**: Generate multiple aesthetic takes on a single prompt using curated styles like _Modern SaaS_, _Neo-Brutalism_, _Glassmorphism_, and _Synthetic Cyber-Pop_.
- **Live Streaming Progress**: Real-time feedback during the generation process with accurate progress tracking.
- **Export Options**:
  - **Code**: Copy or download self-contained HTML/Tailwind CSS files.
  - **Images**: High-quality PNG exports using `html2canvas`, automatically sized for the selected device.
- **Dark Mode Support**: All generated UIs include a functional dark/light mode toggle by default.

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript, Vite 6
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite` and CDN for artifacts)
- **AI Engine**: Google Gemini (using `@google/genai` SDK)
  - **Gemini 3 Flash**: Primary model for fast UI generation.
  - **Gemini 3.1 Pro**: Advanced design analysis and feedback.
  - **Gemini Flash Image (2.5)**: High-quality asset generation.
- **Icons**: Lucide React
- **Animations**: Framer Motion (Motion)
- **Exporting**: `html2canvas`

## 📖 How to Use

1. **Describe your UI**: Enter a prompt in the text area (e.g., "A premium dashboard for a crypto wallet").
2. **Select Device**: Toggle between Desktop, Tablet, or Mobile mode to target specific viewports.
3. **(Optional) Add References**: Upload images to use as a visual base or generate custom assets using the "Asset Generator".
4. **Generate**: Click "Generate UI" for a single design or select a "Variation Pack" to see multiple styles.
5. **Iterate**: Use the **Refine** tab to provide follow-up instructions for specific changes.
6. **Analyze**: Use the **Design Analysis** feature to get AI-driven improvements for your UI.
7. **Export**: Copy the code, download the HTML, or save the design as a PNG directly from the preview header.

## 🎨 Variation Packs

- **Core Styles**: Minimalist Organic, Bold Neo-Brutalism, Dark Technical.
- **Premium & Luxury**: Dark Luxury, Editorial Magazine, Prestige Asset.
- **Modern App**: Clean Utility, SaaS Split Layout, Atmospheric Glass.
- **Playful & Creative**: Retro Pop, Soft Pastel, Cyberpunk.
- **Extended Styles**: Ethereal Soft-Focus, Kinetic Utility, High-Contrast Editorial, Synthetic Cyber-Pop, Raw Industrialism, Luxe Noir & Gold.

---

Built with ❤️ using Google Gemini.
