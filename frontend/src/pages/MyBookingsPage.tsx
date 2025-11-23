// My Bookings Page
import { useEffect, useState } from 'react'
import { bookingsAPI, studiosAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { Calendar, Clock, User, DollarSign, MapPin } from 'lucide-react'

const MyBookingsPage = () => {
  const { user } = useAuthStore()
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBookings()
  }, [user])

  const loadBookings = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'STUDIO_OWNER') {
        // Get all studios owned by this user
        const studiosResponse = await studiosAPI.getMyStudios()
        const studios = studiosResponse.data.studios
        
        // Get bookings for each studio
        const allBookings: any[] = []
        for (const studio of studios) {
          try {
            const bookingsResponse = await bookingsAPI.getStudioBookings(studio.id)
            const studioBookings = bookingsResponse.data.bookings.map((booking: any) => ({
              ...booking,
              studio: studio, // Attach studio info
            }))
            allBookings.push(...studioBookings)
          } catch (error) {
            console.error(`Failed to fetch bookings for studio ${studio.id}:`, error)
          }
        }
        
        // Sort by booking date (most recent first)
        allBookings.sort((a, b) => 
          new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime()
        )
        
        setBookings(allBookings)
      } else {
        // Creator: Get their own bookings
        const response = await bookingsAPI.getMyBookings()
        setBookings(response.data.bookings)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="section-container">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section-container">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">
          {user?.role === 'STUDIO_OWNER' ? 'Studio Bookings' : 'My Bookings'}
        </h1>
        <p className="text-gray-600 mb-8">
          {user?.role === 'STUDIO_OWNER' 
            ? 'Manage all bookings for your studios' 
            : 'View and manage your studio bookings'}
        </p>

        {bookings.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No bookings yet</h3>
            <p className="text-gray-500">
              {user?.role === 'STUDIO_OWNER' 
                ? 'Your studios haven\'t received any bookings yet.' 
                : 'You haven\'t made any bookings yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Studio Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={booking.studio.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=200'}
                      alt={booking.studio.name}
                      className="w-full md:w-32 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Booking Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold mb-1">{booking.studio.name}</h3>
                        <p className="text-gray-600 flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-1" />
                          {booking.studio.city}, {booking.studio.state}
                        </p>
                      </div>
                      <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div className="flex items-center text-gray-700">
                        <Calendar className="h-5 w-5 mr-2 text-primary-600" />
                        <span>{new Date(booking.bookingDate).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Clock className="h-5 w-5 mr-2 text-primary-600" />
                        <span>{booking.startTime} - {booking.endTime} ({booking.totalHours}h)</span>
                      </div>
                      {user?.role === 'STUDIO_OWNER' && booking.creator && (
                        <div className="flex items-center text-gray-700">
                          <User className="h-5 w-5 mr-2 text-primary-600" />
                          <span>{booking.creator.fullName}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-700">
                        <DollarSign className="h-5 w-5 mr-2 text-primary-600" />
                        <span className="font-semibold">${booking.totalPrice}</span>
                        {user?.role === 'STUDIO_OWNER' && (
                          <span className="text-sm text-gray-500 ml-2">
                            (You earn: ${booking.studioEarnings})
                          </span>
                        )}
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Special Requests:</span> {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    {booking.payment && (
                      <div className="mt-3 flex items-center text-sm">
                        <span className={`px-3 py-1 rounded-full ${
                          booking.payment.status === 'COMPLETED' 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          Payment: {booking.payment.status}
                        </span>
                        <span className="text-gray-500 ml-3">
                          Method: {booking.payment.paymentMethod}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyBookingsPage

