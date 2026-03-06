import React, { useState } from 'react'
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Users,
  Check,
  X,
  DollarSign
} from 'lucide-react'
import { Plan } from '@/types'

const Plans: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    features: [''],
    maxUsers: null as number | null,
    isActive: true
  })

  const handleCreatePlan = () => {
    const newPlan: Plan = {
      id: Date.now(),
      name: formData.name,
      description: formData.description,
      price: formData.price.toString(),
      billingCycle: formData.billingCycle,
      features: formData.features.filter(f => f.trim() !== '') as any,
      isActive: formData.isActive,
      maxUsers: formData.maxUsers || 0,
      currency: 'USD',
      currentUsers: 0,
      maxStorage: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setPlans([...plans, newPlan])
    setShowCreateModal(false)
    resetForm()
  }

  const handleUpdatePlan = () => {
    if (!editingPlan) return

    setPlans(plans.map(plan =>
      plan.id === editingPlan.id
        ? {
          ...plan,
          name: formData.name,
          description: formData.description,
          price: formData.price.toString(),
          billingCycle: formData.billingCycle,
          features: formData.features.filter(f => f.trim() !== '') as any,
          isActive: formData.isActive,
          maxUsers: (formData.maxUsers || 0) as number,
          updatedAt: new Date().toISOString()
        }
        : plan
    ))

    setEditingPlan(null)
    resetForm()
  }

  const handleDeletePlan = (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return
    }

    setPlans(plans.filter(plan => plan.id !== planId))
  }

  const handleTogglePlan = (planId: number) => {
    setPlans(plans.map(plan =>
      plan.id === planId
        ? { ...plan, isActive: !plan.isActive, updatedAt: new Date().toISOString() }
        : plan
    ))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      billingCycle: 'monthly',
      features: [''],
      maxUsers: null,
      isActive: true
    })
  }

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: parseFloat(plan.price) || 0,
      billingCycle: plan.billingCycle as 'monthly' | 'yearly',
      features: Array.isArray(plan.features) ? [...plan.features, ''] : [''],
      maxUsers: plan.maxUsers,
      isActive: plan.isActive
    })
  }

  const addFeatureField = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    })
  }

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features]
    newFeatures[index] = value
    setFormData({
      ...formData,
      features: newFeatures
    })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const totalRevenue = plans.reduce((sum, plan) => {
    const price = parseFloat(plan.price) || 0
    return sum + price
  }, 0)

  const totalUsers = plans.reduce((sum, plan) => sum + (plan.maxUsers || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plans</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage subscription plans and pricing
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary btn-md flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Loading/Error states would go here if implemented with data fetching */}

      {/* Plans Content */}
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Plans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{plans.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-primary-100 dark:bg-primary-900/20">
                <CreditCard className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Plans</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {plans.filter(plan => plan.isActive).length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalUsers}</p>
              </div>
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${totalRevenue.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <DollarSign className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>


        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{plan.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${plan.isActive
                  ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                  : 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
                  }`}>
                  {plan.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${plan.price}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    /{plan.billingCycle}
                  </span>
                </div>
                {plan.maxUsers && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Up to {plan.maxUsers} users
                  </p>
                )}
              </div>

              <div className="space-y-2 mb-6">
                {Array.isArray(plan.features) && plan.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Current Users</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {plan.currentUsers || 0}
                    {plan.maxUsers && ` / ${plan.maxUsers}`}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full"
                    style={{
                      width: `${plan.maxUsers ? ((plan.currentUsers || 0) / plan.maxUsers) * 100 : 100}%`
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openEditModal(plan)}
                    className="btn btn-outline btn-sm flex items-center space-x-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleTogglePlan(plan.id)}
                    className={`btn btn-outline btn-sm flex items-center space-x-1 ${plan.isActive ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'
                      }`}
                  >
                    {plan.isActive ? (
                      <>
                        <X className="w-3 h-3" />
                        <span>Disable</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Enable</span>
                      </>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => handleDeletePlan(plan.id)}
                  className="btn btn-outline btn-sm text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Modal */}
        {(showCreateModal || editingPlan) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Plan Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                      placeholder="e.g., Starter Plan"
                    />
                  </div>
                  <div>
                    <label className="label">Price</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                    placeholder="Describe the plan..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Billing Cycle</label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'monthly' | 'yearly' })}
                      className="input"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Max Users (optional)</label>
                    <input
                      type="number"
                      value={formData.maxUsers || ''}
                      onChange={(e) => setFormData({ ...formData, maxUsers: e.target.value ? parseInt(e.target.value) : null })}
                      className="input"
                      placeholder="Unlimited"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Features</label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="input flex-1"
                          placeholder="Enter feature..."
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="btn btn-outline btn-sm text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addFeatureField}
                      className="btn btn-outline btn-sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Feature
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Plan is active
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingPlan(null)
                    resetForm()
                  }}
                  className="btn btn-outline btn-md"
                >
                  Cancel
                </button>
                <button
                  onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                  className="btn btn-primary btn-md"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  )
}

export default Plans
