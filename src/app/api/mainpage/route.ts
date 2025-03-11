import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
  }

  // const { searchParams } = new URL(request.url);
  // const tags = searchParams.get('tags');
  // const city = searchParams.get('city');
  // const startDate = searchParams.get('startDate');
  // const endDate = searchParams.get('endDate');
  const supabase = createClient();

  let query = supabase.from('posts').select('*');

  // if (tags) {
  //   try {
  //     query = query.contains('tags', JSON.parse(tags));
  //   } catch (error) {
  //     return NextResponse.json({ error: 'Invalid tags format' }, { status: 400 });
  //   }
  // }

  // if (city) {
  //   query = query.eq('city', city);
  // }

  // if (startDate) {
  //   query = query.gte('start_date', startDate);
  // }

  // if (endDate) {
  //   query = query.lte('end_date', endDate);
  // }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}
