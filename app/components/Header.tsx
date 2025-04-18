'use client';
import Image from 'next/image';
import Link from 'next/link'
import { ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser, signOut } from '../utils/supabase_lib';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [avatarError, setAvatarError] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null)

  // 判断是否是登录相关页面
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(pathname)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      let user_string = localStorage.getItem('user');
      let user = null;
      if (user_string) {
        user = JSON.parse(user_string);
      }
      if (!user) {
        const { user: user_data, error } = await getCurrentUser();
        if (error || !user_data) {
          router.push('/login');
          return
        }
        user = user_data;
      }
      //   console.log('header user', user);
      let tamp = {
        id: user?.id,
        avatar_url: user?.user_metadata?.avatar_url,
        full_name: user?.user_metadata?.full_name,
        name: user?.user_metadata?.name,
        preferred_username: user?.user_metadata?.preferred_username,
      }
      //   console.log('tamp', tamp);
      setUser(tamp);
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      // Call Supabase signOut
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }

      // Clear local storage
      localStorage.removeItem('user');

      // Update local state
      // setIsLoggedIn(false);
      setIsDropdownOpen(false);

      // Redirect to login page
      console.log('logout 1111');
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleDownloadClick = () => {
    router.push('/download');
  };

  const handleBackClick = () => {
    router.push('/');
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/images/logo.svg"
                alt="EpochMine"
                width={32}
                height={32}
                className="h-8 w-auto"
              />
              <span className="ml-2 text-xl font-semibold">EpochMine</span>
            </div>
          </Link>
        </div>
        {!isAuthPage && (
          <div className="flex items-center space-x-4">
            
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img
                  src={user?.avatar_url || "/images/avatar.png"}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full"
                  onError={() => setAvatarError(true)}
                />
                <span className="text-gray-700">{user?.full_name || user?.name || user?.preferred_username || 'User'}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50">
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Cog6ToothIcon className="w-5 h-5 mr-2" />
                    用户设置
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                    退出登录
                  </button>
                </div>
              )}
            </div>

            <ConnectButton label='连接钱包' />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 