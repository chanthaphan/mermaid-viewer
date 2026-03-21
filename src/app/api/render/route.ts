import { NextRequest, NextResponse } from 'next/server';
import { renderMermaidSvg, renderMermaidPng } from '@/lib/mermaid-server';
import { checkRateLimit, validateApiKey } from '@/lib/rate-limit';

const VALID_FORMATS = ['svg', 'png'] as const;
const VALID_THEMES = ['default', 'dark', 'forest', 'neutral', 'base'] as const;
const MAX_CODE_LENGTH = 50_000;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
  };
}

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
}

function getApiKey(req: NextRequest): string | null {
  return req.headers.get('x-api-key') || req.nextUrl.searchParams.get('apiKey');
}

function rateLimitHeaders(remaining: number, limit: number, resetAt: number) {
  return {
    'X-RateLimit-Limit': String(limit),
    'X-RateLimit-Remaining': String(remaining),
    'X-RateLimit-Reset': String(Math.ceil(resetAt / 1000)),
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

async function handleRender(req: NextRequest, params: {
  code: string;
  format: string;
  theme: string;
  bgColor: string;
  themeVariables?: Record<string, string>;
}) {
  const { code, format, theme, bgColor, themeVariables } = params;

  // Validate
  if (!code || typeof code !== 'string') {
    return NextResponse.json(
      { error: 'Missing required field: code' },
      { status: 400, headers: corsHeaders() }
    );
  }
  if (code.length > MAX_CODE_LENGTH) {
    return NextResponse.json(
      { error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters` },
      { status: 400, headers: corsHeaders() }
    );
  }
  if (!VALID_FORMATS.includes(format as typeof VALID_FORMATS[number])) {
    return NextResponse.json(
      { error: `Invalid format. Must be one of: ${VALID_FORMATS.join(', ')}` },
      { status: 400, headers: corsHeaders() }
    );
  }
  if (!VALID_THEMES.includes(theme as typeof VALID_THEMES[number])) {
    return NextResponse.json(
      { error: `Invalid theme. Must be one of: ${VALID_THEMES.join(', ')}` },
      { status: 400, headers: corsHeaders() }
    );
  }

  // Rate limit
  const apiKey = getApiKey(req);
  const hasKey = validateApiKey(apiKey);
  const ip = getIp(req);
  const rl = checkRateLimit(ip, hasKey);
  const rlHeaders = rateLimitHeaders(rl.remaining, rl.limit, rl.resetAt);

  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Add an API key via X-API-Key header for higher limits.' },
      { status: 429, headers: { ...corsHeaders(), ...rlHeaders, 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    if (format === 'png') {
      const pngBuffer = await renderMermaidPng(code, {
        theme,
        bgColor,
        themeVariables,
      });

      return new NextResponse(pngBuffer, {
        headers: {
          ...corsHeaders(),
          ...rlHeaders,
          'Content-Type': 'image/png',
          'Content-Disposition': 'inline; filename="diagram.png"',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    // SVG format
    const { svg } = await renderMermaidSvg(code, {
      theme,
      themeVariables,
    });

    return new NextResponse(svg, {
      headers: {
        ...corsHeaders(),
        ...rlHeaders,
        'Content-Type': 'image/svg+xml; charset=utf-8',
        'Content-Disposition': 'inline; filename="diagram.svg"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Render failed';
    return NextResponse.json(
      { error: 'Render failed', details: message },
      { status: 422, headers: { ...corsHeaders(), ...rlHeaders } }
    );
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const code = sp.get('code') || '';
  const format = sp.get('format') || 'svg';
  const theme = sp.get('theme') || 'default';
  const bgColor = sp.get('bgColor') || '#ffffff';

  return handleRender(req, { code, format, theme, bgColor });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400, headers: corsHeaders() }
    );
  }

  const code = (body.code as string) || '';
  const format = (body.format as string) || 'svg';
  const theme = (body.theme as string) || 'default';
  const bgColor = (body.bgColor as string) || '#ffffff';
  const themeVariables = body.themeVariables as Record<string, string> | undefined;

  return handleRender(req, { code, format, theme, bgColor, themeVariables });
}
