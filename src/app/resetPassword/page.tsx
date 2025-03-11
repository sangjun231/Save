'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Image from 'next/image';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetCode, setResetCode] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');

    if (code) {
      setResetCode(code);
      setShowResetForm(true);
    } else {
      setError('Invalid or missing reset code.');
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setShowResetForm(true);
      }
    });

    return () => {
      if (authListener && typeof (authListener as any).unsubscribe === 'function') {
        (authListener as any).unsubscribe();
      }
    };
  }, [supabase]);

  const validatePassword = (password: string): boolean => {
    // 최소 하나의 영문자, 하나의 숫자, 하나의 특수 문자를 포함하는지 확인
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!validatePassword(newPassword)) {
      setError(
        'Password must be at least 8 characters long and include at least one letter, one number, and one special character.'
      );
      return;
    }

    if (!resetCode) {
      setError('Reset code is missing.');
      return;
    }

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        console.error('Update Error:', updateError.message);
        setError('Failed to update password. Please try again.');
      } else {
        setMessage('Password updated successfully! You can now log in with your new password.');
        setNewPassword('');
        setConfirmPassword('');
        router.push('/');
      }
    } catch (err) {
      console.error('Unexpected Error:', err);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex items-center justify-center md:h-screen md:bg-gray-100">
      <div className="h-[800px] w-full max-w-md bg-white px-5 md:h-auto md:w-full md:max-w-[480px] md:rounded-lg md:p-6 md:px-[80px] md:py-[48px] md:shadow-lg">
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : showResetForm ? (
          <>
            <h1 className="mt-[24px] text-center text-2xl font-bold">Reset Your Password</h1>
            <span className="mb-8 mt-3 block text-center text-sm text-[#7D848D] md:mb-[40px]">
              Please reset your new password
            </span>
            <form onSubmit={handleResetPassword}>
              <p className="mb-2 font-medium">New Password</p>
              <div className="relative mb-3 w-full">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="New Password"
                  className="mb-3 h-12 w-full rounded-xl bg-[#F7F7F9] p-4"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
                  onClick={toggleShowNewPassword}
                >
                  <Image
                    src={showNewPassword ? '/icons/tabler-icon-eye-off.svg' : '/icons/tabler-icon-eye.svg'}
                    alt={showNewPassword ? 'Hide password' : 'Show password'}
                    width={20}
                    height={20}
                  />
                </span>
              </div>
              <p className="mb-2 font-medium">Confirm Password</p>
              <div className="relative mb-3 w-full">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm Password"
                  className="h-12 w-full rounded-xl bg-[#F7F7F9] p-4"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3"
                  onClick={toggleShowConfirmPassword}
                >
                  <Image
                    src={showConfirmPassword ? '/icons/tabler-icon-eye-off.svg' : '/icons/tabler-icon-eye.svg'}
                    alt={showConfirmPassword ? 'Hide password' : 'Show password'}
                    width={20}
                    height={20}
                  />
                </span>
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-[#B95FAB] px-5 py-3 font-semibold text-white hover:bg-[#A14092]"
              >
                Reset Password
              </button>
            </form>
            {message && <p className="mt-4 text-center text-green-500">{message}</p>}
          </>
        ) : (
          <p className="text-center text-lg">Checking your authentication status...</p>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
