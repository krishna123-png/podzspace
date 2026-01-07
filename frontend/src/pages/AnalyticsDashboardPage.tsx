import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, DollarSign, Calendar, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

const AnalyticsDashboardPage = () => {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const response = await api.get('/analytics/owner')
      setAnalytics(response.data)
    } catch (error) {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="section-container">Loading analytics...</div>
  }

  if (!analytics) {
    return <div className="section-container">No data available</div>
  }

  return (
    <div className="section-container">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📊 Analytics Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{analytics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-primary-600">
                  {analytics.totalBookings}
                </p>
              </div>
              <Calendar className="h-12 w-12 text-primary-500 opacity-20" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Bookings</p>
                <p className="text-3xl font-bold text-blue-600">
                  {analytics.upcomingBookings}
                </p>
              </div>
              <TrendingUp className="h-12 w-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg per Booking</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{analytics.totalBookings > 0 
                    ? Math.round(analytics.totalRevenue / analytics.totalBookings) 
                    : 0}
                </p>
              </div>
              <Star className="h-12 w-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Monthly Revenue */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue (₹)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Bookings */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Monthly Bookings</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.monthlyBookingCount}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#EC4899" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Studio Performance */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Studio Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.studioPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#8B5CF6" name="Revenue (₹)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Booking Status Distribution */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Booking Status</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry.status}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Studios Table */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Top Performing Studios</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rank</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Studio Name</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Bookings</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.studioPerformance.map((studio: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium">{studio.name}</td>
                    <td className="px-4 py-3 text-sm">{studio.bookings}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-green-600">
                      ₹{studio.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboardPage
