import Image from 'next/image'
import moment from 'moment'
import { orderService } from '../services/order-service'
import { useState, useEffect } from 'react'
import Loading from './Loading'
import { toast } from 'react-hot-toast'
interface OrderDetailProps {
  order: any
  onBack: () => void
  getStatusTag: (status: number) => JSX.Element
  userInfo: any
  upList: () => void
}

export default function OrderDetail({ order, onBack, getStatusTag, userInfo, upList }: OrderDetailProps) {
  const [orderDetail, setOrderDetail] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<number | ''>('')
  const [upLoading, setUpLoading] = useState(false)

  // 定义状态选项 - 完全移除请选择选项
  const statusOptions = [
    { value: 6, label: '机器准备中' },
    { value: 7, label: '机器已发货' },
    { value: 8, label: '机器已签收' },
    { value: 9, label: '机器待托管' },
    { value: 10, label: '机器已托管' },
  ]

  // 处理状态更新
  const handleUpdateStatus = async () => {
    if (!selectedStatus) {
      toast.error('请选择要更新的状态')
      return
    }
    
    try {
      setUpLoading(true)
      await orderService.updateOrderStatus(orderDetail.id, selectedStatus)
      // 刷新订单详情
      const updatedOrder = await orderService.getOrderDetail(order.id)
      setOrderDetail(updatedOrder)
      toast.success('状态更新成功')
      upList()
      setUpLoading(false)
    } catch (error) {
      console.error('更新状态失败:', error)
      toast.error('更新状态失败')
      setUpLoading(false)
    }
  }

  useEffect(() => {
    orderService.getOrderDetail(order.id).then((res: any) => {
      console.log(res)
      setOrderDetail(res)
      setSelectedStatus(res.status !== 1 ? res.status : '')
      setLoading(false)
    })
  }, [order])

  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回订单列表
        </button>
        
        {/* 修改管理员更新发货状态控件 */}
        {userInfo?.role === 2 && (orderDetail?.status === 1 || orderDetail?.status >= 6) && (
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value ? Number(e.target.value) : '')}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              defaultValue=""
            >
              <option value="" disabled>请选择</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleUpdateStatus}
              disabled={!selectedStatus || selectedStatus === orderDetail?.status || upLoading}
            >
              {upLoading ? '更新中...' : '更新发货状态'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? <Loading /> : <div className="p-6">
          <div className="">
            <h1 className="text-xl font-semibold mb-6">订单详情</h1>
          </div>


          {/* 订单基本信息 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-gray-200">
            <div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">订单编号</div>
                <div>{orderDetail?.order_id}</div>
              </div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">订单金额</div>
                <div className="">${orderDetail?.amount} U</div>
              </div>

              <div className="mb-7">
                <div className="text-gray-500 mb-2">创建时间</div>
                <div>{moment(orderDetail?.created_at).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">付款时间</div>
                <div>{orderDetail?.status === 1 ? moment(orderDetail?.pay_time).format('YYYY-MM-DD HH:mm:ss') : '-'}</div>
              </div>

              <div className="mb-7">
                <div className="text-gray-500 mb-2">收款地址</div>
                <div>{orderDetail?.payment_address}</div>
              </div>

            </div>
            <div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">订单状态</div>
                <div>{getStatusTag(orderDetail?.status)}</div>
              </div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">订单数量</div>
                <div>{orderDetail?.quantity}台</div>
              </div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">过期时间</div>
                <div>{moment(orderDetail?.expired_at).format('YYYY-MM-DD HH:mm:ss')}</div>
              </div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">付款地址</div>
                <div>{orderDetail?.status === 1 && orderDetail?.from_address ? orderDetail?.from_address : '-'}</div>
              </div>
              <div className="mb-7">
                <div className="text-gray-500 mb-2">交易哈希</div>
                {orderDetail?.status === 1 && orderDetail?.transaction_hash ? <a href={`https://bscscan.com/tx/${orderDetail?.transaction_hash}`} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                  {orderDetail?.transaction_hash}
                </a> : '-'
                }
              </div>
            </div>
          </div>

          {/* 收货信息 */}
          <div className='mb-8 border-b border-gray-200 pb-8'>
            <h2 className="text-lg font-semibold mb-4">收货信息</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <div className='flex flex-row gap-2'>
                  <div className="text-gray-500 mb-1">收货人:</div>
                  <div>{orderDetail?.shipping_info?.receiver}</div>
                </div>
                <div className='flex flex-row gap-2'>
                  <div className="text-gray-500 mb-1">联系电话</div>
                  <div>{orderDetail?.shipping_info?.phone}</div>
                </div>
                <div className='flex flex-row gap-2'>
                  <div className="text-gray-500 mb-1">收货地址</div>
                  <div>{orderDetail?.shipping_info?.address}</div>
                </div>
                <div className='flex flex-row gap-2'>
                  <div className="text-gray-500 mb-1">邮政编码</div>
                  <div>{orderDetail?.shipping_info?.postcode || '-'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 商品信息 */}
          <div className="mb-8 border-b border-gray-200 pb-8">
            <h2 className="text-lg font-semibold mb-4">矿机信息</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start ">
                <div className="relative">
                  <img
                    src={orderDetail?.machine_info.image}
                    alt={orderDetail?.machine_info.title}
                    className="rounded object-cover w-36 h-auto"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-lg font-medium">{orderDetail?.machine_info.title}</div>
                  <div
                    className="text-gray-500 mt-2"
                    dangerouslySetInnerHTML={{ __html: orderDetail?.machine_info.description }}
                  />
                  <div className="text-blue-600 mt-2 text-lg font-semibold">${orderDetail?.machine_info.price} U</div>
                </div>
              </div>
            </div>
          </div>

          {/* 矿池信息 */}
          {orderDetail?.pool_info && (
            <div className="mb-8 border-b border-gray-200 pb-8">
              <h2 className="text-lg font-semibold mb-4">矿池信息</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="h-16 w-16 relative">
                    <Image
                      src={orderDetail?.pool_info.logo}
                      alt={orderDetail?.pool_info.name}
                      fill
                      className="rounded object-cover"
                    />
                  </div>
                  <div className="ml-4">
                    <div className="text-lg font-medium">{orderDetail?.pool_info.name}</div>
                    <div className="text-gray-500">{orderDetail?.pool_info.description}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 备注 */}
          {orderDetail?.remark && <div className="mb-8 border-b border-gray-200 pb-8">
            <h2 className="text-lg font-semibold mb-4">备注</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-gray-500">{orderDetail?.remark}</div>
            </div>
          </div>}

        </div>}
      </div>
    </div>
  )
} 