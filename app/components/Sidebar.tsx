'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { icon: "🛒", label: "矿机销售", path: "/" },
    // { icon: "📋", label: "矿机列表", path: "/machines" },
    // { icon: "💰", label: "收益提现", path: "/withdraw" },
    // { icon: "📝", label: "提现记录", path: "/records" },
    { icon: "📄", label: "订单记录", path: "/orders/" },
  ]

  return (
    <div className="w-[230px] min-h-screen bg-white border-r border-gray-200">
      <nav className="mt-8">
        {menuItems.map((item, index) => (
          <Link 
            key={index}
            href={item.path}
            className={`flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${
              pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
} 