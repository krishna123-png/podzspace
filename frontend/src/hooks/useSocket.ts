import { useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

let socket: Socket | null = null

export const useSocket = () => {
  const { user } = useAuthStore()

  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
      })

      socket.on('connect', () => {
        console.log('✅ Connected to WebSocket')
      })

      socket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket')
      })
    }

    // Join owner room if user is studio owner
    if (user?.role === 'STUDIO_OWNER' && socket) {
      socket.emit('join-owner-room', user.id)
    }

    return () => {
      // Don't disconnect on unmount, keep connection alive
    }
  }, [user])

  return socket
}

// Hook for listening to new bookings (for studio owners)
export const useBookingNotifications = (onNewBooking?: (booking: any) => void) => {
  const socket = useSocket()

  useEffect(() => {
    if (!socket) return

    const handleNewBooking = (data: any) => {
      toast.success(`New booking from ${data.booking.customerName}!`, {
        duration: 5000,
        icon: '🎉',
      })
      
      if (onNewBooking) {
        onNewBooking(data.booking)
      }
    }

    socket.on('new-booking', handleNewBooking)

    return () => {
      socket.off('new-booking', handleNewBooking)
    }
  }, [socket, onNewBooking])
}

// Hook for studio calendar updates
export const useStudioUpdates = (studioId: string, onUpdate?: () => void) => {
  const socket = useSocket()

  useEffect(() => {
    if (!socket || !studioId) return

    socket.emit('join-studio', studioId)

    const handleBookingCreated = () => {
      if (onUpdate) {
        onUpdate()
      }
    }

    socket.on('booking-created', handleBookingCreated)

    return () => {
      socket.off('booking-created', handleBookingCreated)
    }
  }, [socket, studioId, onUpdate])
}
