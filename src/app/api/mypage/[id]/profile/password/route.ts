import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { id: user_id } = params;
  const { currentPassword, newPassword } = await req.json();

  try {
    // 현재 비밀번호 확인
    const {
      data: { session },
      error: signInError
    } = await supabase.auth.signInWithPassword({
      email: req.headers.get('email') || '',
      password: currentPassword
    });

    if (signInError || !session) {
      // 현재 비밀번호가 일치하지 않으면 오류 반환
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
    }

    // 비밀번호 변경
    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updatePasswordError) {
      return NextResponse.json({ error: updatePasswordError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Unexpected error occurred' }, { status: 500 });
  }
}
