/**
 * Basic auto-fix rules for common Mermaid syntax errors.
 * Returns the fixed code, or null if no fix could be applied.
 */
export function autoFixMermaid(code: string, errorMessage: string): string | null {
  // Skip non-syntax errors (rendering bugs, circular refs, etc.)
  const nonFixablePatterns = [
    'circular structure',
    'Maximum call stack',
    'out of memory',
    'Cannot read prop',
    'is not a function',
  ];
  if (nonFixablePatterns.some((p) => errorMessage.includes(p))) return null;

  let fixed = code;
  let changed = false;

  // Rule 1: Fix "graph" without direction → add TD
  if (/^graph\s*$/m.test(fixed)) {
    fixed = fixed.replace(/^graph\s*$/m, 'graph TD');
    changed = true;
  }

  // Rule 1b: Fix escaped \n inside node label strings → <br/>
  // Only replace \n inside ["..."] or ("...") node labels, not globally
  fixed = fixed.replace(/(\["[^"]*"\])/g, (match) => {
    if (match.includes('\\n')) {
      changed = true;
      return match.replace(/\\n/g, '<br/>');
    }
    return match;
  });
  fixed = fixed.replace(/\("([^"]*)"\)/g, (match) => {
    if (match.includes('\\n')) {
      changed = true;
      return match.replace(/\\n/g, '<br/>');
    }
    return match;
  });

  // Rule 2: Fix common arrow typos
  // "- ->" → "-->"
  fixed = fixed.replace(/- ->/g, () => { changed = true; return '-->'; });
  // "-- >" → "-->"
  fixed = fixed.replace(/-- >/g, () => { changed = true; return '-->'; });
  // "- -> " with extra space
  fixed = fixed.replace(/-\s+->/g, () => { changed = true; return '-->'; });

  // Rule 3: Fix unmatched brackets in node definitions
  // e.g., "A[text" → "A[text]"
  const lines = fixed.split('\n');
  const fixedLines = lines.map((line) => {
    // Skip comment lines
    if (/^\s*%%/.test(line)) return line;

    // Count brackets
    const openSquare = (line.match(/\[/g) || []).length;
    const closeSquare = (line.match(/\]/g) || []).length;
    const openCurly = (line.match(/\{/g) || []).length;
    const closeCurly = (line.match(/\}/g) || []).length;
    const openParen = (line.match(/\(/g) || []).length;
    const closeParen = (line.match(/\)/g) || []).length;

    let result = line;
    // Add missing closing brackets
    if (openSquare > closeSquare) {
      result += ']'.repeat(openSquare - closeSquare);
      changed = true;
    }
    if (openCurly > closeCurly && !line.trim().endsWith('{')) {
      // Only fix inline curly braces (like {Decision), not block openers
      result += '}'.repeat(openCurly - closeCurly);
      changed = true;
    }
    if (openParen > closeParen) {
      result += ')'.repeat(openParen - closeParen);
      changed = true;
    }
    return result;
  });
  fixed = fixedLines.join('\n');

  // Rule 4: Fix "end" keyword casing in subgraph contexts
  // "End" or "END" → "end"
  if (/^\s*(End|END)\s*$/m.test(fixed)) {
    fixed = fixed.replace(/^(\s*)(End|END)(\s*)$/gm, '$1end$3');
    changed = true;
  }

  // Rule 5: Fix missing space after arrow in label syntax
  // "-->|label|B" is valid, but "-->| label|B" needs trimming inside pipes
  // Actually fix "-->|label" without closing pipe
  fixed = fixed.replace(/-->\|([^|]+)(?!\|)\s/g, (match, label) => {
    changed = true;
    return `-->|${label.trim()}| `;
  });

  // Rule 6: Fix "sequenceDiagram" typos
  const seqTypos = ['sequencediagram', 'SequenceDiagram', 'sequence diagram', 'Sequence Diagram'];
  for (const typo of seqTypos) {
    if (fixed.includes(typo)) {
      fixed = fixed.replace(typo, 'sequenceDiagram');
      changed = true;
    }
  }

  // Rule 7: Fix "classDiagram" typos
  const classTypos = ['classdiagram', 'ClassDiagram', 'class diagram', 'Class Diagram'];
  for (const typo of classTypos) {
    if (fixed.includes(typo)) {
      fixed = fixed.replace(typo, 'classDiagram');
      changed = true;
    }
  }

  // Rule 8: Fix "erDiagram" typos
  const erTypos = ['erdiagram', 'ERDiagram', 'er diagram', 'ER Diagram', 'ErDiagram'];
  for (const typo of erTypos) {
    if (fixed.includes(typo)) {
      fixed = fixed.replace(typo, 'erDiagram');
      changed = true;
    }
  }

  // Rule 9: Fix "stateDiagram" typos
  const stateTypos = ['statediagram-v2', 'StateDiagram-v2', 'state diagram'];
  for (const typo of stateTypos) {
    if (fixed.includes(typo)) {
      fixed = fixed.replace(typo, 'stateDiagram-v2');
      changed = true;
    }
  }

  // Rule 10: Fix "gitGraph" typos
  const gitTypos = ['gitgraph', 'GitGraph', 'git graph', 'Git Graph'];
  for (const typo of gitTypos) {
    if (fixed.includes(typo)) {
      fixed = fixed.replace(typo, 'gitGraph');
      changed = true;
    }
  }

  // Rule 11: Remove duplicate blank lines (more than 2 consecutive)
  const beforeBlankFix = fixed;
  fixed = fixed.replace(/\n{4,}/g, '\n\n\n');
  if (fixed !== beforeBlankFix) changed = true;

  // Rule 12: Fix tab characters → 4 spaces
  if (fixed.includes('\t')) {
    fixed = fixed.replace(/\t/g, '    ');
    changed = true;
  }

  // Rule 13: If error mentions a specific line, try removing that line as last resort
  if (!changed && errorMessage) {
    const lineMatch = errorMessage.match(/line\s+(\d+)/i);
    if (lineMatch) {
      const errLine = parseInt(lineMatch[1]) - 1;
      const codeLines = fixed.split('\n');
      if (errLine >= 0 && errLine < codeLines.length) {
        // Try commenting out the problematic line
        codeLines[errLine] = '%% ' + codeLines[errLine];
        fixed = codeLines.join('\n');
        changed = true;
      }
    }
  }

  return changed ? fixed : null;
}
