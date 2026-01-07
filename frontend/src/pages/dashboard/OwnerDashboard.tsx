// Studio Owner Dashboard
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { studiosAPI, bookingsAPI } from '@/lib/api'
import { Plus, Edit2, DollarSign, Calendar, Eye, Clock, MapPin, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const OwnerDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [studios, setStudios] = useState<any[]>([])
  const [recentBookings, setRecentBookings] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalStudios: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [studiosRes, bookingsRes] = await Promise.all([
        studiosAPI.getMyStudios(),
        bookingsAPI.getBookingsForMyStudios()
      ])

      const studiosData = studiosRes.data.studios || []
      const bookingsData = bookingsRes.data.bookings || []

      setStudios(studiosData.slice(0, 3))
      setRecentBookings(bookingsData.slice(0, 5))

      // Calculate stats
      const totalRevenue = bookingsData
        .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0)

      setStats({
        totalStudios: studiosData.length,
        totalRevenue
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-700'
      case 'PENDING': return 'bg-yellow-100 text-yellow-700'
      case 'COMPLETED': return 'bg-blue-100 text-blue-700'
      case 'CANCELLED': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="section-container">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="section-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName?.split(' ')[0]}! 🎵
          </h1>
          <p className="text-gray-600 text-lg">Here's how your studios are performing</p>
        </div>
        <button
          onClick={() => navigate('/add-studio')}
          className="btn btn-primary flex items-center shadow-lg hover-lift"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Studio
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <MapPin className="h-8 w-8 opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm">
              Total
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalStudios}</div>
          <div className="text-blue-100">Active Studios</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm">
              Revenue
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">${stats.totalRevenue.toFixed(0)}</div>
          <div className="text-green-100">Total Earned</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-primary-600" />
              Recent Bookings
            </h2>
            <button
              onClick={() => navigate('/my-studios')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {recentBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate('/add-studio')}
                className="btn btn-primary"
              >
                Add Your First Studio
              </button>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{booking.studio?.name}</h3>
                      <p className="text-sm text-gray-600">By {booking.creator?.fullName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {booking.bookingDate ? new Date(booking.bookingDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.totalHours || 0}h
                    </span>
                    <span className="text-primary-600 font-semibold ml-auto">
                      ${booking.totalPrice ? booking.totalPrice.toFixed(0) : '0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Your Studios */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MapPin className="h-6 w-6 mr-2 text-primary-600" />
              Your Studios
            </h2>
            <button
              onClick={() => navigate('/my-studios')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
            >
              Manage All
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {studios.length === 0 ? (
            <div className="text-center py-12">
              <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No studios yet</p>
              <button
                onClick={() => navigate('/add-studio')}
                className="btn btn-primary"
              >
                Create Your First Studio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {studios.map((studio) => (
                <div
                  key={studio.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={studio.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100'}
                      alt={studio.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{studio.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {studio.city}, {studio.state}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary-600 font-semibold">
                          ${studio.pricePerHour}/hr
                        </span>
                        <button
                          onClick={() => navigate(`/edit-studio/${studio.id}`)}
                          className="text-sm text-gray-600 hover:text-primary-600 flex items-center"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/add-studio')}
            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Plus className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2">Add New Studio</h3>
            <p className="text-sm text-gray-600">List a new recording space</p>
          </button>

          <button
            onClick={() => navigate('/my-studios')}
            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Eye className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2">Manage Studios</h3>
            <p className="text-sm text-gray-600">View and edit your listings</p>
          </button>

          <button
            onClick={() => navigate('/my-studios')}
            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Calendar className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2">View Bookings</h3>
            <p className="text-sm text-gray-600">Check upcoming sessions</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard
