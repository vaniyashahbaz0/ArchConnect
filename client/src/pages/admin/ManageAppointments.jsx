import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/appointmentDate'
import { getNextStatuses } from '../../utils/statusRules'

const statuses = ['All', 'Pending', 'Approved', 'Rejected', 'Completed', 'Cancelled']

function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [activeStatus, setActiveStatus] = useState('All')
  const [dateFilter, setDateFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [newStatuses, setNewStatuses] = useState({})
  const [notes, setNotes] = useState({})
  const [savingId, setSavingId] = useState('')

  useEffect(() => {
    const loadAppointments = async () => {
      setLoading(true)
      setError('')

      try {
        const params = {}

        if (activeStatus !== 'All') {
          params.status = activeStatus
        }

        if (dateFilter) {
          params.date = dateFilter
        }

        const response = await api.get('/appointments', { params })
        setAppointments(response.data)
        setNewStatuses({})
        setNotes({})
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load appointments')
      } finally {
        setLoading(false)
      }
    }

    loadAppointments()
  }, [activeStatus, dateFilter])

  const handleSave = async (item) => {
    setError('')
    setSavingId(item._id)

    const data = { status: newStatuses[item._id] }

    if (notes[item._id] !== undefined) {
      data.adminNote = notes[item._id]
    }

    try {
      const response = await api.patch(`/appointments/${item._id}/status`, data)

      setAppointments(
        appointments.map((row) =>
          row._id === item._id
            ? {
                ...row,
                status: response.data.status,
                adminNote: response.data.adminNote,
                statusUpdatedAt: response.data.statusUpdatedAt,
              }
            : row
        )
      )

      setNewStatuses({ ...newStatuses, [item._id]: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the changes')
    } finally {
      setSavingId('')
    }
  }

  return (
    <section className="page page-wide">
      <div className="page-header">
        <h1>Appointments</h1>
      </div>

      <div className="filters">
        <div className="filter-group">
          {statuses.map((item) => (
            <button
              key={item}
              onClick={() => setActiveStatus(item)}
              className={activeStatus === item ? 'filter-btn active' : 'filter-btn'}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="filter-group">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />

          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="btn btn-outline btn-small">
              Clear date
            </button>
          )}
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Date</th>
                <th>Time</th>
                <th>Meeting</th>
                <th>Consultation</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((item) => {
                const nextStatuses = getNextStatuses('appointment', item.status)

                return (
                  <tr key={item._id}>
                    <td>
                      {item.client ? (
                        <>
                          {item.client.name}
                          <br />
                          <small>{item.client.email}</small>
                        </>
                      ) : (
                        'Deleted user'
                      )}
                    </td>

                    <td>{formatDate(item.date)}</td>
                    <td>{item.timeSlot}</td>
                    <td>{item.meetingType}</td>

                    <td>
                      {item.consultation ? (
                        <Link to={`/consultations/${item.consultation._id}`}>{item.consultation.title}</Link>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td>
                      <StatusBadge status={item.status} />

                      {item.statusUpdatedAt && (
                        <>
                          <br />
                          <small>Updated {new Date(item.statusUpdatedAt).toLocaleDateString()}</small>
                        </>
                      )}
                    </td>

                    <td>
                      {nextStatuses.length === 0 ? (
                        <small>Final status</small>
                      ) : (
                        <div className="status-actions">
                          <select
                            value={newStatuses[item._id] || ''}
                            onChange={(e) => setNewStatuses({ ...newStatuses, [item._id]: e.target.value })}
                          >
                            <option value="">Change status...</option>
                            {nextStatuses.map((next) => (
                              <option key={next} value={next}>
                                {next}
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            placeholder="Admin note"
                            value={notes[item._id] !== undefined ? notes[item._id] : item.adminNote || ''}
                            onChange={(e) => setNotes({ ...notes, [item._id]: e.target.value })}
                          />

                          <button
                            onClick={() => handleSave(item)}
                            disabled={!newStatuses[item._id] || savingId === item._id}
                            className="btn btn-small"
                          >
                            {savingId === item._id ? 'Saving...' : 'Save'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ManageAppointments
