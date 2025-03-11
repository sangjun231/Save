import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { id: post_id } = params;

    // 리뷰와 사용자 이름을 함께 가져오는 쿼리
    const { data, error } = await supabase
      .from('reviews')
      .select(
        `
        id,
        post_id,
        user_id,
        rating,
        content,
        created_at,
        users (
          name
        )
      `
      )
      .eq('post_id', post_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 사용자 이름을 포함한 리뷰 데이터 반환
    const formattedData = data.map((review: any) => ({
      id: review.id,
      post_id: review.post_id,
      user_id: review.user_id,
      user_name: review.users.name,
      rating: review.rating,
      content: review.content,
      created_at: review.created_at
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: '데이터를 가져오는 데 실패했습니다.' }, { status: 500 });
  }
}
