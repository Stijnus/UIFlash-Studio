# GEMINI.md - UIFlash Studio

This file provides instructional context for AI interactions within the **UIFlash Studio** project.

## Project Overview

**UIFlash Studio** (internally `flash-ui`) is a powerful AI-driven UI prototyping tool designed to rapidly generate, iterate, and analyze user interfaces using **Gemini 3 Flash**. It allows designers and developers to transform natural language descriptions and reference images into functional, responsive UIs.

### Core Technologies
- **Frontend Framework:** React 19 (TypeScript)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS 4 (via `@tailwindcss/vite` and CDN in generated artifacts)
- **AI Engine:** Google Gemini (using `@google/genai` SDK)
  - **Gemini 3 Flash Preview:** Primary model for fast UI generation.
  - **Gemini 3.1 Pro Preview:** Used for advanced design analysis and feedback.
  - **Gemini Flash Image (2.5):** Used for generating assets like icons and logos.
- **Icons:** Lucide React
- **Exporting:** `html2canvas` for image exports.

## Key Features & Workflows

1.  **Instant UI Generation:** Users provide a prompt (and optionally up to 3 reference images). The system generates a self-contained HTML/Tailwind CSS file.
2.  **Device-Aware Design:** Optimizes generated UI for Desktop or Mobile viewports.
3.  **Iterative Refinement:** Allows users to "Refine" an existing generation by providing additional instructions.
4.  **Style Variations:** Supports "Variation Packs" (e.g., Modern SaaS, Neo-Brutalism, Glassmorphism) to generate multiple aesthetic takes on a single prompt.
5.  **Design Analysis:** Provides professional AI feedback on layout, typography, accessibility, and color harmony.
6.  **Asset Generation:** A built-in "Asset Generator" for creating custom icons or logos to use as references.

## Project Structure

- `App.tsx`: The main entry point. Manages application state, including prompts, uploaded images, generation history, and view modes.
- `src/services/geminiService.ts`: The core service layer handling all interactions with the Google GenAI SDK. Includes methods for UI generation (`generateUI`), image analysis (`analyzeImages`), and asset generation (`generateImageAsset`).
- `components/`:
    - `SideDrawer.tsx`: Settings and configuration drawer.
    - `ArtifactCard.tsx`: UI for displaying generated artifacts.
    - `Icons.tsx`: Custom icon components.
- `constants.ts`: Contains static data like `VARIATION_PACKS` (aesthetic style definitions) and `INITIAL_PLACEHOLDERS`.
- `types.ts`: TypeScript interfaces for `Artifact`, `Session`, and other core data structures.
- `metadata.json`: Project metadata.

## Building and Running

### Prerequisites
- Node.js and npm/yarn/pnpm.
- A **Gemini API Key** configured in `.env` as `VITE_GEMINI_API_KEY`.

### Key Commands
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Compiles the project for production.
- `npm run lint`: Performs type-checking using `tsc`.
- `npm run preview`: Previews the production build locally.

## Development Conventions

- **Surgical Updates:** When modifying `App.tsx` or `geminiService.ts`, ensure that existing streaming logic and error handling remain robust.
- **Styling:** Adhere to Tailwind CSS 4 conventions. Note that generated UIs (artifacts) use the Tailwind CDN for portability.
- **AI Prompting:** System instructions in `geminiService.ts` are critical for ensuring the model returns valid, self-contained JSON with a "styleName" and "html" property.
- **Dark Mode:** All generated UIs MUST include a functional dark/light mode toggle as per the system instructions in the generator.

## TODO / Future Enhancements
- Implement a persistent history/storage for sessions.
- Enhance the code editor view with syntax highlighting.
- Add more granular control over component-level variations.
