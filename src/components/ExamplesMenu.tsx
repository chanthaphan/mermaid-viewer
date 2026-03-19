'use client';

import { useEffect, useRef, useState } from 'react';
import { EXAMPLES } from '@/lib/examples';
import styles from './ExamplesMenu.module.css';
import headerStyles from './Header.module.css';

interface Props {
  onSelect: (code: string) => void;
  onOpen?: () => void;
}

const CATEGORIES: { label: string; keys: string[] }[] = [
  {
    label: 'Basic',
    keys: ['flowchart', 'sequence', 'class', 'er', 'gantt', 'pie', 'state', 'journey', 'mindmap', 'gitgraph'],
  },
  {
    label: 'Advanced',
    keys: ['flowchartLR', 'classfull', 'seqadvanced', 'flowchartStyles', 'ganttAdvanced', 'swimlane', 'network'],
  },
  {
    label: 'Charts & Data',
    keys: ['sankey', 'xy', 'block', 'quadrant', 'requirement', 'kanban', 'packet', 'timeline', 'c4context'],
  },
  {
    label: 'Architecture',
    keys: ['architecture', 'architectureAdv', 'azureArch', 'awsArch', 'iconGuide'],
  },
  {
    label: 'ZenUML',
    keys: ['zenuml', 'zenumlTryCatch'],
  },
];

export default function ExamplesMenu({ onSelect, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
    if (!open) setSearch('');
  }, [open]);

  const filteredCategories = CATEGORIES.map((cat) => ({
    ...cat,
    keys: cat.keys.filter((key) => {
      const ex = EXAMPLES[key];
      return ex && ex.label.toLowerCase().includes(search.toLowerCase());
    }),
  })).filter((cat) => cat.keys.length > 0);

  return (
    <div className={styles.group} ref={ref}>
      <button
        className={headerStyles.toolbarBtn}
        data-tooltip="Insert example diagram"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); if (!open) onOpen?.(); }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
        Examples
      </button>
      <div className={`${styles.menu} ${open ? styles.open : ''}`}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            ref={searchRef}
            className={styles.searchInput}
            type="text"
            placeholder="Filter diagrams..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        {filteredCategories.map((cat) => (
          <div key={cat.label}>
            <div className={styles.categoryHeader}>{cat.label}</div>
            {cat.keys.map((key) => {
              const ex = EXAMPLES[key];
              return (
                <button
                  key={key}
                  className={styles.menuItem}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(ex.code);
                    setOpen(false);
                  }}
                >
                  {ex.label}
                </button>
              );
            })}
          </div>
        ))}
        {filteredCategories.length === 0 && (
          <div className={styles.noResults}>No diagrams found</div>
        )}
      </div>
    </div>
  );
}
