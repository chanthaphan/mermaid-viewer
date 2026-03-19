const HL_KEYWORDS = /^(graph|flowchart|sequenceDiagram|classDiagram|erDiagram|gantt|pie|stateDiagram-v2|stateDiagram|journey|mindmap|gitGraph|C4Context|timeline|sankey-beta|xychart-beta|block-beta|quadrantChart|requirementDiagram|kanban|packet-beta|architecture-beta|zenuml)$/;
const HL_SUB = /^(subgraph|end|participant|actor|autonumber|title|section|dateFormat|excludes|group|service|junction|style|linkStyle|classDef|click|note|loop|alt|opt|par|critical|break|rect|activate|deactivate)$/i;
const HL_ARROW = /^(-->|--\>|<--|\.->|==>|---|-\.->|-\.-|==|:R|:L|:T|:B|-->>|->>|--x|--o)$/;

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function highlightLine(line: string): string {
  if (/^\s*%%/.test(line)) {
    return `<span class="hl-comment">${esc(line)}</span>`;
  }
  const tokens = line.match(
    /("(?:[^"\\]|\\.)*"|\|[^|]*\||-->>\|?|-->>|-->[|]?|-->|<--|\.->|-\.-|==>|---|==|:R|:L|:T|:B|->>|--x|--o|%%.*|\S+|\s+)/g
  ) || [line];
  return tokens
    .map((t) => {
      const e = esc(t);
      if (/^%%/.test(t)) return `<span class="hl-comment">${e}</span>`;
      if (/^"/.test(t)) return `<span class="hl-string">${e}</span>`;
      if (/^\|/.test(t)) return `<span class="hl-label">${e}</span>`;
      if (HL_ARROW.test(t)) return `<span class="hl-arrow">${e}</span>`;
      if (HL_KEYWORDS.test(t.trim())) return `<span class="hl-keyword">${e}</span>`;
      if (HL_SUB.test(t.trim())) return `<span class="hl-keyword">${e}</span>`;
      if (/^(fill|color|stroke|background):#/.test(t)) return `<span class="hl-style">${e}</span>`;
      return e;
    })
    .join('');
}

export function highlightCode(code: string, errorLine: number | null): string {
  const lines = code.split('\n');
  return (
    lines
      .map((line, i) => {
        let h = highlightLine(line);
        if (errorLine && i === errorLine - 1) {
          h = `<span class="hl-error-line">${h}</span>`;
        }
        return h;
      })
      .join('\n') + '\n'
  );
}
