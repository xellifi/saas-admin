import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  MapPin,
  Phone,
  Edit,
  Save,
  X,
  User,
  Briefcase,
  Globe,
  Camera
} from 'lucide-react'
import { toast } from '@/components/ui/Toast'
import Notification from '@/components/ui/Notification'
import { useConfirmDialog } from '@/contexts/ConfirmDialogContext'

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'security'>('overview')

  const { confirm } = useConfirmDialog()

  // Mock user data - in real app, this would come from API
  const user = {
    id: parseInt(id || '1'),
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
    bio: 'Senior Software Engineer with 5+ years of experience in full-stack development. Passionate about creating scalable and user-friendly applications.',
    avatar: null,
    isActive: true,
    emailVerified: true,
    createdAt: '2023-01-15',
    lastLoginAt: '2024-03-04',
    department: 'Engineering',
    position: 'Senior Developer',
    manager: 'Jane Smith'
  }

  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    location: user.location,
    website: user.website,
    bio: user.bio,
    department: user.department,
    position: user.position
  })

  const handleSave = () => {
    // In real app, this would save to API
    setIsEditing(false)
    console.log('Saving profile:', formData)

    // Show success notification
    toast.push(
      <Notification
        title="Success"
        type="success"
      >
        Profile updated successfully!
      </Notification>
    )
  }

  const handleDeleteAccount = async () => {
    const result = await confirm({
      title: 'Delete Account',
      message: 'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      confirmText: 'Delete Account',
      cancelText: 'Cancel',
      confirmVariant: 'danger',
      onConfirm: async () => {
        // In real app, this would call API to delete account
        console.log('Deleting account:', user)

        toast.push(
          <Notification
            title="Account Deleted"
            type="success"
          >
            Your account has been deleted successfully.
          </Notification>
        )

        // Redirect to login after deletion
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      }
    })

    if (result) {
      console.log('Account deletion confirmed')
    }
  }

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      website: user.website,
      bio: user.bio,
      department: user.department,
      position: user.position
    })
    setIsEditing(false)
  }

  const activities = [
    { id: 1, action: 'Logged in', timestamp: '2024-03-04 09:30 AM', ip: '192.168.1.100' },
    { id: 2, action: 'Updated profile', timestamp: '2024-03-03 02:15 PM', ip: '192.168.1.100' },
    { id: 3, action: 'Changed password', timestamp: '2024-03-01 11:45 AM', ip: '192.168.1.100' },
    { id: 4, action: 'Logged in', timestamp: '2024-02-28 08:20 AM', ip: '192.168.1.100' },
    { id: 5, action: 'Created account', timestamp: '2023-01-15 03:30 PM', ip: '192.168.1.100' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
            <p className="text-gray-600 dark:text-gray-400">
              View and manage user information
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="card shadow mb-6">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-3xl">
                  {user.firstName[0]}{user.lastName[0]}
                </span>
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-3 border-white dark:border-gray-800 ${user.isActive ? 'bg-green-500' : 'bg-red-500'
                }`} />
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </h2>
                <span className={`px-3 py-1 text-sm rounded-full font-medium ${user.role === 'superadmin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                  user.role === 'admin' ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                  }`}>
                  {user.role}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="w-4 h-4" />
                  <span className={user.emailVerified ? 'text-green-600' : 'text-yellow-600'}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>
              </div>

              {user.bio && (
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                  ) : (
                    user.bio
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card shadow">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'overview'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'activity'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Activity
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'security'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              Security
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{user.location}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
                    {isEditing ? (
                      <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                          {user.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Work Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        <span>{user.department}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Position</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-900 dark:text-white">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>{user.position}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{activity.action}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">IP: {activity.ip}</p>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{activity.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Verification</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.emailVerified ? 'Your email is verified' : 'Verify your email address'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${user.emailVerified
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                    {user.emailVerified ? 'Verified' : 'Not Verified'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Account Status</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {user.isActive ? 'Your account is active' : 'Your account is inactive'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm rounded-full font-medium ${user.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white mb-2">Password</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Last changed 30 days ago</p>
                  <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Change Password
                  </button>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="font-medium text-red-900 dark:text-red-100 mb-2">Danger Zone</p>
                  <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                    Once you delete your account, there is no going back. Please be certain.
                  </p>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile
