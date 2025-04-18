'use client'

import { useState } from 'react'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface MinerData {
  id: string
  macAddress: string
  ipAddress: string
  status: 'online' | 'offline'
  duration: string
  yesterdayEarnings: number
  totalEarnings: number
}

export default function MachinePage() {
  const [searchTerm, setSearchTerm] = useState('')

  // 模拟矿机数据
  const miners: MinerData[] = [
    {
      id: 'EM10086',
      macAddress: '00:1B:44:11:3A:B7',
      ipAddress: '192.168.1.100',
      status: 'online',
      duration: '30 天',
      yesterdayEarnings: 0.05,
      totalEarnings: 2.5
    },
    {
      id: 'EM10087',
      macAddress: '00:1B:44:11:3A:B8',
      ipAddress: '192.168.1.101',
      status: 'offline',
      duration: '25 天',
      yesterdayEarnings: 0.03,
      totalEarnings: 1.8
    }
  ]

  const getStatusTag = (status: 'online' | 'offline') => {
    return status === 'online' ? (
      <span className="px-2 py-1 text-green-600 bg-green-50 rounded-full text-sm">
        在线
      </span>
    ) : (
      <span className="px-2 py-1 text-red-600 bg-red-50 rounded-full text-sm">
        离线
      </span>
    )
  }

  return (
    <div className="p-6">
      {/* 搜索框 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="搜索矿机"
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        </div>
      </div>

      {/* 矿机列表表格 */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">矿机 ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">MAC 地址</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">IP 地址</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">在线时间</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <span className="text-blue-600">昨日收益</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <span className="text-blue-600">总收益</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {miners.map((miner) => (
              <tr key={miner.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">{miner.id}</td>
                <td className="px-4 py-4 text-sm font-mono text-gray-900">
                  {miner.macAddress}
                </td>
                <td className="px-4 py-4 text-sm font-mono text-gray-900">
                  {miner.ipAddress}
                </td>
                <td className="px-4 py-4">{getStatusTag(miner.status)}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{miner.duration}</td>
                <td className="px-4 py-4">
                  <span className="text-sm text-blue-600 font-medium">
                    {miner.yesterdayEarnings.toFixed(2)} ETH
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-blue-600 font-medium">
                    {miner.totalEarnings.toFixed(2)} ETH
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页或加载更多 */}
        <div className="px-4 py-3 border-t">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              共 {miners.length} 台矿机
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                上一页
              </button>
              <button className="px-3 py-1 border rounded text-sm text-gray-600 hover:bg-gray-50">
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 