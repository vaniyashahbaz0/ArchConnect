import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/appointmentDate'

function ClientDetail() {
  const { id } = useParams()
  const [client, setClient] = useState(null)
  const [consultations, setConsultations] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadClientDetail = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/users/clients/${id}`)
        setClient(response.data.client)
        setConsultations(response.data.consultations || [])
        setAppointments(response.data.appointments || [])
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Client not found')
        } else {
          setError(err.response?.data?.message || 'Could not load client details')
        }
      } finally {
        setLoading(false)
      }
    }

    loadClientDetail()
  }, [id])

  if (loading) {
    return (
      <section className="page page-wide">
        <p>Loading...</p>
      </section>
    )
  }

  if (error || !client) {
    return (
      <section className="page page-wide">
        <p className="error">{error || 'Client not found'}</p>
        <Link to="/admin/clients" className="btn btn-outline">
          Back to Clients
        </Link>
      </section>
    )
  }

  return (
    <section className="page page-wide">
      <div className="page-header">
        <div>
          <h1>{client.name}</h1>
          <p>{client.email}</p>
          <small>Member since {new Date(client.createdAt).toLocaleDateString()}</small>
        </div>

        <Link to="/admin/clients" className="btn btn-outline btn-small">
          Back to Clients
        </Link>
      </div>

      <div className="dashboard-section">
        <h2>Consultation Requests ({consultations.length})</h2>

        {consultations.length === 0 ? (
          <p>No consultations found for this client</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Budget</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {consultations.map((item) => (
                  <tr key={item._id}>
                    <td>{item.title}</td>
                    <td>{item.projectType}</td>
                    <td>{item.budget ? `$${item.budget.toLocaleString()}` : '-'}</td>
                    <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td>
                      <Link to={`/consultations/${item._id}`} className="btn btn-outline btn-small">
                        View Request
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
        <h2>Appointments ({appointments.length})</h2>

        {appointments.length === 0 ? (
          <p>No appointments found for this client</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Meeting</th>
                  <th>Consultation</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {appointments.map((item) => (
                  <tr key={item._id}>
                    <td>{formatDate(item.date)}</td>
                    <td>{item.timeSlot}</td>
                    <td>{item.meetingType}</td>
                    <td>{item.consultation ? item.consultation.title : '-'}</td>

                    <td>
                      <StatusBadge status={item.status} />
                    </td>

                    <td>
                      <Link to="/admin/appointments" className="btn btn-outline btn-small">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}

export default ClientDetail
