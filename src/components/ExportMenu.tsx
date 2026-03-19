'use client';

import { useEffect, useRef, useState } from 'react';
import type { ExportFormat } from '@/types';
import styles from './ExportMenu.module.css';

interface Props {
  onExport: (format: ExportFormat) => void;
  saveBtnText: string;
}

const IMAGE_FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'png', label: 'Save as PNG' },
  { format: 'jpg', label: 'Save as JPG' },
  { format: 'svg', label: 'Save as SVG' },
  { format: 'pdf', label: 'Save as PDF' },
  { format: 'clipboard', label: 'Copy to Clipboard' },
];

const SOURCE_FORMATS: { format: ExportFormat; label: string }[] = [
  { format: 'mmd', label: 'Save as .mmd' },
];

export default function ExportMenu({ onExport, saveBtnText }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const isCopied = saveBtnText === 'Copied!';

  return (
    <div className={styles.group} ref={ref}>
      <button
        className={`${styles.saveBtn} ${isCopied ? styles.saveBtnPulse : ''}`}
        data-tooltip="Export diagram (Ctrl+S)"
        onClick={() => onExport('png')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        {saveBtnText}
      </button>
      <button
        className={styles.dropdownBtn}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div className={`${styles.menu} ${open ? styles.open : ''}`}>
        {IMAGE_FORMATS.map(({ format, label }) => (
          <button
            key={format}
            className={styles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              onExport(format);
              setOpen(false);
            }}
          >
            {label}
          </button>
        ))}
        <div className={styles.menuDivider} />
        {SOURCE_FORMATS.map(({ format, label }) => (
          <button
            key={format}
            className={styles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              onExport(format);
              setOpen(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
