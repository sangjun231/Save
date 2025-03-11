import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id: post_id } = params;

  try {
    // 특정 게시물과 연관된 장소 데이터를 가져옴
    const { data: placesData, error: placesError } = await supabase
      .from('schedule')
      .select('lat, long, places, day') // day 필드를 추가
      .eq('post_id', post_id);
    if (placesError) {
      return NextResponse.json({ error: placesError.message }, { status: 500 });
    }

    if (!placesData || placesData.length === 0) {
      return NextResponse.json({ error: 'No places found' }, { status: 404 });
    }

    return NextResponse.json({ places: placesData });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
