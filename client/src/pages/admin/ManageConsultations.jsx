import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/downloadAttachment'

const statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Completed']

function ManageConsultations() {
  const [consultations, setConsultations] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadConsultations = async () => {
      setLoading(true)
      setError('')

      const path =
        statusFilter === 'All' ? '/consultations' : `/consultations?status=${statusFilter}`

      try {
        const response = await api.get(path)
        setConsultations(response.data)
      } catch (err) {
        setError('Could not load consultation requests')
      } finally {
        setLoading(false)
      }
    }

    loadConsultations()
  }, [statusFilter])

  return (
    <section className="page page-wide">
      <div className="page-header">
        <h1>Consultations</h1>

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : consultations.length === 0 ? (
        <p>No consultation requests</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Email</th>
                <th>Title</th>
                <th>Project type</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {consultations.map((consultation) => (
                <tr key={consultation._id}>
                  <td>{consultation.client?.name || '-'}</td>
                  <td>{consultation.client?.email || '-'}</td>
                  <td>{consultation.title}</td>
                  <td>{consultation.projectType}</td>
                  <td>{formatDate(consultation.createdAt)}</td>
                  <td>
                    <StatusBadge status={consultation.status} />
                  </td>
                  <td>
                    <Link to={`/admin/consultations/${consultation._id}`} className="btn btn-outline btn-small">
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
