import { Session } from "@/types";

const STORAGE_KEY = "uiflash_sessions";

export const saveSessions = (sessions: Session[]): void => {
  try {
    // Optimization: Strip large image data before saving to localStorage
    const optimized = sessions.map((s) => ({
      ...s,
      images: s.images?.map((img) => {
        const { data, url, ...rest } = img;
        return rest;
      }),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(optimized));
  } catch (err) {
    console.error("Failed to save sessions to localStorage:", err);
  }
};

export const loadSessions = (): Session[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (err) {
    console.error("Failed to load sessions from localStorage:", err);
    return [];
  }
};

export const clearSessions = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
