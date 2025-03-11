import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = createClient();
    const { id: user_id } = params;
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');
    const postId = searchParams.get('post_id');

    let query = supabase.from('reviews').select('*').eq('user_id', user_id);

    if (reviewId) {
      query = query.eq('id', reviewId).eq('post_id', postId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { content, rating, post_id } = await request.json();
  const { id: user_id } = params;

  try {
    const { data, error } = await supabase.from('reviews').insert({ content, rating, post_id, user_id });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id, content, rating } = await request.json();
  const { id: user_id } = params;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({ content, rating })
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id } = await request.json();
  const { id: user_id } = params;

  try {
    const { data, error } = await supabase.from('reviews').delete().eq('id', id).eq('user_id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
