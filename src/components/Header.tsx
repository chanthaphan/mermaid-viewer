'use client';

import { useRef } from 'react';
import type { ExportFormat, MermaidSettings } from '@/types';
import ExamplesMenu from './ExamplesMenu';
import ExportMenu from './ExportMenu';
import FileMenu from './FileMenu';
import SettingsPanel from './SettingsPanel';
import styles from './Header.module.css';

interface Props {
  onExampleSelect: (code: string) => void;
  onImportFile: (code: string) => void;
  onExport: (format: ExportFormat) => void;
  saveBtnText: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  settingsOpen: boolean;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  settings: MermaidSettings;
  onSettingsChange: (settings: MermaidSettings) => void;
}

export default function Header({
  onExampleSelect,
  onImportFile,
  onExport,
  saveBtnText,
  isFullscreen,
  onToggleFullscreen,
  settingsOpen,
  onToggleSettings,
  onCloseSettings,
  settings,
  onSettingsChange,
}: Props) {
  const themeRef = useRef<HTMLButtonElement>(null);

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <a href="https://github.com/chanthaphan/mermaid-viewer" target="_blank" rel="noopener noreferrer" className={styles.titleLink}>
          Mermaid Viewer
        </a>
        <small className={styles.subtitle}>by Atthawut Chanthaphan</small>
      </h1>
      <div className={styles.toolbar}>
        <FileMenu onImport={onImportFile} onExport={onExport} saveBtnText={saveBtnText} />
        <ExamplesMenu onSelect={(code) => { onCloseSettings(); onExampleSelect(code); }} onOpen={onCloseSettings} />
        <span className={styles.separator} />
        <button
          className={styles.toolbarBtn}
          data-tooltip={isFullscreen ? 'Show editor (F11)' : 'Fullscreen (F11)'}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 14 4 20 10 20"/><polyline points="20 10 20 4 14 4"/><line x1="14" y1="10" x2="20" y2="4"/><line x1="4" y1="20" x2="10" y2="14"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          )}
          {isFullscreen ? 'Editor' : 'Fullscreen'}
        </button>
        <button
          ref={themeRef}
          className={styles.toolbarBtn}
          data-tooltip="Settings"
          onClick={(e) => { e.stopPropagation(); onToggleSettings(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Settings
        </button>
        <span className={styles.separator} />
        <button
          className={styles.copyBtn}
          data-tooltip="Copy to clipboard"
          onClick={() => onExport('clipboard')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        </button>
        <ExportMenu onExport={onExport} saveBtnText={saveBtnText} />
      </div>
      <SettingsPanel
        open={settingsOpen}
        onClose={onCloseSettings}
        settings={settings}
        onSettingsChange={onSettingsChange}
        toggleRef={themeRef}
      />
    </header>
  );
}
