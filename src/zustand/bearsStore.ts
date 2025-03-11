import { create } from 'zustand';
import { toast } from 'react-toastify';
import { createClient } from '@/utils/supabase/client';

interface AuthStore {
  user: any;
  isAuthenticated: boolean;
  errorMessage: string;
  setUser: (user: any) => void;
  login: (email: string, password: string, router: any) => Promise<void>;
  logout: (router: any) => Promise<void>;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  errorMessage: '',
  setUser: (user: any) => set({ user, isAuthenticated: !!user }),

  login: async (email: string, password: string, router: any): Promise<void> => {
    const supabase = createClient();

    if (!email) {
      toast.error('Please Enter your email!');
      return;
    }
    if (!password) {
      toast.error('Please enter your password!');
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      console.error('Sign-in error:', signInError);
      if (signInError.message.toLowerCase().includes('invalid login credentials')) {
        toast.error('Invalid login credentials');
      } else {
        set({ errorMessage: signInError.message });
      }
    } else {
      toast.success('Login successful');
      set({ user: data.user, isAuthenticated: true, errorMessage: '' });
      window.location.href = '/';
    }
  },

  logout: async (router: any): Promise<void> => {
    const supabase = createClient();

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('Sign-out error:', signOutError);
      toast.error('Failed to log out');
    } else {
      toast.success('Logout successful');
      set({ user: null, isAuthenticated: false, errorMessage: '' });
      window.location.href = '/';
    }
  }
}));

export default useAuthStore;
