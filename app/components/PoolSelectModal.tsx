'use client'

import { useState, useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import { minerService } from '../services/miner-service'
import { toast } from 'react-hot-toast'
import Loading from '../components/Loading'

interface Pool {
  id: string
  name: string
  description: string
  icon: string
}

interface PoolSelectModalProps {
  isOpen: boolean
  onClose: () => void
  onNext: (selectedPool: Pool) => void
}

export default function PoolSelectModal({ isOpen, onClose, onNext }: PoolSelectModalProps) {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedPoolId, setSelectedPoolId] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      fetchPools()
    }
  }, [isOpen])

  const fetchPools = async () => {
    try {
      setLoading(true)
      const data: any = await minerService.getMiningPools()
      setPools(data?.records)
    } catch (error) {
      toast.error('获取矿池列表失败')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  // const pools: Pool[] = [
  //   {
  //     id: 'ethermine',
  //     name: 'EtherMine',
  //     description: '全球最大的以太坊矿池,稳定可靠的收益分配',
  //     icon: '/images/pools/ethermine.png'
  //   },
  //   {
  //     id: 'f2pool',
  //     name: 'F2Pool',
  //     description: '老牌矿池,支持多币种挖矿,收益结算及时',
  //     icon: '/images/pools/f2pool.png'
  //   },
  //   {
  //     id: 'sparkpool',
  //     name: 'SparkPool',
  //     description: '大型综合矿池,提供智能收益优化',
  //     icon: '/images/pools/sparkpool.png'
  //   }
  // ]

  const handleNext = () => {
    const selectedPool = pools.find(p => p.id === selectedPoolId)
    if (selectedPool) {
      onNext(selectedPool)
    }
  }

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
          <h2 className="text-xl font-semibold">选择矿池</h2>
        </div>

        {/* 步骤指示器 */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              1
            </div>
            <div className="w-16 h-1 bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              2
            </div>
            <div className="w-16 h-1 bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              3
            </div>
          </div>
        </div>

        {/* 矿池列表 */}
        <div className="px-6 py-4">
          {loading ? (
            <Loading />
          ) : (
            <div className="space-y-3">
              {pools.map((pool: any) => (
                <div
                  key={pool.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedPoolId === pool.id 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPoolId(pool.id)}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 relative mr-4">
                      <Image
                        src={pool.logo}
                        alt={pool.name}
                        fill
                        className="object-contain rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{pool.name}</h3>
                      <p className="text-sm text-gray-500">{pool.description}</p>
                    </div>
                    <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center">
                      {selectedPoolId === pool.id && (
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 按钮组 */}
        <div className="px-6 py-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            取消
          </button>
          <button
            onClick={handleNext}
            disabled={!selectedPoolId || loading}
            className={`px-4 py-2 rounded-lg ${
              selectedPoolId && !loading
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            下一步
          </button>
        </div>
      </div>
    </div>
  )
} 