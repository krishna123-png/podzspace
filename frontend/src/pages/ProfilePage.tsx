import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { usersAPI } from '@/lib/api'
import { User, Mail, Phone, MapPin, Edit2, Save, X, Building2, Star, Upload } from 'lucide-react'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, setUser } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(user?.profileImage || '')
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
  })

  const [stats, setStats] = useState({
    totalBookings: 0,
    totalStudios: 0,
    totalReviews: 0,
    averageRating: 0,
  })

  useEffect(() => {
    // Fetch user stats from API
    const fetchStats = async () => {
      try {
        const response = await usersAPI.getStats()
        setStats(response.data.stats)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      }
    }
    
    fetchStats()
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB')
        return
      }
      setProfileImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('fullName', formData.fullName)
      formDataToSend.append('phone', formData.phone || '')
      formDataToSend.append('bio', formData.bio || '')
      
      if (profileImageFile) {
        formDataToSend.append('profileImage', profileImageFile)
      }

      const response = await usersAPI.updateProfile(formDataToSend)
      setUser(response.data.user)
      setImagePreview(response.data.user.profileImage || '')
      setProfileImageFile(null)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      profileImage: user?.profileImage || '',
    })
    setImagePreview(user?.profileImage || '')
    setProfileImageFile(null)
    setIsEditing(false)
  }

  if (!user) return <div className="section-container">Loading...</div>

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="btn btn-secondary flex items-center gap-2"
                disabled={loading}
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn btn-primary flex items-center gap-2"
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="card p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt={formData.fullName}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center border-4 border-primary-200">
                  <User className="h-16 w-16 text-primary-600" />
                </div>
              )}
              {isEditing && (
                <label className="mt-3 cursor-pointer block">
                  <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2 text-sm">
                    <Upload className="h-4 w-4" />
                    <span>Change Photo</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-1 text-center">Max 5MB</p>
                </label>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 w-full">
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="input"
                    />
                  ) : (
                    <p className="text-lg font-semibold">{user.fullName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email
                  </label>
                  <p className="text-gray-600">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className="input"
                    />
                  ) : (
                    <p className="text-gray-600">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                {/* Role Badge */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <span className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${
                    user.role === 'STUDIO_OWNER' 
                      ? 'bg-purple-100 text-purple-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {user.role === 'STUDIO_OWNER' ? 'Studio Owner' : 'Creator'}
                  </span>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself..."
                      className="input min-h-[100px]"
                    />
                  ) : (
                    <p className="text-gray-600">{user.bio || 'No bio added yet'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section - Different for each role */}
        {user.role === 'STUDIO_OWNER' ? (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="card p-6 text-center">
              <Building2 className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalStudios}</div>
              <div className="text-sm text-gray-600">Studios Listed</div>
            </div>
            <div className="card p-6 text-center">
              <MapPin className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="card p-6 text-center">
              <Star className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="card p-6 text-center">
              <MapPin className="h-12 w-12 text-primary-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBookings}</div>
              <div className="text-sm text-gray-600">Total Bookings</div>
            </div>
            <div className="card p-6 text-center">
              <Star className="h-12 w-12 text-yellow-600 mx-auto mb-3" />
              <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalReviews}</div>
              <div className="text-sm text-gray-600">Reviews Written</div>
            </div>
          </div>
        )}

        {/* Account Information */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Account Type</span>
              <span className="font-semibold">
                {user.role === 'STUDIO_OWNER' ? 'Studio Owner' : 'Podcast Creator'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Member Since</span>
              <span className="font-semibold">
                {new Date(user.createdAt).toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Account Status</span>
              <span className="text-green-600 font-semibold">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage

