import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function AdminDashboard() {
  const { user } = useAuth()
  const [projectCount, setProjectCount] = useState(null)

  const [pendingCount, setPendingCount] = useState(null)

  useEffect(() => {
    const loadCount = async () => {
      try {
        const response = await api.get('/projects')
        setProjectCount(response.data.length)
      } catch (err) {
        setProjectCount(null)
      }
    }

    const loadPendingCount = async () => {
      try {
        const response = await api.get('/consultations', { params: { status: 'Pending' } })
        setPendingCount(response.data.length)
      } catch (err) {
        setPendingCount(null)
      }
    }

    loadCount()
    loadPendingCount()
  }, [])

  return (
    <section className="page">
      <h1>Admin Dashboard</h1>
      <p>Name: {user.name}</p>
      <p>Role: {user.role}</p>

      <div className="dashboard-cards">
        <Link to="/admin/projects" className="dashboard-card">
          <h3>Manage Projects</h3>
          <p className="dashboard-count">{projectCount === null ? '-' : projectCount}</p>
          <span>Total projects</span>
        </Link>

        <Link to="/admin/consultations" className="dashboard-card">
          <h3>Consultations</h3>
          <p className="dashboard-count">{pendingCount === null ? '-' : pendingCount}</p>
          <span>Pending requests</span>
        </Link>
      </div>
    </section>
  )
}

export default AdminDashboard
