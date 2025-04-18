'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { loginWithTwitter, getCurrentUser, get_access_token } from '../utils/supabase_lib';
import Image from 'next/image';
import { supabase } from '../utils/supabase_lib';
import router from 'next/router';
import { useRouter, usePathname } from 'next/navigation';


const LoginPage: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [isActivating, setIsActivating] = React.useState(false);
  const [active_record_status, setActiveRecordStatus] = React.useState(null);
  const [is_activated, setIsActivated] = React.useState(false);
  const [user, setUser] = React.useState(null);
  const fetchUserData = async (user) => {
    try {
        // setUser(user);
        // Fetch user data from backend API
        const access_token = await get_access_token();
        if (!access_token) {
            // router.push('/login');
            return;
        }
        const response = await fetch(`/api/v1/user/${user.id}`, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }
        const responseData = await response.json();
        console.log(responseData);
        return responseData

    } catch (error) {
        console.error('Error fetching user data:', error);
    } finally {
    }
};

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      let user_string = localStorage.getItem('user');
      let user = null;
      if (user_string) {
        user = JSON.parse(user_string);
      }
      if (!user) {
        const { user:user_data , error } = await getCurrentUser();
        if (error || !user_data) {
            return
        }
        user = user_data;
      }
      if (user) {
        
       const responseData = await fetchUserData(user);
       if (!responseData) {
        return
       }
       const userData = responseData && responseData.data && responseData.data.user;
       const active_record = responseData && responseData.data && responseData.data.active_record;

        setIsActivated(userData?.status !== 0);
        setUser({
          id: user.id,
          name: user.user_metadata?.full_name || "",
          username: user.user_metadata?.preferred_username || "",
          avatar: user.user_metadata?.avatar_url || "",
          email: user.email || "",
          is_activated: userData?.status !== 0, // status = 0 means not activated
        });
        

        setActiveRecordStatus(active_record?.status);
        if (userData?.status === 1) {
          router.replace('/');
        }
      }
    };

    checkUser();
  }, [login]);

  const handleTwitterLogin = async () => {
    try {
      // Get referral_id from URL if it exists
      const urlParams = new URLSearchParams(window.location.search);
      const referralId = urlParams.get('referral_id');

      // Decode base64 referral ID if it exists
      const decodedReferralId = referralId ? atob(referralId) : null;

      const { error } = await loginWithTwitter({
        ...(decodedReferralId && { referralId: decodedReferralId })
      });
      if (error) {
        console.error('Twitter login error:', error);
      }
    } catch (error) {
      console.error('Error during Twitter login:', error);
    }
  };

  const handleActivateAccount = async () => {
    if (isActivating) return;
    
    setIsActivating(true);
    try {
      const access_token = await get_access_token();
      if (!access_token) {
        // router.push('/login');
        return;
      }
      const response = await fetch('/api/v1/user/active', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to activate account');
      }

      const data = await response.json();
      if (data.code === 200 && data.data) {
        setActiveRecordStatus(0)
        // Open Twitter follow page in a new window
        window.open(`https://x.com/intent/follow?screen_name=${data.data}`, '_blank');
        router.replace('/');
      } else {
        console.error('Activation failed:', data);
      }
    } catch (error) {
      console.error('Error activating account:', error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 from-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="w-[480px] bg-white rounded-xl shadow-lg p-10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
        <div className="flex justify-center mb-4">
          <Image 
            src="/images/logo.svg" 
            alt="Logo" 
            width={48}
            height={48}
            className="h-12 w-auto"
          />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome</h1>
          <p className="text-gray-500">Sign in to start your journey</p>
          {/* <button
            onClick={() => {window.open('/cad_video_tutorial.mp4', '_blank')}}
            className="mt-4 text-base text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
          >
            <i className="fas fa-play-circle"></i>
            <span>Watch Tutorial</span>
            <i className="fas fa-external-link-alt text-xs"></i>
          </button> */}
        </div>
        
        {user && !user.is_activated ? (
          <div className="flex flex-col items-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <img
                src={user?.avatar || "/images/avatar.png"}
                alt="User Avatar"
                className="rounded-full w-full h-full object-cover"
              />
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-yellow-500 rounded-full border-4 border-white"></div>
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">{user?.full_name || user?.name || "User Name"}</h3>
            <p className="text-gray-500 mb-4">@{user?.username || "username"}</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 w-full">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-yellow-700">
                    {active_record_status === 2 ? 
                      'Activation failed. Please try again.' : 
                      'Please follow our official Twitter account to activate your account'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col w-full gap-3">
              <button
                className="!rounded-button flex items-center justify-center w-full bg-blue-500 text-white py-3 px-6 font-medium hover:bg-blue-600 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleActivateAccount}
                disabled={isActivating || active_record_status === 0}
              >
                {active_record_status === 0 ? (
                  <>
                    Verifying...
                  </>
                ) : isActivating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Activating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-external-link-alt mr-2"></i>
                    {active_record_status === 2 ? 'Retry Activation' : 'Follow Official Account'}
                  </>
                )}
              </button>

              {(active_record_status === 0 || active_record_status === 2) && (
                <button
                  onClick={() => router.replace('/')}
                  className="!rounded-button flex items-center justify-center w-full bg-gray-100 text-gray-700 py-3 px-6 font-medium hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  Go to Index
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <button
              onClick={handleTwitterLogin}
              className="!rounded-button flex items-center justify-center w-full bg-[#1DA1F2] text-white py-4 px-6 text-lg font-medium hover:bg-[#1a91da] transition-colors whitespace-nowrap"
            >
              <i className="fab fa-twitter mr-3 text-xl"></i>
              Sign in with Twitter
            </button>
          </div>
        )}
        
        {/* <div className="mt-8 text-center text-sm text-gray-500">
          <p>By signing in, you agree to our</p>
          <div className="mt-1">
            <a href="#" className="text-blue-500 hover:text-blue-600">Terms of Service</a>
            <span className="mx-2">and</span>
            <a href="#" className="text-blue-500 hover:text-blue-600">Privacy Policy</a>
          </div>
        </div> */}
      </div>
    </div>
  );
}

export default LoginPage; 