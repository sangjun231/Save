import { createClient } from '@/utils/supabase/server';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const url = 'https://openapi.naver.com/v1/search/local.json';
    const headers = {
      'X-Naver-Client-Id': process.env.NAVER_SEARCH_CLIENT_ID!,
      'X-Naver-Client-Secret': process.env.NAVER_SEARCH_CLIENT_SECRET!
    };

    const response = await axios.get(url, {
      headers,
      params: {
        query,
        display: 5, // 검색 결과 개수, 5개가 최대임..
        start: 1,
        sort: 'sim' // 정렬 기준 정확도 순, 리뷰순은 comment
      }
    });

    if (response === null) {
      console.log('검색 결과가 없습니다');
    }

    return NextResponse.json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error response data:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error headers:', error.response?.headers);
    } else {
      console.error('Unexpected error:', error);
    }
    return NextResponse.json({ error: 'An error occurred while searching for places' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const data = await request.json();
  const { post_id, day, places, lat, long, area } = data;

  try {
    const { error } = await supabase.from('schedule').upsert({
      post_id,
      day,
      places,
      lat,
      long,
      area
    });
    if (error) {
      console.error('Error inserting dates:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 }); // 성공적으로 데이터를 삽입한 후 응답 반환
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const data = await request.json();
  const { post_id, day, places, lat, long, area } = data;

  try {
    const { data, error } = await supabase
      .from('schedule')
      .update({
        post_id,
        day,
        places,
        lat,
        long,
        area
      })
      .eq('post_id', post_id)
      .eq('day', day);
    if (error) {
      console.error('Error inserting dates:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true }, { status: 200 }); // 성공적으로 데이터를 삽입한 후 응답 반환
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
