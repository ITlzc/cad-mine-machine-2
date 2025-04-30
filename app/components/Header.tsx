'use client';
import Image from 'next/image';
import Link from 'next/link'
import { ChevronDownIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from '../utils/supabase_lib';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useDisconnect } from 'wagmi'
import { useUser } from '../contexts/UserContext';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [avatarError, setAvatarError] = useState(false);
  const { user, setUser } = useUser();
  const { disconnect } = useDisconnect()

  const dropdownRef = useRef<HTMLDivElement>(null)

  // 判断是否是登录相关页面
  const isAuthPage = ['/login/', '/register/', '/forgot-password/'].includes(pathname)

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

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Error signing out:', error);
        return;
      }

      // 断开钱包连接
      disconnect();

      localStorage.removeItem('user');
      setUser(null);
      setIsDropdownOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <Image
                src="/images/logo.jpeg"
                alt="EpochMine"
                width={42}
                height={42}
                // className="h-8 w-auto"
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
                <span className="text-gray-700">{user?.full_name || user?.name || user?.preferred_username || user?.email || 'User'}</span>
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