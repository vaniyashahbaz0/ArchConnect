import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { formatDate, isUpcoming } from '../utils/appointmentDate'

const statuses = ['Pending', 'Approved', 'Rejected', 'Completed']

function ClientDashboard() {
  const { user } = useAuth()
  const [consultations, setConsultations] = useState(null)
  const [appointments, setAppointments] = useState(null)

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await api.get('/appointments/my')
        setAppointments(response.data)
      } catch (err) {
        setAppointments(null)
      }
    }

    loadAppointments()
  }, [])

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

  const nextAppointment = appointments ? appointments.find(isUpcoming) : null

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

      <h2>Next Appointment</h2>

      {appointments === null ? (
        <p>Loading...</p>
      ) : nextAppointment ? (
        <div className="request-card">
          <div className="request-card-info">
            <h3>
              {formatDate(nextAppointment.date)} at {nextAppointment.timeSlot}
            </h3>

            <p>{nextAppointment.meetingType}</p>
          </div>

          <span className={`badge badge-${nextAppointment.status}`}>{nextAppointment.status}</span>

          <Link to="/appointments" className="btn btn-outline btn-small">
            View All
          </Link>
        </div>
      ) : (
        <>
          <p>No upcoming appointments</p>

          <Link to="/appointments/new" className="btn">
            Book Appointment
          </Link>
        </>
      )}
    </section>
  )
}

export default ClientDashboard
