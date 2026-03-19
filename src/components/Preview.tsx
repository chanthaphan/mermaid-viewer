'use client';

import { forwardRef, useCallback, useEffect, useRef } from 'react';
import styles from './Preview.module.css';

interface Props {
  svgHtml: string;
  bgColor: string;
  scale: number;
  panX: number;
  panY: number;
  onWheel: (e: WheelEvent) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToView: () => void;
  onResetZoom: () => void;
  isPanning: boolean;
}

function isDarkBg(color: string): boolean {
  if (color === 'transparent') return false;
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

const Preview = forwardRef<HTMLDivElement, Props>(function Preview(
  { svgHtml, bgColor, scale, panX, panY, onWheel, onMouseDown, onZoomIn, onZoomOut, onFitToView, onResetZoom, isPanning },
  ref
) {
  const paneRef = useRef<HTMLDivElement>(null);
  const dark = isDarkBg(bgColor);

  const bgStyle = bgColor === 'transparent'
    ? 'repeating-conic-gradient(#e0e0e0 0% 25%, #fff 0% 50%) 0 0 / 20px 20px'
    : bgColor;

  useEffect(() => {
    const el = paneRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => { e.preventDefault(); onWheel(e); };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [onWheel]);

  // Touch gestures
  const touchState = useRef({ dist: 0, scale: 1, x: 0, y: 0, panX: 0, panY: 0 });

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.zoomControls}`)) return;
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchState.current.dist = Math.hypot(dx, dy);
      touchState.current.scale = scale;
    } else if (e.touches.length === 1) {
      touchState.current.x = e.touches[0].clientX;
      touchState.current.y = e.touches[0].clientY;
      touchState.current.panX = panX;
      touchState.current.panY = panY;
    }
  }, [scale, panX, panY]);

  return (
    <div
      ref={paneRef}
      className={`${styles.previewPane} ${dark ? styles.dark : ''} ${isPanning ? styles.grabbing : ''}`}
      style={{ background: bgStyle }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest(`.${styles.zoomControls}`)) return;
        onMouseDown(e);
      }}
      onTouchStart={handleTouchStart}
    >
      <div
        ref={ref}
        className={styles.previewInner}
        style={{ transform: `translate(${panX}px, ${panY}px) scale(${scale})` }}
        dangerouslySetInnerHTML={{ __html: svgHtml }}
      />
      <div className={styles.zoomControls}>
        <button className={styles.zoomBtn} onClick={onZoomOut} title="Zoom out">&#8722;</button>
        <span className={styles.zoomLabel}>{Math.round(scale * 100)}%</span>
        <button className={styles.zoomBtn} onClick={onZoomIn} title="Zoom in">+</button>
        <span className={styles.zoomDivider} />
        <button className={styles.zoomBtn} onClick={onFitToView} title="Fit to view">&#8865;</button>
        <button className={styles.zoomBtn} onClick={onResetZoom} title="Reset zoom">1:1</button>
      </div>
    </div>
  );
});

export default Preview;
