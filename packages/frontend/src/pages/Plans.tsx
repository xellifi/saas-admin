import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Users,
  DollarSign,
  Check,
  Plus,
  Trash2,
  Edit
} from 'lucide-react'
import { Plan } from '@/types'
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext'
import { useAuthStore } from '@/stores/auth'
import { toast } from '@/components/ui/Toast'
import Notification from '@/components/ui/Notification'

const PlansPage: React.FC = () => {
  const { user } = useAuthStore()

  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [totalUsers, setTotalUsers] = useState(0)
  const [totalRevenue, setTotalRevenue] = useState(0)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly',
    maxUsers: 5,
    maxStorage: 10,
    features: '',
    isActive: true
  })

  const { confirm } = useConfirmDialog()

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/plans')
      if (!response.ok) throw new Error('Failed to fetch plans')
      const data = await response.json()
      setPlans(data.plans || [])
      setTotalUsers(data.totalUsers || 0)
      setTotalRevenue(data.totalRevenue || 0)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching plans:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
  }, [])

  // Guard: Only superadmin and admin can access this page
  const canAccess = user && (
    user.role === 'superadmin' ||
    (user.role === 'admin' && user.permissions?.accessAdminPlansEnabled === true)
  )

  const canManage = user && (
    user.role === 'superadmin' ||
    (user.role === 'admin' && user.permissions?.accessAdminPlansEnabled === true)
  )

  if (!canAccess) {
    return <div className="text-center py-12">Access Denied</div>
  }

  const handleDeletePlan = async (plan: Plan) => {
    await confirm({
      title: 'Delete Plan',
      message: `Are you sure you want to delete the plan "${plan.name}"? This action cannot be undone and will affect all users subscribed to this plan.`,
      confirmText: 'Delete Plan',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/plans/${plan.id}`, {
            method: 'DELETE'
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || 'Failed to delete plan')
          }

          toast.push(
            <Notification title="Success" type="success">
              Plan deleted successfully!
            </Notification>
          )
          fetchPlans()
        } catch (err: any) {
          toast.push(
            <Notification title="Error" type="danger">
              {err.message}
            </Notification>
          )
        }
      }
    })
  }

  const handleOpenAddModal = () => {
    setModalMode('add')
    setEditingPlan(null)
    setFormData({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      maxUsers: 5,
      maxStorage: 10,
      features: '',
      isActive: true
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (plan: Plan) => {
    setModalMode('edit')
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: parseFloat(plan.price),
      billingCycle: plan.billingCycle,
      maxUsers: plan.maxUsers,
      maxStorage: plan.maxStorage,
      features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
      isActive: plan.isActive
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = modalMode === 'add'
        ? 'http://localhost:3001/api/plans'
        : `http://localhost:3001/api/plans/${editingPlan?.id}`

      const method = modalMode === 'add' ? 'POST' : 'PUT'

      // Process features string to array
      const submissionData = {
        ...formData,
        features: formData.features.split(',').map(f => f.trim()).filter(f => f !== '')
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save plan')
      }

      toast.push(
        <Notification title="Success" type="success">
          Plan {modalMode === 'add' ? 'created' : 'updated'} successfully!
        </Notification>
      )

      setIsModalOpen(false)
      fetchPlans()
    } catch (err: any) {
      toast.push(
        <Notification title="Error" type="danger">
          {err.message}
        </Notification>
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFeaturesArray = (features: any) => {
    if (Array.isArray(features)) return features
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features)
        return Array.isArray(parsed) ? parsed : []
      } catch (e) {
        return features.split(',').map(f => f.trim()).filter(f => f !== '')
      }
    }
    return []
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your SaaS pricing and features.</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenAddModal}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Plan</span>
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading plans...</span>
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
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading plans</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Plans Content */}
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{plans.length}</p>
                </div>
                <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Plans</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {plans.filter(plan => plan.isActive).length}
                  </p>
                </div>
                <Check className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{totalUsers}</p>
                </div>
                <Users className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ${totalRevenue.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="card p-8 relative flex flex-col">
                {/* Status Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wider rounded border ${plan.isActive
                    ? 'text-primary-600 dark:text-primary-400 border-primary-600/50 dark:border-primary-400/50'
                    : 'text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600'
                    }`}>
                    {plan.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400 ml-2">
                      /{plan.billingCycle}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6 flex-grow">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Features</h4>
                  <ul className="space-y-2">
                    {getFeaturesArray(plan.features).map((feature: any, index: number) => (
                      <li key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Check className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Limits */}
                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Max Users</span>
                    <span className="font-medium text-gray-900 dark:text-white">{plan.maxUsers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Storage</span>
                    <span className="font-medium text-gray-900 dark:text-white">{plan.maxStorage}GB</span>
                  </div>
                </div>

                {/* Actions - Fixed at bottom */}
                <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex space-x-2">
                    {canManage && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(plan)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-bold"
                        >
                          <Edit className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan)}
                          className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900/30 transition-colors text-sm font-bold"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="card w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {modalMode === 'add' ? 'Add New Plan' : 'Edit Plan'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-500 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    placeholder="e.g. Professional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    placeholder="Briefly describe the plan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                      Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                      Billing Cycle
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                      Max Users
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.maxUsers}
                      onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                      Max Storage (GB)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.maxStorage}
                      onChange={(e) => setFormData({ ...formData, maxStorage: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wider">
                    Features (comma separated)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
                    placeholder="e.g. Unlimited Projects, Priority Support, Custom Domain"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest active:scale-95 transition-all">
                    Plan is Active
                  </label>
                </div>
              </div>
            </form>

            <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center space-x-3 bg-gray-50/50 dark:bg-gray-800/50 uppercase font-black tracking-widest text-xs">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:scale-100"
              >
                {isSubmitting ? 'Saving...' : (modalMode === 'add' ? 'Create Plan' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlansPage
