'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { MermaidSettings } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_CODE } from '@/types';

const STORAGE_KEY = 'mermaid-viewer-state';

interface StoredState {
  code: string;
  theme: string;
  bgColor: string;
  diagramFontSize: string;
  diagramFontFamily: string;
  clrPrimary: string;
  clrSecondary: string;
  clrTertiary: string;
  clrBackground: string;
  clrText: string;
  clrLine: string;
}

export function useLocalStorage() {
  const loaded = useRef(false);

  const loadState = useCallback((): { code: string; settings: MermaidSettings } => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { code: DEFAULT_CODE, settings: { ...DEFAULT_SETTINGS } };
      const s: Partial<StoredState> = JSON.parse(raw);
      return {
        code: s.code || DEFAULT_CODE,
        settings: {
          theme: s.theme || DEFAULT_SETTINGS.theme,
          bgColor: s.bgColor || DEFAULT_SETTINGS.bgColor,
          diagramFontSize: s.diagramFontSize ? parseInt(s.diagramFontSize) : DEFAULT_SETTINGS.diagramFontSize,
          diagramFontFamily: s.diagramFontFamily || DEFAULT_SETTINGS.diagramFontFamily,
          clrPrimary: s.clrPrimary || DEFAULT_SETTINGS.clrPrimary,
          clrSecondary: s.clrSecondary || DEFAULT_SETTINGS.clrSecondary,
          clrTertiary: s.clrTertiary || DEFAULT_SETTINGS.clrTertiary,
          clrBackground: s.clrBackground || DEFAULT_SETTINGS.clrBackground,
          clrText: s.clrText || DEFAULT_SETTINGS.clrText,
          clrLine: s.clrLine || DEFAULT_SETTINGS.clrLine,
        },
      };
    } catch {
      return { code: DEFAULT_CODE, settings: { ...DEFAULT_SETTINGS } };
    }
  }, []);

  const saveState = useCallback((code: string, settings: MermaidSettings) => {
    try {
      const state: StoredState = {
        code,
        theme: settings.theme,
        bgColor: settings.bgColor,
        diagramFontSize: String(settings.diagramFontSize),
        diagramFontFamily: settings.diagramFontFamily,
        clrPrimary: settings.clrPrimary,
        clrSecondary: settings.clrSecondary,
        clrTertiary: settings.clrTertiary,
        clrBackground: settings.clrBackground,
        clrText: settings.clrText,
        clrLine: settings.clrLine,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, []);

  return { loadState, saveState, loaded };
}
