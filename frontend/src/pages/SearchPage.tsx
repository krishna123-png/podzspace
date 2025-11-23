// Placeholder - Search page with filters
import { useState, useEffect } from 'react'
import { studiosAPI } from '@/lib/api'
import { Search, MapPin, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

const SearchPage = () => {
  const [studios, setStudios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ city: '', minPrice: '', maxPrice: '' })

  useEffect(() => {
    loadStudios()
  }, [])

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
              <img
                src={studio.images[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'}
                alt={studio.name}
                className="w-full h-48 object-cover"
              />
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
