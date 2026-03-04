import { GoogleGenAI } from "@google/genai";
import { UploadedImage } from "@/types";
import { MODELS } from "@/constants";

const getAi = () => {
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.API_KEY ||
    import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error("API key is missing");
  return new GoogleGenAI({ apiKey });
};

export const generateUI = async function* (
  prompt: string,
  model: string,
  images?: UploadedImage[],
  previousHtml?: string,
  deviceMode: "desktop" | "mobile" | "tablet" = "desktop",
) {
  const ai = getAi();

  let fullPrompt = prompt;
  if (previousHtml) {
    fullPrompt = `Update the following HTML based on this request: "${prompt}"

IMPORTANT: Preserve ALL existing functionality, styles, and features (including the dark/light mode toggle, layout structure, and responsive behavior). Only modify what is explicitly requested. Do not remove or break any features that are not mentioned in the request.

Existing HTML:
\`\`\`html
${previousHtml}
\`\`\``;
  }

  const parts: any[] = [{ text: fullPrompt }];
  if (images && images.length > 0) {
    images.forEach((img) => {
      parts.push({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType,
        },
      });
    });
  }

  const systemInstruction = `You are an expert frontend developer and UI designer. 
Your task is to generate a single, self-contained HTML file that includes HTML, CSS (using Tailwind CSS via CDN), and JavaScript.
CRITICAL INSTRUCTION: You MUST include a functional dark/light mode toggle button in the generated UI. The toggle should switch the Tailwind 'dark' class on the root element (<html>) or body, and the design must support both light and dark themes using Tailwind's dark: variants.
DEVICE TARGET: You are generating UI for a ${deviceMode.toUpperCase()} viewport.
${
  deviceMode === "mobile"
    ? `MOBILE DESIGN RULES (target: 375×812px, iPhone-class):
- Include <meta name="viewport" content="width=device-width, initial-scale=1"> in the <head>.
- Use a single-column layout. No multi-column grids wider than 2 columns.
- Touch targets must be ≥44×44px. Buttons should have generous padding.
- Use bottom navigation or a hamburger menu — never a full horizontal nav bar.
- Font sizes: body ≥16px (to prevent iOS zoom), headings 24-32px.
- Avoid hover-dependent interactions; design for tap and swipe.
- Use full-width cards and inputs. Ensure content doesn't overflow horizontally.`
    : deviceMode === "tablet"
      ? `TABLET DESIGN RULES (target: 768×1024px, iPad-class):
- Include <meta name="viewport" content="width=device-width, initial-scale=1"> in the <head>.
- Use a flexible 2-column layout (sidebar + content) or responsive grid.
- Touch targets must be ≥44×44px. Support both touch and pointer inputs.
- Font sizes: body 16-18px, headings 28-40px.
- Navigation can use a collapsible sidebar or top bar with icons.
- Balance between mobile simplicity and desktop density.`
      : `DESKTOP DESIGN RULES (target: 1280×800px):
- Use multi-column layouts, sidebars, and spacious grids freely.
- Include hover states on all interactive elements.
- Font sizes: body 14-16px, headings 32-56px.
- Navigation should use a full horizontal navbar or persistent sidebar.
- Design for mouse and keyboard (focus-visible states, hover tooltips).
- Make effective use of horizontal space — avoid single-column layouts.`
}
If you use any custom fonts (e.g., Google Fonts like Inter, Cormorant Garamond, Anton, Quicksand, Outfit, etc.), you MUST include the appropriate <link> tag in the <head> to load the font from https://fonts.googleapis.com. Do not reference fonts that are not loaded.
QUALITY REQUIREMENTS:
- Use semantic HTML elements (header, nav, main, section, footer, article) for proper document structure.
- Include appropriate ARIA labels on interactive elements (buttons, inputs, links) for screen reader accessibility.
- Ensure sufficient color contrast ratios (WCAG AA minimum) between text and backgrounds.
- Add focus-visible styles on interactive elements for keyboard navigation.
- Include smooth transitions and micro-animations for a premium feel (hover states, focus rings, transitions).
The output MUST be a valid JSON object with the following structure:
{
  "styleName": "A short, catchy name for the design style (e.g., 'Glassmorphism', 'Brutalist')",
  "html": "The complete HTML code as a string"
}
Do NOT wrap the JSON in markdown code blocks. Return ONLY the raw JSON object.`;

  const responseStream = await ai.models
    .generateContentStream({
      model: model || MODELS.FLASH,
      contents: [{ role: "user", parts }],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    })
    .catch((err) => {
      throw new Error(`Failed to start generation stream: ${err.message}`);
    });

  let lastUsageMetadata: any = null;

  for await (const chunk of responseStream) {
    // Track usageMetadata from every chunk — the last one is the most complete
    if (chunk.usageMetadata) {
      lastUsageMetadata = chunk.usageMetadata;
    }
    const text = chunk.text;
    if (text) {
      yield text;
    }
  }

  // Emit usage metadata as a final dedicated signal after all text is done
  if (lastUsageMetadata) {
    console.debug("[UIFlash] usageMetadata captured:", lastUsageMetadata);
    yield { type: "usage", metadata: lastUsageMetadata };
  } else {
    console.debug("[UIFlash] No usageMetadata returned by the model.");
  }
};

/**
 * Parse the raw streamed JSON response from generateUI into {styleName, html}.
 * Handles cases like markdown fences, missing properties, truncated/malformed JSON.
 */
export function parseGeneratedResponse(raw: string): {
  styleName: string;
  html: string;
} {
  if (!raw) {
    return {
      styleName: "Error",
      html: "<div>Model returned an empty response.</div>",
    };
  }

  // Strip markdown code fences if present
  const stripped = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  // Strategy 1: Try a full JSON parse
  try {
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.html) {
        return { styleName: parsed.styleName || "Custom", html: parsed.html };
      }
    }
  } catch {
    // Fall through to recovery strategies
  }

  // Strategy 2: Regex-extract the styleName and html field values even from truncated JSON.
  // The model truncates inside the "html" string value, so we grab everything after `"html":"`
  // up to the last `</html>` tag (or as much as we have).
  try {
    const styleMatch = stripped.match(/"styleName"\s*:\s*"([^"]+)"/);
    const styleName = styleMatch ? styleMatch[1] : "Custom";

    // Find the start of the html value (after `"html":"` or `"html": "`)
    const htmlKeyIdx = stripped.search(/"html"\s*:\s*"/);
    if (htmlKeyIdx !== -1) {
      // Skip past the key and opening quote
      const valueStart =
        stripped.indexOf('"', stripped.indexOf(":", htmlKeyIdx) + 1) + 1;
      let htmlContent = stripped.slice(valueStart);

      // Unescape JSON string sequences that were already emitted
      htmlContent = htmlContent
        .replace(/\\n/g, "\n")
        .replace(/\\t/g, "\t")
        .replace(/\\r/g, "\r")
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, "\\");

      // Close any open tags to make it renderable — find the last </html> or </body>
      const closeHtml = htmlContent.lastIndexOf("</html>");
      const closeBody = htmlContent.lastIndexOf("</body>");
      if (closeHtml !== -1) {
        htmlContent = htmlContent.slice(0, closeHtml + 7);
      } else if (closeBody !== -1) {
        htmlContent = htmlContent.slice(0, closeBody + 7) + "\n</html>";
      }
      // If we have something that looks like HTML, return it
      if (htmlContent.includes("<") && htmlContent.length > 50) {
        return { styleName, html: htmlContent };
      }
    }
  } catch {
    // Fall through
  }

  // Strategy 3: If the raw content itself looks like HTML (not wrapped in JSON), return it directly
  if (stripped.startsWith("<!DOCTYPE") || stripped.startsWith("<html")) {
    return { styleName: "Custom", html: stripped };
  }

  return {
    styleName: "Error",
    html: `<div style="font-family:monospace;padding:1rem;color:#ef4444;">
      <strong>Failed to parse response</strong><br/>
      The model's response was likely truncated. Try regenerating.
      <br/><details><summary>Raw (first 500 chars)</summary><pre>${raw.substring(0, 500)}</pre></details>
    </div>`,
  };
}

export const analyzeImages = async (
  images: { data: string; mimeType: string }[],
) => {
  const ai = getAi();
  const parts: any[] = [
    {
      text: "Analyze these images and suggest a UI design prompt based on them. Return a short, descriptive prompt.",
    },
  ];
  images.forEach((img) => {
    parts.push({
      inlineData: { data: img.data, mimeType: img.mimeType },
    });
  });

  const response = await ai.models
    .generateContent({
      model: MODELS.FLASH,
      contents: [{ role: "user", parts }],
    })
    .catch((err) => {
      throw new Error(`Failed to analyze images: ${err.message}`);
    });

  if (!response.text) {
    throw new Error("Model failed to generate a prompt from the images.");
  }

  return response.text;
};

export const generateImageAsset = async (prompt: string) => {
  const ai = getAi();
  const systemPrompt = `You are a professional UI asset designer. Generate a clean, high-quality design asset suitable for use in a web or mobile UI. The asset should have a transparent or minimal background, use crisp vector-style rendering, and be production-ready. Follow the user's description precisely.`;
  const response = await ai.models
    .generateContent({
      model: MODELS.IMAGE,
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nAsset description: ${prompt}` }],
        },
      ],
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      } as any,
    })
    .catch((err) => {
      throw new Error(`Failed to generate image: ${err.message}`);
    });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return {
        data: part.inlineData.data,
        mimeType: part.inlineData.mimeType,
        url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`,
      };
    }
  }
  throw new Error("No image data returned from model.");
};

export const analyzeImageForFeedback = async function* (
  images: { data: string; mimeType: string }[],
) {
  const ai = getAi();
  const parts: any[] = [
    {
      text: `Analyze the provided UI design image(s). 
        1. Provide a detailed breakdown of the current design (layout, colors, typography, UX).
        2. Propose directions for improvement (what could be better, more modern, or more user-friendly).
        3. Suggest 3 specific actionable changes to elevate the design.
        Format the response in clean Markdown.`,
    },
  ];
  images.forEach((img) => {
    parts.push({
      inlineData: { data: img.data, mimeType: img.mimeType },
    });
  });

  const responseStream = await ai.models.generateContentStream({
    model: MODELS.PRO, // Use pro for better analysis
    contents: [{ role: "user", parts }],
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
};
