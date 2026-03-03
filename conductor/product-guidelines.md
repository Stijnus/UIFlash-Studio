# Product Guidelines: UIFlash Studio

## 1. UX Philosophy: Dense & Feature-Rich
The interface should act as a high-powered IDE rather than a simplistic tool. We prioritize exposing controls, variation packs, and configuration options upfront to reduce navigation clicks. The layout should efficiently utilize screen real estate to accommodate side-by-side previews, code editors, and AI feedback panels simultaneously.

## 2. Visual Design Language: Neutral/Dark Theme Default
To ensure the generated UIs remain the focal point, the application itself will default to a professional, low-contrast dark theme (e.g., heavily utilizing Tailwind's `zinc` or `slate` palettes). UI chrome should be unobtrusive, avoiding vibrant brand colors except for critical interactive elements like primary action buttons (e.g., "Generate").

## 3. AI Interaction Paradigms
A multi-modal approach is required to cater to different user workflows:
- **Form/Input Heavy:** Provide structured inputs (dropdowns for models, checkboxes for styles) to yield predictable generation results.
- **Chat-Driven:** Allow iterative refinement through a conversational interface (e.g., "Make the button rounded" or "Change the theme to light mode").
- **Command-Palette Driven:** Implement keyboard-centric shortcuts (e.g., `Cmd+K`) for power users to execute generation, toggle views, or export code without leaving the keyboard.

## 4. Error & State Handling: Strict Validation
To minimize wasted API calls and ensure high-quality outputs, apply strict validation before sending prompts to the Gemini model. This includes:
- Preventing empty prompts (unless images are provided).
- Validating the format and size of uploaded reference images.
- Clearly displaying inline errors or warnings *before* generation begins if parameters are invalid.

## 5. Accessibility and Performance
- Ensure the dense UI is still navigable via keyboard.
- Maintain high performance when rendering iframes or updating large code blocks in the editor.
- Generated code must inherently favor semantic HTML and accessible Tailwind patterns.