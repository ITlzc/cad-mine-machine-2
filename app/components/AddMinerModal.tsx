'use client'

import { useEffect, useState } from 'react'

interface AddMinerModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (macAddress: string) => void
  submitting: boolean
}

export default function AddMinerModal({
  isOpen,
  onClose,
  onConfirm,
  submitting
}: AddMinerModalProps) {
  const [macAddress, setMacAddress] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    // Simple MAC address validation
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
    if (!macRegex.test(macAddress)) {
      setError('请输入有效的MAC地址格式 (例如: 00:1B:44:11:3A:B7)')
      return
    }
    
    onConfirm(macAddress)
    setError('')
  }

  const handleClose = () => {
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      setMacAddress('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* 模态框 */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">新增矿机</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 内容 */}
          <div className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  MAC地址
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00:1B:44:11:3A:B7"
                  value={macAddress}
                  onChange={(e) => {
                    setMacAddress(e.target.value)
                    setError('')
                  }}
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600">
                    {error}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="flex justify-end gap-2 p-4 border-t">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              disabled={submitting}
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? '提交中...' : '确认'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 