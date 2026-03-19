'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExportFormat } from '@/types';
import styles from './FileMenu.module.css';
import headerStyles from './Header.module.css';

interface Props {
  onImport: (code: string) => void;
  onExport: (format: ExportFormat) => void;
  saveBtnText: string;
}

export default function FileMenu({ onImport, onExport, saveBtnText }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) onImport(ev.target.result as string);
    };
    reader.readAsText(file);
    e.target.value = '';
    setOpen(false);
  };

  const isCopied = saveBtnText === 'Copied!';

  return (
    <div className={styles.group} ref={ref}>
      <input
        ref={fileInputRef}
        type="file"
        accept=".mmd,.mermaid,.md,.txt"
        style={{ display: 'none' }}
        onChange={handleFileImport}
      />
      <button
        className={`${headerStyles.toolbarBtn} ${isCopied ? styles.btnPulse : ''}`}
        data-tooltip="File (Ctrl+S)"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        File
      </button>
      <div className={`${styles.menu} ${open ? styles.open : ''}`}>
        <div className={styles.sectionHeader}>Open</div>
        <button
          className={styles.menuItem}
          onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          Open .mmd file...
        </button>
        <div className={styles.menuDivider} />
        <div className={styles.sectionHeader}>Save</div>
        <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); onExport('mmd'); setOpen(false); }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Save as .mmd
        </button>
      </div>
    </div>
  );
}
