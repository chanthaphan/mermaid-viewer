import puppeteer, { type Browser } from 'puppeteer';

export interface RenderOptions {
  theme?: string;
  bgColor?: string;
  width?: number;
  themeVariables?: Record<string, string>;
}

let browserPromise: Promise<Browser> | null = null;

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    // If browser disconnects, reset so next call creates a new one
    browserPromise.then(b => {
      b.on('disconnected', () => { browserPromise = null; });
    });
  }
  return browserPromise;
}

export async function renderMermaidSvg(
  code: string,
  options: RenderOptions = {}
): Promise<{ svg: string; width: number; height: number }> {
  const { theme = 'default', themeVariables = {} } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Load a minimal page with Mermaid from CDN
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
      </head>
      <body>
        <div id="container"></div>
      </body>
      </html>
    `, { waitUntil: 'networkidle0' });

    // Render the diagram
    const result = await page.evaluate(async (code: string, theme: string, themeVars: Record<string, string>) => {
      const mermaid = (window as unknown as Record<string, typeof import('mermaid').default>).mermaid;

      mermaid.initialize({
        startOnLoad: false,
        theme: theme as 'default' | 'dark' | 'forest' | 'neutral' | 'base',
        themeVariables: {
          fontSize: '16px',
          fontFamily: 'system-ui, sans-serif',
          ...themeVars,
        },
        securityLevel: 'loose',
      });

      const id = 'mermaid-api-' + Date.now();
      const { svg } = await mermaid.render(id, code.trim());

      // Parse viewBox for dimensions
      const parser = new DOMParser();
      const doc = parser.parseFromString(svg, 'image/svg+xml');
      const svgEl = doc.querySelector('svg');
      let width = 800, height = 600;
      if (svgEl) {
        const vb = svgEl.getAttribute('viewBox');
        if (vb) {
          const parts = vb.split(/\s+/).map(Number);
          width = Math.ceil(parts[2]);
          height = Math.ceil(parts[3]);
        }
      }

      return { svg, width, height };
    }, code, theme, themeVariables);

    return result;
  } finally {
    await page.close();
  }
}

export async function renderMermaidPng(
  code: string,
  options: RenderOptions = {}
): Promise<Buffer> {
  const { theme = 'default', bgColor = '#ffffff', themeVariables = {} } = options;

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    const bg = bgColor === 'transparent' ? 'transparent' : bgColor;
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <script src="https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.min.js"></script>
        <style>
          body { margin: 0; padding: 16px; background: ${bg}; }
          #container { display: inline-block; }
        </style>
      </head>
      <body>
        <div id="container"></div>
      </body>
      </html>
    `, { waitUntil: 'networkidle0' });

    // Render diagram into the container
    await page.evaluate(async (code: string, theme: string, themeVars: Record<string, string>) => {
      const mermaid = (window as unknown as Record<string, typeof import('mermaid').default>).mermaid;
      mermaid.initialize({
        startOnLoad: false,
        theme: theme as 'default' | 'dark' | 'forest' | 'neutral' | 'base',
        themeVariables: { fontSize: '16px', fontFamily: 'system-ui, sans-serif', ...themeVars },
        securityLevel: 'loose',
      });
      const id = 'mermaid-png-' + Date.now();
      const { svg } = await mermaid.render(id, code.trim());
      document.getElementById('container')!.innerHTML = svg;
    }, code, theme, themeVariables);

    // Screenshot the container element
    const container = await page.$('#container');
    if (!container) throw new Error('Container not found');

    const png = await container.screenshot({
      type: 'png',
      omitBackground: bg === 'transparent',
    });

    return Buffer.from(png);
  } finally {
    await page.close();
  }
}

// Cleanup browser on process exit
if (typeof process !== 'undefined') {
  const cleanup = async () => {
    if (browserPromise) {
      const browser = await browserPromise;
      await browser.close().catch(() => {});
    }
  };
  process.on('exit', () => { cleanup(); });
  process.on('SIGTERM', () => { cleanup().then(() => process.exit(0)); });
  process.on('SIGINT', () => { cleanup().then(() => process.exit(0)); });
}
