import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { getImageUrl } from '../../utils/imageUrl'

function ManageProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/projects')
        setProjects(response.data)
      } catch (err) {
        setError('Could not load projects')
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  const handleDelete = async (id) => {
    setError('')
    setDeletingId(id)

    try {
      await api.delete(`/projects/${id}`)
      setProjects(projects.filter((project) => project._id !== id))
      setConfirmId('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the project')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className="page page-wide">
      <div className="page-header">
        <h1>Manage Projects</h1>

        <Link to="/admin/projects/new" className="btn">
          Add Project
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : projects.length === 0 ? (
        <p>No projects yet</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((project) => (
                <tr key={project._id}>
                  <td>
                    {project.images.length > 0 ? (
                      <img
                        src={getImageUrl(project.images[0])}
                        alt={project.title}
                        className="table-thumb"
                      />
                    ) : (
                      <div className="table-thumb table-thumb-empty">None</div>
                    )}
                  </td>

                  <td>{project.title}</td>
                  <td>{project.category}</td>

                  <td>
                    <span className={`badge badge-${project.status}`}>{project.status}</span>
                  </td>

                  <td>
                    {confirmId === project._id ? (
                      <div className="table-actions">
                        <span>Are you sure?</span>

                        <button
                          onClick={() => handleDelete(project._id)}
                          disabled={deletingId === project._id}
                          className="btn btn-danger btn-small"
                        >
                          {deletingId === project._id ? 'Deleting...' : 'Yes'}
                        </button>

                        <button
                          onClick={() => setConfirmId('')}
                          className="btn btn-outline btn-small"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="table-actions">
                        <Link
                          to={`/admin/projects/${project._id}/edit`}
                          className="btn btn-outline btn-small"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => setConfirmId(project._id)}
                          className="btn btn-danger btn-small"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ManageProjects
