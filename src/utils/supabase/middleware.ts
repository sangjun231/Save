import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // 현재 로그인 상태이면서 경로가 /login, /findPassword, /resetPassword 인 경우 홈화면으로 리다이렉트
  if (
    user &&
    (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/findPassword') ||
      request.nextUrl.pathname.startsWith('/resetPassword'))
  ) {
    return NextResponse.redirect(request.nextUrl.origin);
  }

  if (
    !user &&
    (request.nextUrl.pathname.endsWith('/mypage') ||
      request.nextUrl.pathname.startsWith('/chatlistpage') ||
      request.nextUrl.pathname.startsWith('/postpage'))
  ) {
    return NextResponse.redirect(request.nextUrl.origin);
  }

  // is_admin 값을 확인하여 backOffice 페이지 접근 제어
  if (request.nextUrl.pathname.startsWith('/backOffice')) {
    if (user) {
      const { data: userData, error: adminCheckError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (adminCheckError) {
        console.error('Error fetching admin data:', adminCheckError);
        return NextResponse.redirect(request.nextUrl.origin);
      }

      if (!userData.is_admin) {
        return NextResponse.redirect(request.nextUrl.origin);
      }
    } else {
      return NextResponse.redirect(request.nextUrl.origin);
    }
  }

  return supabaseResponse;
}
