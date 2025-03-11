'use client';
import BackButton from '@/components/common/Button/BackButton';
import { discordLogin, googleLogin, handleLogin, handleSignUp } from '@/utils/supabase/service';
import useAuthStore from '@/zustand/bearsStore';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  const onLogin = async (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await login(email, password, router);
  };

  const onSignUp = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    handleSignUp(email, password, name, router, setError);
  };

  const goToFindPassword = () => {
    router.push('/findPassword');
  };

  const onGoogleLogin = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    await googleLogin();
  };

  const onDiscordLogin = async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    await discordLogin();
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center md:h-screen md:bg-gray-100">
      <div className="h-[800px] w-full max-w-md bg-white px-5 md:h-auto md:w-full md:max-w-[480px] md:rounded-lg md:p-6 md:px-[80px] md:py-[48px] md:shadow-lg">
        <div className="mt-2 flex h-[44px] items-center pb-[16px] pt-3.5 md:hidden">
          <BackButton />
        </div>

        <h1 className="mt-[41px] text-center text-2xl font-bold">{isSignUp ? 'Create account' : 'Log in now'}</h1>
        <span className="mb-8 mt-3 block text-center text-sm text-[#7D848D]">
          {isSignUp ? 'Please sign up to continue Welko' : 'Please Log in to continue Welko'}
        </span>
        {isSignUp && <p className="mb-2 font-medium">Email</p>}
        <input
          type="email"
          placeholder="example@google.com"
          className="mb-3 h-12 w-full rounded-xl bg-[#F7F7F9] p-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {isSignUp && <p className="mb-2 font-medium">Password</p>}
        <div className="relative mb-3 w-full">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="h-12 w-full rounded-xl bg-[#F7F7F9] p-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
            onClick={toggleShowPassword}
          >
            <Image
              src={showPassword ? '/icons/tabler-icon-eye-off.svg' : '/icons/tabler-icon-eye.svg'}
              alt={showPassword ? 'Hide password' : 'Show password'}
              width={20}
              height={20}
            />
          </span>
        </div>
        {isSignUp && (
          <div>
            <p className="mb-2 font-medium">Nickname</p>
            <input
              type="text"
              placeholder="Nickname"
              className="mb-3 h-12 w-full rounded-xl bg-[#F7F7F9] p-4"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        )}

        <button
          onClick={isSignUp ? onSignUp : onLogin}
          className="w-full rounded-xl bg-[#B95FAB] px-5 py-3 font-semibold text-white hover:bg-[#A14092]"
        >
          {isSignUp ? 'Sign Up' : 'Log In'}
        </button>

        <div
          className={`absolute left-0 ${isSignUp ? 'mt-[58px] md:mt-[40px]' : 'mt-[214px] md:mt-[40px]'} w-full text-center md:relative`}
        >
          <p className="text-center text-[#707B81]">
            {isSignUp ? 'Already have an account?' : 'Don’t have an account?'}{' '}
            <button onClick={toggleForm} className="font-medium text-[#FF7029] underline">
              {isSignUp ? 'Log In' : 'Sign Up'}
            </button>
          </p>

          {!isSignUp && (
            <p className="absolute mt-4 w-full text-center md:relative">
              <button onClick={goToFindPassword} className="font-medium text-[#FF7029] underline">
                Forgot Password?
              </button>
            </p>
          )}

          <div className="my-4 mt-[77px] flex justify-center md:mt-[40px]">
            <a href="#" onClick={onGoogleLogin} className="mx-1 p-2">
              <Image
                src="https://supabase.com/dashboard/img/icons/google-icon.svg"
                alt="Google logo"
                width={24}
                height={24}
                className="h-[37px] w-[37px]"
              />
            </a>
            <a href="#" onClick={onDiscordLogin} className="mx-1 p-2">
              <Image
                src="https://supabase.com/dashboard/img/icons/discord-icon.svg"
                alt="Discord logo"
                width={24}
                height={24}
                className="h-[37px] w-[37px]"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
