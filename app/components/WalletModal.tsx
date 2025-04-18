'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useEffect } from 'react';
export default function WalletModal({ isOpen, onClose, onConnect }: {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (address: string) => void;
}) {
  

  const { address } = useAccount()

  useEffect(() => {
    console.log(address)
    if (address) {
      onConnect(address)
    }
  }, [address])

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[400px] p-6">
        <h2 className="text-xl font-semibold text-center mb-4">绑定钱包地址</h2>
        <p className="text-gray-600 text-center mb-6">
          绑定钱包地址以便进行交易和收益提现
        </p>
        <div className="space-y-3">
          {/* <button
            onClick={onConnect}
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            连接钱包
          </button> */}
          {!address ? <div className='flex items-center justify-center w-full bind-wallet-btn'>
            <ConnectButton label='连接钱包' />
          </div> :
            <div
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              绑定中...
            </div>}
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