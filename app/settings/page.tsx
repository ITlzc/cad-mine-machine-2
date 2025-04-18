'use client'

import { useState, useEffect } from 'react'
import { LinkIcon } from '@heroicons/react/24/outline'
import { getCurrentUser } from '../utils/supabase_lib'
import { userService } from '../services/user-service'

export default function SettingsPage() {
  const [emailAddress, setEmailAddress] = useState('')
  const [walletAddress, setWalletAddress] = useState('')

  useEffect(() => {
    async function getUserInfo() {
      const { user: user_data, error } = await getCurrentUser();
      if (error) {
        console.error('获取用户信息失败:', error)
      } else {
        setEmailAddress(user_data?.email || '')
        const userInfo: any = await userService.getUserInfo(user_data?.id)
        console.log('用户信息:', userInfo, userInfo && userInfo?.user && !userInfo?.user.wallet_address)
        if (userInfo && userInfo?.user && !userInfo?.user.wallet_address) {
          setWalletAddress(userInfo?.user.wallet_address)
        } else {
          setWalletAddress(userInfo?.user.wallet_address)
        }
      }
    }
    getUserInfo()

  }, [])

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-8">用户设置</h1>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 space-y-6">
          {/* 邮箱地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              type="text"
              value={emailAddress}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-50"
            />
          </div>

          {/* 钱包地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              钱包地址
            </label>
            <div className="flex items-center">
              {walletAddress ? <input
                type="text"
                value={walletAddress}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-gray-50"
              /> : <div className="flex-1 px-4 py-2 border rounded-lg bg-gray-50">未绑定</div>}
              {walletAddress ? <button
                className="ml-2 px-4 py-2 text-red-600 hover:text-red-800 flex items-center"
              >
                <LinkIcon className="w-5 h-5 mr-1" />
                解绑
              </button> : <button
                className="ml-2 px-4 py-2 text-blue-600 hover:text-blue-800 flex items-center"
              >
                <LinkIcon className="w-5 h-5 mr-1" />
                绑定
              </button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 