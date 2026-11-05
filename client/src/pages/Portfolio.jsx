import { useEffect, useState } from 'react'
import api from '../api/axios'
import ProjectCard from '../components/ProjectCard'

const categories = ['Residential', 'Commercial', 'Interior', 'Landscape', 'Other']
const statuses = ['completed', 'ongoing']

function Portfolio() {
  const [projects, setProjects] = useState([])
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true)
      setError('')

      const params = {}
      if (category) params.category = category
      if (status) params.status = status

      try {
        const response = await api.get('/projects', { params })
        setProjects(response.data)
      } catch (err) {
        setError('Could not load projects')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [category, status])

  return (
    <section className="page page-wide">
      <h1>Our Portfolio</h1>

      <div className="filters">
        <div className="filter-group">
          <button
            onClick={() => setCategory('')}
            className={category === '' ? 'filter-btn active' : 'filter-btn'}
          >
            All
          </button>

          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={category === item ? 'filter-btn active' : 'filter-btn'}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <button
            onClick={() => setStatus('')}
            className={status === '' ? 'filter-btn active' : 'filter-btn'}
          >
            Any status
          </button>

          {statuses.map((item) => (
            <button
              key={item}
              onClick={() => setStatus(item)}
              className={status === item ? 'filter-btn active' : 'filter-btn'}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p>No projects yet</p>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </section>
  )
}

export default Portfolio
