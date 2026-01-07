import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../lib/api';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  studioId?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  receiver: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  studio?: {
    id: string;
    name: string;
  };
}

interface Conversation {
  otherUser: {
    id: string;
    fullName: string;
    email: string;
    profileImage?: string;
  };
  studio?: {
    id: string;
    name: string;
  };
  lastMessage: Message;
  unreadCount: number;
}

const MessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, checkAuth, isAuthenticated } = useAuthStore();
  const socket = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!user && isAuthenticated) {
        console.log('User not loaded but authenticated, calling checkAuth');
        await checkAuth();
      }
    };
    initAuth();
  }, []);

  // Join user's personal room for real-time messages
  useEffect(() => {
    if (socket && user) {
      socket.emit('join-user-room', user.id);
    }
  }, [socket, user]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    socket.on('new-message', (message: Message) => {
      // If this message is for the currently open conversation, add it
      if (selectedConversation) {
        const conversationId = `${selectedConversation.otherUser.id}-${selectedConversation.studio?.id || 'general'}`;
        const messageConversationId = `${message.senderId === user?.id ? message.receiverId : message.senderId}-${message.studioId || 'general'}`;
        
        if (conversationId === messageConversationId) {
          setMessages((prev) => [...prev, message]);
          
          // Mark as read if we're viewing the conversation
          if (message.receiverId === user?.id) {
            api.patch(`/messages/${message.id}/read`).catch(console.error);
          }
        }
      }

      // Refresh conversations list only if needed
      if (!selectedConversation || 
          (message.senderId !== selectedConversation.otherUser.id && 
           message.receiverId !== selectedConversation.otherUser.id)) {
        fetchConversations();
      }
    });

    return () => {
      socket.off('new-message');
    };
  }, [socket, selectedConversation, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      console.log('Fetching conversations...');
      const response = await api.get('/messages/conversations');
      console.log('Conversations response:', response.data);
      setConversations(response.data.data || []);
    } catch (error: any) {
      console.error('Failed to fetch conversations:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load conversations');
      setConversations([]);
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const response = await api.get(`/messages/${conversationId}`);
      console.log('Messages response:', response.data);
      setMessages(response.data.data || []);

      // Mark all unread messages as read
      const unreadMessages = (response.data.data || []).filter(
        (msg: Message) => msg.receiverId === user?.id && !msg.isRead
      );
      for (const msg of unreadMessages) {
        api.patch(`/messages/${msg.id}/read`).catch(console.error);
      }
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      console.error('Error details:', error.response?.data);
      toast.error('Failed to load messages');
      setMessages([]);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('Fetching conversations for user:', user.id);
      fetchConversations();
    } else if (!isAuthenticated) {
      console.log('No authentication, redirecting to login');
      setLoading(false);
      navigate('/login');
    }
  }, [user]); // Trigger when user is loaded

  useEffect(() => {
    if (selectedConversation) {
      const conversationId = `${selectedConversation.otherUser.id}-${selectedConversation.studio?.id || 'general'}`;
      fetchMessages(conversationId);
    }
  }, [selectedConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation || !user) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        receiverId: selectedConversation.otherUser.id,
        studioId: selectedConversation.studio?.id || null,
        content: messageInput.trim(),
      });

      // Message will be added via socket, but add it optimistically
      const newMessage = response.data.data;
      setMessages((prev) => {
        // Check if message already exists (from socket)
        if (prev.some(m => m.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });
      setMessageInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error);
      toast.error('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex h-[600px]">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <p className="text-sm mt-2">Start chatting with studio owners or customers!</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={`${conversation.otherUser.id}-${conversation.studio?.id || 'general'}`}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.otherUser.id === conversation.otherUser.id &&
                      selectedConversation?.studio?.id === conversation.studio?.id
                        ? 'bg-indigo-50'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className="flex-shrink-0">
                          {conversation.otherUser.profileImage ? (
                            <img
                              src={conversation.otherUser.profileImage}
                              alt={conversation.otherUser.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-indigo-600 font-semibold text-lg">
                                {conversation.otherUser.fullName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {conversation.otherUser.fullName}
                            </p>
                            {conversation.unreadCount > 0 && (
                              <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-600 rounded-full">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          {conversation.studio && (
                            <p className="text-xs text-gray-500 truncate">
                              About: {conversation.studio.name}
                            </p>
                          )}
                          <p className="text-sm text-gray-600 truncate mt-1">
                            {conversation.lastMessage.content}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(conversation.lastMessage.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center space-x-3">
                      {selectedConversation.otherUser.profileImage ? (
                        <img
                          src={selectedConversation.otherUser.profileImage}
                          alt={selectedConversation.otherUser.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {selectedConversation.otherUser.fullName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedConversation.otherUser.fullName}
                        </h3>
                        {selectedConversation.studio && (
                          <p className="text-sm text-gray-500">
                            About: {selectedConversation.studio.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.map((message) => {
                      const isOwnMessage = message.senderId === user?.id;
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
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !messageInput.trim()}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                      >
                        <Send className="h-5 w-5" />
                        <span>Send</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-lg">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
