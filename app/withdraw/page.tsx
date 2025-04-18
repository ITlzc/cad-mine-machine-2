'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface WithdrawRecord {
  time: string
  address: string
  amount: number
  fee: string
  status: 'completed' | 'pending' | 'failed'
}

export default function WithdrawPage() {
  const [withdrawAddress, setWithdrawAddress] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [fee, setFee] = useState(0)
  const [actualAmount, setActualAmount] = useState(0)

  // 模拟数据
  const availableBalance = 5.8
  const totalWithdrawn = 12.5
  
  const withdrawRecords: WithdrawRecord[] = [
    {
      time: '2024-01-15 14:30:22',
      address: '0x8Fc6...3E4d',
      amount: 2.5,
      fee: '1%',
      status: 'completed'
    }
  ]

  // 计算手续费和实际到账金额
  useEffect(() => {
    const amount = parseFloat(withdrawAmount) || 0
    const feeRate = 0.01 // 1%
    const feeAmount = amount * feeRate
    setFee(feeAmount)
    setActualAmount(amount - feeAmount)
  }, [withdrawAmount])

  const handleWithdraw = () => {
    // 处理提现逻辑
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-green-600 bg-green-50 rounded-full text-sm">已完成</span>
      case 'pending':
        return <span className="px-2 py-1 text-yellow-600 bg-yellow-50 rounded-full text-sm">处理中</span>
      case 'failed':
        return <span className="px-2 py-1 text-red-600 bg-red-50 rounded-full text-sm">失败</span>
      default:
        return null
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">收益提现</h1>
      
      {/* 余额卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-600 text-white rounded-lg p-6">
          <div className="text-sm mb-2">可提现金额</div>
          <div className="text-3xl font-bold">{availableBalance} ETH</div>
        </div>
        <div className="bg-green-600 text-white rounded-lg p-6">
          <div className="text-sm mb-2">已提现金额</div>
          <div className="text-3xl font-bold">{totalWithdrawn} ETH</div>
        </div>
      </div>

      {/* 提现表单 */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提现地址
            </label>
            <input
              type="text"
              placeholder="请输入提现地址"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={withdrawAddress}
              onChange={(e) => setWithdrawAddress(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              提现数量
            </label>
            <input
              type="number"
              placeholder="0"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>

          <div className="flex justify-between text-sm text-gray-500">
            <span>手续费率</span>
            <span>1%</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>实际到账</span>
            <span className="text-blue-600 font-medium">{actualAmount.toFixed(4)} ETH</span>
          </div>

          <button
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleWithdraw}
          >
            确认提现
          </button>
        </div>
      </div>

      {/* 提现记录 */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-medium">提现记录</h2>
          <Link 
            href="/withdraw/records" 
            className="text-blue-600 flex items-center text-sm hover:text-blue-800"
          >
            更多记录
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提现时间</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提现地址</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">提现数量</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">手续费率</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {withdrawRecords.map((record, index) => (
              <tr key={index}>
                <td className="px-6 py-4 text-sm text-gray-900">{record.time}</td>
                <td className="px-6 py-4 text-sm font-mono">{record.address}</td>
                <td className="px-6 py-4 text-sm text-blue-600">{record.amount} ETH</td>
                <td className="px-6 py-4 text-sm text-gray-900">{record.fee}</td>
                <td className="px-6 py-4">{getStatusTag(record.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 