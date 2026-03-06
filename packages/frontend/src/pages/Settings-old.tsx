import React, { useState } from 'react'
import { 
  Settings as SettingsIcon, 
  Save, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Database,
  Mail,
  Key,
  User,
  Building,
  CreditCard,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Check
} from 'lucide-react'

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    // General Settings
    siteName: 'Admin Dashboard',
    siteDescription: 'SaaS Admin Dashboard Platform',
    adminEmail: 'admin@example.com',
    defaultLanguage: 'en',
    timezone: 'UTC',
    
    // Appearance
    theme: 'light',
    primaryColor: '#3B82F6',
    accentColor: '#10B981',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    systemUpdates: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordMinLength: 8,
    requireStrongPassword: true,
    
    // API Settings
    apiRateLimit: 1000,
    enableApiDocs: true,
    corsOrigins: 'http://localhost:3000',
    
    // Email Settings
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'noreply@example.com',
    smtpSecure: true,
    
    // Billing
    currency: 'USD',
    taxRate: 0,
    billingCycle: 'monthly',
    
    // Storage
    maxFileSize: 10,
    storageProvider: 'local',
    backupFrequency: 'daily'
  })

  const handleSave = () => {
    // Simulate saving settings
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const tabs = [
    { id: 'general', label: 'General', icon: Building },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'api', label: 'API', icon: Key },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'storage', label: 'Storage', icon: Database }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure your application settings and preferences
          </p>
        </div>
        <button
          onClick={handleSave}
          className="btn btn-primary btn-md flex items-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="alert alert-success flex items-center space-x-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

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
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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
                    <label className="label">Site Name</label>
                    <input
                      type="text"
                      value={formData.siteName}
                      onChange={(e) => handleInputChange('general', 'siteName', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Admin Email</label>
                    <input
                      type="email"
                      value={formData.adminEmail}
                      onChange={(e) => handleInputChange('general', 'adminEmail', e.target.value)}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Site Description</label>
                  <textarea
                    value={formData.siteDescription}
                    onChange={(e) => handleInputChange('general', 'siteDescription', e.target.value)}
                    className="input"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Default Language</label>
                    <select
                      value={formData.defaultLanguage}
                      onChange={(e) => handleInputChange('general', 'defaultLanguage', e.target.value)}
                      className="input"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Timezone</label>
                    <select
                      value={formData.timezone}
                      onChange={(e) => handleInputChange('general', 'timezone', e.target.value)}
                      className="input"
                    >
                      <option value="UTC">UTC</option>
                      <option value="EST">Eastern Time</option>
                      <option value="PST">Pacific Time</option>
                      <option value="CET">Central European Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
                
                <div>
                  <label className="label">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={() => handleInputChange('appearance', 'theme', 'light')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 ${
                        formData.theme === 'light' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <Sun className="w-6 h-6" />
                      <span className="text-sm">Light</span>
                    </button>
                    <button
                      onClick={() => handleInputChange('appearance', 'theme', 'dark')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 ${
                        formData.theme === 'dark' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <Moon className="w-6 h-6" />
                      <span className="text-sm">Dark</span>
                    </button>
                    <button
                      onClick={() => handleInputChange('appearance', 'theme', 'system')}
                      className={`p-4 border rounded-lg flex flex-col items-center space-y-2 ${
                        formData.theme === 'system' ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                    >
                      <Monitor className="w-6 h-6" />
                      <span className="text-sm">System</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Primary Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                        className="h-10 w-20 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('appearance', 'primaryColor', e.target.value)}
                        className="input flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="label">Accent Color</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('appearance', 'accentColor', e.target.value)}
                        className="h-10 w-20 border rounded"
                      />
                      <input
                        type="text"
                        value={formData.accentColor}
                        onChange={(e) => handleInputChange('appearance', 'accentColor', e.target.value)}
                        className="input flex-1"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('notifications', 'emailNotifications', !formData.emailNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.emailNotifications ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser push notifications</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('notifications', 'pushNotifications', !formData.pushNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.pushNotifications ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Security Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about security events</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('notifications', 'securityAlerts', !formData.securityAlerts)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.securityAlerts ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.securityAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">System Updates</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Notifications about system updates</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('notifications', 'systemUpdates', !formData.systemUpdates)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.systemUpdates ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.systemUpdates ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all users</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('security', 'twoFactorAuth', !formData.twoFactorAuth)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.twoFactorAuth ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Require Strong Passwords</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Enforce strong password requirements</p>
                    </div>
                    <button
                      onClick={() => handleInputChange('security', 'requireStrongPassword', !formData.requireStrongPassword)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData.requireStrongPassword ? 'bg-primary-500' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData.requireStrongPassword ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Session Timeout (minutes)</label>
                    <input
                      type="number"
                      value={formData.sessionTimeout}
                      onChange={(e) => handleInputChange('security', 'sessionTimeout', parseInt(e.target.value))}
                      className="input"
                      min={5}
                      max={1440}
                    />
                  </div>
                  <div>
                    <label className="label">Minimum Password Length</label>
                    <input
                      type="number"
                      value={formData.passwordMinLength}
                      onChange={(e) => handleInputChange('security', 'passwordMinLength', parseInt(e.target.value))}
                      className="input"
                      min={6}
                      max={50}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* API Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">API Rate Limit (requests/hour)</label>
                    <input
                      type="number"
                      value={formData.apiRateLimit}
                      onChange={(e) => handleInputChange('api', 'apiRateLimit', parseInt(e.target.value))}
                      className="input"
                      min={100}
                      max={10000}
                    />
                  </div>
                  <div>
                    <label className="label">CORS Origins</label>
                    <input
                      type="text"
                      value={formData.corsOrigins}
                      onChange={(e) => handleInputChange('api', 'corsOrigins', e.target.value)}
                      className="input"
                      placeholder="http://localhost:3000"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Enable API Documentation</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Show API docs to authenticated users</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('api', 'enableApiDocs', !formData.enableApiDocs)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.enableApiDocs ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.enableApiDocs ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Email Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">SMTP Host</label>
                    <input
                      type="text"
                      value={formData.smtpHost}
                      onChange={(e) => handleInputChange('email', 'smtpHost', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">SMTP Port</label>
                    <input
                      type="number"
                      value={formData.smtpPort}
                      onChange={(e) => handleInputChange('email', 'smtpPort', parseInt(e.target.value))}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">SMTP Username</label>
                  <input
                    type="email"
                    value={formData.smtpUser}
                    onChange={(e) => handleInputChange('email', 'smtpUser', e.target.value)}
                    className="input"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Use Secure Connection (TLS)</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enable TLS encryption for SMTP</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('email', 'smtpSecure', !formData.smtpSecure)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.smtpSecure ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        formData.smtpSecure ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Billing Settings */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Billing Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => handleInputChange('billing', 'currency', e.target.value)}
                      className="input"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Tax Rate (%)</label>
                    <input
                      type="number"
                      value={formData.taxRate}
                      onChange={(e) => handleInputChange('billing', 'taxRate', parseFloat(e.target.value))}
                      className="input"
                      step={0.1}
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Default Billing Cycle</label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => handleInputChange('billing', 'billingCycle', e.target.value)}
                    className="input"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                  </select>
                </div>
              </div>
            )}

            {/* Storage Settings */}
            {activeTab === 'storage' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Storage Configuration</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="label">Max File Size (MB)</label>
                    <input
                      type="number"
                      value={formData.maxFileSize}
                      onChange={(e) => handleInputChange('storage', 'maxFileSize', parseInt(e.target.value))}
                      className="input"
                      min={1}
                      max={100}
                    />
                  </div>
                  <div>
                    <label className="label">Storage Provider</label>
                    <select
                      value={formData.storageProvider}
                      onChange={(e) => handleInputChange('storage', 'storageProvider', e.target.value)}
                      className="input"
                    >
                      <option value="local">Local Storage</option>
                      <option value="s3">Amazon S3</option>
                      <option value="gcs">Google Cloud Storage</option>
                      <option value="azure">Azure Blob Storage</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Backup Frequency</label>
                  <select
                    value={formData.backupFrequency}
                    onChange={(e) => handleInputChange('storage', 'backupFrequency', e.target.value)}
                    className="input"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
