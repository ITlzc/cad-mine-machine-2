'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { minerService } from '../services/miner-service'
import { orderService } from '../services/order-service'
import Loading from '../components/Loading'
import PaymentModal from '../components/PaymentModal'
import ConfirmModal from '../components/ConfirmModal'
import toast from 'react-hot-toast'
import moment from 'moment'

interface Order {
  orderId: string
  productInfo: {
    name: string
    image: string
    quantity: number
  }
  poolInfo: {
    name: string
    icon: string
    description: string
  } | null
  amount: number
  txHash: string
  status: 'success' | 'pending' | 'cancelled'
  createTime: string
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)
  const [processingOrders, setProcessingOrders] = useState<{ [key: string]: boolean }>({})
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<any>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  })

  const fetchOrders = async (page = 1, keyword = '') => {
    try {
      setLoading(true)
      const res: any = await orderService.orderList(page, pagination.pageSize, keyword)
      setOrders(res.records)
      setPagination(prev => ({
        ...prev,
        current: page,
        total: res.total
      }))
    } catch (error) {
      toast.error('获取订单列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleSearch = () => {
    fetchOrders(1, searchTerm)
  }

  const handlePageChange = (page: number) => {
    fetchOrders(page, searchTerm)
  }

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">待支付</span>
      case 1:
        return <span className="text-green-600 bg-green-50 px-2 py-1 rounded">支付成功</span>
      case 2:
        return <span className="text-red-600 bg-red-50 px-2 py-1 rounded">订单取消</span>
      case 3:
        return <span className="text-red-600 bg-red-50 px-2 py-1 rounded">支付超时</span>
      case 4:
        return <span className="text-red-600 bg-red-50 px-2 py-1 rounded">支付失败</span>
      case 5:
        return <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded">待验证</span>
      default:
        return <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded">未知状态</span>
    }
  }

  const handleRepay = async (order: any) => {
    try {
      setProcessingOrders(prev => ({ ...prev, [order.id]: true }))
      // 调用重新支付接口获取支付地址
      setCurrentOrder({
        ...order,
        payment_address: order.payment_address,
      })
      setShowPaymentModal(true)
    } catch (error) {
      toast.error('获取支付信息失败')
    } finally {
      setProcessingOrders(prev => ({ ...prev, [order.id]: false }))
    }
  }

  const handlePaymentConfirm = async () => {
    try {
      setProcessingOrders(prev => ({ ...prev, [currentOrder.id]: true }))
      const response: any = await minerService.confirmPayment(currentOrder.id || '')
      console.log(response)
      setShowPaymentModal(false)
      toast.success('已确认支付')
      // 刷新订单列表
      const res: any = await orderService.orderList()
      setOrders(res.records)
    } catch (error) {
      toast.error('确认支付失败')
    } finally {
      setProcessingOrders(prev => ({ ...prev, [currentOrder.id]: false }))
    }
  }

  const handleCancelClick = (order: any) => {
    setOrderToCancel(order)
    setShowConfirmModal(true)
  }

  const handleCancelConfirm = async () => {
    if (!orderToCancel) return

    try {
      setProcessingOrders(prev => ({ ...prev, [orderToCancel.id]: true }))
      await orderService.cancelOrder(orderToCancel.id)
      toast.success('订单已取消')
      // 刷新订单列表
      const res: any = await orderService.orderList()
      setOrders(res.records)
    } catch (error) {
      toast.error('取消订单失败')
    } finally {
      setProcessingOrders(prev => ({ ...prev, [orderToCancel.id]: false }))
      setShowConfirmModal(false)
      setOrderToCancel(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">订单记录</h1>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <input
                type="text"
                placeholder="搜索订单号"
                className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleSearch}
            >
              搜索
            </button>
          </div>
        </div>

        {loading ? <Loading /> : (
          <div className="bg-white rounded-lg shadow">
            <div className="w-full">
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">订单编号</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">商品信息</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">矿池信息</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[100px]">支付金额</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[100px]">交易哈希</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 min-w-[120px]">订单状态</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">创建时间</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders?.map((order: any) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 text-sm text-gray-900">{order.order_id}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center">
                            <div className="h-12 w-12 relative">
                              <Image
                                src={order.machine_info.image}
                                alt={order.machine_info.title}
                                fill
                                className="rounded object-cover"
                              />
                            </div>
                            <div className="ml-2">
                              <div className="text-sm font-medium text-gray-900">{order.machine_info.title}</div>
                              {/* <div className="text-sm text-gray-500">数量: 1台</div> */}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          {order.pool_info ? (
                            <div className="flex items-center">
                              <div className="w-12 h-12 relative flex-shrink-0">
                                <Image
                                  src={order.pool_info.logo}
                                  alt={order.pool_info.name}
                                  fill
                                  className="rounded"
                                />
                              </div>
                              <div className="ml-2 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate" title={order.pool_info.name}>
                                  {order.pool_info.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-[120px]" title={order.pool_info.description}>
                                  {order.pool_info.description}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">$ {order.amount}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-[120px]" title={order.txHash}>
                            {order.status === 1 ? order.transaction_hash : '-'}
                          </div>
                        </td>
                        <td className="px-4 py-4">{getStatusTag(order.status)}</td>
                        <td className="px-4 py-4 text-sm text-gray-900">{moment(order.created_at).format('YYYY-MM-DD HH:mm:ss')}</td>
                        <td className="px-4 py-4">

                          <div className="flex space-x-2">
                            {order.status === 0 ? (
                              <button
                                className="px-3 w-[90px] py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                                onClick={() => handleRepay(order)}
                                disabled={processingOrders[order.id]}
                              >
                                {processingOrders[order.id] ? '处理中...' : '重新支付'}
                              </button>
                            ) : null}
                            {order.status === 0 || order.status === 5 ? (
                              <button
                                className="px-3 w-[90px] py-1.5 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                                onClick={() => handleCancelClick(order)}
                                disabled={processingOrders[order.id]}
                              >
                                {processingOrders[order.id] ? '处理中...' : '取消订单'}
                              </button>
                            ) : null}
                          </div>

                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {/* 分页组件 */}
            <div className="px-4 py-3 border-t flex items-center justify-between">
              <div className="text-sm text-gray-700">
                共 {pagination.total} 条记录
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
          </div>
        )}
      </div>

      {/* 支付弹窗 */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        paymentAddress={currentOrder?.payment_address || ''}
        submitting={processingOrders[currentOrder?.id]}
        showStep={false}
        expiration_time={currentOrder?.expiration_time || ''}
      />

      {/* 确认对话框 */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setOrderToCancel(null)
        }}
        onConfirm={handleCancelConfirm}
        title="取消订单"
        content="确定要取消该订单吗？此操作不可恢复。"
        confirmText="确认取消"
        loading={processingOrders[orderToCancel?.id]}
      />
    </div>
  )
} 