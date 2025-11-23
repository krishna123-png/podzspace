import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studiosAPI } from '@/lib/api'
import { Upload, Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'

const AddStudioPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    pricePerHour: '',
    capacity: '',
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([''])
  const [equipment, setEquipment] = useState<string[]>([''])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setImageFiles([...imageFiles, ...newFiles])

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index))
    setImagePreviews(imagePreviews.filter((_, i) => i !== index))
  }

  const handleArrayChange = (index: number, value: string, type: 'amenities' | 'equipment') => {
    if (type === 'amenities') {
      const newAmenities = [...amenities]
      newAmenities[index] = value
      setAmenities(newAmenities)
    } else {
      const newEquipment = [...equipment]
      newEquipment[index] = value
      setEquipment(newEquipment)
    }
  }

  const addArrayField = (type: 'amenities' | 'equipment') => {
    if (type === 'amenities') {
      setAmenities([...amenities, ''])
    } else {
      setEquipment([...equipment, ''])
    }
  }

  const removeArrayField = (index: number, type: 'amenities' | 'equipment') => {
    if (type === 'amenities') {
      setAmenities(amenities.filter((_, i) => i !== index))
    } else {
      setEquipment(equipment.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // For now, we'll use placeholder URLs since we don't have actual file upload
      // In production, you would upload files to Cloudinary/S3 first
      const imageUrls = imagePreviews.length > 0 
        ? imagePreviews 
        : ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800']

      const studioData = {
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour),
        capacity: parseInt(formData.capacity),
        images: imageUrls,
        amenities: amenities.filter(amenity => amenity.trim() !== ''),
        equipment: equipment.filter(equip => equip.trim() !== ''),
      }

      await studiosAPI.create(studioData)
      toast.success('Studio added successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add studio')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Add New Studio</h1>
        <p className="text-gray-600 mb-8">Fill in the details to list your podcast studio</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Studio Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Premium Podcast Studio"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input min-h-[120px]"
                  placeholder="Describe your studio, its features, and what makes it special..."
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Hour ($) *
                  </label>
                  <input
                    type="number"
                    name="pricePerHour"
                    value={formData.pricePerHour}
                    onChange={handleChange}
                    className="input"
                    placeholder="50"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity (people) *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    className="input"
                    placeholder="4"
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Location</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="123 Main Street"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="input"
                    placeholder="New York"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className="input"
                    placeholder="NY"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP Code *
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className="input"
                    placeholder="10001"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Studio Images</h2>
            
            <div className="mb-4">
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="mb-2 text-sm text-gray-600">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB each)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg"
                  multiple
                  onChange={handleImageChange}
                />
              </label>
            </div>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-gray-500 mt-3">
              Upload high-quality images of your studio space
            </p>
          </div>

          {/* Amenities */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Amenities</h2>
              <button
                type="button"
                onClick={() => addArrayField('amenities')}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Amenity
              </button>
            </div>
            
            <div className="space-y-3">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={amenity}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'amenities')}
                    className="input flex-1"
                    placeholder="e.g., Free WiFi, Parking, Coffee"
                  />
                  {amenities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'amenities')}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Equipment */}
          <div className="card p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Equipment</h2>
              <button
                type="button"
                onClick={() => addArrayField('equipment')}
                className="text-primary-600 hover:text-primary-700 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Equipment
              </button>
            </div>
            
            <div className="space-y-3">
              {equipment.map((equip, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={equip}
                    onChange={(e) => handleArrayChange(index, e.target.value, 'equipment')}
                    className="input flex-1"
                    placeholder="e.g., Shure SM7B Microphone, Focusrite Interface"
                  />
                  {equipment.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayField(index, 'equipment')}
                      className="text-red-500 hover:text-red-700 p-2"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Adding Studio...' : 'Add Studio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddStudioPage
