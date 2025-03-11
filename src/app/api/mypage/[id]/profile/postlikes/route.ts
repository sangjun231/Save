import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const userId = params.id;

  try {
    const { data, error } = await supabase
      .from('likes')
      .select('post_id, posts (id, title, content, image, startDate, endDate, price)')
      .eq('user_id', userId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: data.map((like) => like.posts) }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const userId = params.id;
  const { postId } = await request.json();

  if (!userId || !postId) {
    return NextResponse.json({ error: 'User ID and Post ID are required' }, { status: 400 });
  }

  try {
    const { data: existingLike, error: likeError } = await supabase
      .from('likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .single();

    if (likeError && likeError.code !== 'PGRST116') {
      return NextResponse.json({ error: likeError.message }, { status: 500 });
    }

    if (existingLike) {
      const { error: deleteError } = await supabase.from('likes').delete().eq('user_id', userId).eq('post_id', postId);

      if (deleteError) {
        return NextResponse.json({ error: deleteError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, liked: false }, { status: 200 });
    } else {
      const { error: insertError } = await supabase.from('likes').insert([{ user_id: userId, post_id: postId }]);

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, liked: true }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
