import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/imageUrl'

const categories = ['Residential', 'Commercial', 'Interior', 'Landscape', 'Other']

function ProjectForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Residential')
  const [status, setStatus] = useState('ongoing')
  const [location, setLocation] = useState('')
  const [year, setYear] = useState('')
  const [existingImages, setExistingImages] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [errors, setErrors] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [notFound, setNotFound] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [removingImage, setRemovingImage] = useState('')

  useEffect(() => {
    if (!isEdit) return

    const loadProject = async () => {
      try {
        const response = await api.get(`/projects/${id}`)
        const project = response.data

        setTitle(project.title)
        setDescription(project.description)
        setCategory(project.category)
        setStatus(project.status)
        setLocation(project.location || '')
        setYear(project.year || '')
        setExistingImages(project.images)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNotFound(true)
        } else {
          setErrors(['Could not load this project'])
        }
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id, isEdit])

  useEffect(() => {
    const urls = newFiles.map((file) => URL.createObjectURL(file))
    setPreviews(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [newFiles])

  const handleFilesChange = (e) => {
    setNewFiles(Array.from(e.target.files))
  }

  const handleRemoveNewFile = (index) => {
    setNewFiles(newFiles.filter((file, fileIndex) => fileIndex !== index))
  }

  const handleRemoveExistingImage = async (imagePath) => {
    setErrors([])
    setRemovingImage(imagePath)

    try {
      await api.delete(`/projects/${id}/images`, { data: { path: imagePath } })
      setExistingImages(existingImages.filter((image) => image !== imagePath))
    } catch (err) {
      setErrors([err.response?.data?.message || 'Could not remove the image'])
    } finally {
      setRemovingImage('')
    }
  }

  const getErrorMessages = (err) => {
    const data = err.response?.data

    if (data && data.errors && data.errors.length > 0) {
      return data.errors.map((item) => item.msg)
    }

    return [data?.message || 'Could not reach the server']
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setSubmitting(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('description', description)
    formData.append('category', category)
    formData.append('status', status)
    formData.append('location', location)

    if (year) {
      formData.append('year', year)
    }

    newFiles.forEach((file) => formData.append('images', file))

    try {
      if (isEdit) {
        await api.put(`/projects/${id}`, formData)
      } else {
        await api.post('/projects', formData)
      }

      navigate('/admin/projects')
    } catch (err) {
      setErrors(getErrorMessages(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="page-message">Loading...</p>
  }

  if (notFound) {
    return (
      <section className="page">
        <h1>Project not found</h1>
        <Link to="/admin/projects" className="btn">
          Back to Projects
        </Link>
      </section>
    )
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="form-card project-form">
        <h2>{isEdit ? 'Edit Project' : 'Add Project'}</h2>

        {errors.length > 0 && (
          <ul className="error">
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}

        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Description</label>
        <textarea
          rows="5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <label>Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
        </select>

        <label>Location</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />

        <label>Year</label>
        <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />

        {isEdit && existingImages.length > 0 && (
          <>
            <label>Current images</label>
            <div className="image-previews">
              {existingImages.map((image) => (
                <div key={image} className="image-preview">
                  <img src={getImageUrl(image)} alt="Project" />

                  <button
                    type="button"
                    onClick={() => handleRemoveExistingImage(image)}
                    disabled={removingImage === image}
                    className="image-remove"
                  >
                    {removingImage === image ? '...' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        <label>{isEdit ? 'Add more images' : 'Images'}</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleFilesChange}
        />

        {previews.length > 0 && (
          <div className="image-previews">
            {previews.map((url, index) => (
              <div key={url} className="image-preview">
                <img src={url} alt="Preview" />

                <button type="button" onClick={() => handleRemoveNewFile(index)} className="image-remove">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="form-buttons">
          <button type="submit" disabled={submitting} className="btn">
            {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Project'}
          </button>

          <Link to="/admin/projects" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default ProjectForm
