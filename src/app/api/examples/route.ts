import { NextResponse } from 'next/server';
import { EXAMPLES } from '@/lib/examples';

export async function GET() {
  const examples = Object.entries(EXAMPLES).map(([key, val]) => ({
    id: key,
    label: val.label,
    code: val.code,
  }));

  return NextResponse.json(
    { examples, count: examples.length },
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
    }
  );
}
