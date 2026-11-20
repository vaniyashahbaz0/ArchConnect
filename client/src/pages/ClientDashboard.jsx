import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/appointmentDate'
import { formatRelativeTime } from '../utils/timeAgo'

const statuses = ['Pending', 'Approved', 'Rejected', 'Completed']

function ClientDashboard() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/dashboard/client')
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
      <section className="page">
        <p>Loading...</p>
      </section>
    )
  }

  const consultationCounts = data?.consultationCounts || {}
  const upcomingAppointments = data?.upcomingAppointments || []
  const recentUpdates = data?.recentUpdates || []

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Welcome, {user?.name}</h1>
          <p>Manage your architectural consultation requests and scheduled appointments</p>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="dashboard-actions">
        <Link to="/consultations/new" className="btn">
          New Request
        </Link>

        <Link to="/appointments/new" className="btn">
          Book Appointment
        </Link>

        <Link to="/consultations" className="btn btn-outline">
          My Requests
        </Link>

        <Link to="/appointments" className="btn btn-outline">
          My Appointments
        </Link>
      </div>

      <h2>Consultation Requests</h2>

      <div className="dashboard-cards">
        {statuses.map((status) => (
          <Link key={status} to="/consultations" className="dashboard-card">
            <h3>{status}</h3>
            <p className="dashboard-count">{consultationCounts[status] ?? 0}</p>
            <span>View requests</span>
          </Link>
        ))}
      </div>

      <div className="dashboard-section">
        <h2>Upcoming Appointments</h2>

        {upcomingAppointments.length === 0 ? (
          <div>
            <p>No upcoming appointments</p>
            <Link to="/appointments/new" className="btn btn-small">
              Book Appointment
            </Link>
          </div>
        ) : (
          <div className="request-list">
            {upcomingAppointments.map((item) => (
              <div key={item._id} className="request-card">
                <div className="request-card-info">
                  <h3>
                    {formatDate(item.date)} at {item.timeSlot}
                  </h3>

                  <p>{item.meetingType}</p>

                  {item.consultation && <p>Request: {item.consultation.title}</p>}
                </div>

                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Recent Updates</h2>

        {recentUpdates.length === 0 ? (
          <p>No recent updates</p>
        ) : (
          <div className="request-list">
            {recentUpdates.map((item) => (
              <Link key={`${item.type}-${item.id}`} to={item.link} className="request-card">
                <div className="request-card-info">
                  <h3>{item.title}</h3>

                  <p>
                    {item.type === 'consultation' ? 'Consultation Request' : 'Appointment'} &bull; Updated{' '}
                    {formatRelativeTime(item.updatedAt)}
                  </p>
                </div>

                <StatusBadge status={item.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default ClientDashboard
