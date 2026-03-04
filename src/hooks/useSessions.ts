import { useState, useEffect } from "react";
import { Session } from "@/types";
import { loadSessions, saveSessions } from "@/utils/storage";

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Load history on mount
  useEffect(() => {
    const loaded = loadSessions();
    if (loaded && loaded.length > 0) {
      setSessions(loaded);
    }
  }, []);

  // Save history whenever sessions change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  const deleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSessions(updated);
      return updated;
    });
  };

  return {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSessionId,
    deleteSession,
  };
}
