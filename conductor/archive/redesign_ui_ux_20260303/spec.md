# Specification: REDesign style ui and ux of the app

## Overview
This track focuses on a comprehensive overhaul of the UIFlash Studio visual identity and user experience. The application will be rebuilt using **shadcn/ui** as the foundational component library, styled with a "Glassmorphism 2.0" aesthetic.

## Functional Requirements
- **shadcn/ui Integration:** Implement the core design system using shadcn/ui components (e.g., Tabs, Sheets, Buttons, Inputs, Dialogs, etc.).
- **Glassmorphism 2.0 Aesthetic:** Style the shadcn/ui components and the overall layout with glass effects, backdrop blurs, subtle borders, and depth via layered shadows.
- **Themeable UI Engine:** Develop a theme system allowing users to switch between different color presets, leveraging shadcn/ui's CSS variables system.
- **Sidebar & Controls Revamp:** Redesign the sidebar for better ergonomics using shadcn/ui components for sections, inputs, and session management.
- **Enhanced Artifact Preview:** Polishing the preview container using shadcn/ui's Card and Toolbar patterns.
- **Unified Loading & State UI:** Implementing high-fidelity animations and visual feedback using shadcn/ui progress and skeleton components where appropriate.

## UX Improvements
- **Optimized Input Ergonomics:** Improve the prompt input and image upload experience using polished shadcn/ui form elements.
- **Seamless Device Mode Switching:** Make the transition between Mobile and Desktop preview modes more intuitive.
- **Improved History Visibility:** Enhance the accessibility and display of saved sessions using shadcn/ui's scroll areas or side panels.

## Acceptance Criteria
- Entire application is built using shadcn/ui components.
- UI follows the "Glassmorphism 2.0" style.
- User can toggle between at least two theme presets.
- Sidebar is more readable and ergonomically improved.
- Transitions between preview modes are smooth and intuitive.

## Out of Scope
- backend changes to Gemini API integration.
- Implementation of multi-page flows.