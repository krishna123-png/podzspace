import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { bookingsAPI } from '@/lib/api'
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format, parseISO, isSameDay } from 'date-fns'
import toast from 'react-hot-toast'

interface Booking {
  id: string
  bookingDate: string
  startTime: string
  endTime: string
  status: string
  creator: {
    fullName: string
    email: string
  }
}

const StudioCalendarPage = () => {
  const { studioId } = useParams()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (studioId) loadBookings()
  }, [studioId])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const response = await bookingsAPI.getStudioBookings(studioId!)
      setBookings(response.data.bookings)
    } catch (error) {
      toast.error('Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const getDayBookings = (date: Date) => {
    return bookings.filter(booking => 
      isSameDay(parseISO(booking.bookingDate), date)
    )
  }

  const getDayStatus = (date: Date) => {
    const dayBookings = getDayBookings(date)
    if (dayBookings.length === 0) return 'available'
    if (dayBookings.length >= 3) return 'full'
    return 'partial'
  }

  const selectedDateBookings = getDayBookings(selectedDate)

  if (loading) {
    return <div className="section-container">Loading calendar...</div>
  }

  return (
    <div className="section-container">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Calendar className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-3xl font-bold">Studio Availability Calendar</h1>
            <p className="text-gray-600">View and manage your bookings</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Calendar View */}
          <div className="md:col-span-2 card p-6">
            <h2 className="text-xl font-bold mb-4">Monthly View</h2>
            
            {/* Custom Calendar */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center font-semibold text-sm text-gray-600">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1).getDay() + 1)
                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                  const isSelected = isSameDay(date, selectedDate)
                  const status = getDayStatus(date)
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDate(date)}
                      disabled={!isCurrentMonth}
                      className={`
                        aspect-square p-2 rounded-lg text-sm font-medium transition-all
                        ${!isCurrentMonth ? 'text-gray-300' : ''}
                        ${isSelected ? 'bg-primary-600 text-white' : ''}
                        ${!isSelected && isCurrentMonth && status === 'available' ? 'bg-green-100 text-green-800 hover:bg-green-200' : ''}
                        ${!isSelected && isCurrentMonth && status === 'partial' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' : ''}
                        ${!isSelected && isCurrentMonth && status === 'full' ? 'bg-red-100 text-red-800 hover:bg-red-200' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded"></div>
                  <span>Partially Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-100 rounded"></div>
                  <span>Fully Booked</span>
                </div>
              </div>
            </div>
          </div>

          {/* Day Details */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">
              {format(selectedDate, 'MMM d, yyyy')}
            </h2>

            {selectedDateBookings.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">No bookings for this day</p>
                <p className="text-sm text-gray-500 mt-2">Your studio is available!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateBookings.map((booking) => (
                  <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="font-semibold">{booking.startTime} - {booking.endTime}</span>
                      </div>
                      <span className={`
                        text-xs px-2 py-1 rounded-full
                        ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : ''}
                        ${booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${booking.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{booking.creator.fullName}</p>
                    <p className="text-xs text-gray-500">{booking.creator.email}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Stats */}
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Today's Summary</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-primary-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-primary-600">
                    {selectedDateBookings.filter(b => b.status === 'CONFIRMED').length}
                  </div>
                  <div className="text-xs text-gray-600">Confirmed</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {selectedDateBookings.filter(b => b.status === 'PENDING').length}
                  </div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StudioCalendarPage
