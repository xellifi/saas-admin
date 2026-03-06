import React, { useState, useRef } from 'react'
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
  AlertCircle,
  Clock
} from 'lucide-react'
import { Addon, AddonManifest } from '@/types'

// Mock data - in real app, this would come from API
const mockAddons: Addon[] = [
  {
    id: 1,
    name: 'Analytics Dashboard',
    version: '1.0.0',
    description: 'Advanced analytics and reporting with real-time data visualization',
    author: 'SaaS Team',
    status: 'active',
    installedAt: new Date('2024-01-15').toISOString(),
    manifest: {
      name: 'analytics-dashboard',
      version: '1.0.0',
      description: 'Advanced analytics and reporting',
      author: 'SaaS Team',
      main: 'index.js',
      routes: [
        {
          path: '/analytics',
          component: './components/AnalyticsDashboard.jsx',
          permissions: ['admin', 'superadmin']
        }
      ],
      dependencies: ['recharts', 'date-fns'],
      database: {
        migrations: ['./migrations/001_create_analytics.sql']
      }
    }
  },
  {
    id: 2,
    name: 'Advanced Forms',
    version: '2.1.0',
    description: 'Dynamic form builder with validation and conditional logic',
    author: 'Forms Inc',
    status: 'installed',
    installedAt: new Date('2024-02-01').toISOString(),
    manifest: {
      name: 'advanced-forms',
      version: '2.1.0',
      description: 'Dynamic form builder',
      author: 'Forms Inc',
      main: 'index.js',
      routes: [
        {
          path: '/forms',
          component: './components/FormBuilder.jsx',
          permissions: ['admin', 'superadmin', 'user']
        }
      ],
      dependencies: ['react-hook-form', 'zod'],
      database: {
        migrations: ['./migrations/001_create_forms.sql']
      }
    }
  },
  {
    id: 3,
    name: 'Email Templates',
    version: '1.5.0',
    description: 'Custom email templates with drag-and-drop editor',
    author: 'MailCraft',
    status: 'inactive',
    installedAt: new Date('2024-01-20').toISOString(),
    manifest: {
      name: 'email-templates',
      version: '1.5.0',
      description: 'Custom email templates',
      author: 'MailCraft',
      main: 'index.js',
      routes: [
        {
          path: '/email-templates',
          component: './components/EmailEditor.jsx',
          permissions: ['admin', 'superadmin']
        }
      ],
      dependencies: ['react-dnd', 'react-dnd-html5-backend'],
      database: {
        migrations: ['./migrations/001_create_templates.sql']
      }
    }
  }
]

const AddonsPage: React.FC = () => {
  const [addons, setAddons] = useState<Addon[]>(mockAddons)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedAddon, setSelectedAddon] = useState<Addon | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.zip')) {
      alert('Please upload a ZIP file')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('addon', file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Add new addon to list
      const newAddon: Addon = {
        id: Date.now(),
        name: file.name.replace('.zip', ''),
        version: '1.0.0',
        description: 'Newly uploaded addon',
        author: 'Unknown',
        status: 'installed',
        installedAt: new Date().toISOString(),
        manifest: {
          name: file.name.replace('.zip', ''),
          version: '1.0.0',
          description: 'Newly uploaded addon',
          author: 'Unknown',
          main: 'index.js',
          routes: [],
          dependencies: [],
          database: { migrations: [] }
        }
      }

      setAddons([...addons, newAddon])
      setShowUploadModal(false)
      setUploadProgress(0)
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleStatus = async (addonId: number) => {
    setAddons(addons.map(addon => 
      addon.id === addonId 
        ? { ...addon, status: addon.status === 'active' ? 'inactive' : 'active' }
        : addon
    ))
  }

  const handleUninstall = async (addonId: number) => {
    if (!confirm('Are you sure you want to uninstall this addon? This action cannot be undone.')) {
      return
    }

    setAddons(addons.filter(addon => addon.id !== addonId))
    setSelectedAddon(null)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'installed':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'inactive':
        return <Square className="w-4 h-4 text-gray-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
      case 'installed':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
      case 'inactive':
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20'
      default:
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Addons</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Extend functionality with modular addons
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn btn-primary btn-md flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Addon</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Addons</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{addons.length}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {addons.filter(a => a.status === 'active').length}
              </p>
            </div>
            <Play className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Installed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {addons.filter(a => a.status === 'installed').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {addons.filter(a => a.status === 'inactive').length}
              </p>
            </div>
            <Square className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Addons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {addons.map((addon) => (
          <div key={addon.id} className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 rounded-lg flex items-center justify-center">
                  <Puzzle className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{addon.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">v{addon.version}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(addon.status)}`}>
                {getStatusIcon(addon.status)}
                <span>{addon.status}</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {addon.description}
            </p>

            <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              <p>By {addon.author}</p>
              <p>Installed {new Date(addon.installedAt).toLocaleDateString()}</p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleStatus(addon.id)}
                  className="btn btn-outline btn-sm flex items-center space-x-1"
                >
                  {addon.status === 'active' ? (
                    <>
                      <Square className="w-3 h-3" />
                      <span>Disable</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      <span>Enable</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedAddon(addon)}
                  className="btn btn-outline btn-sm"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>
              <button
                onClick={() => handleUninstall(addon.id)}
                className="btn btn-outline btn-sm text-red-600 hover:text-red-700 dark:text-red-400"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Upload Addon
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Drop your addon ZIP file here or click to browse
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="btn btn-primary btn-md"
              >
                {uploading ? 'Uploading...' : 'Choose File'}
              </button>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                disabled={uploading}
                className="btn btn-outline btn-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Addon Details Modal */}
      {selectedAddon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedAddon.name}
              </h2>
              <button
                onClick={() => setSelectedAddon(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Version</p>
                    <p className="font-medium">{selectedAddon.version}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Author</p>
                    <p className="font-medium">{selectedAddon.author}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Status</p>
                    <p className="font-medium capitalize">{selectedAddon.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Installed</p>
                    <p className="font-medium">{new Date(selectedAddon.installedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedAddon.description}</p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Dependencies</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedAddon.manifest.dependencies.length > 0 ? (
                    selectedAddon.manifest.dependencies.map((dep, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 text-xs rounded">
                        {dep}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">No dependencies</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Routes</h3>
                <div className="space-y-2">
                  {selectedAddon.manifest.routes.length > 0 ? (
                    selectedAddon.manifest.routes.map((route, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded">
                        <div>
                          <p className="font-medium">{route.path}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{route.component}</p>
                        </div>
                        <div className="flex gap-1">
                          {route.permissions.map((perm, i) => (
                            <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs rounded">
                              {perm}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">No routes defined</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setSelectedAddon(null)}
                className="btn btn-outline btn-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AddonsPage
