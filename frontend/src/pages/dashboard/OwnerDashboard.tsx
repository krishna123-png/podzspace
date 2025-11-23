// Studio Owner Dashboard
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studiosAPI } from '@/lib/api'
import { Plus, Edit2, MapPin, DollarSign } from 'lucide-react'

const OwnerDashboard = () => {
  const navigate = useNavigate()
  const [studios, setStudios] = useState<any[]>([])

  useEffect(() => {
    loadMyStudios()
  }, [])

  const loadMyStudios = async () => {
    try {
      const response = await studiosAPI.getMyStudios()
      setStudios(response.data.studios)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="section-container">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Studios</h1>
        <button 
          onClick={() => navigate('/add-studio')}
          className="btn btn-primary"
        >
          <Plus className="inline h-5 w-5 mr-2" />
          Add Studio
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {studios.map((studio) => (
          <div key={studio.id} className="card p-6 hover:shadow-lg transition-shadow">
            <img
              src={studio.images?.[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'}
              alt={studio.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
            <h3 className="text-xl font-bold mb-2">{studio.name}</h3>
            <p className="text-gray-600 flex items-center mb-3">
              <MapPin className="h-4 w-4 mr-1" />
              {studio.city}, {studio.state}
            </p>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center text-primary-600 font-bold text-xl">
                <DollarSign className="h-5 w-5" />
                {studio.pricePerHour}/hr
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                studio.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {studio.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button
              onClick={() => navigate(`/edit-studio/${studio.id}`)}
              className="btn btn-primary w-full flex items-center justify-center gap-2"
            >
              <Edit2 className="h-4 w-4" />
              Edit Studio
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OwnerDashboard
