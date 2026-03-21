'use client';

import { useState, useCallback } from 'react';
import styles from './page.module.css';

function CodeBlock({ label, labelClass, children }: { label: string; labelClass: string; children: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [children]);

  return (
    <div className={styles.codeBlock}>
      <div className={`${styles.codeLabel} ${labelClass}`}>{label}</div>
      <button className={styles.copyBtn} onClick={copy}>{copied ? 'Copied!' : 'Copy'}</button>
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{children}</pre>
    </div>
  );
}

export default function DocsPage() {
  const [playCode, setPlayCode] = useState('graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[OK]\n    B -->|No| D[Retry]\n    C --> E[End]\n    D --> E');
  const [playFormat, setPlayFormat] = useState('svg');
  const [playTheme, setPlayTheme] = useState('default');
  const [playResult, setPlayResult] = useState<string | null>(null);
  const [playError, setPlayError] = useState<string | null>(null);
  const [playLoading, setPlayLoading] = useState(false);

  const baseUrl = 'https://your-domain.com';

  const tryRender = useCallback(async () => {
    setPlayLoading(true);
    setPlayError(null);
    setPlayResult(null);
    try {
      const res = await fetch('/api/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: playCode, format: playFormat, theme: playTheme }),
      });
      if (!res.ok) {
        const err = await res.json();
        setPlayError(err.error || 'Render failed');
        return;
      }
      if (playFormat === 'svg') {
        const svgText = await res.text();
        const blob = new Blob([svgText], { type: 'image/svg+xml' });
        setPlayResult(URL.createObjectURL(blob));
      } else {
        const blob = await res.blob();
        setPlayResult(URL.createObjectURL(blob));
      }
    } catch (e) {
      setPlayError((e as Error).message);
    } finally {
      setPlayLoading(false);
    }
  }, [playCode, playFormat, playTheme]);

  return (
    <div className={styles.page}>
      <a href="/" className={styles.backLink}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
        Back to Editor
      </a>

      <h1 className={styles.title}>Mermaid Viewer API</h1>
      <p className={styles.subtitle}>
        Generate Mermaid diagrams as SVG or PNG via a simple REST API.
        Embed diagrams in docs, dashboards, or any application.
      </p>

      {/* Endpoints */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Endpoints</h2>

        <div className={styles.endpoint}>
          <div>
            <span className={`${styles.method} ${styles.methodPost}`}>POST</span>
            <span className={styles.path}>/api/render</span>
          </div>
          <p className={styles.desc}>Render Mermaid code to SVG or PNG. Send diagram code and options as JSON.</p>
          <table className={styles.paramTable}>
            <thead>
              <tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>code</code><span className={styles.required}>required</span></td><td>string</td><td>-</td><td>Mermaid diagram code</td></tr>
              <tr><td><code>format</code></td><td>string</td><td><code>svg</code></td><td><code>svg</code> or <code>png</code></td></tr>
              <tr><td><code>theme</code></td><td>string</td><td><code>default</code></td><td><code>default</code>, <code>dark</code>, <code>forest</code>, <code>neutral</code>, or <code>base</code></td></tr>
              <tr><td><code>bgColor</code></td><td>string</td><td><code>#ffffff</code></td><td>Background color for PNG (hex or <code>transparent</code>)</td></tr>
              <tr><td><code>themeVariables</code></td><td>object</td><td><code>{'{}'}</code></td><td>Custom Mermaid theme variables</td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.endpoint}>
          <div>
            <span className={`${styles.method} ${styles.methodGet}`}>GET</span>
            <span className={styles.path}>/api/render</span>
          </div>
          <p className={styles.desc}>
            Quick render via query parameters. Ideal for embedding in <code>&lt;img&gt;</code> tags.
          </p>
          <table className={styles.paramTable}>
            <thead>
              <tr><th>Query Param</th><th>Type</th><th>Default</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr><td><code>code</code><span className={styles.required}>required</span></td><td>string</td><td>-</td><td>URL-encoded Mermaid code</td></tr>
              <tr><td><code>format</code></td><td>string</td><td><code>svg</code></td><td><code>svg</code> or <code>png</code></td></tr>
              <tr><td><code>theme</code></td><td>string</td><td><code>default</code></td><td>Mermaid theme name</td></tr>
              <tr><td><code>bgColor</code></td><td>string</td><td><code>#ffffff</code></td><td>Background color (hex)</td></tr>
            </tbody>
          </table>
        </div>

        <div className={styles.endpoint}>
          <div>
            <span className={`${styles.method} ${styles.methodGet}`}>GET</span>
            <span className={styles.path}>/api/examples</span>
          </div>
          <p className={styles.desc}>
            Returns all available example diagrams with their code. Useful for building UI selectors or testing.
          </p>
        </div>
      </div>

      {/* Code Examples */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Code Examples</h2>

        <CodeBlock label="cURL" labelClass={styles.codeLabelCurl}>
{`# Generate SVG
curl -X POST ${baseUrl}/api/render \\
  -H "Content-Type: application/json" \\
  -d '{"code": "graph TD\\n  A-->B-->C", "format": "svg"}' \\
  -o diagram.svg

# Generate PNG with dark theme
curl -X POST ${baseUrl}/api/render \\
  -H "Content-Type: application/json" \\
  -d '{"code": "graph TD\\n  A-->B", "format": "png", "theme": "dark"}' \\
  -o diagram.png`}
        </CodeBlock>

        <CodeBlock label="JavaScript" labelClass={styles.codeLabelJs}>
{`const response = await fetch('${baseUrl}/api/render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'graph TD\\n  A[Start] --> B[End]',
    format: 'svg',
    theme: 'default'
  })
});

const svg = await response.text();
document.getElementById('diagram').innerHTML = svg;`}
        </CodeBlock>

        <CodeBlock label="Python" labelClass={styles.codeLabelPy}>
{`import requests

response = requests.post('${baseUrl}/api/render', json={
    'code': 'graph TD\\n  A[Start] --> B[End]',
    'format': 'png',
    'theme': 'forest'
})

with open('diagram.png', 'wb') as f:
    f.write(response.content)`}
        </CodeBlock>

        <CodeBlock label="HTML Embed" labelClass={styles.codeLabelHtml}>
{`<!-- Embed SVG directly in an img tag -->
<img src="${baseUrl}/api/render?code=graph+TD%0A++A-->B&format=svg"
     alt="Mermaid Diagram" />

<!-- Embed PNG -->
<img src="${baseUrl}/api/render?code=graph+TD%0A++A-->B&format=png&theme=dark"
     alt="Mermaid Diagram" />`}
        </CodeBlock>
      </div>

      {/* Playground */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Try It</h2>
        <div className={styles.playground}>
          <div className={styles.playgroundGrid}>
            <div>
              <textarea
                className={styles.playgroundTextarea}
                value={playCode}
                onChange={(e) => setPlayCode(e.target.value)}
                placeholder="Enter Mermaid code..."
              />
              <div className={styles.playgroundControls}>
                <select className={styles.playgroundSelect} value={playFormat} onChange={(e) => setPlayFormat(e.target.value)}>
                  <option value="svg">SVG</option>
                  <option value="png">PNG</option>
                </select>
                <select className={styles.playgroundSelect} value={playTheme} onChange={(e) => setPlayTheme(e.target.value)}>
                  <option value="default">Default</option>
                  <option value="dark">Dark</option>
                  <option value="forest">Forest</option>
                  <option value="neutral">Neutral</option>
                  <option value="base">Base</option>
                </select>
                <button className={styles.playgroundBtn} onClick={tryRender} disabled={playLoading}>
                  {playLoading ? 'Rendering...' : 'Render'}
                </button>
              </div>
            </div>
            <div className={styles.playgroundResult}>
              {playError && <div className={styles.playgroundError}>{playError}</div>}
              {playResult && <img src={playResult} alt="Rendered diagram" />}
              {!playResult && !playError && <span style={{ color: '#999', fontSize: 14 }}>Click Render to see the result</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Rate Limits */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Rate Limits</h2>
        <table className={styles.rateTable}>
          <thead>
            <tr><th>Tier</th><th>Rate Limit</th><th>Auth</th></tr>
          </thead>
          <tbody>
            <tr>
              <td><span className={`${styles.badge} ${styles.badgeFree}`}>Free</span></td>
              <td>30 requests / minute</td>
              <td>No key required</td>
            </tr>
            <tr>
              <td><span className={`${styles.badge} ${styles.badgePro}`}>With API Key</span></td>
              <td>200 requests / minute</td>
              <td><code>X-API-Key</code> header or <code>apiKey</code> query param</td>
            </tr>
          </tbody>
        </table>
        <p style={{ color: '#666', fontSize: 14, marginTop: 12 }}>
          Rate limit headers (<code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>) are included in every response.
        </p>
      </div>

      {/* Response Codes */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Response Codes</h2>
        <table className={styles.rateTable}>
          <thead>
            <tr><th>Code</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>200</code></td><td>Success - returns SVG or PNG</td></tr>
            <tr><td><code>400</code></td><td>Bad request - missing code, invalid format/theme, or malformed JSON</td></tr>
            <tr><td><code>422</code></td><td>Unprocessable - valid request but Mermaid syntax error</td></tr>
            <tr><td><code>429</code></td><td>Rate limit exceeded</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
