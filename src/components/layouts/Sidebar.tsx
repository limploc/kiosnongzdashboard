import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  CreditCard,
  Users,
  LogOut,
} from 'lucide-react'
import { cn } from '@/utils'
import { Button } from '@/components/ui/button'
import { authService } from '@/api/auth'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { label: 'Products', icon: Package, href: '/products' },
  { label: 'Categories', icon: FolderTree, href: '/categories' },
  { label: 'Orders', icon: ShoppingCart, href: '/orders' },
  { label: 'Payments', icon: CreditCard, href: '/payments' },
  { label: 'Customers', icon: Users, href: '/customers' },
]

export function Sidebar() {
  const location = useLocation()

  const handleLogout = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold text-blue-600">Kios Admin</h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}