import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/appointmentDate'

function AdminDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/dashboard/admin')
      setData(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  useEffect(() => {
    const handleFocus = () => {
      loadDashboard()
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  if (loading) {
    return (
      <section className="page page-wide">
        <p>Loading...</p>
      </section>
    )
  }

  const totals = data?.totals || {}
  const recentConsultations = data?.recentConsultations || []
  const upcomingAppointments = data?.upcomingAppointments || []

  return (
    <section className="page page-wide">
      <div className="page-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="dashboard-cards">
        <Link to="/admin/projects" className="dashboard-card">
          <h3>Projects</h3>
          <p className="dashboard-count">{totals.projects ?? 0}</p>
          <span>Total projects</span>
        </Link>

        <Link to="/admin/clients" className="dashboard-card">
          <h3>Clients</h3>
          <p className="dashboard-count">{totals.clients ?? 0}</p>
          <span>Registered clients</span>
        </Link>

        <Link to="/admin/consultations" className="dashboard-card">
          <h3>Consultations</h3>
          <p className="dashboard-count">{totals.consultations?.total ?? 0}</p>
          <span>All consultation requests</span>
        </Link>

        <Link to="/admin/consultations" className="dashboard-card">
          <h3>Pending Requests</h3>
          <p className="dashboard-count">{totals.consultations?.Pending ?? 0}</p>
          <span>Awaiting response</span>
        </Link>

        <Link to="/admin/appointments" className="dashboard-card">
          <h3>Upcoming Appointments</h3>
          <p className="dashboard-count">{upcomingAppointments.length}</p>
          <span>Scheduled</span>
        </Link>
      </div>

      <div className="dashboard-section">
        <div className="page-header">
          <h2>Recent Requests</h2>
          <Link to="/admin/consultations" className="btn btn-outline btn-small">
            View All
          </Link>
        </div>

        {recentConsultations.length === 0 ? (
          <p>No recent requests</p>
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
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {recentConsultations.map((item) => (
                  <tr key={item._id}>
                    <td>{item.client ? item.client.name : 'Unknown client'}</td>
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
      </div>

      <div className="dashboard-section">
        <div className="page-header">
          <h2>Upcoming Appointments</h2>
          <Link to="/admin/appointments" className="btn btn-outline btn-small">
            View All
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <p>No upcoming appointments</p>
        ) : (
          <div className="request-list">
            {upcomingAppointments.map((item) => (
              <div key={item._id} className="request-card">
                <div className="request-card-info">
                  <h3>
                    {formatDate(item.date)} at {item.timeSlot}
                  </h3>

                  <p>Client: {item.client ? item.client.name : 'Unknown client'}</p>
                  <p>Type: {item.meetingType}</p>
                  {item.consultation && <p>Consultation: {item.consultation.title}</p>}
                </div>

                <StatusBadge status={item.status} />

                <Link to="/admin/appointments" className="btn btn-outline btn-small">
                  Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AdminDashboard
