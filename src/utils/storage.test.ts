import { describe, it, expect, beforeEach, vi } from 'vitest';
import { saveSessions, loadSessions, clearSessions } from './storage';
import { Session } from '../../types';

describe('Storage Utility', () => {
    const mockSessions: Session[] = [
        {
            id: '1',
            prompt: 'Test prompt 1',
            timestamp: Date.now(),
            artifacts: [
                { id: 'art-1', styleName: 'Test Style', html: '<div>1</div>', status: 'complete' }
            ]
        }
    ];

    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
    });

    it('should save and load sessions correctly', () => {
        saveSessions(mockSessions);
        const loaded = loadSessions();
        expect(loaded).toEqual(mockSessions);
    });

    it('should return empty array if no sessions are stored', () => {
        const loaded = loadSessions();
        expect(loaded).toEqual([]);
    });

    it('should clear sessions', () => {
        saveSessions(mockSessions);
        clearSessions();
        const loaded = loadSessions();
        expect(loaded).toEqual([]);
    });

    it('should handle invalid JSON in localStorage gracefully', () => {
        localStorage.setItem('uiflash_sessions', '{invalid}');
        const loaded = loadSessions();
        expect(loaded).toEqual([]);
    });

    it('should handle localStorage.setItem failure gracefully', () => {
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('Quota exceeded');
        });
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        
        saveSessions(mockSessions);
        
        expect(consoleSpy).toHaveBeenCalledWith('Failed to save sessions to localStorage:', expect.any(Error));
        
        setItemSpy.mockRestore();
        consoleSpy.mockRestore();
    });
});
