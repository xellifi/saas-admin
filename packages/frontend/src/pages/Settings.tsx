import React, { useState, useEffect } from 'react'
import {
  Save,
  Bell,
  Palette,
  Database,
  Mail,
  Key,
  Building,
  Check,
  Lock,
  Loader2,
  Share2
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'

const Settings: React.FC = () => {
  const { user } = useAuthStore()
  const { settings, fetchSettings, updateSettings, loading, error } = useSettingsStore()
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState(settings)

  // Sync formData with settings when they are fetched
  useEffect(() => {
    setFormData(settings)
  }, [settings])

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    try {
      await updateSettings(formData)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const allTabs = [
    { id: 'general', label: 'General', icon: Building, roles: ['superadmin', 'admin'] },
    { id: 'appearance', label: 'Appearance', icon: Palette, roles: ['superadmin', 'admin'] },
    { id: 'notifications', label: 'Notifications', icon: Bell, roles: ['superadmin', 'admin', 'user'] },
    { id: 'security', label: 'Security', icon: Lock, roles: ['superadmin'] },
    { id: 'api', label: 'API', icon: Key, roles: ['superadmin'] },
    { id: 'email', label: 'Email', icon: Mail, roles: ['superadmin'] },
    { id: 'backup', label: 'Backup', icon: Database, roles: ['superadmin'] },
    { id: 'integrations', label: 'Integration', icon: Share2, roles: ['superadmin', 'admin'] }
  ]

  const tabs = allTabs.filter(tab => user && tab.roles.includes(user.role))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Configure your SaaS platform settings and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {saved && (
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <Check className="w-4 h-4 mr-1" />
              Settings saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2.5 rounded-xl flex items-center space-x-2 disabled:opacity-50 transition-all font-bold"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{loading ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && !formData && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Loading settings...</span>
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
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Content */}
      {(!loading || formData) && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${activeTab === tab.id
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  )
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">General Settings</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site Name
                      </label>
                      <input
                        type="text"
                        value={formData.siteName}
                        onChange={(e) => handleInputChange('siteName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Admin Email
                      </label>
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Description
                    </label>
                    <textarea
                      value={formData.siteDescription}
                      onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              )}

              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Theme
                      </label>
                      <select
                        value={formData.theme || 'light'}
                        onChange={(e) => handleInputChange('theme', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="color"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="h-10 w-20 border border-gray-200 dark:border-gray-700 rounded"
                        />
                        <input
                          type="text"
                          value={formData.primaryColor}
                          onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>

                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive email notifications for important events</p>
                      </div>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.pushNotifications}
                        onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive push notifications in your browser</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>

                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={formData.twoFactorAuth || false}
                        onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</span>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Require 2FA for all admin accounts</p>
                      </div>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={formData.sessionTimeout || 30}
                        onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}


              {activeTab === 'api' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">API configuration options</p>
                </div>
              )}

              {activeTab === 'email' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">SMTP and email configuration</p>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Backup Settings</h2>
                  <p className="text-gray-600 dark:text-gray-400">Automated backup configuration</p>
                </div>
              )}

              {activeTab === 'integrations' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Integration</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Supercharge your workflow using these integration</p>
                  </div>

                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[
                      { id: 'google_drive', name: 'Google Drive', desc: 'Upload your files to Google Drive', icon: 'https://cdn-icons-png.flaticon.com/512/2991/2991147.png' },
                      { id: 'slack', name: 'Slack', desc: 'Post to a Slack channel', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111615.png' },
                      { id: 'notion', name: 'Notion', desc: 'Retrieve notion note to your project', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968909.png' },
                      { id: 'jira', name: 'Jira', desc: 'Create Jira issues', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968875.png' },
                      { id: 'zendesk', name: 'Zendesk', desc: 'Exchange data with Zendesk', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968962.png' },
                      { id: 'dropbox', name: 'Dropbox', desc: 'Exchange data with Dropbox', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111381.png' },
                      { id: 'github', name: 'Github', desc: 'Exchange files with a GitHub repository', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111425.png' },
                      { id: 'gitlab', name: 'Gitlab', desc: 'Exchange files with a Gitlab repository', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968866.png' },
                      { id: 'figma', name: 'Figma', desc: 'Exchange screenshots with Figma', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968705.png' },
                      { id: 'adobe_xd', name: 'Adobe XD', desc: 'Exchange screenshots with Adobe XD', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968412.png' },
                      { id: 'sketch', name: 'Sketch', desc: 'Exchange screenshots with Sketch', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968566.png' },
                      { id: 'hubspot', name: 'Hubspot', desc: 'Exchange data with Hubspot', icon: 'https://cdn-icons-png.flaticon.com/512/5968/5968870.png' },
                      { id: 'zapier', name: 'Zapier', desc: 'Integrate with hundreds of services.', icon: 'https://cdn-icons-png.flaticon.com/512/5969/5969013.png' },
                    ].map((integration) => (
                      <div key={integration.id} className="py-6 flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 flex-shrink-0 bg-gray-50 dark:bg-gray-800 rounded-xl p-2.5 border border-gray-200 dark:border-gray-700 flex items-center justify-center">
                            <img
                              src={integration.icon}
                              alt={integration.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                (e.target as any).src = 'https://cdn-icons-png.flaticon.com/512/1243/1243560.png'
                              }}
                            />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">
                              {integration.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {integration.desc}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <button className="text-xs font-semibold text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors uppercase tracking-wider">
                            Learn more
                          </button>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={!!formData[`integration_${integration.id}` as keyof typeof formData]}
                              onChange={(e) => handleInputChange(`integration_${integration.id}`, e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
