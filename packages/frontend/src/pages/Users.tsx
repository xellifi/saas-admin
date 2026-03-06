import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Grid,
  List,
  Eye,
  X as CloseIcon,
  ChevronDown,
  Activity
} from 'lucide-react'
import { User } from '@/types'
import { toast } from '@/components/ui/Toast'
import Notification from '@/components/ui/Notification'
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext'
import { useAuthStore } from '@/stores/auth'

const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuthStore()

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('')

  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add')
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user',
    isActive: true
  })

  const { confirm } = useConfirmDialog()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3001/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data.users || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching users:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Guard: Only superadmin and admin can access this page
  const canAccess = currentUser && (
    currentUser.role === 'superadmin' ||
    (currentUser.role === 'admin' && currentUser.permissions?.accessAdminUsersEnabled === true)
  )

  const canManage = currentUser && (
    currentUser.role === 'superadmin' ||
    (currentUser.role === 'admin' && currentUser.permissions?.accessAdminUsersEnabled === true)
  )

  if (!canAccess) {
    return <Navigate to="/dashboard" replace />
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = searchTerm === '' ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesRole = selectedRole === '' || user.role === selectedRole

      return matchesSearch && matchesRole
    }).sort((a, b) => {
      // Superadmins always at the bottom
      if (a.role === 'superadmin' && b.role !== 'superadmin') return 1
      if (a.role !== 'superadmin' && b.role === 'superadmin') return -1
      return 0
    })
  }, [users, searchTerm, selectedRole])

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded text-xs font-bold uppercase'
      case 'admin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-0.5 rounded text-xs font-bold uppercase'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 px-2 py-0.5 rounded text-xs font-bold uppercase'
    }
  }

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? 'px-2 py-1 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider rounded border border-primary-600/50 dark:border-primary-400/50'
      : 'px-2 py-1 text-gray-400 dark:text-gray-500 font-bold text-xs uppercase tracking-wider rounded border border-gray-300 dark:border-gray-600'
  }

  const handleOpenAddModal = () => {
    setModalMode('add')
    setEditingUser(null)
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'user',
      isActive: true
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (user: User) => {
    setModalMode('edit')
    setEditingUser(user)
    setFormData({
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive
    })
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = modalMode === 'add'
        ? 'http://localhost:3001/api/users'
        : `http://localhost:3001/api/users/${editingUser?.id}`

      const method = modalMode === 'add' ? 'POST' : 'PUT'

      const submissionData = { ...formData }
      if (modalMode === 'edit' && !submissionData.password) {
        delete (submissionData as any).password
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save user')
      }

      toast.push(
        <Notification title="Success" type="success">
          User {modalMode === 'add' ? 'created' : 'updated'} successfully!
        </Notification>
      )

      setIsModalOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast.push(<Notification title="Error" type="danger">{err.message}</Notification>)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async (user: User) => {
    await confirm({
      title: 'Confirm Delete',
      message: `Are you sure you want to delete ${user.firstName || user.email}? This action cannot be undone.`,
      confirmText: 'Delete User',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/users/${user.id}`, {
            method: 'DELETE'
          })
          if (!response.ok) throw new Error('Failed to delete user')
          toast.push(<Notification title="Success" type="success">User deleted successfully!</Notification>)
          fetchUsers()
        } catch (err: any) {
          toast.push(<Notification title="Error" type="danger">{err.message}</Notification>)
        }
      }
    })
  }

  return (
    <div className="space-y-6 px-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage your platform users and their permissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${viewMode === 'list' ? 'scale-110' : ''}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 ${viewMode === 'grid' ? 'scale-110' : ''}`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          {canManage && (
            <button
              onClick={handleOpenAddModal}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Add User</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {!loading && !error && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Total Users</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{users.length}</p>
              </div>
              <Users className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Active Users</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{users.filter(u => u.isActive).length}</p>
              </div>
              <UserCheck className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Inactive Users</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">{users.filter(u => !u.isActive).length}</p>
              </div>
              <UserX className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Growth</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white">12%</p>
              </div>
              <Activity className="w-6 h-6 text-gray-900 dark:text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      {!error && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">All accounts</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none w-full md:w-64"
              />
            </div>
            <div className="relative">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="appearance-none bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 pr-8 rounded-xl text-sm font-medium outline-none cursor-pointer"
              >
                <option value="">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredUsers.map(user => (
              <div key={user.id} className={`card p-6 space-y-4 ${user.role === 'superadmin' ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-lg text-gray-500">
                      {user.firstName?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[120px]">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-xs text-gray-500 truncate max-w-[120px]">{user.email}</p>
                    </div>
                  </div>
                  <span className={getRoleColor(user.role)}>{user.role}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                  <span className={getStatusColor(user.isActive)}>{user.isActive ? 'Active' : 'Inactive'}</span>
                  <div className="flex items-center space-x-2">
                    {canManage && user.role !== 'superadmin' && (
                      <>
                        <button onClick={() => handleOpenEditModal(user)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => handleDeleteUser(user)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto px-4 pb-4">
              <table className="w-full border-separate border-spacing-y-3 border-spacing-x-0">
                <thead>
                  <tr className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-2 uppercase">User</th>
                    <th className="px-6 py-2 uppercase">Role</th>
                    <th className="px-6 py-2 uppercase">Status</th>
                    <th className="px-6 py-2 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="group cursor-pointer">
                      <td className="px-6 py-4 bg-white dark:bg-gray-800 rounded-l-2xl border-y border-l border-transparent group-hover:border-blue-400 transition-all">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center font-bold text-gray-500">
                            {user.firstName?.[0] || user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{user.firstName} {user.lastName}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all">
                        <span className={getRoleColor(user.role)}>{user.role}</span>
                      </td>
                      <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all">
                        <span className={getStatusColor(user.isActive)}>{user.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className="px-6 py-4 bg-white dark:bg-gray-800 rounded-r-2xl border-y border-r border-transparent group-hover:border-blue-400 transition-all text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {canManage && user.role !== 'superadmin' && (
                            <>
                              <button onClick={() => handleOpenEditModal(user)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteUser(user)} className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                            </>
                          )}
                          <Link to={`/profile/${user.id}`} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600"><Eye className="w-4 h-4" /></Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{modalMode === 'add' ? 'Add User' : 'Edit User'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><CloseIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                <input type="text" placeholder="Last Name" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <input type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <input type="password" placeholder={modalMode === 'add' ? 'Password' : 'New Password (optional)'} required={modalMode === 'add'} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="active" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4" />
                <label htmlFor="active" className="text-sm dark:text-gray-300">Active Account</label>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage
