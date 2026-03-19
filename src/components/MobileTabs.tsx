'use client';

import styles from './MobileTabs.module.css';

interface Props {
  activeTab: 'editor' | 'preview';
  onTabChange: (tab: 'editor' | 'preview') => void;
}

export default function MobileTabs({ activeTab, onTabChange }: Props) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'editor' ? styles.active : ''}`}
        onClick={() => onTabChange('editor')}
      >
        Editor
      </button>
      <button
        className={`${styles.tab} ${activeTab === 'preview' ? styles.active : ''}`}
        onClick={() => onTabChange('preview')}
      >
        Preview
      </button>
    </div>
  );
}
