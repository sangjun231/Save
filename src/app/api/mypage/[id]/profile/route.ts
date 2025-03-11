import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id: user_id } = params;

  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', user_id).single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id: user_id } = params;
  const { name, email, avatar, region } = await req.json();

  try {
    const { data, error } = await supabase.from('users').update({ name, email, avatar, region }).eq('id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id: user_id } = params;

  try {
    const { error: deleteUserError } = await supabase.from('users').delete().eq('id', user_id);

    if (deleteUserError) {
      return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
