import { apiClient } from '../utils/api-client'

export const orderService = {
  // 获取矿机列表
  orderList: (page: number = 1, limit: number = 20, orderID: string = "") => {
    return apiClient.get(`/orders/list?page=${page}&limit=${limit}&order_id=${orderID}`)
  },

  // 取消订单
  cancelOrder: (id: string) => {
    return apiClient.post(`/orders/cancel/`, { id })
  }
} 