import { createClient } from '@/utils/supabase/client';
import useAuthStore from '@/zustand/bearsStore';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 이메일 유효성 검사 함수
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// 비밀번호 유효성 검사 함수
const validatePassword = (password: string): boolean => {
  // 최소 하나의 영문자, 하나의 숫자, 하나의 특수 문자를 포함하는지 확인
  const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// 로그인
export const handleLogin = async (
  email: string,
  password: string,
  router: any,
  setError: (message: string) => void
) => {
  const { login } = useAuthStore.getState();
  await login(email, password, router);
};

// 회원가입
export const handleSignUp = async (
  email: string,
  password: string,
  name: string,
  router: any,
  setError: (message: string) => void
) => {
  const supabase = createClient();

  if (!email || !password || !name) {
    return toast.error('Please fill in all the blanks!');
  }

  // 클라이언트 사이드 유효성 검사
  if (!validateEmail(email)) {
    return toast.error('Please enter a valid email address!');
  }
  if (!validatePassword(password)) {
    return toast.error(
      'Password must contain at least 8 characters, English characters, numbers, and special characters!'
    );
  }

  // 이메일과 닉네임 중복 체크
  const { data: emailExist, error: emailError } = await supabase.from('users').select('id').eq('email', email).single();

  if (emailExist) {
    return toast.error('This email is already in use!');
  }

  const { data: nameExist, error: nameError } = await supabase.from('users').select('id').eq('name', name).single();

  if (nameExist) {
    return toast.error('This nickname is already in use!');
  }

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        name: name
      }
    }
  });

  if (error) {
    setError(error.message);
  } else {
    toast.success('Successfully signed up for membership!');
    router.push('/');
  }
};

// 구글로그인
export const googleLogin = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://welko.vercel.app/auth/callback',
      queryParams: {
        access_type: 'offline'
        // prompt: 'consent' // 권한 부여 동의 화면 항상 표시
      }
    }
  });
  if (error) {
    console.error('Error during Google login:', error);
    return;
  }
};

// 디스코드로그인
export const discordLogin = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: 'https://welko.vercel.app/auth/callback',
      queryParams: {
        access_type: 'offline'
        // prompt: 'consent' // 권한 부여 동의 화면 항상 표시
      }
    }
  });
  if (error) {
    console.error('Error during Discord login:', error);
    return;
  }
};
