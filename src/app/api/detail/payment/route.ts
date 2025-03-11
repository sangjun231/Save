import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { id, user_id, post_id, pay_state, total_price } = await request.json();

    console.log('Received data:', { id, user_id, post_id, pay_state, total_price });

    const supabase = createClient();

    const { data, error } = await supabase.from('payments').insert([
      {
        id,
        user_id,
        post_id,
        pay_state,
        total_price
      }
    ]);

    if (error) {
      console.error('Supabase insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('Inserted data:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error('Unknown error:', error);
      return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
    }
  }
}
