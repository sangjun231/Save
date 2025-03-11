import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const supabase = createClient();
  const postId = request.nextUrl.searchParams.get('postId');

  if (!postId) {
    return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*, users (id, email , name , avatar), posts (id, title , image, price, startDate, endDate)')
      .eq('post_id', postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}
