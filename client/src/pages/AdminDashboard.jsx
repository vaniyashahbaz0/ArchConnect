import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function AdminDashboard() {
  const { user } = useAuth()
  const [projectCount, setProjectCount] = useState(null)
  const [consultationCount, setConsultationCount] = useState(null)
  const [pendingCount, setPendingCount] = useState(null)

  useEffect(() => {
    const loadCounts = async () => {
      try {
        const response = await api.get('/projects')
        setProjectCount(response.data.length)
      } catch (err) {
        setProjectCount(null)
      }

      try {
        const response = await api.get('/consultations')
        const list = response.data

        setConsultationCount(list.length)
        setPendingCount(list.filter((item) => item.status === 'Pending').length)
      } catch (err) {
        setConsultationCount(null)
        setPendingCount(null)
      }
    }

    loadCounts()
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
          <p className="dashboard-count">{consultationCount === null ? '-' : consultationCount}</p>
          <span>{pendingCount === null ? '-' : pendingCount} pending</span>
        </Link>
      </div>
    </section>
  )
}

export default AdminDashboard
