import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'
import { getNextStatuses } from '../utils/statusRules'

function ConsultationDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'

  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        const response = await api.get(`/consultations/${id}`)
        setConsultation(response.data)
        setNewStatus(getNextStatuses('consultation', response.data.status)[0] || '')
        setAdminNote(response.data.adminNote || '')
      } catch (err) {
        if (err.response && (err.response.status === 404 || err.response.status === 403)) {
          setNotFound(true)
        } else {
          setError('Could not load this consultation')
        }
      } finally {
        setLoading(false)
      }
    }

    loadConsultation()
  }, [id])

  const handleDownload = async (file) => {
    setError('')

    try {
      const response = await api.get(`/consultations/${id}/attachments/${file.filename}`, {
        responseType: 'blob',
      })

      const url = URL.createObjectURL(response.data)
      const link = document.createElement('a')
      link.href = url
      link.download = file.originalName
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Could not download the file')
    }
  }

  const handleSave = async () => {
    setError('')
    setMessage('')
    setSaving(true)

    try {
      const response = await api.patch(`/consultations/${id}/status`, {
        status: newStatus,
        adminNote,
      })

      setConsultation({
        ...consultation,
        status: response.data.status,
        adminNote: response.data.adminNote,
        statusUpdatedAt: response.data.statusUpdatedAt,
      })
      setNewStatus(getNextStatuses('consultation', response.data.status)[0] || '')
      setMessage('Saved')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save the changes')
    } finally {
      setSaving(false)
    }
  }

  const nextStatuses = consultation ? getNextStatuses('consultation', consultation.status) : []

  const backLink = isAdmin ? '/admin/consultations' : '/consultations'

  if (loading) {
    return <p className="page-message">Loading...</p>
  }

  if (notFound) {
    return (
      <section className="page">
        <h1>Consultation not found</h1>
        <Link to={backLink} className="btn">
          Go Back
        </Link>
      </section>
    )
  }

  if (!consultation) {
    return (
      <section className="page">
        <p className="error">{error}</p>
      </section>
    )
  }

  return (
    <section className="page">
      <Link to={backLink}>&larr; Back</Link>

      <div className="page-header detail-header">
        <h1>{consultation.title}</h1>
        <StatusBadge status={consultation.status} />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="detail-fields">
        {isAdmin && consultation.client && (
          <p>
            <strong>Client:</strong> {consultation.client.name} ({consultation.client.email})
          </p>
        )}

        <p>
          <strong>Project type:</strong> {consultation.projectType}
        </p>

        <p>
          <strong>Submitted:</strong> {new Date(consultation.createdAt).toLocaleDateString()}
        </p>

        {consultation.statusUpdatedAt && (
          <p>
            <strong>Last updated:</strong> {new Date(consultation.statusUpdatedAt).toLocaleDateString()}
          </p>
        )}

        {consultation.location && (
          <p>
            <strong>Location:</strong> {consultation.location}
          </p>
        )}

        {consultation.budget !== undefined && consultation.budget !== null && (
          <p>
            <strong>Budget:</strong> {consultation.budget}
          </p>
        )}

        {consultation.preferredStartDate && (
          <p>
            <strong>Preferred start date:</strong>{' '}
            {new Date(consultation.preferredStartDate).toLocaleDateString()}
          </p>
        )}
      </div>

      <h3>Description</h3>
      <p className="detail-description">{consultation.description}</p>

      {consultation.adminNote && !isAdmin && (
        <div className="admin-note">
          <h3>Note from admin</h3>
          <p>{consultation.adminNote}</p>
        </div>
      )}

      {!isAdmin && (
        <Link to={`/appointments/new?consultation=${consultation._id}`} className="btn">
          Book appointment for this request
        </Link>
      )}

      <h3>Attachments</h3>

      {consultation.attachments.length === 0 ? (
        <p>No attachments</p>
      ) : (
        <ul className="file-list">
          {consultation.attachments.map((file) => (
            <li key={file.filename}>
              <button onClick={() => handleDownload(file)} className="link-button">
                {file.originalName}
              </button>
            </li>
          ))}
        </ul>
      )}

      {isAdmin && nextStatuses.length === 0 && (
        <p>This request is {consultation.status} and its status can no longer be changed.</p>
      )}

      {isAdmin && nextStatuses.length > 0 && (
        <div className="form-card project-form admin-panel">
          <h3>Update request</h3>

          {message && <p className="success">{message}</p>}

          <label>Status</label>
          <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
            {nextStatuses.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label>Admin note</label>
          <textarea
            rows="4"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
          ></textarea>

          <div className="form-buttons">
            <button onClick={handleSave} disabled={saving} className="btn">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}

export default ConsultationDetail
