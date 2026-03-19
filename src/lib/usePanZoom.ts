'use client';

import { useCallback, useRef, useState } from 'react';

export function usePanZoom() {
  const [scale, setScale] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const applyTransform = useCallback(
    (s: number, px: number, py: number) => {
      setScale(s);
      setPanX(px);
      setPanY(py);
    },
    []
  );

  const fitToView = useCallback(
    (previewPane: HTMLElement, previewInner: HTMLElement, currentScale: number) => {
      const svg = previewInner.querySelector('svg');
      if (!svg) return;
      const paneW = previewPane.clientWidth;
      const paneH = previewPane.clientHeight;
      const svgW = svg.getBoundingClientRect().width / currentScale;
      const svgH = svg.getBoundingClientRect().height / currentScale;
      if (!svgW || !svgH) return;
      const fitScale = Math.min(paneW / svgW, paneH / svgH) * 0.9;
      const newScale = Math.max(0.1, Math.min(fitScale, 5));
      const newPanX = (paneW - svgW * newScale) / 2;
      const newPanY = (paneH - svgH * newScale) / 2;
      applyTransform(newScale, newPanX, newPanY);
    },
    [applyTransform]
  );

  const resetZoom = useCallback(() => {
    applyTransform(1, 0, 0);
  }, [applyTransform]);

  const zoomIn = useCallback(
    (paneRect: DOMRect, currentScale: number, currentPanX: number, currentPanY: number) => {
      const cx = paneRect.width / 2;
      const cy = paneRect.height / 2;
      const newScale = Math.min(currentScale * 1.25, 10);
      const ratio = newScale / currentScale;
      applyTransform(newScale, cx - ratio * (cx - currentPanX), cy - ratio * (cy - currentPanY));
    },
    [applyTransform]
  );

  const zoomOut = useCallback(
    (paneRect: DOMRect, currentScale: number, currentPanX: number, currentPanY: number) => {
      const cx = paneRect.width / 2;
      const cy = paneRect.height / 2;
      const newScale = Math.max(currentScale * 0.8, 0.1);
      const ratio = newScale / currentScale;
      applyTransform(newScale, cx - ratio * (cx - currentPanX), cy - ratio * (cy - currentPanY));
    },
    [applyTransform]
  );

  const handleWheel = useCallback(
    (e: WheelEvent, paneRect: DOMRect, currentScale: number, currentPanX: number, currentPanY: number) => {
      e.preventDefault();
      const mx = e.clientX - paneRect.left;
      const my = e.clientY - paneRect.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.max(0.1, Math.min(currentScale * delta, 10));
      const ratio = newScale / currentScale;
      applyTransform(newScale, mx - ratio * (mx - currentPanX), my - ratio * (my - currentPanY));
    },
    [applyTransform]
  );

  const startPan = useCallback(
    (clientX: number, clientY: number, currentPanX: number, currentPanY: number) => {
      isPanning.current = true;
      panStart.current = { x: clientX - currentPanX, y: clientY - currentPanY };
    },
    []
  );

  const movePan = useCallback(
    (clientX: number, clientY: number) => {
      if (!isPanning.current) return false;
      setPanX(clientX - panStart.current.x);
      setPanY(clientY - panStart.current.y);
      return true;
    },
    []
  );

  const endPan = useCallback(() => {
    isPanning.current = false;
  }, []);

  return {
    scale,
    panX,
    panY,
    isPanning,
    fitToView,
    resetZoom,
    zoomIn,
    zoomOut,
    handleWheel,
    startPan,
    movePan,
    endPan,
    applyTransform,
  };
}
