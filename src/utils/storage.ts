import { Session } from '../../types';

const STORAGE_KEY = 'uiflash_sessions';

export const saveSessions = (sessions: Session[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    } catch (err) {
        console.error('Failed to save sessions to localStorage:', err);
    }
};

export const loadSessions = (): Session[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        return JSON.parse(stored);
    } catch (err) {
        console.error('Failed to load sessions from localStorage:', err);
        return [];
    }
};

export const clearSessions = (): void => {
    localStorage.removeItem(STORAGE_KEY);
};
