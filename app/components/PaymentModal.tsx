'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon, ClipboardIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  paymentAddress: string
  submitting: boolean
  showStep?: boolean
  expiration_time?: string
  minAmount?: number
}

export default function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  paymentAddress,
  submitting,
  showStep = true,
  expiration_time = '',
  minAmount = 0
}: PaymentModalProps) {
  const [countdown, setCountdown] = useState('23:59:59')

  useEffect(() => {
    // 设置倒计时
    const endTime = expiration_time ? new Date(expiration_time).getTime() : new Date().getTime() + 24 * 60 * 60 * 1000 // 24小时

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = endTime - now

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setCountdown(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)

      if (distance < 0) {
        clearInterval(timer)
        setCountdown('00:00:00')
      }
    }, 1000)

    if (!isOpen) {
      clearInterval(timer)
    }

    return () => clearInterval(timer)
  }, [isOpen])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress)
    toast.success('地址已复制')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* 标题 */}
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">支付信息</h2>
        </div>

        {/* 步骤指示器 */}
        {showStep && (
          <div className="px-6 py-4">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                1
              </div>
              <div className="w-16 h-1 bg-blue-600" />
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                2
              </div>
              <div className="w-16 h-1 bg-blue-600" />
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
                3
              </div>
            </div>
          </div>
        )}

        {/* 支付信息 */}
        <div className="px-6 py-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-medium">请在24小时内完成支付</h3>
            <p className="text-gray-500 mt-1">支付倒计时：{countdown}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              收款钱包地址
            </label>
            <div className="flex items-center">
              <input
                type="text"
                value={paymentAddress}
                // value={`${paymentAddress.slice(0, 10)}...${paymentAddress.slice(-6)}`}
                readOnly
                className="flex-1 px-4 py-2 border rounded-l-lg bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyAddress}
                className="px-4 py-2 border border-l-0 rounded-r-lg hover:bg-gray-50"
              >
                <ClipboardIcon className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center mb-6">
            <QRCodeSVG
              value={paymentAddress}
              size={200}
              level="H"
              includeMargin
              className="mb-2"
            />
            <p className="text-sm text-gray-500">扫码支付</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">网络</div>
              <div className="text-sm">Binance Smart Chain</div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">最小充币额</span>
              <span className="text-sm">{minAmount} USDT</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">充币到账时间</span>
              <span className="text-sm">约 7 分钟</span>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-600">
              支付完成后，请点击"支付完成"按钮，我们会尽快为您发货
            </p>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="px-6 py-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                处理中...
              </>
            ) : (
              '支付完成'
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 