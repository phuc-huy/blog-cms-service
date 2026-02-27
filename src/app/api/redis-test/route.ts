import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '@/utils/cache';

export async function GET() {
  const key = 'test:time';
  let value = await cacheGet<string>(key);
  if (!value) {
    value = new Date().toISOString();
    // cache it for 30 seconds
    await cacheSet(key, value, 30);
  }

  return NextResponse.json({ fromCache: value });
}
