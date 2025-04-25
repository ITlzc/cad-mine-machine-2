'use client'

import { useAccount } from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useState, useEffect } from 'react'

export default function WalletModal({ isOpen, onClose, onConnect, submitting }: {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
  submitting: boolean;
}) {
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const [visible, setVisible] = useState(false)

  const handleBindWallet = async () => {
    setVisible(true)
    if (!isConnected) {
      // 如果未连接钱包，先打开连接钱包弹窗
      openConnectModal?.()
      return
    }
    
    // 如果已连接钱包，直接执行绑定操作
    if (address) {
      setVisible(false)
      onConnect(address)
    }
  }

  useEffect(() => {
    if (isOpen && visible && address) {
      onConnect(address)
      setVisible(false)
    }
  }, [isOpen, address, visible])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] p-6">
        <h2 className="text-xl font-semibold text-center mb-4">绑定钱包地址</h2>
        <p className="text-gray-600 text-center mb-6">
          绑定钱包地址以便进行交易和收益提现
        </p>
        <div className="space-y-3">
          {(
            <button 
              className='w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center w-full bind-wallet-btn' 
              onClick={handleBindWallet}
            >
              {submitting ? '绑定中...' : ('绑定钱包')}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
          >
            暂不绑定
          </button>
        </div>
      </div>
    </div>
  );
} 