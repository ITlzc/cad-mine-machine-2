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
import { useAccount, useWriteContract, usePublicClient } from 'wagmi'
import { Bsc } from './utils/bsc_config'
import { useConnectModal } from '@rainbow-me/rainbowkit'

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
    shipping_info: null,
    quantity: 0
  })
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  const { writeContractAsync } = useWriteContract()
  const { address, isConnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const publicClient = usePublicClient()

  const [pendingTransaction, setPendingTransaction] = useState<{
    toastId: string;
    paymentAddress: string;
    amount: string;
    orderId: string;
  } | null>(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  // 初始化每个矿机的数量为其 MPQ
  useEffect(() => {
    if (miners.length > 0) {
      const initialQuantities = miners.reduce((acc: { [key: string]: number }, miner: any) => {
        acc[miner.id] = miner.MPQ || 1;
        return acc;
      }, {});
      setQuantities(initialQuantities);
    }
  }, [miners]);

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
        console.error('获取矿机列表失败', error)
      } finally {
        setLoading(false)
      }
    }
    fetchMiners()
  }, [])

  // 监听钱包连接状态
  useEffect(() => {
    if (isConnected && pendingTransaction) {
      handleTransfer(
        pendingTransaction.toastId,
        pendingTransaction.paymentAddress,
        pendingTransaction.amount,
        pendingTransaction.orderId
      )
      setPendingTransaction(null)
    }
  }, [isConnected])

  // 连接钱包的处理函数
  const handleBindWallet = async (address: string) => {
    try {
      setSubmitting(true)
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
    } finally {
      setSubmitting(false)
    }
  }

  const handleBuyClick = (miner: any) => {
    setSelectedMiner(miner)
    setOrderData(prev => ({ 
      ...prev, 
      machine_id: miner.id,
      quantity: quantities[miner.id] || miner.MPQ || 1
    }))
    setShowPoolModal(true)
  }

  const handlePoolSelect = (pool: any) => {
    setSelectedPool(pool)
    setOrderData(prev => ({ ...prev, pool_id: pool.id }))
    setShowPoolModal(false)
    setShowAddressModal(true)
  }

  // 处理转账的函数
  const handleTransfer = async (toastId: string, paymentAddress: string, amount: string, orderId: string) => {
    try {
      toast.loading('转账处理中...', {
        id: toastId
      })

      // ERC20 代币合约配置
      const tokenAddress = '0x55d398326f99059fF775485246999027B3197955' as `0x${string}`
      const tokenABI = [{
        name: 'transfer',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'to', type: 'address' },
          { name: 'amount', type: 'uint256' }
        ],
        outputs: [{ type: 'bool' }]
      }] as const

      // 将金额转换为 wei（考虑 18 位小数）
      const amountInWei = BigInt(parseFloat(amount) * Math.pow(10, 18))

      // 发起转账
      const hash = await writeContractAsync({
        abi: tokenABI,
        address: tokenAddress,
        functionName: 'transfer',
        args: [paymentAddress as `0x${string}`, amountInWei],
        chain: Bsc,
        account: address
      })

      // 等待交易确认
      toast.loading('等待交易确认...', {
        id: toastId
      })

      // 等待交易被确认
      const receipt = await publicClient.waitForTransactionReceipt({ hash })
      
      if (receipt.status === 'success') {
        // 确认支付
        const response_confirm: any = await minerService.confirmPayment(orderId)
        console.log(response_confirm)

        toast.success('支付成功', {
          id: toastId
        })
        setOrderData({
          machine_id: '',
          pool_id: '',
          shipping_info: null,
          quantity: 0
        })
        router.push(`/orders`)
      } else {
        throw new Error('交易失败')
      }
    } catch (error: any) {
      console.error('转账失败:', error)
      toast.dismiss(toastId)
    } finally {
      toast.dismiss(toastId)
    }
  }

  const handleAddressSubmit = async (addressData: any) => {
    try {
      setIsSubmitting(true)
      // 创建订单
      const response: any = await minerService.createOrder({
        machine_id: orderData.machine_id,
        pool_id: orderData.pool_id,
        shipping_info: addressData,
        quantity: orderData.quantity
      })

      console.log(response)

      // 保存支付信息
      setPaymentInfo({
        address: response.payment_address,
        id: response.id
      })

      // 订单创建成功 提示成功和提示操作转账支付
      toast.success('订单创建成功,请在钱包中确认支付')
      setShowAddressModal(false)
      setIsSubmitting(false)


      // 检测是否为钱包环境
      if (typeof window.ethereum !== 'undefined') {
        const toastId = toast.loading('准备支付...')
        try {
          // 检查钱包连接状态
          if (!isConnected && openConnectModal) {
            toast.loading('请先连接钱包...', {
              id: toastId
            })
            
            // 保存待处理的交易信息
            setPendingTransaction({
              toastId,
              paymentAddress: response.payment_address,
              amount: response.amount,
              orderId: response.id
            })
            
            // 打开 RainbowKit 钱包连接模态框
            openConnectModal()
            return
          }

          // 如果已经连接钱包，直接处理转账
          await handleTransfer(
            toastId,
            response.payment_address,
            response.amount,
            response.id
          )
          
        } catch (error: any) {
          console.error('支付失败:', error)
        } finally {
          setIsSubmitting(false)
          toast.dismiss(toastId)
        }
      } else {
        // 非钱包环境或未连接钱包，显示常规支付弹窗
        setShowAddressModal(false)
        setShowPaymentModal(true)
        setIsSubmitting(false)
      }
    } catch (error) {
      toast.error('创建订单失败')
      setIsSubmitting(false)
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
        shipping_info: null,
        quantity: 0
      })
    } catch (error) {
      console.error('确认支付失败', error)
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
        submitting={submitting}
      />

      <PoolSelectModal
        isOpen={showPoolModal}
        onClose={() => setShowPoolModal(false)}
        onNext={handlePoolSelect}
      />

      <AddressModal
        isOpen={showAddressModal}
        onClose={() => !isSubmitting && setShowAddressModal(false)}
        onSubmit={handleAddressSubmit}
        isSubmitting={isSubmitting}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
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
                <div 
                  className="text-gray-600 mb-4 prose prose-sm max-w-none [&>*]:!my-0 [&_p]:!leading-normal"
                  dangerouslySetInnerHTML={{ __html: miner.description }}
                />
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-blue-600">${miner.price} U</span>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantities(prev => ({
                            ...prev,
                            [miner.id]: Math.max(miner.MPQ || 1, (prev[miner.id] || miner.MPQ || 1) - 1)
                          }))
                        }}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 min-w-[40px] text-center">
                        {quantities[miner.id] || miner.MPQ || 1}
                      </span>
                      <button
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          setQuantities(prev => ({
                            ...prev,
                            [miner.id]: (prev[miner.id] || miner.MPQ || 1) + 1
                          }))
                        }}
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        className="px-6 py-2 min-w-[100px] bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={() => handleBuyClick(miner)}
                      >
                        立即购买
                      </button>
                    </div>
                  </div>
                </div>
                <span className="flex justify-end mt-2 text-xs text-gray-500">{miner.MPQ || 1} 台起订</span>

              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
} 