// Placeholder - Search page with filters
import { useState, useEffect } from 'react'
import { studiosAPI, favoritesAPI } from '@/lib/api'
import { Search, MapPin, Star, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const SearchPage = () => {
  const { isAuthenticated } = useAuthStore()
  const [studios, setStudios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ city: '', minPrice: '', maxPrice: '' })
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadStudios()
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated])

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll()
      const favoriteIds = new Set(response.data.favorites.map((f: any) => f.studioId))
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
  }

  const loadStudios = async () => {
    try {
      const response = await studiosAPI.search(filters)
      setStudios(response.data.studios)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadStudios()
  }

  const toggleFavorite = async (e: React.MouseEvent, studioId: string) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      toast.error('Please login to add favorites')
      return
    }

    try {
      const isFavorited = favorites.has(studioId)
      if (isFavorited) {
        await favoritesAPI.remove(studioId)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(studioId)
          return newSet
        })
        toast.success('Removed from favorites')
      } else {
        await favoritesAPI.add(studioId)
        setFavorites(prev => new Set(prev).add(studioId))
        toast.success('Added to favorites')
      }
    } catch (error) {
      toast.error('Failed to update favorites')
    }
  }

  return (
    <div className="section-container">
      <h1 className="text-4xl font-bold mb-8">Find Your Studio</h1>
      
      {/* Filters */}
      <div className="card p-6 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="City"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="input"
          />
          <input
            type="number"
            placeholder="Min Price"
            value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="input"
          />
          <input
            type="number"
            placeholder="Max Price"
            value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="input"
          />
          <button onClick={handleSearch} className="btn btn-primary">
            <Search className="inline h-5 w-5 mr-2" />
            Search
          </button>
        </div>
      </div>

      {/* Studios Grid */}
      {loading ? (
        <div className="text-center py-12">Loading studios...</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {studios.map((studio) => (
            <Link key={studio.id} to={`/studio/${studio.id}`} className="card overflow-hidden hover-lift">
              <div className="relative">
                <img
                  src={studio.images[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'}
                  alt={studio.name}
                  className="w-full h-48 object-cover"
                />
                <button
                  onClick={(e) => toggleFavorite(e, studio.id)}
                  className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.has(studio.id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{studio.name}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  {studio.city}, {studio.state}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-bold text-primary-600">
                    ${studio.pricePerHour}
                    <span className="text-sm text-gray-600 font-normal">/hour</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500 mr-1" />
                    <span>{studio.averageRating?.toFixed(1) || 'New'}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchPage
