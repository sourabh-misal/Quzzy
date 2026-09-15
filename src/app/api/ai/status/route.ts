import { NextResponse } from 'next/server';
import { checkAiStatus } from '@/lib/ai';

export async function GET() {
  try {
    const status = await checkAiStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'offline',
        model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        latencyMs: 0,
        apiKeyConfigured: !!process.env.GEMINI_API_KEY,
        rateLimits: { rpm: '15 RPM', tpm: '250K TPM', rpd: '500 RPD' },
        error: error?.message || 'Failed to check AI status.'
      },
      { status: 500 }
    );
  }
}
