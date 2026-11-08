import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const statuses = ['Pending', 'Approved', 'Rejected', 'Completed']

function ClientDashboard() {
  const { user } = useAuth()
  const [consultations, setConsultations] = useState(null)

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const response = await api.get('/consultations/my')
        setConsultations(response.data)
      } catch (err) {
        setConsultations(null)
      }
    }

    loadConsultations()
  }, [])

  const countByStatus = (status) => {
    if (consultations === null) return '-'

    return consultations.filter((item) => item.status === status).length
  }

  return (
    <section className="page">
      <h1>Client Dashboard</h1>
      <p>Name: {user.name}</p>
      <p>Role: {user.role}</p>

      <h2>My Requests</h2>

      <div className="status-counts">
        {statuses.map((status) => (
          <div key={status} className="status-count">
            <strong>{countByStatus(status)}</strong>
            <span className={`badge badge-${status}`}>{status}</span>
          </div>
        ))}
      </div>

      <Link to="/consultations" className="btn">
        View My Requests
      </Link>
    </section>
  )
}

export default ClientDashboard
