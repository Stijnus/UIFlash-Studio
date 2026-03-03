import { GoogleGenAI, Type } from '@google/genai';

const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) throw new Error("API key is missing");
    return new GoogleGenAI({ apiKey });
};

export const generateUI = async function* (
    prompt: string, 
    model: string, 
    images?: { data: string; mimeType: string }[],
    previousHtml?: string,
    deviceMode: 'desktop' | 'mobile' = 'desktop'
) {
    const ai = getAi();
    
    let fullPrompt = prompt;
    if (previousHtml) {
        fullPrompt = `Update the following HTML based on this request: "${prompt}"\n\nExisting HTML:\n\`\`\`html\n${previousHtml}\n\`\`\``;
    }

    const parts: any[] = [{ text: fullPrompt }];
    if (images && images.length > 0) {
        images.forEach(img => {
            parts.push({
                inlineData: {
                    data: img.data,
                    mimeType: img.mimeType
                }
            });
        });
    }

    const systemInstruction = `You are an expert frontend developer and UI designer. 
Your task is to generate a single, self-contained HTML file that includes HTML, CSS (using Tailwind CSS via CDN), and JavaScript.
CRITICAL INSTRUCTION: You MUST include a functional dark/light mode toggle button in the generated UI. The toggle should switch the Tailwind 'dark' class on the root element (<html>) or body, and the design must support both light and dark themes using Tailwind's dark: variants.
CRITICAL INSTRUCTION: You are generating UI for a ${deviceMode.toUpperCase()} application. Ensure the layout, typography, touch targets, and overall design are optimized for ${deviceMode}.
The output MUST be a valid JSON object with the following structure:
{
  "styleName": "A short, catchy name for the design style (e.g., 'Glassmorphism', 'Brutalist')",
  "html": "The complete HTML code as a string"
}
Do NOT wrap the JSON in markdown code blocks. Return ONLY the raw JSON object.`;

    const responseStream = await ai.models.generateContentStream({
        model: model,
        contents: [{ role: 'user', parts }],
        config: {
            systemInstruction,
            temperature: 0.7,
        }
    }).catch(err => {
        throw new Error(`Failed to start generation stream: ${err.message}`);
    });

    let buffer = '';
    try {
        for await (const chunk of responseStream) {
            const text = chunk.text;
            if (text) {
                buffer += text;
                yield buffer;
            }
        }
    } catch (err: any) {
        yield { styleName: 'Error', html: `<div>Stream error: ${err.message}</div>` };
        return;
    }
    
    if (!buffer) {
        yield { styleName: 'Error', html: '<div>Model returned an empty response.</div>' };
        return;
    }

    // Attempt to parse the final buffer
    try {
        const jsonMatch = buffer.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.html) {
                yield parsed;
            } else {
                yield { styleName: 'Error', html: `<div>Parsed JSON missing 'html' property: ${JSON.stringify(parsed)}</div>` };
            }
        } else {
            yield { styleName: 'Error', html: `<div>Failed to find JSON object in response. Raw response: ${buffer.substring(0, 500)}...</div>` };
        }
    } catch (e) {
        yield { styleName: 'Error', html: `<div>Error parsing JSON: ${e}. Raw response: ${buffer.substring(0, 500)}...</div>` };
    }
};

export const analyzeImages = async (images: { data: string; mimeType: string }[]) => {
    const ai = getAi();
    const parts: any[] = [
        { text: "Analyze these images and suggest a UI design prompt based on them. Return a short, descriptive prompt." }
    ];
    images.forEach(img => {
        parts.push({
            inlineData: { data: img.data, mimeType: img.mimeType }
        });
    });

    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts }]
    }).catch(err => {
        throw new Error(`Failed to analyze images: ${err.message}`);
    });

    if (!response.text) {
        throw new Error("Model failed to generate a prompt from the images.");
    }

    return response.text;
};

export const generateImageAsset = async (prompt: string) => {
    const ai = getAi();
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
            imageConfig: {
                aspectRatio: "1:1",
            },
        } as any,
    }).catch(err => {
        throw new Error(`Failed to generate image: ${err.message}`);
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return {
                data: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
                url: `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
            };
        }
    }
    throw new Error("No image data returned from model.");
};

export const analyzeImageForFeedback = async function* (images: { data: string; mimeType: string }[]) {
    const ai = getAi();
    const parts: any[] = [
        { text: `Analyze the provided UI design image(s). 
        1. Provide a detailed breakdown of the current design (layout, colors, typography, UX).
        2. Propose directions for improvement (what could be better, more modern, or more user-friendly).
        3. Suggest 3 specific actionable changes to elevate the design.
        Format the response in clean Markdown.` }
    ];
    images.forEach(img => {
        parts.push({
            inlineData: { data: img.data, mimeType: img.mimeType }
        });
    });

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-pro-preview', // Use pro for better analysis
        contents: [{ role: 'user', parts }]
    });

    for await (const chunk of responseStream) {
        if (chunk.text) {
            yield chunk.text;
        }
    }
};
