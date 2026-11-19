import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'

function MyConsultations() {
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const [deletingId, setDeletingId] = useState('')

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const response = await api.get('/consultations/my')
        setConsultations(response.data)
      } catch (err) {
        setError('Could not load your requests')
      } finally {
        setLoading(false)
      }
    }

    loadConsultations()
  }, [])

  const handleDelete = async (id) => {
    setError('')
    setDeletingId(id)

    try {
      await api.delete(`/consultations/${id}`)
      setConsultations(consultations.filter((item) => item._id !== id))
      setConfirmId('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete the request')
    } finally {
      setDeletingId('')
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>My Requests</h1>

        <Link to="/consultations/new" className="btn">
          New Request
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : consultations.length === 0 ? (
        <p>You have not sent any requests yet</p>
      ) : (
        <div className="request-list">
          {consultations.map((item) => (
            <div key={item._id} className="request-card">
              <div className="request-card-info">
                <Link to={`/consultations/${item._id}`}>
                  <h3>{item.title}</h3>
                </Link>

                <p>
                  {item.projectType} - submitted {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              <StatusBadge status={item.status} />

              {item.status === 'Pending' &&
                (confirmId === item._id ? (
                  <div className="table-actions">
                    <span>Are you sure?</span>

                    <button
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                      className="btn btn-danger btn-small"
                    >
                      {deletingId === item._id ? 'Deleting...' : 'Yes'}
                    </button>

                    <button onClick={() => setConfirmId('')} className="btn btn-outline btn-small">
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(item._id)}
                    className="btn btn-danger btn-small"
                  >
                    Delete
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyConsultations
