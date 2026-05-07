"use client";

import { useRef, useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";

export interface KeystrokeEvent {
  t: number;   // ms since recording started
  code: string; // full editor content at this moment
}

export interface ReplayJSON {
  startedAt: string;        // ISO timestamp
  challengeId: string;
  language: string;
  events: KeystrokeEvent[];
}

export function useCodeRecorder(challengeId: string) {
  const startedAtRef = useRef<number | null>(null);
  const languageRef = useRef<string>("javascript");
  const eventsRef = useRef<KeystrokeEvent[]>([]);

  const startRecording = useCallback((language: string) => {
    startedAtRef.current = Date.now();
    languageRef.current = language;
    eventsRef.current = [];
  }, []);

  const recordKeystroke = useDebouncedCallback((code: string) => {
    if (startedAtRef.current === null) return;
    eventsRef.current.push({
      t: Date.now() - startedAtRef.current,
      code,
    });
  }, 1000);

  const exportReplay = useCallback((): string => {
    const replay: ReplayJSON = {
      startedAt: startedAtRef.current
        ? new Date(startedAtRef.current).toISOString()
        : new Date().toISOString(),
      challengeId,
      language: languageRef.current,
      events: eventsRef.current,
    };
    return JSON.stringify(replay);
  }, [challengeId]);

  const setLanguage = useCallback((lang: string) => {
    languageRef.current = lang;
  }, []);

  return { startRecording, recordKeystroke, exportReplay, setLanguage };
}
