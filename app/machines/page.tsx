'use client'

import { useEffect, useState, useCallback } from 'react'
import { MagnifyingGlassIcon, ClipboardDocumentIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { userService } from '../services/user-service'
import TransferModal from '../components/TransferModal'
import AddMinerModal from '../components/AddMinerModal'
import toast from 'react-hot-toast'
import Loading from '../components/Loading'
import MD5 from 'crypto-js/md5'

interface MinerData {
  id: string
  node_key: string,
  mac_addr: string
  last_ip: string,
  last_submit_time: string,
  status: 0
  online_time: string
  y_earn: number
  t_earn: number
}

export default function MachinePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [miners, setMiners] = useState<MinerData[]>([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showAddMinerModal, setShowAddMinerModal] = useState(false)
  const [selectedMiner, setSelectedMiner] = useState<MinerData | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const formatOnlineTime = (seconds: number): string => {
    if (!seconds) return '-'

    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    return `${hours}小时${minutes}分钟${remainingSeconds}秒`
  }

  // 使用useCallback包装搜索函数，避免重复创建
  const debouncedSearch = useCallback(
    (keyword: string) => {
      setPagination(prev => ({
        ...prev,
        current: 1
      }))
      getMiners(1, pagination.pageSize, keyword)
    },
    [pagination.pageSize]
  )

  // 处理搜索框输入
  const handleSearchInput = (value: string) => {
    setSearchTerm(value)
  }

  // 处理清空按钮点击
  const handleClear = () => {
    setSearchTerm('')
    setPagination(prev => ({
      ...prev,
      current: 1
    }))
    getMiners(1, pagination.pageSize, '')
  }

  // 监听搜索词变化，使用防抖处理搜索
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchTerm)
    }, 300) // 300ms 的防抖延迟

    return () => clearTimeout(timer)
  }, [searchTerm, debouncedSearch])

  const handlePageChange = (page: number) => {
    getMiners(page, pagination.pageSize, searchTerm)
    // 页面回到顶部
    window.scrollTo(0, 0)
  }

  const getMiners = async (page: number, pageSize: number, searchTerm: string) => {
    setLoading(true)
    try {
      const res: any = await userService.getMinerNode(page, pageSize, searchTerm)
      if (res.records && res.records.length > 0) {
        setMiners(res.records)
        setPagination(prev => ({
          ...prev,
          current: page,
          total: res.total
        }))
      }
    } catch (error) {
      console.error('Failed to fetch miners:', error)
    } finally {
      setLoading(false)
    }
  }

  const onlineTimeForMiner = async (node_keys: string[], records: MinerData[]) => {
    const res: any = await userService.getMinerNodeOnlineTime(node_keys)
    console.log("onlineTimeForMiner =", res)
    for (let i = 0; i < res.length; i++) {
      for (let j = 0; j < records.length; j++) {
        if (records[j].node_key === res[i].node_key) {
          records[j].online_time = res[i].online_time
        }
      }
    }
    console.log("records =", records)
    setMiners(records)
    // const data = await response.json()
    // if (data.code === 200 && data.data) {
    //   let records = data.data
    //   for (let i = 0; i < records.length; i++) {
    //     let online_time = records[i].online_time
    //     for (let j = 0; j < miners.length; j++) {
    //       if (miners[j].node_key === records[i].node_key) {
    //         miners[j].duration = online_time
    //       }
    //     }
    //   }
    //   setMiners(miners)
    // }
  }

  const handleTransferClick = (miner: MinerData) => {
    setSelectedMiner(miner)
    setShowTransferModal(true)
  }

  const handleTransferConfirm = async (email: string) => {
    if (!selectedMiner) return

    try {
      setSubmitting(true)
      const res: any = await userService.transferMinerNode(selectedMiner.node_key, email)
      console.log("transferMinerNode =", res)
      toast.success('转让成功')
      setShowTransferModal(false)
      // 刷新列表
      getMiners(pagination.current, pagination.pageSize, searchTerm)
    } catch (error) {
      console.error('转让失败:', error)
      toast.error('转让失败')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    toast.success('已复制到剪贴板')
    setCopiedId(id)
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedId(null)
    }, 2000)
  }

  const handleAddMinerConfirm = async (macAddress: string) => {
    try {
      setSubmitting(true)
      const res: any = await userService.addMinerNode(macAddress)
      console.log("addMinerNode =", res)
      toast.success('添加成功')
      setShowAddMinerModal(false)
      // 刷新列表
      getMiners(pagination.current, pagination.pageSize, searchTerm)
    } catch (error: any) {
      console.error('添加失败: ', error.message)
      toast.error('添加失败: ' + error.message)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    getMiners(pagination.current, pagination.pageSize, searchTerm)
  }, [])

  const getStatusTag = (status: number) => {
    if (status === 2) {
      return <span className="px-2 py-1 text-purple-600 bg-purple-50 rounded-full text-sm">
        无效
      </span>
    }
    return status === 1 ? (
      <span className="px-2 py-1 text-green-600 bg-green-50 rounded-full text-sm">
        在线
      </span>
    ) : (
      <span className="px-2 py-1 text-red-600 bg-red-50 rounded-full text-sm">
        离线
      </span>
    )
  }

  const getShortHash = (text: string) => {
    return MD5(text).toString().substring(8, 24)
  }

  return (
    <div className="p-6">
      {/* 搜索框 */}
      <div className="mb-6 flex justify-between items-center">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="搜索矿机"
            className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => handleSearchInput(e.target.value)}
          />
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          {searchTerm && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              title="清空搜索"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg outline-none border-none hover:bg-blue-700 focus:outline-none"
          onClick={() => setShowAddMinerModal(true)}
        >
          新增矿机
        </button>
      </div>

      {/* 矿机列表表格 */}
      {loading ? <Loading /> : <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">矿机 ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">MAC 地址</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">IP 地址</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">状态</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">在线时间</th>
              {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <span className="text-blue-600">昨日收益</span>
              </th> */}
              {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <span className="text-blue-600">总收益</span>
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                <span className="text-blue-600">操作</span>
              </th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {miners.map((miner) => (
              <tr key={miner.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>{getShortHash(miner.node_key)}</span>
                    {/* <button
                      onClick={() => handleCopyId(miner.node_key)}
                      className={`p-1 hover:bg-gray-100 rounded-full transition-colors ${copiedId === miner.node_key ? 'bg-gray-200' : ''}`}
                      title="复制ID"
                    >
                      {copiedId === miner.node_key ? (
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                      )}
                    </button> */}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-mono text-gray-900">
                  <div className="flex items-center space-x-2">
                    <span>{miner.mac_addr || '-'}</span>
                    {miner.mac_addr && miner.mac_addr.length > 0 && (
                      <button
                        onClick={() => handleCopyId(miner.mac_addr)}
                      className={`p-1 hover:bg-gray-100 rounded-full transition-colors ${copiedId === miner.mac_addr ? 'bg-gray-200' : ''}`}
                      title="复制"
                    >
                      {copiedId === miner.mac_addr ? (
                        <CheckIcon className="w-4 h-4 text-green-600" />
                      ) : (
                        <ClipboardDocumentIcon className="w-4 h-4 text-gray-500" />
                      )}
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 text-sm font-mono text-gray-900">
                  {miner.last_ip || '-'}
                </td>
                <td className="px-4 py-4">{getStatusTag(miner.status)}</td>
                <td className="px-4 py-4 text-sm text-gray-900">{formatOnlineTime(Number(miner.online_time)) || '-'}</td>
                {/* <td className="px-4 py-4">
                  <span className="text-sm text-blue-600 font-medium">
                    {Number(ethers.utils.formatEther(BigInt(miner.y_earn).toString())).toFixed(2)} CAD
                  </span>
                </td> */}
                {/* <td className="px-4 py-4">
                  <span className="text-sm text-blue-600 font-medium">
                    {Number(ethers.utils.formatEther(BigInt(miner.t_earn).toString())).toFixed(2)} CAD
                  </span>
                </td> */}
                {/* <td className="px-4 py-4">
                  <button
                    className="px-3 py-1 rounded text-sm text-white bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleTransferClick(miner)}
                  >
                    转让
                  </button>
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>

        {/* 分页或加载更多 */}
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            共 {pagination.total} 台矿机
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current === 1}
              className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            {(() => {
              const totalPages = Math.ceil(pagination.total / pagination.pageSize)
              const currentPage = pagination.current
              const pages = []

              // 始终显示第一页
              pages.push(1)

              // 计算中间页码
              let start = Math.max(2, currentPage - 2)
              let end = Math.min(totalPages - 1, currentPage + 2)

              // 调整start和end，确保显示5个页码
              if (end - start < 4) {
                if (start === 2) {
                  end = Math.min(6, totalPages - 1)
                } else if (end === totalPages - 1) {
                  start = Math.max(2, totalPages - 5)
                }
              }

              // 添加省略号
              if (start > 2) {
                pages.push('...')
              }

              // 添加中间页码
              for (let i = start; i <= end; i++) {
                pages.push(i)
              }

              // 添加省略号
              if (end < totalPages - 1) {
                pages.push('...')
              }

              // 始终显示最后一页
              if (totalPages > 1) {
                pages.push(totalPages)
              }

              return pages.map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2">...</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page as number)}
                    className={`px-3 py-1 rounded ${page === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border'
                      }`}
                  >
                    {page}
                  </button>
                )
              ))
            })()}
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current === Math.ceil(pagination.total / pagination.pageSize)}
              className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      </div>}

      <TransferModal
        isOpen={showTransferModal}
        onClose={() => {
          setShowTransferModal(false)
          setSelectedMiner(null)
        }}
        onConfirm={handleTransferConfirm}
        minerId={selectedMiner?.node_key || ''}
        submitting={submitting}
      />

      <AddMinerModal
        isOpen={showAddMinerModal}
        onClose={() => setShowAddMinerModal(false)}
        onConfirm={handleAddMinerConfirm}
        submitting={submitting}
      />
    </div>
  )
} 