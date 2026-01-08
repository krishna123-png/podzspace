import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studiosAPI, bookingsAPI } from '@/lib/api'
import { Plus, Edit2, MapPin, DollarSign, Calendar, TrendingUp, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const MyStudiosPage = () => {
  const navigate = useNavigate()
  const [studios, setStudios] = useState<any[]>([])
  const [bookingsByStudio, setBookingsByStudio] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudiosData()
  }, [])

  const loadStudiosData = async () => {
    try {
      setLoading(true)
      const [studiosRes, bookingsRes] = await Promise.all([
        studiosAPI.getMyStudios(),
        bookingsAPI.getBookingsForMyStudios()
      ])

      const studiosData = studiosRes.data.studios || []
      const bookingsData = bookingsRes.data.bookings || []

      setStudios(studiosData)

      // Group bookings by studio
      const grouped: Record<string, any[]> = {}
      bookingsData.forEach((booking: any) => {
        if (!grouped[booking.studioId]) {
          grouped[booking.studioId] = []
        }
        grouped[booking.studioId].push(booking)
      })
      setBookingsByStudio(grouped)
    } catch (error) {
      console.error('Failed to load studios:', error)
      toast.error('Failed to load your studios')
    } finally {
      setLoading(false)
    }
  }

  const getStudioStats = (studioId: string) => {
    const bookings = bookingsByStudio[studioId] || []
    const totalBookings = bookings.length
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0)
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length

    return { totalBookings, totalRevenue, pendingBookings }
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">My Studios</h1>
          <p className="text-gray-600">Manage your recording studio listings</p>
        </div>
        <button
          onClick={() => navigate('/add-studio')}
          className="btn btn-primary flex items-center shadow-lg hover-lift"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add New Studio
        </button>
      </div>

      {/* Studios Grid */}
      {studios.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Studios Yet</h3>
          <p className="text-gray-600 mb-6">Create your first studio listing to start accepting bookings</p>
          <button
            onClick={() => navigate('/add-studio')}
            className="btn btn-primary inline-flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Your First Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studios.map((studio) => {
            const stats = getStudioStats(studio.id)
            return (
              <div
                key={studio.id}
                className="card hover:shadow-xl transition-all duration-300"
              >
                <div className="relative">
                  <img
                    src={studio.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'}
                    alt={studio.name}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                  <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${
                    studio.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {studio.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{studio.name}</h3>
                  <p className="text-gray-600 flex items-center mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {studio.city}, {studio.state}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <Calendar className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-blue-600">{stats.totalBookings}</div>
                      <div className="text-xs text-gray-600">Bookings</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <DollarSign className="h-5 w-5 text-green-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-green-600">${stats.totalRevenue.toFixed(0)}</div>
                      <div className="text-xs text-gray-600">Revenue</div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3 text-center">
                      <TrendingUp className="h-5 w-5 text-yellow-600 mx-auto mb-1" />
                      <div className="text-lg font-bold text-yellow-600">{stats.pendingBookings}</div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-primary-600 font-bold text-xl">
                      ${studio.pricePerHour}/hr
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-studio/${studio.id}`)}
                      className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => navigate(`/studio/${studio.id}`)}
                      className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyStudiosPage
