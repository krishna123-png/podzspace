// Placeholder - Studio detail with booking
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studiosAPI, bookingsAPI, paymentsAPI } from '@/lib/api'
import { MapPin, Star, X, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

declare global {
  interface Window {
    Razorpay: any;
  }
}

const StudioDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [studio, setStudio] = useState<any>(null)
  const [bookingData, setBookingData] = useState({ date: '', startTime: '', endTime: '', hours: 1 })
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('CARD')
  const [cardNumber, setCardNumber] = useState('')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) loadStudio()
  }, [id])

  const loadStudio = async () => {
    try {
      const response = await studiosAPI.getById(id!)
      setStudio(response.data.studio)
    } catch (error) {
      console.error(error)
    }
  }

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book a studio')
      navigate('/login')
      return
    }

    if (!bookingData.date || !bookingData.startTime || !bookingData.endTime) {
      toast.error('Please select date and time')
      return
    }

    // Calculate hours
    const start = new Date(`2000-01-01T${bookingData.startTime}`)
    const end = new Date(`2000-01-01T${bookingData.endTime}`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    if (hours <= 0) {
      toast.error('End time must be after start time')
      return
    }

    setBookingData({ ...bookingData, hours })
    setShowPaymentModal(true)
  }

  const handlePayment = async () => {
    // Validate payment details
    if (paymentMethod === 'CARD' && !cardNumber) {
      toast.error('Please enter card number')
      return
    }
    if (paymentMethod === 'UPI' && !upiId) {
      toast.error('Please enter UPI ID')
      return
    }

    setLoading(true)
    try {
      const totalAmount = studio.pricePerHour * bookingData.hours

      // First create the booking
      const bookingResponse = await bookingsAPI.create({
        studioId: id,
        bookingDate: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        totalHours: bookingData.hours,
        paymentMethod: 'CARD',
        paymentAmount: totalAmount,
      })

      const bookingId = bookingResponse.data.booking.id

      // Create Razorpay order
      const orderResponse = await paymentsAPI.createOrder({
        bookingId,
        amount: totalAmount,
      })

      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        document.body.appendChild(script)
        await new Promise((resolve) => {
          script.onload = resolve
        })
      }

      // Initialize Razorpay
      const options = {
        key: orderResponse.data.keyId,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'PodzSpace',
        description: `Booking for ${studio.name}`,
        order_id: orderResponse.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment
            await paymentsAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            })
            
            toast.success('Booking confirmed! Payment successful.')
            setShowPaymentModal(false)
            navigate('/my-bookings')
          } catch (error) {
            toast.error('Payment verification failed')
          }
        },
        prefill: {
          name: useAuthStore.getState().user?.fullName || '',
          email: useAuthStore.getState().user?.email || '',
        },
        theme: {
          color: '#8B5CF6',
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
      setLoading(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Booking failed')
      setLoading(false)
    }
  }

  if (!studio) return <div className="section-container">Loading...</div>

  const totalAmount = studio.pricePerHour * bookingData.hours

  return (
    <>
      <div className="section-container">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <img
            src={studio.images[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'}
            alt={studio.name}
            className="w-full h-96 object-cover rounded-xl mb-6"
          />
          <h1 className="text-4xl font-bold mb-4">{studio.name}</h1>
          <div className="flex items-center text-gray-600 mb-4">
            <MapPin className="h-5 w-5 mr-2" />
            {studio.address}, {studio.city}, {studio.state}
          </div>
          <div className="flex items-center mb-6">
            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500 mr-1" />
            <span className="font-semibold">{studio.averageRating?.toFixed(1)}</span>
            <span className="text-gray-600 ml-2">({studio.reviewCount} reviews)</span>
          </div>
          <p className="text-gray-700 mb-6">{studio.description}</p>
          
          <h3 className="font-bold text-xl mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {studio.amenities?.map((amenity: string, i: number) => (
              <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">{amenity}</span>
            ))}
          </div>
        </div>

        <div>
          <div className="card p-6 sticky top-20">
            <div className="text-3xl font-bold text-primary-600 mb-4">
              ${studio.pricePerHour}
              <span className="text-lg text-gray-600 font-normal">/hour</span>
            </div>
            <div className="space-y-4">
              <input type="date" value={bookingData.date} onChange={(e) => setBookingData({...bookingData, date: e.target.value})} className="input" />
              <input type="time" value={bookingData.startTime} onChange={(e) => setBookingData({...bookingData, startTime: e.target.value})} className="input" />
              <input type="time" value={bookingData.endTime} onChange={(e) => setBookingData({...bookingData, endTime: e.target.value})} className="input" />
              <button onClick={handleBooking} className="btn btn-primary w-full">Book Now</button>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">{studio.name}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Date: {bookingData.date}</p>
                <p>Time: {bookingData.startTime} - {bookingData.endTime}</p>
                <p>Duration: {bookingData.hours} hour(s)</p>
              </div>
              <div className="border-t mt-3 pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-primary-600">${totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                  <span>Credit/Debit Card</span>
                </label>
                
                {paymentMethod === 'CARD' && (
                  <div className="ml-8 space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number (16 digits)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      className="input"
                      maxLength={16}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="input"
                        maxLength={5}
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="input"
                        maxLength={3}
                      />
                    </div>
                  </div>
                )}

                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <span>UPI</span>
                </label>
                
                {paymentMethod === 'UPI' && (
                  <div className="ml-8">
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g., name@upi)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="input"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="btn btn-secondary flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay $${totalAmount}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default StudioDetailPage
