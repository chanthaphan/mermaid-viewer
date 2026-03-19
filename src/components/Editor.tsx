'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { highlightCode } from '@/lib/highlight';
import { autoFixMermaid } from '@/lib/autofix';
import styles from './Editor.module.css';

interface Props {
  code: string;
  onCodeChange: (code: string) => void;
  errorMessage: string | null;
  errorLine: number | null;
}

const DIAGRAM_TYPES: Record<string, string> = {
  graph: 'Flowchart',
  flowchart: 'Flowchart',
  sequenceDiagram: 'Sequence',
  classDiagram: 'Class',
  erDiagram: 'ER Diagram',
  gantt: 'Gantt',
  pie: 'Pie Chart',
  'stateDiagram-v2': 'State',
  stateDiagram: 'State',
  journey: 'Journey',
  mindmap: 'Mindmap',
  gitGraph: 'Git Graph',
  C4Context: 'C4 Context',
  timeline: 'Timeline',
  'sankey-beta': 'Sankey',
  'xychart-beta': 'XY Chart',
  'block-beta': 'Block',
  quadrantChart: 'Quadrant',
  requirementDiagram: 'Requirement',
  kanban: 'Kanban',
  'packet-beta': 'Packet',
  'architecture-beta': 'Architecture',
  zenuml: 'ZenUML',
};

function detectDiagramType(code: string): string {
  const firstLine = code.trim().split('\n')[0]?.trim() || '';
  const firstWord = firstLine.split(/[\s{([\]]/)[0];
  return DIAGRAM_TYPES[firstWord] || 'Diagram';
}

export default function Editor({ code, onCodeChange, errorMessage, errorLine }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  const updateHighlight = useCallback(() => {
    if (highlightRef.current) {
      highlightRef.current.innerHTML = highlightCode(code, errorLine);
    }
  }, [code, errorLine]);

  const updateLineNumbers = useCallback(() => {
    if (!lineNumbersRef.current) return;
    const lines = code.split('\n').length;
    const current = lineNumbersRef.current.children.length;
    if (lines === current) {
      const spans = lineNumbersRef.current.querySelectorAll('span');
      spans.forEach((s, i) => {
        if (errorLine && i === errorLine - 1) {
          s.style.color = '#dc2626';
          s.style.fontWeight = 'bold';
        } else {
          s.style.color = '';
          s.style.fontWeight = '';
        }
      });
      return;
    }
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= lines; i++) {
      const span = document.createElement('span');
      span.textContent = String(i);
      if (errorLine && i === errorLine) {
        span.style.color = '#dc2626';
        span.style.fontWeight = 'bold';
      }
      frag.appendChild(span);
    }
    lineNumbersRef.current.innerHTML = '';
    lineNumbersRef.current.appendChild(frag);
  }, [code, errorLine]);

  useEffect(() => {
    updateHighlight();
    updateLineNumbers();
  }, [updateHighlight, updateLineNumbers]);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = textareaRef.current!;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const newValue = code.substring(0, start) + '  ' + code.substring(end);
      onCodeChange(newValue);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  const handleErrorClick = () => {
    if (!errorLine || !textareaRef.current) return;
    const lines = code.split('\n');
    let pos = 0;
    for (let i = 0; i < Math.min(errorLine - 1, lines.length); i++) pos += lines[i].length + 1;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(pos, pos + (lines[errorLine - 1] || '').length);
    const lineHeight = parseFloat(getComputedStyle(textareaRef.current).lineHeight);
    textareaRef.current.scrollTop = (errorLine - 3) * lineHeight;
  };

  const lineCount = useMemo(() => code.split('\n').length, [code]);
  const charCount = useMemo(() => code.length, [code]);
  const diagramType = useMemo(() => detectDiagramType(code), [code]);

  return (
    <>
      <div className={styles.editorWrap}>
        <div className={styles.lineNumbers} ref={lineNumbersRef} />
        <div className={styles.codeArea}>
          <pre className={styles.highlightLayer} ref={highlightRef} aria-hidden="true" />
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            spellCheck={false}
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>
      <div className={styles.statusBar}>
        <span className={styles.statusItem}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          {diagramType}
        </span>
        <span className={styles.statusRight}>
          <span className={styles.statusItem}>Ln {lineCount}</span>
          <span className={styles.statusDot} />
          <span className={styles.statusItem}>Ch {charCount}</span>
          <span className={styles.statusDot} />
          <span className={styles.statusHint}>Ctrl+S Save</span>
        </span>
      </div>
      <div
        className={`${styles.error} ${errorMessage ? styles.errorVisible : ''}`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" style={{flexShrink:0}} onClick={handleErrorClick}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div className={styles.errorContent} onClick={handleErrorClick}>
          <span>{errorMessage}</span>
          {errorLine && (
            <span className={styles.errorHint}>Click to jump to line {errorLine}</span>
          )}
        </div>
        {errorMessage && (
          <button
            className={styles.fixBtn}
            onClick={(e) => {
              e.stopPropagation();
              const result = autoFixMermaid(code, errorMessage);
              if (result) {
                onCodeChange(result);
              }
            }}
            title="Try to auto-fix common syntax errors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
            Fix
          </button>
        )}
      </div>
    </>
  );
}
