import type { ExportFormat } from '@/types';

export function getSvgInfo(previewEl: HTMLElement) {
  const svgEl = previewEl.querySelector('svg');
  if (!svgEl) return null;
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const vb = clone.getAttribute('viewBox');
  if (vb) {
    const [, , w, h] = vb.split(/\s+/).map(Number);
    clone.setAttribute('width', String(w));
    clone.setAttribute('height', String(h));
    clone.removeAttribute('style');
  }
  const svgData = new XMLSerializer().serializeToString(clone);
  return { svgData, svgEl };
}

function inlineComputedStyles(sourceEl: SVGSVGElement, cloneEl: SVGSVGElement) {
  // Inline computed fill/stroke/font on text and path elements so export matches render
  const sourceNodes = sourceEl.querySelectorAll('text, tspan, path, rect, circle, ellipse, polygon, polyline, line');
  const cloneNodes = cloneEl.querySelectorAll('text, tspan, path, rect, circle, ellipse, polygon, polyline, line');
  for (let i = 0; i < sourceNodes.length && i < cloneNodes.length; i++) {
    const computed = window.getComputedStyle(sourceNodes[i]);
    const target = cloneNodes[i] as SVGElement;
    const tag = target.tagName.toLowerCase();
    // Inline fill for text elements
    if (tag === 'text' || tag === 'tspan') {
      const fill = computed.fill;
      if (fill && fill !== 'none') target.setAttribute('fill', fill);
      const fontSz = computed.fontSize;
      if (fontSz) target.setAttribute('font-size', fontSz);
      const fontFam = computed.fontFamily;
      if (fontFam) target.setAttribute('font-family', fontFam);
    }
    // Inline stroke for lines/paths
    if (tag === 'path' || tag === 'line' || tag === 'polyline') {
      const stroke = computed.stroke;
      if (stroke && stroke !== 'none') target.setAttribute('stroke', stroke);
    }
  }
}

function replaceForeignObjects(svgEl: SVGSVGElement): SVGSVGElement {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  const vb = clone.getAttribute('viewBox');
  if (vb) {
    const [, , vw, vh] = vb.split(/\s+/).map(Number);
    clone.setAttribute('width', String(vw));
    clone.setAttribute('height', String(vh));
    clone.removeAttribute('style');
  }
  clone.querySelectorAll('foreignObject').forEach((fo) => {
    const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    const x = parseFloat(fo.getAttribute('x') || '0') + parseFloat(fo.getAttribute('width') || '0') / 2;
    const y = parseFloat(fo.getAttribute('y') || '0') + parseFloat(fo.getAttribute('height') || '0') / 2;
    textEl.setAttribute('x', String(x));
    textEl.setAttribute('y', String(y));
    textEl.setAttribute('text-anchor', 'middle');
    textEl.setAttribute('dominant-baseline', 'central');
    textEl.setAttribute('font-size', '14');
    textEl.setAttribute('font-family', 'system-ui, sans-serif');
    const span = fo.querySelector('span, div, p');
    if (span) {
      const style = span.getAttribute('style') || '';
      const colorMatch = style.match(/color\s*:\s*([^;]+)/);
      if (colorMatch) textEl.setAttribute('fill', colorMatch[1].trim());
    }
    textEl.textContent = fo.textContent?.trim() || '';
    fo.parentNode?.replaceChild(textEl, fo);
  });
  return clone;
}

export function exportToCanvas(previewEl: HTMLElement, bgColor: string, callback: (canvas: HTMLCanvasElement) => void) {
  const info = getSvgInfo(previewEl);
  if (!info) return;
  const { svgEl } = info;
  const vb = svgEl.getAttribute('viewBox');
  let w = 800, h = 600;
  if (vb) {
    const parts = vb.split(/\s+/).map(Number);
    w = Math.ceil(parts[2]);
    h = Math.ceil(parts[3]);
  }
  const s = 2;
  const canvas = document.createElement('canvas');
  canvas.width = w * s;
  canvas.height = h * s;
  const ctx = canvas.getContext('2d')!;
  if (bgColor !== 'transparent') {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const clone = replaceForeignObjects(svgEl);
  // Inline computed styles from the live DOM so export matches what user sees
  inlineComputedStyles(svgEl, clone);
  const svgStr = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.onload = () => {
    ctx.scale(s, s);
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);
    callback(canvas);
  };
  img.onerror = () => {
    URL.revokeObjectURL(url);
    alert('Export failed. Please use "Save as SVG" instead.');
  };
  img.src = url;
}

function download(blob: Blob, name: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

export function exportAs(
  format: ExportFormat,
  previewEl: HTMLElement,
  bgColor: string,
  onCopied?: () => void
) {
  if (format === 'svg') {
    const info = getSvgInfo(previewEl);
    if (!info) return;
    download(new Blob([info.svgData], { type: 'image/svg+xml' }), 'mermaid-diagram.svg');
  } else if (format === 'png') {
    exportToCanvas(previewEl, bgColor, (canvas) =>
      canvas.toBlob((b) => b && download(b, 'mermaid-diagram.png'), 'image/png')
    );
  } else if (format === 'clipboard') {
    exportToCanvas(previewEl, bgColor, (canvas) =>
      canvas.toBlob(async (b) => {
        if (!b) return;
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]);
          onCopied?.();
        } catch (e) {
          alert('Copy failed: ' + (e as Error).message);
        }
      }, 'image/png')
    );
  } else if (format === 'jpg') {
    exportToCanvas(previewEl, bgColor, (canvas) =>
      canvas.toBlob((b) => b && download(b, 'mermaid-diagram.jpg'), 'image/jpeg', 0.95)
    );
  } else if (format === 'pdf') {
    exportToCanvas(previewEl, bgColor, (canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const w = canvas.width;
      const h = canvas.height;
      const isLandscape = w > h;
      const pageW = isLandscape ? 297 : 210;
      const pageH = isLandscape ? 210 : 297;
      const margin = 10;
      const maxW = pageW - margin * 2;
      const maxH = pageH - margin * 2;
      const ratio = Math.min(maxW / (w / 2), maxH / (h / 2));
      const imgW = (w / 2) * ratio;
      const imgH = (h / 2) * ratio;
      const x = (pageW - imgW) / 2;
      const y = (pageH - imgH) / 2;

      const objects: { content: string }[] = [];
      function addObj(content: string) {
        const num = objects.length + 1;
        objects.push({ content: `${num} 0 obj\n${content}\nendobj\n` });
        return num;
      }
      addObj('<< /Type /Catalog /Pages 2 0 R >>');
      addObj('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
      addObj(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${(pageW * 2.835).toFixed(2)} ${(pageH * 2.835).toFixed(2)}] /Contents 4 0 R /Resources << /XObject << /Img 5 0 R >> >> >>`
      );
      const stream = `q ${(imgW * 2.835).toFixed(2)} 0 0 ${(imgH * 2.835).toFixed(2)} ${(x * 2.835).toFixed(2)} ${((pageH - y - imgH) * 2.835).toFixed(2)} cm /Img Do Q`;
      addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);

      void imgData; // used below indirectly
      const jpgData = canvas.toDataURL('image/jpeg', 0.95);
      const jpgB64 = jpgData.split(',')[1];
      const jpgBin = atob(jpgB64);
      const jpgBytes = new Uint8Array(jpgBin.length);
      for (let i = 0; i < jpgBin.length; i++) jpgBytes[i] = jpgBin.charCodeAt(i);

      objects.push({
        content: `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpgBytes.length} >>\nstream\n`,
      });

      const header = '%PDF-1.4\n';
      const parts: BlobPart[] = [header];
      const offsets: number[] = [];
      let pos = header.length;
      for (let i = 0; i < objects.length; i++) {
        offsets.push(pos);
        if (i === 4) {
          const pre = objects[i].content;
          const post = '\nendstream\nendobj\n';
          parts.push(pre);
          pos += pre.length;
          parts.push(jpgBytes);
          pos += jpgBytes.length;
          parts.push(post);
          pos += post.length;
        } else {
          parts.push(objects[i].content);
          pos += objects[i].content.length;
        }
      }
      const xrefPos = pos;
      let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
      for (const o of offsets) xref += `${String(o).padStart(10, '0')} 00000 n \n`;
      xref += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;
      parts.push(xref);
      const pdfBlob = new Blob(parts, { type: 'application/pdf' });
      download(pdfBlob, 'mermaid-diagram.pdf');
    });
  }
}
