'use client';

import axios from 'axios';
import { useState } from 'react';
import { API_MYPAGE_PROFILE_PASSWORD } from '@/utils/apiConstants';

type PasswordChangeFormProps = {
  userId: string;
  email: string;
};

const PasswordChangeForm = ({ userId, email }: PasswordChangeFormProps) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await axios.put(
        API_MYPAGE_PROFILE_PASSWORD(userId),
        { currentPassword, newPassword },
        {
          headers: {
            email: email
          }
        }
      );
      alert('Password changed successfully');
    } catch (error) {
      alert('Error changing password');
    }
  };

  return (
    <form onSubmit={handlePasswordChange} className="">
      <div>
        <input
          className="w-full rounded border px-3 py-2 text-black"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Current Password"
        />
      </div>
      <div className="mt-4">
        <input
          className="w-full rounded border px-3 py-2 text-black"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
        />
      </div>
      <button type="submit" className="mt-4 rounded bg-black px-4 py-2 text-white">
        Done
      </button>
    </form>
  );
};

export default PasswordChangeForm;
