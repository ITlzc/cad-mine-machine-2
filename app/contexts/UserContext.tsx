'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '../utils/supabase_lib';

interface User {
  id: string;
  avatar_url?: string;
  full_name?: string;
  name?: string;
  preferred_username?: string;
  email?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>;
  handleLoginSuccess: (userData: any) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const handleLoginSuccess = (userData: any) => {
    const userInfo = {
      id: userData?.id,
      avatar_url: userData?.user_metadata?.avatar_url,
      full_name: userData?.user_metadata?.full_name,
      name: userData?.user_metadata?.name,
      preferred_username: userData?.user_metadata?.preferred_username,
      email: userData?.email,
    };
    setUser(userInfo);
  };

  const refreshUser = async () => {
    try {
      let user_string = localStorage.getItem('user');
      let userData = null;
      
      if (user_string) {
        userData = JSON.parse(user_string);
      }
      
      if (!userData) {
        const { user: user_data, error } = await getCurrentUser();
        if (error || !user_data) {
          router.push('/login');
          return;
        }
        userData = user_data;
      }

      handleLoginSuccess(userData);
    } catch (error) {
      console.error('获取用户信息失败:', error);
      router.push('/login');
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, refreshUser, handleLoginSuccess }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 