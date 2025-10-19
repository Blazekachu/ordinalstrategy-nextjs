import { NextRequest, NextResponse } from 'next/server';

const XVERSE_API_KEY = process.env.NEXT_PUBLIC_XVERSE_API_KEY || '3c3e2704-7562-41c3-956e-7cd19c6c82bb';
const XVERSE_API_BASE = 'https://api.secretkeylabs.io/v1';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const sparkAddress = searchParams.get('address');

  if (!sparkAddress) {
    return NextResponse.json(
      { error: 'Spark address is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${XVERSE_API_BASE}/spark/address/${sparkAddress}/btkn`,
      {
        headers: {
          'x-api-key': XVERSE_API_KEY,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Xverse API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching Spark balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Spark balance' },
      { status: 500 }
    );
  }
}

