import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Layout
import Layout from './components/layout/Layout'

// Pages
import HomePage from './pages/HomePage'
import SearchPage from './pages/SearchPage'
import StudioDetailPage from './pages/StudioDetailPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CreatorDashboard from './pages/dashboard/CreatorDashboard'
import OwnerDashboard from './pages/dashboard/OwnerDashboard'
import MyBookingsPage from './pages/MyBookingsPage'
import ProfilePage from './pages/ProfilePage'
import AddStudioPage from './pages/AddStudioPage'
import EditStudioPage from './pages/EditStudioPage'

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="studio/:id" element={<StudioDetailPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-bookings"
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="add-studio"
          element={
            <ProtectedRoute requiredRole="STUDIO_OWNER">
              <AddStudioPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="edit-studio/:id"
          element={
            <ProtectedRoute requiredRole="STUDIO_OWNER">
              <EditStudioPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  )
}

// Router for different dashboard types
const DashboardRouter = () => {
  const { user } = useAuthStore()
  
  if (user?.role === 'STUDIO_OWNER') {
    return <OwnerDashboard />
  }
  
  return <CreatorDashboard />
}

export default App
