import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();
    const clientId = process.env.NEXT_PUBLIC_TRANSLATION_CLIENT_ID!;
    const clientSecret = process.env.NEXT_PUBLIC_TRANSLATION_CLIENT_SECRET!;
    const url = 'https://naveropenapi.apigw.ntruss.com/nmt/v1/translation';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'X-NCP-APIGW-API-KEY-ID': clientId as string,
        'X-NCP-APIGW-API-KEY': clientSecret as string
      },
      body: new URLSearchParams({
        source: 'ko',
        target: 'en',
        text: text
      })
    });
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json({ error: errorData.message }, { status: response.status });
    }

    const data = await response.json();

    if (data.message && data.message.result && data.message.result.translatedText) {
      return NextResponse.json({ translatedText: data.message.result.translatedText }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Failed to translate the text' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
