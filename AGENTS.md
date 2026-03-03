# Repository Guidelines

## Project Structure & Module Organization
This is a Vite + React + TypeScript project with a mostly flat structure.

- Main app shell: `App.tsx`
- Entry point: `index.tsx`
- Shared UI components: `components/` (PascalCase files like `SideDrawer.tsx`)
- AI/service logic: `src/services/` (`geminiService.ts`)
- Shared constants/types/utilities: `constants.ts`, `types.ts`, `utils.ts`
- Global styles: `index.css`
- Build/tooling config: `vite.config.ts`, `tsconfig.json`, `package.json`

Use the `@` alias for root-based imports when helpful (configured in Vite/TS).

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start local dev server on port `3000` (`0.0.0.0` host).
- `npm run build`: create production build in `dist/`.
- `npm run preview`: serve the built app locally.
- `npm run lint`: TypeScript type-check (`tsc --noEmit`).

Example flow:
```bash
npm install
npm run lint
npm run dev
```

## Coding Style & Naming Conventions
- Language: TypeScript + React function components with hooks.
- Indentation: 2 spaces preferred; keep formatting consistent within edited files.
- Components/types: `PascalCase` (`ArtifactCard`, `VariationPack`).
- Variables/functions/hooks: `camelCase` (`generateImageAsset`, `setIsGenerating`).
- Keep modules focused: UI in `components/`, model/API interactions in `src/services/`.

No dedicated Prettier/ESLint ruleset is configured; use clean, readable TypeScript and run `npm run lint` before committing.

## Testing Guidelines
There is currently no automated test suite configured (`npm test` is not defined). For now:
- Run `npm run lint` on every change.
- Perform manual smoke tests in `npm run dev` for key flows:
  - prompt-based generation
  - image upload/analysis
  - export actions and view-mode toggles

When adding tests, colocate them as `*.test.ts(x)` near source files or under a future `tests/` directory.

## Commit & Pull Request Guidelines
Recent history follows Conventional Commit style (for example: `feat: add image asset generation`). Use:
- `feat: ...`, `fix: ...`, `chore: ...`, `docs: ...`, `refactor: ...`

PRs should include:
- Clear summary of behavior changes
- Linked issue/task when available
- Screenshots or short recordings for UI changes
- Verification notes (commands run, manual checks performed)
