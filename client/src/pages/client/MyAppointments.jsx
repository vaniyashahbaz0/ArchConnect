import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { formatDate, isUpcoming } from '../../utils/appointmentDate'

function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirmId, setConfirmId] = useState('')
  const [cancellingId, setCancellingId] = useState('')

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const response = await api.get('/appointments/my')
        setAppointments(response.data)
      } catch (err) {
        setError('Could not load your appointments')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [])

  const handleCancel = async (id) => {
    setError('')
    setCancellingId(id)

    try {
      const response = await api.patch(`/appointments/${id}/cancel`)

      setAppointments(
        appointments.map((item) => (item._id === id ? { ...item, status: response.data.status } : item))
      )
      setConfirmId('')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel the appointment')
    } finally {
      setCancellingId('')
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>My Appointments</h1>

        <Link to="/appointments/new" className="btn">
          Book Appointment
        </Link>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>You have not booked any appointments yet</p>
      ) : (
        <div className="request-list">
          {appointments.map((item) => (
            <div key={item._id} className="request-card">
              <div className="request-card-info">
                <h3>
                  {formatDate(item.date)} at {item.timeSlot}
                </h3>

                <p>{item.meetingType}</p>

                {item.consultation && (
                  <p>
                    Request:{' '}
                    <Link to={`/consultations/${item.consultation._id}`}>{item.consultation.title}</Link>
                  </p>
                )}

                {item.adminNote && <p>Note from admin: {item.adminNote}</p>}
              </div>

              <span className={`badge badge-${item.status}`}>{item.status}</span>

              {isUpcoming(item) &&
                (confirmId === item._id ? (
                  <div className="table-actions">
                    <span>Are you sure?</span>

                    <button
                      onClick={() => handleCancel(item._id)}
                      disabled={cancellingId === item._id}
                      className="btn btn-danger btn-small"
                    >
                      {cancellingId === item._id ? 'Cancelling...' : 'Yes'}
                    </button>

                    <button onClick={() => setConfirmId('')} className="btn btn-outline btn-small">
                      No
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(item._id)} className="btn btn-danger btn-small">
                    Cancel
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default MyAppointments
