import React, { useState, useEffect } from 'react'
import {
  Users,
  TrendingUp,
  CreditCard,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ShoppingCart,
  Package,
  DollarSign,
  UserPlus
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import NotificationType from '@/components/NotificationType'
// Use store-style stat cards directly for perfect visual parity

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPlans: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    newUsersThisMonth: 0,
    activeSubscriptions: 0,
    supportTickets: 0,
    openTickets: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch stats
        const statsResponse = await fetch('/api/dashboard/stats')
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        const statsData = await statsResponse.json()
        setStats(statsData.stats)

        // Fetch recent activity
        const activityResponse = await fetch('/api/activity/logs?limit=5')
        let activityData = []
        if (activityResponse.ok) {
          activityData = await activityResponse.json()
        }

        // Transform activity data
        const formattedActivity = (activityData.logs || []).map((log: any) => ({
          id: log.id,
          action: log.action,
          resource: log.resource_type || 'system',
          timestamp: new Date(log.created_at).toLocaleString(),
          user: log.user_name || 'System'
        }))

        setRecentActivity(formattedActivity)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Generate mock chart data based on real stats
  const userGrowthData = [
    { month: 'Jan', users: Math.max(0, (stats.totalUsers || 0) - 200) },
    { month: 'Feb', users: Math.max(0, (stats.totalUsers || 0) - 150) },
    { month: 'Mar', users: Math.max(0, (stats.totalUsers || 0) - 100) },
    { month: 'Apr', users: Math.max(0, (stats.totalUsers || 0) - 50) },
    { month: 'May', users: Math.max(0, (stats.totalUsers || 0) - 25) },
    { month: 'Jun', users: stats.totalUsers || 0 }
  ]

  const revenueData = [
    { month: 'Jan', revenue: Math.max(0, (stats.totalRevenue || 0) * 0.1) },
    { month: 'Feb', revenue: Math.max(0, (stats.totalRevenue || 0) * 0.2) },
    { month: 'Mar', revenue: Math.max(0, (stats.totalRevenue || 0) * 0.3) },
    { month: 'Apr', revenue: Math.max(0, (stats.totalRevenue || 0) * 0.4) },
    { month: 'May', revenue: Math.max(0, (stats.totalRevenue || 0) * 0.6) },
    { month: 'Jun', revenue: stats.totalRevenue || 0 }
  ]

  const statCards = [
    {
      title: 'Total Users',
      value: (stats.totalUsers || 0).toLocaleString(),
      change: '+12%',
      changeType: 'increase' as const,
      icon: Users,
    },
    {
      title: 'Active Users',
      value: (stats.activeUsers || 0).toLocaleString(),
      change: '+8%',
      changeType: 'increase' as const,
      icon: Activity,
    },
    {
      title: 'Total Plans',
      value: (stats.totalPlans || 0).toString(),
      change: '0%',
      changeType: 'neutral' as const,
      icon: CreditCard,
    },
    {
      title: 'Total Revenue',
      value: `${(stats.totalRevenue || 0).toLocaleString()}`,
      change: '+23%',
      changeType: 'increase' as const,
      icon: TrendingUp,
    },
    {
      title: 'New Users',
      value: (stats.newUsersThisMonth || 0).toString(),
      change: '+15%',
      changeType: 'increase' as const,
      icon: UserPlus,
    },
    {
      title: 'Active Subscriptions',
      value: (stats.activeSubscriptions || 0).toString(),
      change: '+5%',
      changeType: 'increase' as const,
      icon: ShoppingCart,
    },
    {
      title: 'Support Tickets',
      value: (stats.supportTickets || 0).toString(),
      change: '-3%',
      changeType: 'decrease' as const,
      icon: Package,
    },
    {
      title: 'Open Tickets',
      value: (stats.openTickets || 0).toString(),
      change: '-10%',
      changeType: 'decrease' as const,
      icon: DollarSign,
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">Welcome back! Here's what's happening with your SaaS platform.</p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading dashboard data...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading dashboard</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && !error && (
        <>
          {/* Stats Cards (Store-style) */}
          {(() => {
            const fillers = [
              { title: 'Tickets Closed', value: '--', change: '0%', icon: Users },
              { title: 'Churn', value: '--', change: '0%', icon: Users },
            ];
            const fullStats = [...statCards, ...fillers].slice(0, 10);
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {fullStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="card p-6">
                      <div className="flex items-center justify-between mb-4">
                        <Icon className="w-6 h-6 text-gray-900 dark:text-white" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{stat.change}</span>
                      </div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Activity
              </h3>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent activity found
                  </p>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {activity.action}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.resource} • {activity.user}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Notification Demo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Test the global notification system with different types of notifications:
              </p>
              <NotificationType />
            </div>
          </div>
        </>
      )}
    </div >
  )
}

export default Dashboard
