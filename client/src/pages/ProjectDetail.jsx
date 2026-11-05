import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../api/axios'
import { getImageUrl } from '../utils/imageUrl'

function ProjectDetail() {
  const { id } = useParams()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState('')

  useEffect(() => {
    const loadProject = async () => {
      setLoading(true)
      setNotFound(false)
      setError('')

      try {
        const response = await api.get(`/projects/${id}`)
        setProject(response.data)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNotFound(true)
        } else {
          setError('Could not load this project')
        }
      } finally {
        setLoading(false)
      }
    }

    loadProject()
  }, [id])

  if (loading) {
    return <p className="page-message">Loading...</p>
  }

  if (notFound) {
    return (
      <section className="page">
        <h1>Project not found</h1>
        <Link to="/portfolio" className="btn">
          Back to Portfolio
        </Link>
      </section>
    )
  }

  if (error) {
    return <p className="page-message error">{error}</p>
  }

  return (
    <section className="page page-wide">
      <Link to="/portfolio">&larr; Back to Portfolio</Link>

      <h1>{project.title}</h1>

      <div className="detail-info">
        <span>{project.category}</span>
        <span className={`badge badge-${project.status}`}>{project.status}</span>
        {project.location && <span>{project.location}</span>}
        {project.year && <span>{project.year}</span>}
      </div>

      <p className="detail-description">{project.description}</p>

      {project.images.length > 0 && (
        <div className="gallery">
          {project.images.map((image) => (
            <img
              key={image}
              src={getImageUrl(image)}
              alt={project.title}
              onClick={() => setSelectedImage(image)}
            />
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="lightbox" onClick={() => setSelectedImage('')}>
          <img src={getImageUrl(selectedImage)} alt={project.title} />
        </div>
      )}
    </section>
  )
}

export default ProjectDetail
