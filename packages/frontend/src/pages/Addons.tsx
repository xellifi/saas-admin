import React, { useState, useEffect, useRef } from 'react'
import {
  Puzzle,
  Upload,
  Download,
  Settings,
  Trash2,
  Play,
  Square,
  Package,
  CheckCircle,
  Clock,
  RefreshCw
} from 'lucide-react'
import { Addon } from '@/types'
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext'
import { toast } from '@/components/ui/Toast'
import NotificationComponent from '@/components/ui/Notification'
import api from '@/lib/api'

const Addons: React.FC = () => {
  const [addons, setAddons] = useState<Addon[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { confirm } = useConfirmDialog()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchAddons = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get<Addon[]>('/addons')
      setAddons(response.data || [])
    } catch (err) {
      console.error('Error fetching addons:', err)
      setError('Failed to load addons')
    } finally {
      setLoading(false)
    }
  }

  // Fetch addons from API
  useEffect(() => {
    fetchAddons()
  }, [])

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.zip')) {
      toast.push(
        <NotificationComponent title="Invalid file type" type="danger">
          Please upload a valid .zip Addon package.
        </NotificationComponent>
      )
      return
    }

    try {
      setLoading(true)

      const response = await api.upload<any>('/addons/upload', file)

      if (!response.success) {
        throw new Error(response.error || 'Upload failed')
      }

      toast.push(
        <NotificationComponent title="Success" type="success">
          Addon uploaded successfully!
        </NotificationComponent>
      )

      // Refresh list
      await fetchAddons()
    } catch (error: any) {
      console.error('Error uploading addon:', error)
      const serverMsg = error?.response?.data?.error || error?.message || 'Unknown error'
      toast.push(
        <NotificationComponent title="Error" type="danger">
          Failed to upload addon: {serverMsg}
        </NotificationComponent>
      )
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
      setLoading(false)
    }
  }

  const handleInstallAddon = async (addon: Addon) => {
    try {
      setLoading(true)
      const response = await api.post(`/addons/${addon.id}/install`, {})
      if (!response.success) throw new Error(response.error || 'Failed to install')

      toast.push(<NotificationComponent title="Success" type="success">Addon installed successfully</NotificationComponent>)
      await fetchAddons()
    } catch (error: any) {
      toast.push(<NotificationComponent title="Error" type="danger">Failed to install: {error?.response?.data?.error || error.message}</NotificationComponent>)
      setLoading(false)
    }
  }

  const handleToggleAddon = async (addon: Addon) => {
    try {
      setLoading(true)
      const response = await api.post<any>(`/addons/${addon.id}/toggle`, {})
      if (!response.success) throw new Error(response.error || 'Failed to toggle')

      toast.push(<NotificationComponent title="Success" type="success">Addon {response.data.isEnabled ? 'enabled' : 'disabled'} successfully</NotificationComponent>)
      await fetchAddons()
    } catch (error: any) {
      toast.push(<NotificationComponent title="Error" type="danger">Failed to toggle: {error?.response?.data?.error || error.message}</NotificationComponent>)
      setLoading(false)
    }
  }

  const handleUninstallAddon = async (addon: Addon) => {
    const result = await confirm({
      title: 'Uninstall Addon',
      message: `Are you sure you want to uninstall "${addon.name}"? This will remove its data and integrations, but keep the files so you can reinstall later.`,
      confirmText: 'Uninstall',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          setLoading(true)
          const response = await api.post(`/addons/${addon.id}/uninstall`, {})
          if (!response.success) throw new Error(response.error || 'Failed to uninstall')

          toast.push(<NotificationComponent title="Success" type="success">Addon uninstalled successfully</NotificationComponent>)
          await fetchAddons()
        } catch (error: any) {
          toast.push(<NotificationComponent title="Error" type="danger">Failed to uninstall: {error?.response?.data?.error || error.message}</NotificationComponent>)
          setLoading(false)
        }
      }
    })
  }

  const handleDeleteAddon = async (addon: Addon) => {
    if (addon.isInstalled) {
      toast.push(<NotificationComponent title="Error" type="danger">Cannot delete an installed addon. Uninstall it first.</NotificationComponent>)
      return
    }

    const result = await confirm({
      title: 'Delete Addon',
      message: `Are you sure you want to completely delete "${addon.name}"? This removes the files permanently.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => {
        try {
          setLoading(true)
          const response = await api.delete(`/addons/${addon.id}`)
          if (!response.success) throw new Error(response.error || 'Failed to delete')

          toast.push(<NotificationComponent title="Success" type="success">Addon deleted successfully</NotificationComponent>)
          await fetchAddons()
        } catch (error: any) {
          toast.push(<NotificationComponent title="Error" type="danger">Failed to delete: {error?.response?.data?.error || error.message}</NotificationComponent>)
          setLoading(false)
        }
      }
    })
  }

  // Get status text
  const getStatusText = (isEnabled: boolean, isInstalled: boolean) => {
    if (!isInstalled) return 'Uploaded'
    if (isEnabled) return 'Active'
    return 'Disabled'
  }

  const getStatusColor = (isEnabled: boolean, isInstalled: boolean) => {
    if (!isInstalled) return 'px-2 py-1 text-gray-500 font-bold text-xs uppercase tracking-wider rounded border border-gray-300 dark:border-gray-600'
    if (isEnabled) return 'px-2 py-1 text-primary-600 dark:text-primary-400 font-bold text-xs uppercase tracking-wider rounded border border-primary-600/50 dark:border-primary-400/50'
    return 'px-2 py-1 text-amber-600 dark:text-amber-500 font-bold text-xs uppercase tracking-wider rounded border border-amber-500/50 dark:border-amber-400/50'
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      <input
        type="file"
        accept=".zip"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileUpload}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Addons</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage plugins and extensions for your SaaS platform
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
            onClick={async () => {
              try {
                setScanning(true)
                const response = await api.post<any>('/addons/scan', {})
                if (response.success) {
                  toast.push(
                    <NotificationComponent title="Scan Complete" type="success">
                      {response.message || 'Addons scanned successfully'}
                    </NotificationComponent>
                  )
                  await fetchAddons()
                }
              } catch (err: any) {
                toast.push(
                  <NotificationComponent title="Scan Failed" type="danger">
                    {err?.response?.data?.error || err?.message || 'Failed to scan'}
                  </NotificationComponent>
                )
              } finally {
                setScanning(false)
              }
            }}
            disabled={scanning}
          >
            <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Scanning...' : 'Scan Addons'}</span>
          </button>
          <button
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Addon</span>
          </button>
          <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium">
            <Download className="w-4 h-4" />
            <span>Browse Store</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading Addons...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error loading addons</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Addons Content */}
      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Total Addons</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{addons.length}</p>
                </div>
                <Puzzle className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Installed</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {addons.filter(a => a.isInstalled).length}
                  </p>
                </div>
                <CheckCircle className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Active</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {addons.filter(a => a.isEnabled).length}
                  </p>
                </div>
                <Play className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-tight dark:text-gray-400">Uploaded</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">
                    {addons.filter(a => !a.isInstalled).length}
                  </p>
                </div>
                <Package className="w-6 h-6 text-gray-900 dark:text-white" />
              </div>
            </div>
          </div>

          {/* Addons Grid */}
          {addons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {addons.map((addon) => (
              <div key={addon.id} className="card p-6 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                      <Puzzle className="w-6 h-6 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {addon.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        v{addon.version}
                      </p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span className={`text-xs ${getStatusColor(addon.isEnabled, addon.isInstalled)} text-right`}>
                    {getStatusText(addon.isEnabled, addon.isInstalled)}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2 flex-grow">
                  {addon.description || 'No description provided.'}
                </p>

                {/* Author */}
                {addon.author && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <span>by {addon.author}</span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                  {!addon.isInstalled ? (
                    <>
                      <button
                        onClick={() => handleInstallAddon(addon)}
                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                      >
                        Install
                      </button>
                      <button
                        onClick={() => handleDeleteAddon(addon)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                        title="Delete Addon Files"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleAddon(addon)}
                        className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                      >
                        {addon.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleUninstallAddon(addon)}
                        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                        title="Uninstall Addon"
                      >
                        Uninstall
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
          ) : (
            /* Empty State */
            <div className="card p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Puzzle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No addons found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Get started by installing your first addon or browsing the addon store.
              </p>
              <div className="flex justify-center space-x-2">
                <button className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium">
                  <Download className="w-4 h-4" />
                  <span>Browse Store</span>
                </button>
                <button
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Addon</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Addons
