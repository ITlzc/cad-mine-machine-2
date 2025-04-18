'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { getCurrentUser } from './utils/supabase_lib';
import WalletModal from './components/WalletModal'
import AddressModal from './components/AddressModal'
import PoolSelectModal from './components/PoolSelectModal'
import PaymentModal from './components/PaymentModal'
import { minerService } from './services/miner-service'
import { userService } from './services/user-service';
import Loading from './components/Loading'
import { useAccount } from 'wagmi'

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const router = useRouter()
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [hasWallet, setHasWallet] = useState(false)
  const [showAddressModal, setShowAddressModal] = useState(false)
  const [selectedMiner, setSelectedMiner] = useState<any>(null)
  const [showPoolModal, setShowPoolModal] = useState(false)
  const [selectedPool, setSelectedPool] = useState<any>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [miners, setMiners] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<{
    address: string;
    id: string;
  } | null>(null)

  const [orderData, setOrderData] = useState({
    machine_id: '',
    pool_id: '',
    shipping_info: null
  })

  // 检查是否已经绑定钱包
  useEffect(() => {
    async function getUserInfo() {
      const { user: user_data, error } = await getCurrentUser();
      if (error) {
        console.error('获取用户信息失败:', error)
      } else {
        const userInfo: any = await userService.getUserInfo(user_data?.id)
        console.log('用户信息:', userInfo, userInfo && userInfo?.user && !userInfo?.user.wallet_address)
        if(userInfo && userInfo?.user && !userInfo?.user.wallet_address) {
          setShowWalletModal(true)
        } else {
          setHasWallet(true)
        }
      }
    }
    getUserInfo()

  }, [])

  useEffect(() => {
    const fetchMiners = async () => {
      try {
        setLoading(true)
        const miners: any = await minerService.getMiners()
        setMiners(miners?.records)
      } catch (error) {
        toast.error('获取矿机列表失败')
      } finally {
        setLoading(false)
      }
    }
    fetchMiners()
  }, [])

  // 连接钱包的处理函数
  const handleBindWallet = async (address: string) => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        if (address) {
          await userService.bindWalletAddress(address)
          toast.success('绑定成功')
          setHasWallet(true)
          setShowWalletModal(false)
        }
      } else {
        toast.error('请安装 MetaMask 钱包！')
      }
    } catch (error) {
      console.error('连接钱包失败:', error)
      toast.error('连接钱包失败')
    }
  }

  const handleBuyClick = (miner: any) => {
    setSelectedMiner(miner)
    setOrderData(prev => ({ ...prev, machine_id: miner.id }))
    setShowPoolModal(true)
  }

  const handlePoolSelect = (pool: any) => {
    setSelectedPool(pool)
    setOrderData(prev => ({ ...prev, pool_id: pool.id }))
    setShowPoolModal(false)
    setShowAddressModal(true)
  }

  const handleAddressSubmit = async (addressData: any) => {
    try {
      // 创建订单
      const response: any = await minerService.createOrder({
        machine_id: orderData.machine_id,
        pool_id: orderData.pool_id,
        shipping_info: addressData
      })

      // 保存支付信息
      setPaymentInfo({
        address: response.payment_address,
        id: response.id
      })

      setShowAddressModal(false)
      setShowPaymentModal(true)
    } catch (error) {
      toast.error('创建订单失败')
    }
  }

  const handlePaymentConfirm = async () => {
    try {
      setSubmitting(true)

      const response: any = await minerService.confirmPayment(paymentInfo?.id || '')
      console.log(response)

      setShowPaymentModal(false)
      toast.success('确认成功！')
      setOrderData({
        machine_id: '',
        pool_id: '',
        shipping_info: null
      })
    } catch (error) {
      toast.error('确认支付失败')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <WalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onConnect={(address: string) => handleBindWallet(address)}
      />

      <PoolSelectModal
        isOpen={showPoolModal}
        onClose={() => setShowPoolModal(false)}
        onNext={handlePoolSelect}
      />

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSubmit={handleAddressSubmit}
      />

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onConfirm={handlePaymentConfirm}
        paymentAddress={paymentInfo?.address || ''}
        submitting={submitting}
      />

      {loading ? (
        <Loading />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {miners.map(miner => (
            <div key={miner.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* 图片容器 */}
              <div className="w-full bg-gray-200">
                <Image
                  src={miner.image}
                  alt={miner.title}
                  width={400}
                  height={269}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>

              {/* 内容区域 */}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{miner.title}</h2>
                <p className="text-gray-600 mb-4">{miner.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${miner.price}</span>
                  <button
                    className="px-6 py-2 min-w-[100px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => handleBuyClick(miner)}
                  >
                    立即购买
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
} 