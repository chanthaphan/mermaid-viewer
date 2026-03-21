'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ExportFormat, MermaidSettings } from '@/types';
import { DEFAULT_SETTINGS, DEFAULT_CODE } from '@/types';
import { exportAs } from '@/lib/export';
import { useLocalStorage } from '@/lib/useLocalStorage';
import { usePanZoom } from '@/lib/usePanZoom';
import Header from '@/components/Header';
import Editor from '@/components/Editor';
import Preview from '@/components/Preview';
import MobileTabs from '@/components/MobileTabs';
import styles from './page.module.css';

function isDarkBg(color: string): boolean {
  if (color === 'transparent') return false;
  const hex = color.replace('#', '');
  if (hex.length !== 6) return false;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export default function Home() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [settings, setSettings] = useState<MermaidSettings>(DEFAULT_SETTINGS);
  const [svgHtml, setSvgHtml] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorLine, setErrorLine] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [showDrop, setShowDrop] = useState(false);
  const [saveBtnText, setSaveBtnText] = useState('Save PNG');
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const editorPaneRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const previewPaneRef = useRef<HTMLDivElement>(null);
  const renderCounter = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mermaidRef = useRef<typeof import('mermaid').default | null>(null);
  const dragCounter = useRef(0);

  const { loadState, saveState } = useLocalStorage();
  const panZoom = usePanZoom();

  // Load saved state + init mermaid
  useEffect(() => {
    const { code: savedCode, settings: savedSettings } = loadState();
    setCode(savedCode);
    setSettings(savedSettings);
    setMounted(true);
  }, [loadState]);

  // Initialize mermaid
  useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    (async () => {
      const mermaid = (await import('mermaid')).default;
      if (cancelled) return;
      try {
        const zenuml = (await import('@mermaid-js/mermaid-zenuml')).default;
        await mermaid.registerExternalDiagrams([zenuml]);
      } catch {
        // ZenUML optional
      }
      mermaidRef.current = mermaid;
      initMermaid(settings);
      renderDiagram(code);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const initMermaid = useCallback((s: MermaidSettings) => {
    const m = mermaidRef.current;
    if (!m) return;
    const fontSize = s.diagramFontSize + 'px';
    const fontFamily = s.diagramFontFamily;
    const commonVars: Record<string, string> = { fontSize, fontFamily };

    // Detect dark background to auto-adjust text colors for readability
    const darkBg = isDarkBg(s.bgColor);
    if (darkBg && s.theme !== 'base') {
      // For non-custom themes on dark backgrounds, override text/line colors for readability
      commonVars.primaryTextColor = '#cdd6f4';
      commonVars.secondaryTextColor = '#bac2de';
      commonVars.tertiaryTextColor = '#a6adc8';
      commonVars.lineColor = '#6c7086';
      commonVars.primaryBorderColor = '#6c7086';
      commonVars.signalColor = '#cdd6f4';
      commonVars.signalTextColor = '#cdd6f4';
      commonVars.labelTextColor = '#cdd6f4';
      commonVars.loopTextColor = '#cdd6f4';
      commonVars.noteBkgColor = '#313244';
      commonVars.noteTextColor = '#cdd6f4';
      commonVars.actorTextColor = '#cdd6f4';
      commonVars.actorLineColor = '#6c7086';
    }

    const themeVars = s.theme === 'base'
      ? {
          ...commonVars,
          primaryColor: s.clrPrimary,
          secondaryColor: s.clrSecondary,
          tertiaryColor: s.clrTertiary,
          mainBkg: s.clrBackground,
          primaryTextColor: s.clrText,
          lineColor: s.clrLine,
          primaryBorderColor: s.clrLine,
        }
      : commonVars;
    m.initialize({
      startOnLoad: false,
      theme: s.theme === 'base' ? 'base' : s.theme as 'default' | 'dark' | 'forest' | 'neutral',
      themeVariables: themeVars,
      securityLevel: 'loose',
    });
  }, []);

  const renderDiagram = useCallback(async (src: string) => {
    const m = mermaidRef.current;
    if (!m) return;
    const trimmed = src.trim();
    if (!trimmed) {
      setSvgHtml('');
      setErrorMessage(null);
      setErrorLine(null);
      return;
    }
    try {
      // Pre-process: convert \n inside node labels to <br/> for line breaks
      const processed = trimmed
        .replace(/\["([^"]*?)"\]/g, (m, inner) => `["${inner.replace(/\\n/g, '<br/>')}"]`)
        .replace(/\("([^"]*?)"\)/g, (m, inner) => `("${inner.replace(/\\n/g, '<br/>')}")`);
      const id = `mermaid-${++renderCounter.current}`;
      const { svg } = await m.render(id, processed);
      // Fix SVG dimensions from viewBox
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      if (svgEl) {
        const vb = svgEl.getAttribute('viewBox');
        if (vb) {
          const parts = vb.split(/\s+/).map(Number);
          svgEl.setAttribute('width', String(parts[2]));
          svgEl.setAttribute('height', String(parts[3]));
        }
        svgEl.style.maxWidth = 'none';
      }
      setSvgHtml(svgEl ? svgEl.outerHTML : svg);
      setErrorMessage(null);
      setErrorLine(null);
      // Fit to view after render
      setTimeout(() => {
        if (previewPaneRef.current && previewRef.current) {
          panZoom.fitToView(previewPaneRef.current, previewRef.current, panZoom.scale);
        }
      }, 50);
    } catch (err) {
      const msg = (err as Error).message || 'Invalid syntax';
      const lineMatch = msg.match(/line\s+(\d+)/i);
      const line = lineMatch ? parseInt(lineMatch[1]) : null;
      setErrorMessage(msg);
      setErrorLine(line);
      // Clean up error containers
      const errContainer = document.getElementById(`dmermaid-${renderCounter.current}`);
      if (errContainer) errContainer.remove();
    }
  }, [panZoom]);

  // Debounced render on code change
  useEffect(() => {
    if (!mounted) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => renderDiagram(code), 300);
    return () => clearTimeout(debounceTimer.current);
  }, [code, mounted, renderDiagram]);

  // Re-init mermaid on settings change
  useEffect(() => {
    if (!mounted || !mermaidRef.current) return;
    initMermaid(settings);
    renderDiagram(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings, mounted, initMermaid]);

  // Auto-save
  useEffect(() => {
    if (!mounted) return;
    saveState(code, settings);
  }, [code, settings, mounted, saveState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleExport('png');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
        e.preventDefault();
        if (previewPaneRef.current && previewRef.current) {
          panZoom.fitToView(previewPaneRef.current, previewRef.current, panZoom.scale);
        }
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        if (previewPaneRef.current) {
          panZoom.zoomIn(previewPaneRef.current.getBoundingClientRect(), panZoom.scale, panZoom.panX, panZoom.panY);
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
        e.preventDefault();
        if (previewPaneRef.current) {
          panZoom.zoomOut(previewPaneRef.current.getBoundingClientRect(), panZoom.scale, panZoom.panX, panZoom.panY);
        }
      }
      if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen((f) => !f);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [panZoom]);

  // Drag and drop
  useEffect(() => {
    const onEnter = (e: DragEvent) => { e.preventDefault(); dragCounter.current++; setShowDrop(true); };
    const onLeave = (e: DragEvent) => { e.preventDefault(); dragCounter.current--; if (dragCounter.current <= 0) { dragCounter.current = 0; setShowDrop(false); } };
    const onOver = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter.current = 0;
      setShowDrop(false);
      const file = e.dataTransfer?.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => { if (ev.target?.result) setCode(ev.target.result as string); };
        reader.readAsText(file);
      }
    };
    document.addEventListener('dragenter', onEnter);
    document.addEventListener('dragleave', onLeave);
    document.addEventListener('dragover', onOver);
    document.addEventListener('drop', onDrop);
    return () => {
      document.removeEventListener('dragenter', onEnter);
      document.removeEventListener('dragleave', onLeave);
      document.removeEventListener('dragover', onOver);
      document.removeEventListener('drop', onDrop);
    };
  }, []);

  // Resize handle
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current || !editorPaneRef.current) return;
      const containerWidth = containerRef.current.offsetWidth;
      const newWidth = Math.max(200, Math.min(e.clientX, containerWidth - 200));
      editorPaneRef.current.style.width = newWidth + 'px';
    };
    const onUp = () => {
      if (isResizing) {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [isResizing]);

  // Pan mouse events
  useEffect(() => {
    const onMove = (e: MouseEvent) => { panZoom.movePan(e.clientX, e.clientY); };
    const onUp = () => { panZoom.endPan(); };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [panZoom]);

  const handleExport = useCallback((format: ExportFormat) => {
    if (format === 'mmd') {
      const blob = new Blob([code], { type: 'text/plain' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'diagram.mmd';
      a.click();
      URL.revokeObjectURL(a.href);
      return;
    }
    if (!previewRef.current) return;
    exportAs(format, previewRef.current, settings.bgColor, () => {
      setSaveBtnText('Copied!');
      setTimeout(() => setSaveBtnText('Save PNG'), 1500);
    });
  }, [code, settings.bgColor]);

  const handleWheel = useCallback((e: WheelEvent) => {
    if (!previewPaneRef.current) return;
    panZoom.handleWheel(e, previewPaneRef.current.getBoundingClientRect(), panZoom.scale, panZoom.panX, panZoom.panY);
  }, [panZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    panZoom.startPan(e.clientX, e.clientY, panZoom.panX, panZoom.panY);
  }, [panZoom]);

  const handleZoomIn = useCallback(() => {
    if (!previewPaneRef.current) return;
    panZoom.zoomIn(previewPaneRef.current.getBoundingClientRect(), panZoom.scale, panZoom.panX, panZoom.panY);
  }, [panZoom]);

  const handleZoomOut = useCallback(() => {
    if (!previewPaneRef.current) return;
    panZoom.zoomOut(previewPaneRef.current.getBoundingClientRect(), panZoom.scale, panZoom.panX, panZoom.panY);
  }, [panZoom]);

  const handleFitToView = useCallback(() => {
    if (previewPaneRef.current && previewRef.current) {
      panZoom.fitToView(previewPaneRef.current, previewRef.current, panZoom.scale);
    }
  }, [panZoom]);

  const handleMobileTab = useCallback((tab: 'editor' | 'preview') => {
    setMobileTab(tab);
    if (tab === 'preview') {
      requestAnimationFrame(() => {
        if (previewPaneRef.current && previewRef.current) {
          panZoom.fitToView(previewPaneRef.current, previewRef.current, panZoom.scale);
        }
      });
    }
  }, [panZoom]);

  // Container CSS classes
  const containerClasses = [
    styles.container,
    isFullscreen ? styles.fullscreen : '',
    mobileTab === 'preview' ? styles.mobilePreview : styles.mobileEditor,
  ].filter(Boolean).join(' ');

  if (!mounted) return null;

  return (
    <>
      <Header
        onExampleSelect={setCode}
        onImportFile={setCode}
        onExport={handleExport}
        saveBtnText={saveBtnText}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => {
          setIsFullscreen(!isFullscreen);
          requestAnimationFrame(() => {
            if (previewPaneRef.current && previewRef.current) {
              panZoom.fitToView(previewPaneRef.current, previewRef.current, panZoom.scale);
            }
          });
        }}
        settingsOpen={settingsOpen}
        onToggleSettings={() => setSettingsOpen(v => !v)}
        onCloseSettings={() => setSettingsOpen(false)}
        settings={settings}
        onSettingsChange={setSettings}
      />
      <MobileTabs activeTab={mobileTab} onTabChange={handleMobileTab} />
      <div className={containerClasses} ref={containerRef}>
        <div className={`${styles.dropOverlay} ${showDrop ? styles.dropVisible : ''}`}>
          <svg className={styles.dropIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg>
          <span className={styles.dropTitle}>Drop .mmd file here</span>
          <span className={styles.dropSubtitle}>or any text file with Mermaid syntax</span>
        </div>
        <div className={styles.editorPane} ref={editorPaneRef}>
          <Editor
            code={code}
            onCodeChange={setCode}
            errorMessage={errorMessage}
            errorLine={errorLine}
          />
        </div>
        <div
          className={`${styles.resizeHandle} ${isResizing ? styles.resizeActive : ''}`}
          onMouseDown={() => {
            setIsResizing(true);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
          }}
        />
        <Preview
          ref={(el) => {
            (previewRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
            // Also set previewPaneRef to the parent
            if (el) {
              (previewPaneRef as React.MutableRefObject<HTMLDivElement | null>).current = el.parentElement as HTMLDivElement;
            }
          }}
          svgHtml={svgHtml}
          bgColor={settings.bgColor}
          scale={panZoom.scale}
          panX={panZoom.panX}
          panY={panZoom.panY}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onFitToView={handleFitToView}
          onResetZoom={panZoom.resetZoom}
          isPanning={panZoom.isPanning.current}
        />
      </div>
    </>
  );
}
