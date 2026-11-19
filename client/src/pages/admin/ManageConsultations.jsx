import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'

const statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Completed']

function ManageConsultations() {
  const [consultations, setConsultations] = useState([])
  const [activeStatus, setActiveStatus] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadConsultations = async () => {
      setLoading(true)
      setError('')

      try {
        const params = activeStatus === 'All' ? {} : { status: activeStatus }
        const response = await api.get('/consultations', { params })
        setConsultations(response.data)
      } catch (err) {
        setError('Could not load consultations')
      } finally {
        setLoading(false)
      }
    }

    loadConsultations()
  }, [activeStatus])

  return (
    <section className="page page-wide">
      <div className="page-header">
        <h1>Consultations</h1>
      </div>

      <div className="filters">
        <div className="filter-group">
          {statuses.map((item) => (
            <button
              key={item}
              onClick={() => setActiveStatus(item)}
              className={activeStatus === item ? 'filter-btn active' : 'filter-btn'}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : consultations.length === 0 ? (
        <p>No consultations found</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Title</th>
                <th>Type</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {consultations.map((item) => (
                <tr key={item._id}>
                  <td>{item.client ? item.client.name : 'Deleted user'}</td>
                  <td>{item.title}</td>
                  <td>{item.projectType}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                  <td>
                    <StatusBadge status={item.status} />
                  </td>

                  <td>
                    <Link to={`/consultations/${item._id}`} className="btn btn-outline btn-small">
                      View
                    </Link>
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

export default ManageConsultations
