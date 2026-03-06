import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  HelpCircle,
  Puzzle,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  User,
  ShieldCheck,
  Store,
  ChevronDown
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { useAddonsStore } from '@/stores/addons'
import { useGlobalToast } from '@/components/ui/Toast'

// Icon mapping helper — maps manifest icon names to Lucide components
const iconMap: Record<string, any> = {
  LayoutDashboard,
  Users,
  CreditCard,
  HelpCircle,
  Puzzle,
  Settings,
  ShieldCheck,
  Store,
  ShoppingCart: Store,
  'shopping-cart': Store,
  'message-square': HelpCircle,
  // Common addon icons
  Package: Puzzle,
  Box: Puzzle,
}

function resolveIcon(iconName?: string): any {
  if (!iconName) return Puzzle
  return iconMap[iconName] || Puzzle
}

const sidebarItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['superadmin', 'admin', 'user'],
    permission: null
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    path: '/users',
    roles: ['superadmin', 'admin'],
    permission: 'accessAdminUsersEnabled'
  },
  {
    id: 'plans',
    label: 'Plans',
    icon: CreditCard,
    path: '/plans',
    roles: ['superadmin', 'admin'],
    permission: 'accessAdminPlansEnabled'
  },
  {
    id: 'support',
    label: 'Support',
    icon: HelpCircle,
    path: '/support',
    roles: ['superadmin', 'admin', 'user'],
    permission: 'accessUserSupportEnabled'
  },
  {
    id: 'addons',
    label: 'Addons',
    icon: Puzzle,
    path: '/addons',
    roles: ['superadmin'],
    permission: null
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    permission: 'accessAdminSettingsEnabled'
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: ShieldCheck,
    path: '/roles-permissions',
    roles: ['superadmin'],
    permission: null
  }
]

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({})
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode')
      return saved ? JSON.parse(saved) : false
    } catch {
      return false
    }
  })
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { fetchSettings } = useSettingsStore()
  const { activeAddons, fetchActiveAddons } = useAddonsStore()

  // Apply dark mode on initial load
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  useEffect(() => {
    fetchSettings()
    fetchActiveAddons()
  }, [fetchSettings, fetchActiveAddons])

  // Initialize global toast
  useGlobalToast()

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (!user) return false

    // Check role access
    const hasRoleAccess = item.roles && item.roles.includes(user.role)
    if (!hasRoleAccess) return false

    // If superadmin, always show everything they have role access to
    if (user.role === 'superadmin') return true

    // For other roles, check dynamic permissions
    if (item.permission) {
      return user.permissions && user.permissions[item.permission] === true
    }

    return true
  })

  // Build addon sidebar items from active addons
  const addonSidebarItems: typeof sidebarItems = []
  activeAddons.forEach(addon => {
    const manifest = addon.manifest as any
    const isSuperadmin = user?.role === 'superadmin'
    const permissionKey = `addon_${addon.name.replace(/[^a-zA-Z0-9]/g, '_')}_enabled`
    const hasAddonPermission = user?.permissions && user.permissions[permissionKey] === true

    if (!isSuperadmin && !hasAddonPermission) return

    // Priority 1: addon.json sidebar.items format
    const sidebar = manifest?.sidebar
    if (sidebar?.items?.length) {
      addonSidebarItems.push({
        id: `addon-${addon.id}`,
        label: manifest.displayName || addon.name,
        icon: resolveIcon(sidebar.icon || manifest.icon),
        path: sidebar.items[0]?.href || sidebar.items[0]?.path || `/addon/${addon.id}`,
        roles: ['superadmin', 'admin', 'user'],
        permission: null,
        subItems: sidebar.items.map((item: any, idx: number) => ({
          id: `addon-${addon.id}-sub-${idx}`,
          label: item.title || item.label,
          path: item.href || item.path,
          icon: resolveIcon(item.icon)
        }))
      } as any)
      return
    }

    // Priority 2: frontend.routes format (legacy)
    const frontend = manifest?.frontend || manifest?.['saas-dashboard']?.frontend
    if (frontend?.routes?.length) {
      addonSidebarItems.push({
        id: `addon-${addon.id}`,
        label: manifest?.['saas-dashboard']?.displayName || manifest.displayName || addon.name,
        icon: resolveIcon(manifest?.['saas-dashboard']?.icon || manifest.icon),
        path: frontend.routes[0]?.path || `/addon/${addon.id}`,
        roles: ['superadmin', 'admin', 'user'],
        permission: null,
        subItems: frontend.routes.map((route: any, idx: number) => ({
          id: `addon-${addon.id}-sub-${idx}`,
          label: route.label || route.title,
          path: route.path,
          icon: resolveIcon(route.icon)
        }))
      } as any)
    }
  })

  // Sort addon items by sidebar.position (lower = higher in menu)
  addonSidebarItems.sort((a, b) => {
    const posA = activeAddons.find(ad => a.id.includes(`addon-${ad.id}`))?.manifest
    const posB = activeAddons.find(ad => b.id.includes(`addon-${ad.id}`))?.manifest
    return ((posA as any)?.sidebar?.position || 100) - ((posB as any)?.sidebar?.position || 100)
  })

  // Append addon items to sidebar
  filteredSidebarItems.push(...addonSidebarItems)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const toggleDarkMode = () => {
    const newMode = !darkMode
    setDarkMode(newMode)
    localStorage.setItem('darkMode', JSON.stringify(newMode))
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              {!sidebarCollapsed && (
                <span className="text-xl font-semibold text-gray-900 dark:text-white">
                  SaaS Dashboard
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Mobile close button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-auto scrollbar-hide">
            {filteredSidebarItems.map((item: any) => {
              const hasSubItems = item.subItems && item.subItems.length > 0;
              const isActive = location.pathname === item.path || (hasSubItems && item.subItems.some((sub: any) => location.pathname.startsWith(sub.path)));
              const isExpanded = expandedMenus[item.id] || isActive;
              const Icon = item.icon

              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex items-center">
                    <Link
                      to={hasSubItems ? '#' : item.path}
                      onClick={(e) => {
                        if (hasSubItems) {
                          e.preventDefault();
                          if (!sidebarCollapsed) {
                            setExpandedMenus(prev => ({ ...prev, [item.id]: !prev[item.id] }))
                          }
                        } else {
                          setSidebarOpen(false)
                        }
                      }}
                      className={`
                        flex items-center flex-1 ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 rounded-lg transition-colors group
                        ${isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }
                      `}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="font-medium flex-1 text-left">{item.label}</span>
                          {hasSubItems && (
                            <ChevronDown
                              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          )}
                        </>
                      )}
                    </Link>
                  </div>

                  {/* Sub-items rendering */}
                  {hasSubItems && isExpanded && !sidebarCollapsed && (
                    <div className="pl-10 space-y-1">
                      {item.subItems.map((sub: any) => {
                        const SubIcon = sub.icon || Puzzle;
                        const isSubActive = location.pathname === sub.path || location.pathname.startsWith(sub.path + '/');
                        return (
                          <Link
                            key={sub.id}
                            to={sub.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm
                              ${isSubActive
                                ? 'text-primary-600 dark:text-primary-400 font-medium bg-primary-50 dark:bg-primary-900/10'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900'
                              }
                            `}
                          >
                            <SubIcon className="w-4 h-4" />
                            <span>{sub.label}</span>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* User section - simplified */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-2">
            <div className="flex items-center justify-center">
              {!sidebarCollapsed && (
                <div className="text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.firstName || user?.email}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                    {user?.role}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Top bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              {/* Desktop collapse button in header */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <Menu className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>

              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {filteredSidebarItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                )}
              </button>

              {/* Profile dropdown */}
              <div className="relative group">
                <button className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-700">
                    <span className="text-gray-500 font-bold text-sm">
                      {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.firstName || user?.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user?.role}
                    </p>
                  </div>
                </button>

                {/* Dropdown menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="p-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <hr className="my-2 border-gray-200 dark:border-gray-700" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

export default Layout
