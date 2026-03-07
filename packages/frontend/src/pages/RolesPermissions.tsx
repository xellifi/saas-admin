import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
    Plus,
    Search as SearchIcon,
    ChevronDown,
    ArrowRight,
    Loader2,
    MoreVertical,
    ChevronLeft,
    ChevronRight,
    Trash2,
    Edit,
    ShieldCheck,
    UserCog,
    Users as UsersIcon,
    LifeBuoy,
    User as UserIcon,
    UserMinus,
    CircleDashed
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import Notification from '@/components/ui/Notification'
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext'

interface Role {
    id: number
    name: string
    description: string
    permissions: Record<string, boolean>
    created_at: string
}

interface User {
    id: number
    email: string
    role: string
    firstName: string
    lastName: string
    avatar?: string
    status: 'active' | 'blocked' | 'frozen'
    lastLoginAt?: string
}

const AvatarStack: React.FC<{ users: User[], max?: number }> = ({ users, max = 4 }) => {
    const displayUsers = users.slice(0, max)
    const remaining = users.length - max

    return (
        <div className="flex -space-x-2 overflow-hidden">
            {displayUsers.map((user) => (
                <div
                    key={user.id}
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300 overflow-hidden"
                    title={`${user.firstName} ${user.lastName}`}
                >
                    {user.avatar ? (
                        <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span>{user.firstName?.[0] || user.email[0].toUpperCase()}</span>
                    )}
                </div>
            ))}
            {remaining > 0 && (
                <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400">
                    +{remaining}
                </div>
            )}
        </div>
    )
}

const RoleDropdown: React.FC<{
    userId: number
    currentRole: string
    roles: Role[]
    onRoleChange: (userId: number, role: string) => void
}> = ({ userId, currentRole, roles, onRoleChange }) => {
    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div ref={ref} className="relative inline-flex items-center justify-center">
            <button
                onClick={() => setIsOpen(o => !o)}
                className="flex items-center space-x-1 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-primary-600 transition-colors capitalize"
            >
                <span>{currentRole}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute z-50 top-full mt-1 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 min-w-[140px] py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">Role</p>
                    </div>
                    {roles.map(r => (
                        <button
                            key={r.id}
                            onClick={() => { onRoleChange(userId, r.name); setIsOpen(false) }}
                            className={`w-full text-left px-4 py-2 text-sm capitalize transition-colors ${r.name === currentRole
                                ? 'bg-gray-50 dark:bg-gray-700/50 font-semibold text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                }`}
                        >
                            {r.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

const ActionDropdown: React.FC<{
    user: User,
    onEdit: () => void,
    onDelete: () => void,
    onStatusChange: (status: 'active' | 'blocked' | 'frozen') => void
}> = ({ user, onEdit, onDelete, onStatusChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = () => setIsOpen(false);
        if (isOpen) window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
                <MoreVertical className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 origin-top-right rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 z-50 overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="py-1">
                        <button
                            onClick={() => { onEdit(); setIsOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Edit className="w-3.5 h-3.5 mr-2 text-primary-500" />
                            Edit
                        </button>
                        <button
                            onClick={() => {
                                const nextStatus = user.status === 'frozen' ? 'active' : 'frozen';
                                onStatusChange(nextStatus);
                                setIsOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <CircleDashed className={`w-3.5 h-3.5 mr-2 ${user.status === 'frozen' ? 'text-primary-500' : 'text-primary-500'}`} />
                            {user.status === 'frozen' ? 'Unfreeze' : 'Freeze'}
                        </button>
                        <button
                            onClick={() => {
                                const nextStatus = user.status === 'active' ? 'blocked' : 'active';
                                onStatusChange(nextStatus);
                                setIsOpen(false);
                            }}
                            className="flex items-center w-full px-4 py-2 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <UserCog className="w-3.5 h-3.5 mr-2 text-gray-400" />
                            {user.status === 'active' ? 'Block' : 'Activate'}
                        </button>
                        <button
                            onClick={() => { onDelete(); setIsOpen(false); }}
                            className="flex items-center w-full px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

import { useAddonsStore } from '@/stores/addons'

const RolesPermissions: React.FC = () => {
    const { confirm } = useConfirmDialog()
    const { activeAddons, fetchActiveAddons } = useAddonsStore()

    const [roles, setRoles] = useState<Role[]>([])
    const [users, setUsers] = useState<User[]>([])
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [view, setView] = useState<'list' | 'form'>('list')

    // Role Form states
    const [roleModalMode, setRoleModalMode] = useState<'add' | 'edit'>('add')
    const [editingRole, setEditingRole] = useState<Role | null>(null)
    const [roleFormData, setRoleFormData] = useState({
        name: '',
        description: '',
        permissions: {
            accessAdminUsersEnabled: false,
            accessAdminPlansEnabled: false,
            accessUserBillingEnabled: false,
            accessUserSupportEnabled: true,
            accessAdminSettingsEnabled: false,
            // Dynamic addon permissions will be merged here
        } as Record<string, boolean>
    })

    // Base core app permissions
    const corePermissions = [
        { key: 'accessAdminUsersEnabled', label: 'Manage Users', desc: 'Ability to add, edit, and delete users.' },
        { key: 'accessAdminPlansEnabled', label: 'Manage Plans', desc: 'Ability to manage subscription plans.' },
        { key: 'accessAdminSettingsEnabled', label: 'Manage Settings', desc: 'Ability to change site-wide settings.' },
        { key: 'accessUserBillingEnabled', label: 'Access Billing', desc: 'Ability to view and manage billing information.' },
        { key: 'accessUserSupportEnabled', label: 'Access Support', desc: 'Ability to submit and respond to support tickets.' },
    ]

    // Combine core permissions with dynamic addon permissions
    const availablePermissions = useMemo(() => {
        const addonPermissions = activeAddons.map(addon => {
            const rawManifest = addon.manifest as any
            const displayName = rawManifest['saas-dashboard']?.displayName || rawManifest.saasDashboard?.displayName || addon.name || 'Addon'
            return {
                key: `addon_${addon.name.replace(/[^a-zA-Z0-9]/g, '_')}_enabled`,
                label: `Access ${displayName}`,
                desc: `Ability to view and use the ${addon.name} addon features.`
            }
        })
        return [...corePermissions, ...addonPermissions]
    }, [activeAddons])

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            await fetchActiveAddons() // Fetch active addons first

            const token = localStorage.getItem('accessToken')
            const [rolesRes, usersRes, profileRes] = await Promise.all([
                fetch(`${import.meta.env.VITE_API_URL}/roles`),
                fetch(`${import.meta.env.VITE_API_URL}/users`),
                fetch(`${import.meta.env.VITE_API_URL}/auth/profile`, {
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                })
            ])

            if (!rolesRes.ok || !usersRes.ok) throw new Error('Failed to fetch data')

            const rolesData = await rolesRes.json()
            const usersData = await usersRes.json()
            const profileData = profileRes.ok ? await profileRes.json() : null

            setRoles(rolesData.roles || [])
            setUsers(usersData.users || [])
            if (profileData && profileData.user) {
                setCurrentUser(profileData.user)
            }
        } catch (err: any) {
            console.error('Error fetching roles/users:', err)
            toast.push(
                <Notification title="Error" type="danger">
                    {err.message}
                </Notification>
            )
        } finally {
            setLoading(false)
        }
    }, [fetchActiveAddons])

    const getRoleIcon = (roleName: string) => {
        const name = roleName.toLowerCase()
        if (name.includes('superadmin')) return <ShieldCheck className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        if (name.includes('admin')) return <UserCog className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        if (name.includes('supervisor')) return <UsersIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        if (name.includes('support')) return <LifeBuoy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        if (name.includes('user')) return <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        if (name.includes('auditor')) return <SearchIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        if (name.includes('guest')) return <UserMinus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        return <CircleDashed className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    }

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const filteredUsers = useMemo(() => {
        return users.filter(user =>
            `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [users, searchTerm])

    const handleOpenAddRoleModal = () => {
        setRoleModalMode('add')
        setEditingRole(null)

        // Initialize all permissions to false
        const initialPermissions: Record<string, boolean> = {
            accessAdminUsersEnabled: false,
            accessAdminPlansEnabled: false,
            accessUserBillingEnabled: false,
            accessUserSupportEnabled: true,
            accessAdminSettingsEnabled: false
        }

        // Add dynamic addon permissions as default false
        activeAddons.forEach(addon => {
            const key = `addon_${addon.name.replace(/[^a-zA-Z0-9]/g, '_')}_enabled`
            initialPermissions[key] = false
        })

        setRoleFormData({
            name: '',
            description: '',
            permissions: initialPermissions
        })
        setView('form')
    }

    const handleOpenEditRoleModal = (role: Role) => {
        setRoleModalMode('edit')
        setEditingRole(role)

        // Ensure ALL dynamic keys exist in form state even if missing from db role
        const mergedPermissions = { ...role.permissions }
        activeAddons.forEach(addon => {
            const key = `addon_${addon.name.replace(/[^a-zA-Z0-9]/g, '_')}_enabled`
            if (mergedPermissions[key] === undefined) {
                mergedPermissions[key] = false
            }
        })

        setRoleFormData({
            name: role.name,
            description: role.description,
            permissions: mergedPermissions
        })
        setView('form')
    }

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const url = roleModalMode === 'add'
                ? `${import.meta.env.VITE_API_URL}/roles`
                : `${import.meta.env.VITE_API_URL}/roles/${editingRole?.id}`

            const method = roleModalMode === 'add' ? 'POST' : 'PUT'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roleFormData)
            })

            if (!response.ok) throw new Error('Failed to save role')

            toast.push(
                <Notification title="Success" type="success">
                    Role {roleModalMode === 'add' ? 'created' : 'updated'} successfully!
                </Notification>
            )
            setView('list')
            fetchData()
        } catch (err: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {err.message}
                </Notification>
            )
        }
    }

    const handleDeleteRole = async (role: Role) => {
        await confirm({
            title: 'Delete Role',
            message: `Are you sure you want to delete the role "${role.name}"? This will affect all users currently assigned to this role.`,
            confirmText: 'Delete Role',
            confirmVariant: 'danger',
            onConfirm: async () => {
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL}/roles/${role.id}`, {
                        method: 'DELETE'
                    })

                    if (!response.ok) {
                        const data = await response.json()
                        throw new Error(data.error || 'Failed to delete role')
                    }

                    toast.push(
                        <Notification title="Success" type="success">
                            Role deleted successfully!
                        </Notification>
                    )
                    fetchData()
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

    const handleUserRoleChange = async (userId: number, newRole: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            })

            if (!response.ok) throw new Error('Failed to update user role')

            toast.push(
                <Notification title="Success" type="success">
                    User role updated to {newRole}
                </Notification>
            )
            fetchData()
        } catch (err: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {err.message}
                </Notification>
            )
        }
    }

    const handleUserStatusChange = async (userId: number, newStatus: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })

            if (!response.ok) throw new Error('Failed to update user status')

            toast.push(
                <Notification title="Success" type="success">
                    User status updated to {newStatus}
                </Notification>
            )
            fetchData()
        } catch (err: any) {
            toast.push(
                <Notification title="Error" type="danger">
                    {err.message}
                </Notification>
            )
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '-'
        const date = new Date(dateStr)
        return {
            date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
        }
    }

    if (loading && roles.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            </div>
        )
    }

    if (view === 'form') {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Form Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setView('list')}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-500 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                <span className="px-3 py-1 rounded border border-primary-500 text-primary-600 dark:text-primary-400 font-bold">{roleModalMode === 'add' ? 'Create Custom Role' : `Edit Role: ${editingRole?.name}`}</span>
                            </h1>
                            <p className="text-sm text-gray-500">Configure role name and permissions</p>
                        </div>
                    </div>
                </div>

                <div className="card p-8">
                    <form onSubmit={handleRoleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Basic Information</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Role Name</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Moderator"
                                            value={roleFormData.name}
                                            onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-medium"
                                        />
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">Unique identifier without spaces</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                        <textarea
                                            rows={4}
                                            placeholder="What can this role do?"
                                            value={roleFormData.description}
                                            onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Permissions Checklist</h3>
                                <div className="grid grid-cols-1 gap-3">
                                    {availablePermissions.map(p => (
                                        <label key={p.key} className="flex items-start p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors cursor-pointer group">
                                            <div className="flex items-center h-5 mr-3">
                                                <input
                                                    type="checkbox"
                                                    checked={roleFormData.permissions[p.key as keyof typeof roleFormData.permissions]}
                                                    onChange={(e) => setRoleFormData({
                                                        ...roleFormData,
                                                        permissions: {
                                                            ...roleFormData.permissions,
                                                            [p.key]: e.target.checked
                                                        }
                                                    })}
                                                    className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{p.label}</span>
                                                <span className="text-xs text-gray-500 font-medium">{p.desc}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-8 border-t border-gray-50 dark:border-gray-700">
                            <button
                                type="button"
                                onClick={() => setView('list')}
                                className="px-6 py-3 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 font-bold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-bold"
                            >
                                {roleModalMode === 'add' ? 'Create Role' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Roles</h1>
                    {currentUser && (
                        <p className="text-sm text-gray-500 mt-1">
                            Logged in as <span className="font-bold text-gray-900 dark:text-white"> {currentUser.firstName} {currentUser.lastName}</span> • Your Role: <span className="font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">{currentUser.role}</span>
                        </p>
                    )}
                </div>
                <button
                    onClick={handleOpenAddRoleModal}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-bold"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add New Role</span>
                </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map(role => {
                    const roleUsers = users.filter(u => u.role === role.name)
                    return (
                        <div key={role.id} className="card p-6 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="text-gray-900 dark:text-white">
                                            {getRoleIcon(role.name)}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                                            {role.name}
                                        </h3>
                                    </div>
                                    <div className="flex space-x-1">
                                        <button onClick={() => handleOpenEditRoleModal(role)} className="px-3 py-1.5 rounded-lg text-gray-900 dark:text-gray-100 font-medium text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                            Edit
                                        </button>
                                        {!['superadmin', 'admin', 'user'].includes(role.name) && (
                                            <button onClick={() => handleDeleteRole(role)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[32px]">
                                    {role.description || "No description provided for this role."}
                                </p>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total {roleUsers.length} users</p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-50 dark:border-gray-700/50 flex items-center justify-between">
                                <AvatarStack users={roleUsers} />
                                <button
                                    onClick={() => handleOpenEditRoleModal(role)}
                                    className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center space-x-1 group px-3 py-1 rounded-lg border border-primary-500 dark:border-primary-400 transition-colors"
                                >
                                    <span>Edit role</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Accounts Section */}
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">All accounts</h2>
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search */}
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-full md:w-64 transition-all"
                            />
                        </div>
                        {/* Filters */}
                        <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-all">
                                <span>All</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                            <button className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 transition-all">
                                <span>All</span>
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table container with global hover effect */}
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto px-4 pb-4">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead className="dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-4 w-10">
                                        <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                    </th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">NAME</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">STATUS</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">LAST ONLINE</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">ROLE</th>
                                    <th className="px-6 py-4 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => {
                                    const lastOnline = formatDate(user.lastLoginAt)
                                    return (
                                        <tr key={user.id} className="group hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-all duration-300">
                                            <td className="px-6 py-4 bg-white dark:bg-gray-800 first:rounded-l-2xl border-y border-l border-transparent group-hover:border-blue-400 transition-all">
                                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                                            </td>
                                            <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all">
                                                <div className="flex items-center space-x-3 text-left w-max">
                                                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 text-xs font-bold overflow-hidden ring-1 ring-gray-100 dark:ring-gray-700">
                                                        {user.avatar ? (
                                                            <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <span>{user.firstName?.[0] || user.email[0].toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white capitalize">{user.firstName} {user.lastName}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all text-center">
                                                <span className={`px-2 py-0.5 rounded border font-bold text-xs uppercase tracking-wider ${user.status === 'active'
                                                    ? 'text-primary-600 dark:text-primary-400 border-primary-500 dark:border-primary-400'
                                                    : user.status === 'frozen'
                                                        ? 'text-primary-400 dark:text-primary-500 border-primary-400 dark:border-primary-500'
                                                        : 'text-gray-400 dark:text-gray-500 border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {user.status === 'active' ? 'Active' : user.status === 'frozen' ? 'Frozen' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all text-center">
                                                {lastOnline === '-' ? (
                                                    <span className="text-gray-400">-</span>
                                                ) : (
                                                    <div className="space-y-0.5">
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">{lastOnline.date}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase font-bold">{lastOnline.time}</p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 bg-white dark:bg-gray-800 border-y border-transparent group-hover:border-blue-400 transition-all text-center">
                                                <RoleDropdown
                                                    userId={user.id}
                                                    currentRole={user.role}
                                                    roles={roles}
                                                    onRoleChange={(userId, newRole) => handleUserRoleChange(userId, newRole)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 bg-white dark:bg-gray-800 last:rounded-r-2xl border-y border-r border-transparent group-hover:border-blue-400 transition-all text-center">
                                                <div className="flex items-center justify-center">
                                                    <ActionDropdown
                                                        user={user}
                                                        onEdit={() => handleOpenEditRoleModal({ id: 0, name: user.role, description: '', permissions: {}, created_at: '' })} // Dummy role for edit modal trigger, will be handled by actual role logic if needed
                                                        onDelete={() => {/* Implement User Delete if needed */ }}
                                                        onStatusChange={(status) => handleUserStatusChange(user.id, status)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">10 / page</span>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-1">
                            <button className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-primary-600 text-white text-sm font-bold shadow-sm">1</button>
                            <button className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm font-bold">2</button>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

        </div >
    )
}

export default RolesPermissions
