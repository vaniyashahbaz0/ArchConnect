import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/downloadAttachment'

function MyConsultations() {
  const navigate = useNavigate()
  const [consultations, setConsultations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <section className="page page-wide">
      <div className="page-header">
        <h1>My Requests</h1>

        <Link to="/dashboard/consultations/new" className="btn">
          New Request
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : consultations.length === 0 ? (
        <div>
          <p>No requests yet</p>
          <Link to="/dashboard/consultations/new" className="btn">
            New Request
          </Link>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Project type</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {consultations.map((consultation) => (
                <tr
                  key={consultation._id}
                  className="clickable-row"
                  onClick={() => navigate(`/dashboard/consultations/${consultation._id}`)}
                >
                  <td>{consultation.title}</td>
                  <td>{consultation.projectType}</td>
                  <td>{formatDate(consultation.createdAt)}</td>
                  <td>
                    <StatusBadge status={consultation.status} />
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

export default MyConsultations
