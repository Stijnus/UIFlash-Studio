# Specification: Add .env.example file

## Overview
This track involves creating a `.env.example` file to document the environment variables required for the project. This ensures that new contributors can easily set up their local development environment.

## Functional Requirements
- Create a `.env.example` file in the project root.
- Include the `GEMINI_API_KEY` variable.
- Include placeholder variables like `VITE_PORT` for future configuration.
- Provide comments in the file explaining the purpose of each variable and where to obtain necessary keys (e.g., Google AI Studio for Gemini).
- Add a simple validation script or update an existing one to ensure that all variables in `.env.example` are present in the active `.env` file (if it exists).

## Acceptance Criteria
- `.env.example` exists in the root directory.
- All currently used environment variables are documented.
- Clear instructions are provided within the file as comments.
- A validation mechanism is in place to prevent missing environment variables during setup.

## Out of Scope
- Actually providing secret keys in the example file.
- Setting up a remote secrets management system.