'use client'

import './globals.css'
import Head from 'next/head'
import { AuthProvider } from './providers/AuthProvider'
import { Providers } from '../providers/wagmiProvider'
import { Toaster } from 'react-hot-toast'
import { Inter } from 'next/font/google'
import { usePathname } from 'next/navigation'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import { UserProvider } from './contexts/UserContext'
import ScrollToTop from './components/ScrollToTop'

const inter = Inter({ subsets: ['latin'] })


// 定义不需要显示侧边栏的路由
const noSidebarRoutes = ['/login', '/register', '/forgot-password']

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showSidebar = !noSidebarRoutes.includes(pathname)

  return (
    <html lang="en">
      <head>
        <title>Cad Mine Machine</title>
        <meta name="description" content="EpochMine是专业的矿机销售平台，提供高性能矿机、专业级矿机和旗舰级矿机等产品。" />
        {/* <meta name="keywords" content="矿机,挖矿,比特币,以太坊,加密货币" /> */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
        <link rel="icon" href="/images/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ScrollToTop />
        <UserProvider>
          <Providers>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <div className="flex">
                {showSidebar && <Sidebar />}
                <main className={`flex-1 ${showSidebar ? 'p-6 md:px-4' : ''} overflow-x-auto`}>
                  <AuthProvider>
                    {children}
                    <Toaster position="top-right" />
                  </AuthProvider>
                </main>
              </div>
            </div>
          </Providers>
        </UserProvider>
      </body>
    </html>
  )
} 