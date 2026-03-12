import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_GAMES = [
  'karakterfreefire',
  'tebakgame',
  'tebakheroml',
  'tebakjkt',
  'tebakbendera',
];

const BASE_API_URL = 'https://api.fikmydomainsz.xyz/games';

function transformResponse(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const transformed = { ...data };

  if (transformed.creator === 'FikXzMods') {
    transformed.creator = 'vallzx apis';
  }

  return transformed;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { games: string } }
) {
  try {
    const gameName = params.games?.toLowerCase().trim();

    if (!gameName || !SUPPORTED_GAMES.includes(gameName)) {
      return NextResponse.json(
        {
          status: false,
          error: 'Game tidak ditemukan',
        },
        { status: 404 }
      );
    }

    const sourceUrl = `${BASE_API_URL}/${gameName}`;

    const response = await fetch(sourceUrl, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: false,
          error: 'Gagal mengambil data dari sumber',
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const transformedData = transformResponse(data);

    return NextResponse.json(transformedData, {
      headers: {
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Games API Error:', error);
    return NextResponse.json(
      {
        status: false,
        error: 'Terjadi kesalahan internal',
      },
      { status: 500 }
    );
  }
}
