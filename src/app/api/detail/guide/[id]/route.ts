import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id: post_id } = params;

  try {
    // 게시물에서 user_id를 가져옴
    const { data: post, error: postError } = await supabase.from('posts').select('user_id').eq('id', post_id).single();

    if (postError || !post) {
      console.error('Supabase post query error:', postError);
      return NextResponse.json({ error: postError?.message || 'Post not found' }, { status: 500 });
    }

    // user_id를 통해 작성자 정보를 가져옴
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, name, avatar, region')
      .eq('id', post.user_id)
      .single();

    if (userError || !user) {
      console.error('Supabase user query error:', userError);
      return NextResponse.json({ error: userError?.message || 'User not found' }, { status: 500 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Unexpected server error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
