import { Link } from 'react-router-dom'
import { Search, Mic2, Calendar, Star, Shield, Headphones, MapPin, DollarSign, CheckCircle, ArrowRight, Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { studiosAPI, favoritesAPI } from '@/lib/api'
import { useAuthStore } from '@/store/authStore'
import toast from 'react-hot-toast'

const HomePage = () => {
  const { isAuthenticated } = useAuthStore()
  const [featuredStudios, setFeaturedStudios] = useState<any[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadFeaturedStudios()
    if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated])

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll()
      const favoriteIds = new Set<string>(response.data.favorites.map((f: any) => f.studioId))
      setFavorites(favoriteIds)
    } catch (error) {
      console.error('Failed to load favorites:', error)
    }
  }

  const loadFeaturedStudios = async () => {
    try {
      const response = await studiosAPI.getAll()
      setFeaturedStudios(response.data.studios.slice(0, 3))
    } catch (error) {
      console.error('Failed to load studios:', error)
    }
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
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="section-container py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Find Your Perfect
                <span className="gradient-text block mt-2">Podcast Studio</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with professional podcast studios in your area. Book premium recording spaces and create content that resonates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/search" className="btn btn-primary text-lg px-8 py-4 hover-lift">
                  <Search className="inline h-5 w-5 mr-2" />
                  Find Studios
                </Link>
                <Link to="/register" className="btn btn-outline text-lg px-8 py-4 hover-lift">
                  List Your Studio
                </Link>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-3xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-gray-600">Studios</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">10K+</div>
                  <div className="text-sm text-gray-600">Bookings</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary-600">4.9</div>
                  <div className="text-sm text-gray-600">Rating</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-elegant-xl">
                <img
                  src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop"
                  alt="Podcast Studio"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-elegant">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Starting from</div>
                      <div className="text-2xl font-bold text-primary-600">$50/hour</div>
                    </div>
                    <div className="flex items-center space-x-1 bg-yellow-100 px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold text-sm">4.9</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-container bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How PodzSpace Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Three simple steps to book your perfect podcast studio
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Search,
              title: 'Find Your Studio',
              description: 'Browse hundreds of professional studios filtered by location, price, and amenities.',
              color: 'from-blue-500 to-cyan-500',
            },
            {
              icon: Calendar,
              title: 'Book Instantly',
              description: 'Check availability, select your time slot, and book your session in just a few clicks.',
              color: 'from-purple-500 to-pink-500',
            },
            {
              icon: Mic2,
              title: 'Create Content',
              description: 'Show up and start recording. Focus on your content while we handle the rest.',
              color: 'from-orange-500 to-red-500',
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="card p-8 text-center hover-lift">
                <div className={`w-16 h-16 mx-auto mb-6 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
              {index < 2 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section-container bg-gray-50">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose PodzSpace?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to find and book the perfect recording space
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: 'Verified Studios',
              description: 'All studios are verified and quality-checked',
              color: 'text-green-600',
              bg: 'bg-green-100',
            },
            {
              icon: DollarSign,
              title: 'Transparent Pricing',
              description: 'No hidden fees, clear pricing upfront',
              color: 'text-blue-600',
              bg: 'bg-blue-100',
            },
            {
              icon: Headphones,
              title: 'Pro Equipment',
              description: 'Industry-standard recording equipment',
              color: 'text-purple-600',
              bg: 'bg-purple-100',
            },
            {
              icon: MapPin,
              title: 'Multiple Locations',
              description: 'Studios in cities across the country',
              color: 'text-red-600',
              bg: 'bg-red-100',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="card p-6 hover-lift"
            >
              <div className={`w-12 h-12 ${feature.bg} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Studios */}
      {featuredStudios.length > 0 && (
        <section className="section-container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Studios</h2>
              <p className="text-gray-600">Discover top-rated studios in your area</p>
            </div>
            <Link to="/search" className="btn btn-outline hover-lift">
              View All Studios
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredStudios.map((studio) => (
              <motion.div
                key={studio.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <Link to={`/studio/${studio.id}`} className="card overflow-hidden block hover-lift">
                  <div className="relative h-56">
                    <img
                      src={studio.images[0] || 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400'}
                      alt={studio.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full flex items-center space-x-1 shadow-elegant">
                      <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      <span className="font-semibold text-sm">{studio.averageRating.toFixed(1)}</span>
                    </div>
                    <button
                      onClick={(e) => toggleFavorite(e, studio.id)}
                      className="absolute top-4 left-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{studio.name}</h3>
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {studio.city}, {studio.state}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-2xl font-bold text-primary-600">
                        ${studio.pricePerHour}
                        <span className="text-sm text-gray-600 font-normal">/hour</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {studio.reviewCount} reviews
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section-container">
        <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl overflow-hidden shadow-elegant-xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center p-12 lg:p-16">
            <div className="text-white">
              <h2 className="text-4xl font-bold mb-6">Ready to Start Creating?</h2>
              <p className="text-xl text-primary-100 mb-8 leading-relaxed">
                Join thousands of content creators who trust PodzSpace for their recording needs. Book your first session today and get 20% off!
              </p>
              <div className="space-y-4 mb-8">
                {['Verified professional studios', 'Instant booking confirmation', '24/7 customer support', 'Cancel anytime'].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-300" />
                    <span className="text-lg">{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 inline-flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="hidden lg:block">
              <img
                src="https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop"
                alt="Podcast Recording"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
