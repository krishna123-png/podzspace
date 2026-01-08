import React, { useState, useEffect, useRef } from 'react'
import { X, Send } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import { useSocket } from '@/hooks/useSocket'
import toast from 'react-hot-toast'

interface Message {
  id: string
  content: string
  senderId: string
  receiverId: string
  createdAt: string
}

interface ChatBoxProps {
  isOpen: boolean
  onClose: () => void
  receiverId: string
  receiverName: string
  studioId?: string
  studioName?: string
}

const ChatBox: React.FC<ChatBoxProps> = ({
  isOpen,
  onClose,
  receiverId,
  receiverName,
  studioId,
  studioName,
}) => {
  const { user } = useAuthStore()
  const socket = useSocket()
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && user && receiverId) {
      loadMessages()
      if (socket) {
        socket.emit('join-user-room', user.id)
      }
    }
  }, [isOpen, receiverId, user, socket])

  useEffect(() => {
    if (!socket || !isOpen) return

    socket.on('new-message', (message: Message) => {
      if (
        (message.senderId === receiverId && message.receiverId === user?.id) ||
        (message.senderId === user?.id && message.receiverId === receiverId)
      ) {
        setMessages((prev) => [...prev, message])
        scrollToBottom()
      }
    })

    return () => {
      socket.off('new-message')
    }
  }, [socket, receiverId, user, isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadMessages = async () => {
    try {
      const conversationId = `${receiverId}-${studioId || 'general'}`
      console.log('ChatBox: Loading messages for conversation:', conversationId)
      const response = await api.get(`/messages/${conversationId}`)
      console.log('ChatBox: Messages loaded:', response.data.data?.length || 0)
      setMessages(response.data.data || [])
    } catch (error) {
      console.error('ChatBox: Failed to load messages:', error)
      setMessages([])
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageInput.trim() || !user) return

    setSending(true)
    try {
      const response = await api.post('/messages', {
        receiverId: receiverId,
        studioId: studioId || null,
        content: messageInput.trim(),
      })

      setMessages((prev) => [...prev, response.data.data])
      setMessageInput('')
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-xl">
          <div>
            <h3 className="font-semibold text-lg">{receiverName}</h3>
            {studioName && (
              <p className="text-sm text-indigo-100">About: {studioName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>No messages yet</p>
              <p className="text-sm mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isOwnMessage = message.senderId === user?.id
              console.log('ChatBox: Rendering message', message.id, 'senderId:', message.senderId, 'currentUser:', user?.id, 'isOwn:', isOwnMessage)
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-indigo-200' : 'text-gray-400'
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-2 sm:p-4 bg-white border-t border-gray-200 rounded-b-xl">
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-w-0 px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              className="flex-shrink-0 w-10 h-10 sm:w-auto sm:h-auto sm:px-6 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Send className="h-5 w-5 flex-shrink-0" />
              <span className="hidden sm:inline sm:ml-2">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatBox
