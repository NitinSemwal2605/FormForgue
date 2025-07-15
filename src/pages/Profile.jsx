import {
  Activity,
  Calendar,
  Camera,
  Clock,
  Eye,
  EyeOff,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Shield
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css'; // For custom styles
import Button from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export default function Profile() {
  const { user, isSignedIn, logout, updateProfile, changePassword } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userStats, setUserStats] = useState(null)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  })
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/forms/new', label: 'Create Form', icon: Plus },
  ]

  // Fetch user statistics
  useEffect(() => {
    if (isSignedIn && user) {
      fetchUserStats()
    }
  }, [isSignedIn, user])

  const fetchUserStats = async () => {
    try {
      const response = await api.get('/auth/profile/forms')
      setUserStats(response)
    } catch (error) {
      console.error('Failed to fetch user stats:', error)
    }
  }

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await updateProfile(profileData)
      if (result.success) {
        showToast('Profile updated successfully!', 'success')
        setIsEditing(false)
      } else {
        showToast(result.error, 'error')
      }
    } catch (error) {
      showToast('Failed to update profile', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('New passwords do not match', 'error')
      setLoading(false)
      return
    }

    if (passwordData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error')
      setLoading(false)
      return
    }

    try {
      const result = await changePassword(passwordData.currentPassword, passwordData.newPassword)
      if (result.success) {
        showToast('Password changed successfully!', 'success')
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        showToast(result.error, 'error')
      }
    } catch (error) {
      showToast('Failed to change password', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    showToast('Logged out successfully', 'success')
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileData({ ...profileData, avatar: e.target.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const removeAvatar = () => {
    setProfileData({ ...profileData, avatar: '' })
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please sign in</h2>
          <Link to="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 py-12 px-2">
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="md:col-span-1 flex flex-col items-center bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-neutral-800 rounded-full flex items-center justify-center overflow-hidden border-4 border-white/20">
              {profileData.avatar ? (
                <img src={profileData.avatar} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-5xl">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <label className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 border-2 border-white/30">
              <Camera className="w-5 h-5" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
          <p className="text-gray-300 mb-2 text-base">{user?.email}</p>
          <Button onClick={handleLogout} variant="outline" className="w-full mt-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </Button>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
          {/* Profile Info & Edit */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-gray-400" /> Profile Information
              </h2>
              <Button onClick={() => setIsEditing(!isEditing)} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" /> {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </div>
            {isEditing ? (
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <input type="text" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="w-full px-3 py-2 border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent" required />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">Cancel</Button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                  <p className="text-white font-medium">{user?.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                  <p className="text-white font-medium">{user?.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-gray-400" /> Change Password
              </h2>
              <Button onClick={() => setIsChangingPassword(!isChangingPassword)} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                {isChangingPassword ? 'Cancel' : 'Change Password'}
              </Button>
            </div>
            {isChangingPassword && (
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                    <div className="relative">
                      <input type={showPassword.current ? 'text' : 'password'} value={passwordData.currentPassword} onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} className="w-full px-3 py-2 pr-10 border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent" required />
                      <button type="button" onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                    <div className="relative">
                      <input type={showPassword.new ? 'text' : 'password'} value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} className="w-full px-3 py-2 pr-10 border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent" required />
                      <button type="button" onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input type={showPassword.confirm ? 'text' : 'password'} value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="w-full px-3 py-2 pr-10 border border-white/20 rounded-lg bg-white/5 text-white focus:ring-2 focus:ring-blue-400 focus:border-transparent" required />
                      <button type="button" onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                        {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" disabled={loading} className="bg-blue-600 text-white hover:bg-blue-700">
                    {loading ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)} className="bg-white/10 border-white/20 text-white hover:bg-white/20">Cancel</Button>
                </div>
              </form>
            )}
          </div>

          {/* User Stats & Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User Statistics */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" /> Your Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-200">Forms Created</span>
                  </div>
                  <span className="text-lg font-bold text-gray-200">
                    {userStats?.totalForms || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-200">Total Responses</span>
                  </div>
                  <span className="text-lg font-bold text-gray-200">
                    {userStats?.totalResponses || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-200">This Month</span>
                  </div>
                  <span className="text-lg font-bold text-gray-200">
                    {userStats?.recentActivity?.length || 0}
                  </span>
                </div>
              </div>
            </div>
            {/* Account Activity */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" /> Account Activity
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Member Since</p>
                    <p className="text-xs text-gray-400">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Last Login</p>
                    <p className="text-xs text-gray-400">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-lg">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Account Status</p>
                    <p className="text-xs text-gray-400">Active</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Recent Forms */}
          {userStats?.recentForms && userStats.recentForms.length > 0 && (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg p-8 border border-white/20 mt-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-gray-400" /> Recent Forms
              </h2>
              <div className="space-y-3">
                {userStats.recentForms.slice(0, 3).map((form) => (
                  <div key={form._id} className="p-3 bg-neutral-900 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="text-sm font-medium text-white">{form.title}</p>
                    <p className="text-xs text-gray-400">
                      {form.responseCount} responses • {new Date(form.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 