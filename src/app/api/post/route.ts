import { Tables } from '@/types/supabase';
import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data, error } = await supabase.from('posts').select('*');
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 200 });
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const data = await request.json();
  const {
    user_id,
    name,
    title,
    content,
    image,
    maxPeople,
    tags,
    price,
    selectedPrices,
    startDate,
    endDate
  }: Partial<Tables<'posts'>> = data;

  if (!user_id) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data: insertedData, error: insertError } = await supabase
      .from('posts')
      .upsert({
        user_id,
        name,
        title,
        content,
        image,
        maxPeople,
        tags,
        price,
        selectedPrices,
        startDate,
        endDate
      })
      .select();

    if (insertError) {
      console.error('Error inserting dates:', insertError.message);
      return NextResponse.json({ error: insertError.message, details: insertError }, { status: 500 });
    }
    const newPostId = insertedData[0].id;
    return NextResponse.json(
      { message: 'Post inserted successfully', operation: 'insert', id: newPostId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const supabase = createClient();
  const data = await request.json();
  const {
    id,
    name,
    title,
    content,
    image,
    maxPeople,
    tags,
    price,
    selectedPrices,
    startDate,
    endDate
  }: Partial<Tables<'posts'>> = data;

  if (!id) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const { error: updateError } = await supabase
      .from('posts')
      .update({
        name,
        title,
        content,
        image,
        maxPeople,
        tags,
        price,
        selectedPrices,
        startDate,
        endDate
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating post:', updateError.message);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Post updated successfully', operation: 'update' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const supabase = createClient();
  const data = await request.json();
  const { post_id } = data;

  try {
    const { error: postError } = await supabase.from('posts').delete().eq('id', post_id);

    if (postError) {
      throw postError;
    }
    return NextResponse.json({ message: 'deleted' });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting data', error });
  }
}
