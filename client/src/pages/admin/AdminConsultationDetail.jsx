import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import api from '../../api/axios'
import StatusBadge from '../../components/StatusBadge'
import { downloadAttachment, formatDate, formatFileSize } from '../../utils/downloadAttachment'

function AdminConsultationDetail() {
  const { id } = useParams()
  const [consultation, setConsultation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState('')

  useEffect(() => {
    const loadConsultation = async () => {
      try {
        const response = await api.get(`/consultations/${id}`)
        setConsultation(response.data)
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNotFound(true)
        } else {
          setError('Could not load this request')
        }
      } finally {
        setLoading(false)
      }
    }

    loadConsultation()
  }, [id])

  const handleDownload = async (file) => {
    setError('')
    setDownloading(file.filename)

    try {
      await downloadAttachment(consultation._id, file)
    } catch (err) {
      setError('Could not download the file')
    } finally {
      setDownloading('')
    }
  }

  if (loading) {
    return <p className="page-message">Loading...</p>
  }

  if (notFound) {
    return (
      <section className="page">
        <h1>Request not found</h1>
        <Link to="/admin/consultations" className="btn">
          Back to Consultations
        </Link>
      </section>
    )
  }

  const clientName = consultation.client?.name || '-'
  const clientEmail = consultation.client?.email || '-'

  return (
    <section className="page">
      <Link to="/admin/consultations">Back to Consultations</Link>

      <div className="detail-heading">
        <h1>{consultation.title}</h1>
        <StatusBadge status={consultation.status} />
      </div>

      {error && <p className="error">{error}</p>}

      <div className="detail-fields">
        <p>
          <strong>Client:</strong> {clientName}
        </p>
        <p>
          <strong>Email:</strong> {clientEmail}
        </p>
        <p>
          <strong>Project type:</strong> {consultation.projectType}
        </p>
        <p>
          <strong>Submitted:</strong> {formatDate(consultation.createdAt)}
        </p>
        <p>
          <strong>Budget:</strong> {consultation.budget || consultation.budget === 0 ? consultation.budget : '-'}
        </p>
        <p>
          <strong>Location:</strong> {consultation.location || '-'}
        </p>
        <p>
          <strong>Preferred start date:</strong> {formatDate(consultation.preferredStartDate)}
        </p>
      </div>

      <p className="detail-description">{consultation.description}</p>

      <h2>Attachments</h2>

      {consultation.attachments.length === 0 ? (
        <p>No attachments</p>
      ) : (
        <ul className="file-list">
          {consultation.attachments.map((file) => (
            <li key={file.filename}>
              <span>
                {file.originalName} ({formatFileSize(file.size)})
              </span>

              <button
                type="button"
                onClick={() => handleDownload(file)}
                disabled={downloading === file.filename}
                className="btn btn-outline btn-small"
              >
                {downloading === file.filename ? 'Downloading...' : 'Download'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default AdminConsultationDetail
