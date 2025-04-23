'use client'

import { useState } from 'react'
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface AddressFormData {
  receiver: string
  phone: string
  phoneCountry: string
  address: string
  postcode: string
}

interface FormErrors {
  receiver?: string
  phone?: string
  address?: string
  postcode?: string
}

interface AddressModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AddressFormData) => void
  isSubmitting?: boolean
}

export default function AddressModal({ isOpen, onClose, onSubmit, isSubmitting }: AddressModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    receiver: '',
    phone: '',
    phoneCountry: '+86',
    address: '',
    postcode: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // 添加国家/地区区号列表
  const phoneCountries = [
    { code: '+86', name: '中国大陆' },
    { code: '+852', name: '中国香港' },
    { code: '+853', name: '中国澳门' },
    { code: '+886', name: '中国台湾' },
    { code: '+81', name: '日本' },
    { code: '+82', name: '韩国' },
    { code: '+65', name: '新加坡' },
    { code: '+60', name: '马来西亚' },
    { code: '+84', name: '越南' },
    { code: '+66', name: '泰国' },
    { code: '+1', name: '美国/加拿大' },
    { code: '+44', name: '英国' },
    { code: '+61', name: '澳大利亚' },
    { code: '+64', name: '新西兰' },
    { code: '+49', name: '德国' },
    { code: '+33', name: '法国' },
    { code: '+39', name: '意大利' },
    { code: '+7', name: '俄罗斯' },
    { code: '+91', name: '印度' },
    { code: '+971', name: '阿联酋' },
  ]

  // 手机号格式验证
  const isValidPhone = (phone: string) => {
    // 根据不同国家/地区使用不同的验证规则
    if (formData.phoneCountry === '+86') {
      const phoneRegex = /^1[3-9]\d{9}$/
      return phoneRegex.test(phone)
    }
    // 其他地区使用宽松验证规则
    return phone.length >= 5 && phone.length <= 15
  }

  // 邮编验证
  const isValidPostcode = (postcode: string) => {
    // 中国邮编格式
    const postcodeRegex = /^\d{6}$/
    return postcodeRegex.test(postcode)
  }

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.receiver.trim()) {
      newErrors.receiver = '请输入收货人姓名'
    }

    if (!formData.phone) {
      newErrors.phone = '请输入联系电话'
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = '请输入正确的手机号码'
    }

    if (!formData.address.trim()) {
      newErrors.address = '请输入详细地址'
    }

    // 移除邮编验证
    if (formData.postcode && !isValidPostcode(formData.postcode)) {
      newErrors.postcode = '请输入正确的邮政编码'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理输入变化
  const handleChange = (field: keyof AddressFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }))

    // 实时验证
    if (touched[field]) {
      const newErrors = { ...errors }
      
      if (field === 'phone' && e.target.value) {
        if (!isValidPhone(e.target.value)) {
          newErrors.phone = '请输入正确的手机号码'
        } else {
          delete newErrors.phone
        }
      } else if (!e.target.value.trim()) {
        newErrors[field] = `请输入${field === 'receiver' ? '收货人姓名' : field === 'phone' ? '联系电话' : field === 'address' ? '详细地址' : '邮政编码'}`
      } else {
        delete newErrors[field]
      }

      setErrors(newErrors)
    }
  }

  // 处理失去焦点
  const handleBlur = (field: keyof AddressFormData) => () => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }))

    const newErrors = { ...errors }
    
    if (field === 'phone' && formData.phone) {
      if (!isValidPhone(formData.phone)) {
        newErrors.phone = '请输入正确的手机号码'
      } else {
        delete newErrors.phone
      }
    } else if (!formData[field].trim()) {
      newErrors[field] = `请输入${field === 'receiver' ? '收货人姓名' : field === 'phone' ? '联系电话' : field === 'address' ? '详细地址' : '邮政编码'}`
    } else {
      delete newErrors[field]
    }

    setErrors(newErrors)
  }

  const handleSubmit = () => {
    // 标记所有字段为已触碰
    setTouched({
      receiver: true,
      phone: true,
      address: true,
      postcode: true
    })

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  if (!isOpen) return null

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
          <h2 className="text-xl font-semibold">填写收货地址</h2>
        </div>

        {/* 步骤指示器 */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              1
            </div>
            <div className="w-16 h-1 bg-blue-600" />
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              2
            </div>
            <div className="w-16 h-1 bg-gray-200" />
            <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center">
              3
            </div>
          </div>
        </div>

        {/* 表单 */}
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                收货人 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="请输入收货人姓名"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.receiver ? 'border-red-500' : ''
                }`}
                value={formData.receiver}
                onChange={handleChange('receiver')}
                onBlur={handleBlur('receiver')}
              />
              {errors.receiver && (
                <p className="mt-1 text-sm text-red-500">{errors.receiver}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                联系电话 <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-2">
                <div className="relative">
                  <select
                    value={formData.phoneCountry}
                    onChange={(e) => setFormData(prev => ({ ...prev, phoneCountry: e.target.value }))}
                    className="appearance-none px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                  >
                    {phoneCountries.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.code} {country.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="tel"
                  placeholder="请输入联系电话"
                  className={`flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.phone ? 'border-red-500' : ''
                  }`}
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  onBlur={handleBlur('phone')}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                详细地址 <span className="text-red-500">*</span>
              </label>
              <textarea
                placeholder="请输入详细的收货地址"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24 ${
                  errors.address ? 'border-red-500' : ''
                }`}
                value={formData.address}
                onChange={handleChange('address')}
                onBlur={handleBlur('address')}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮政编码
              </label>
              <input
                type="text"
                placeholder="请输入邮政编码（选填）"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.postcode ? 'border-red-500' : ''
                }`}
                value={formData.postcode}
                onChange={handleChange('postcode')}
                onBlur={handleBlur('postcode')}
              />
              {errors.postcode && (
                <p className="mt-1 text-sm text-red-500">{errors.postcode}</p>
              )}
            </div>
          </div>
        </div>

        {/* 按钮组 */}
        <div className="px-6 py-4 border-t flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                处理中...
              </>
            ) : (
              '下一步'
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 