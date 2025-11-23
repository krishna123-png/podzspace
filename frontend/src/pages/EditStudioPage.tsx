import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { studiosAPI } from '@/lib/api'
import { Upload, Plus, X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const EditStudioPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [studio, setStudio] = useState<any>(null)
  
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

  useEffect(() => {
    loadStudio()
  }, [id])

  const loadStudio = async () => {
    try {
      const response = await studiosAPI.getById(id!)
      const studioData = response.data.studio
      setStudio(studioData)
      
      setFormData({
        name: studioData.name,
        description: studioData.description,
        address: studioData.address,
        city: studioData.city,
        state: studioData.state,
        zipCode: studioData.zipCode,
        pricePerHour: studioData.pricePerHour.toString(),
        capacity: studioData.capacity.toString(),
      })
      
      setImagePreviews(studioData.images || [])
      setAmenities(studioData.amenities?.length > 0 ? studioData.amenities : [''])
      setEquipment(studioData.equipment?.length > 0 ? studioData.equipment : [''])
    } catch (error) {
      toast.error('Failed to load studio')
      navigate('/dashboard')
    }
  }

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

    newFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
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
      const studioData = {
        ...formData,
        pricePerHour: parseFloat(formData.pricePerHour),
        capacity: parseInt(formData.capacity),
        images: imagePreviews,
        amenities: amenities.filter(amenity => amenity.trim() !== ''),
        equipment: equipment.filter(equip => equip.trim() !== ''),
      }

      await studiosAPI.update(id!, studioData)
      toast.success('Studio updated successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update studio')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this studio? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await studiosAPI.delete(id!)
      toast.success('Studio deleted successfully!')
      navigate('/dashboard')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete studio')
      setDeleting(false)
    }
  }

  if (!studio) {
    return (
      <div className="section-container">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading studio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="section-container">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Edit Studio</h1>
            <p className="text-gray-600">Update your studio information</p>
          </div>
          <button
            onClick={handleDelete}
            className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
            disabled={deleting}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? 'Deleting...' : 'Delete Studio'}
          </button>
        </div>

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
              {loading ? 'Updating...' : 'Update Studio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditStudioPage
