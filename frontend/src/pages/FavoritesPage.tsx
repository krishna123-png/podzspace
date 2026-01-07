import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { favoritesAPI } from '@/lib/api'
import { Heart, MapPin, Star, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

interface Studio {
  id: string
  name: string
  city: string
  state: string
  pricePerHour: number
  images: string[]
  owner: {
    fullName: string
    isVerified: boolean
  }
  reviews: {
    rating: number
  }[]
}

interface Favorite {
  id: string
  studioId: string
  createdAt: string
  studio: Studio
}

const FavoritesPage = () => {
  const navigate = useNavigate()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      const response = await favoritesAPI.getAll()
      setFavorites(response.data.favorites)
    } catch (error) {
      toast.error('Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (studioId: string) => {
    try {
      await favoritesAPI.remove(studioId)
      setFavorites(favorites.filter(fav => fav.studioId !== studioId))
      toast.success('Removed from favorites')
    } catch (error) {
      toast.error('Failed to remove favorite')
    }
  }

  const calculateAverageRating = (reviews: { rating: number }[]) => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return (sum / reviews.length).toFixed(1)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    )
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            <p className="text-gray-600 mt-1">
              {favorites.length} {favorites.length === 1 ? 'studio' : 'studios'} saved
            </p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="mb-6 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-red-50 rounded-full animate-pulse"></div>
                </div>
                <Heart className="h-20 w-20 text-red-400 mx-auto relative z-10" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">No favorites yet</h2>
              <p className="text-lg text-gray-600 mb-8">
                Start exploring amazing studios and save your favorites for quick access later
              </p>
              <button
                onClick={() => navigate('/search')}
                className="btn btn-primary text-lg px-8 py-4 hover-lift inline-flex items-center space-x-2 shadow-lg"
              >
                {/* <Heart className="h-5 w-5" /> */}
                <span>Browse Studios</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const studio = favorite.studio
              const avgRating = calculateAverageRating(studio.reviews)

              return (
                <div
                  key={favorite.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={studio.images[0] || '/placeholder-studio.jpg'}
                      alt={studio.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onClick={() => navigate(`/studio/${studio.id}`)}
                    />
                    <button
                      onClick={() => handleRemoveFavorite(studio.id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </button>
                  </div>

                  <div
                    className="p-4"
                    onClick={() => navigate(`/studio/${studio.id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {studio.name}
                      </h3>
                      {studio.owner.isVerified && (
                        <span className="ml-2 text-blue-500" title="Verified Owner">
                          ✓
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>
                        {studio.city}, {studio.state}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {avgRating}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({studio.reviews.length})
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-indigo-600">
                          ₹{studio.pricePerHour}
                        </p>
                        <p className="text-xs text-gray-500">per hour</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default FavoritesPage
