'use client';

import { useEffect, useRef } from 'react';
import type { MermaidSettings } from '@/types';
import { BG_PRESETS, THEME_PRESETS, FONT_OPTIONS, DEFAULT_SETTINGS } from '@/types';
import styles from './SettingsPanel.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
  settings: MermaidSettings;
  onSettingsChange: (settings: MermaidSettings) => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
}

export default function SettingsPanel({ open, onClose, settings, onSettingsChange, toggleRef }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        toggleRef.current &&
        !toggleRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [onClose, toggleRef]);

  const update = (partial: Partial<MermaidSettings>) => {
    onSettingsChange({ ...settings, ...partial });
  };

  const transparentBg = 'repeating-conic-gradient(#ccc 0% 25%, #fff 0% 50%) 0 0 / 14px 14px';

  return (
    <div className={`${styles.panel} ${open ? styles.open : ''}`} ref={ref}>
      <div className={styles.panelHeader}>
        <h3 className={styles.panelTitle}>Settings</h3>
        <button className={styles.closeBtn} onClick={onClose} title="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <h3 className={styles.heading}>Background</h3>
      <div className={styles.presetRow}>
        {BG_PRESETS.map((p) => (
          <button
            key={p.color}
            className={`${styles.presetBtn} ${settings.bgColor === p.color ? styles.presetActive : ''}`}
            style={{
              background: p.color === 'transparent' ? transparentBg : p.color,
            }}
            title={p.title}
            onClick={() => update({ bgColor: p.color })}
          />
        ))}
      </div>
      <div className={styles.colorRow}>
        <label className={styles.colorLabel}>Custom</label>
        <input
          type="color"
          className={styles.colorInput}
          value={settings.bgColor === 'transparent' ? '#ffffff' : settings.bgColor}
          onChange={(e) => update({ bgColor: e.target.value })}
        />
      </div>

      <h3 className={`${styles.heading} ${styles.headingBorder}`}>Diagram Colors</h3>
      {[
        { key: 'clrPrimary' as const, label: 'Primary (nodes)' },
        { key: 'clrSecondary' as const, label: 'Secondary' },
        { key: 'clrTertiary' as const, label: 'Tertiary' },
        { key: 'clrBackground' as const, label: 'Background' },
        { key: 'clrText' as const, label: 'Text' },
        { key: 'clrLine' as const, label: 'Lines' },
      ].map(({ key, label }) => (
        <div className={styles.colorRow} key={key}>
          <label className={styles.colorLabel}>{label}</label>
          <input
            type="color"
            className={styles.colorInput}
            value={settings[key]}
            onChange={(e) => update({ [key]: e.target.value, theme: 'base' })}
          />
        </div>
      ))}

      <h3 className={`${styles.heading} ${styles.headingBorder}`}>Diagram Font</h3>
      <div className={styles.sizeRow}>
        <label className={styles.sizeLabel}>Size</label>
        <input
          type="range"
          className={styles.sizeRange}
          min={10}
          max={30}
          value={settings.diagramFontSize}
          onChange={(e) => update({ diagramFontSize: parseInt(e.target.value) })}
        />
        <span className={styles.sizeValue}>{settings.diagramFontSize}px</span>
      </div>
      <div className={styles.fontRow}>
        <label className={styles.colorLabel}>Family</label>
        <select
          className={styles.fontSelect}
          value={settings.diagramFontFamily}
          onChange={(e) => update({ diagramFontFamily: e.target.value })}
        >
          {FONT_OPTIONS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      <h3 className={`${styles.heading} ${styles.headingBorder}`}>Mermaid Theme</h3>
      <div className={styles.themeGrid}>
        {THEME_PRESETS.map((p) => (
          <button
            key={p.theme}
            className={`${styles.themeBtn} ${settings.theme === p.theme ? styles.themeBtnActive : ''}`}
            onClick={() => update({ theme: p.theme })}
          >
            <span className={styles.themeSwatch} style={{ background: p.gradient }} />
            <span className={styles.themeLabel}>{p.title}</span>
          </button>
        ))}
      </div>

      <div className={styles.resetRow}>
        <button className={styles.resetBtn} onClick={() => onSettingsChange({ ...DEFAULT_SETTINGS })}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
