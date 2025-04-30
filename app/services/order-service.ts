import { apiClient } from '../utils/api-client'

export const orderService = {
  // 获取订单列表
  orderList: (page: number = 1, limit: number = 20, orderID: string = "") => {
    return apiClient.get(`/orders/list?page=${page}&limit=${limit}&order_id=${orderID}`)
  },

  // 取消订单
  cancelOrder: (id: string) => {
    return apiClient.post(`/orders/cancel/`, { id })
  },

  // 获取订单详情
  getOrderDetail: (id: string) => {
    return apiClient.get(`/orders/detail/${id}`)
  },

  // 更新订单状态
  updateOrderStatus: (id: string, status: number) => {
    return apiClient.post(`/orders/update-shipping-status`, { id, status })
  }
} 