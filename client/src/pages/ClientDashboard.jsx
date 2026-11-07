import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function ClientDashboard() {
  const { user } = useAuth()
  const [requestCount, setRequestCount] = useState(null)

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await api.get('/consultations/my')
        setRequestCount(response.data.length)
      } catch (err) {
        setRequestCount(null)
      }
    }

    loadCount()
  }, [])

  return (
    <section className="page">
      <h1>Client Dashboard</h1>
      <p>Name: {user.name}</p>
      <p>Role: {user.role}</p>

      <div className="dashboard-cards">
        <Link to="/dashboard/consultations/new" className="dashboard-card">
          <h3>New Request</h3>
          <p>Start a consultation request</p>
        </Link>

        <Link to="/dashboard/consultations" className="dashboard-card">
          <h3>My Requests</h3>
          <p className="dashboard-count">{requestCount === null ? '-' : requestCount}</p>
          <span>Your consultation requests</span>
        </Link>
      </div>
    </section>
  )
}

export default ClientDashboard
