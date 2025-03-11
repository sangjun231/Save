import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID 값이 필요합니다.' }, { status: 400 });
    }
    const supabase = createClient();
    const { data, error } = await supabase.from('posts').select('*').eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'No posts found' }, { status: 404 });
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: '데이터를 가져오는 데 실패했습니다.' }, { status: 500 });
  }
}
