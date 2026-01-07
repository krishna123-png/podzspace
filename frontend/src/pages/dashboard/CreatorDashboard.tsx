// Creator Dashboard
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { bookingsAPI, favoritesAPI } from '@/lib/api'
import { Calendar, Heart, Search, DollarSign, Clock, MapPin, Star, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const CreatorDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [bookingsRes, favoritesRes] = await Promise.all([
        bookingsAPI.getMyBookings(),
        favoritesAPI.getAll()
      ])

      const bookingsData = bookingsRes.data.bookings || []
      const favoritesData = favoritesRes.data.favorites || []

      setBookings(bookingsData.slice(0, 3)) // Latest 3
      setFavorites(favoritesData.slice(0, 3)) // Top 3

      // Calculate stats
      const totalSpent = bookingsData
        .reduce((sum: number, b: any) => sum + (b.hours * b.studio.pricePerHour), 0)

      setStats({
        totalBookings: bookingsData.length,
        totalSpent
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.fullName?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600 text-lg">Here's what's happening with your bookings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="h-8 w-8 opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm">
              All Time
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalBookings}</div>
          <div className="text-blue-100">Total Bookings</div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <DollarSign className="h-8 w-8 opacity-80" />
            <div className="bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm">
              Total
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">${stats.totalSpent.toFixed(0)}</div>
          <div className="text-green-100">Total Spent</div>
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
              onClick={() => navigate('/my-bookings')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No bookings yet</p>
              <button
                onClick={() => navigate('/search')}
                className="btn btn-primary"
              >
                Browse Studios
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/my-bookings')}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{booking.studio?.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {booking.hours || 0}h
                    </span>
                  </div>
                  <div className="mt-2 text-primary-600 font-semibold">
                    ${booking.hours && booking.studio?.pricePerHour ? (booking.hours * booking.studio.pricePerHour).toFixed(0) : '0'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Favorite Studios */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-red-500" />
              Favorite Studios
            </h2>
            <button
              onClick={() => navigate('/favorites')}
              className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
            >
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {favorites.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No favorites yet</p>
              <button
                onClick={() => navigate('/search')}
                className="btn btn-primary"
              >
                Discover Studios
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/studio/${fav.studioId}`)}
                >
                  <div className="flex items-start space-x-3">
                    <img
                      src={fav.studio?.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=100'}
                      alt={fav.studio?.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{fav.studio?.name}</h3>
                      <p className="text-sm text-gray-600 flex items-center mb-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {fav.studio?.city}, {fav.studio?.state}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary-600 font-semibold">
                          ${fav.studio?.pricePerHour}/hr
                        </span>
                        <span className="flex items-center text-sm text-yellow-600">
                          <Star className="h-4 w-4 fill-current mr-1" />
                          {fav.studio?.reviews?.length > 0
                            ? (fav.studio.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / fav.studio.reviews.length).toFixed(1)
                            : 'New'}
                        </span>
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
            onClick={() => navigate('/search')}
            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Search className="h-8 w-8 text-primary-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2">Find Studios</h3>
            <p className="text-sm text-gray-600">Browse and book recording spaces</p>
          </button>

          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Calendar className="h-8 w-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2">My Bookings</h3>
            <p className="text-sm text-gray-600">View and manage your sessions</p>
          </button>

          <button
            onClick={() => navigate('/favorites')}
            className="bg-white rounded-lg p-6 hover:shadow-lg transition-shadow text-left group"
          >
            <Heart className="h-8 w-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 mb-2">Favorites</h3>
            <p className="text-sm text-gray-600">Access your saved studios</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatorDashboard
