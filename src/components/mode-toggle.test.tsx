import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ModeToggle } from "./mode-toggle";
import { ThemeProvider } from "./theme-provider";

describe("ModeToggle Component", () => {
  it("renders without crashing", () => {
    render(
      <ThemeProvider attribute="class">
        <ModeToggle />
      </ThemeProvider>,
    );
    expect(
      screen.getByRole("button", { name: /Toggle theme/i }),
    ).toBeInTheDocument();
  });
});
