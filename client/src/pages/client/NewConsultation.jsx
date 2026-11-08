import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const projectTypes = ['Residential', 'Commercial', 'Interior', 'Landscape', 'Renovation', 'Other']

function NewConsultation() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [projectType, setProjectType] = useState('Residential')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')
  const [preferredStartDate, setPreferredStartDate] = useState('')
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const handleFilesChange = (e) => {
    setFiles(Array.from(e.target.files))
  }

  const getErrorMessages = (err) => {
    const data = err.response?.data

    if (data && data.errors && data.errors.length > 0) {
      return data.errors.map((item) => item.msg)
    }

    return [data?.message || 'Could not reach the server']
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setSubmitting(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('projectType', projectType)
    formData.append('description', description)

    if (location) {
      formData.append('location', location)
    }

    if (budget) {
      formData.append('budget', budget)
    }

    if (preferredStartDate) {
      formData.append('preferredStartDate', preferredStartDate)
    }

    files.forEach((file) => formData.append('attachments', file))

    try {
      await api.post('/consultations', formData)
      navigate('/consultations')
    } catch (err) {
      setErrors(getErrorMessages(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="form-card project-form">
        <h2>New Consultation Request</h2>

        {errors.length > 0 && (
          <ul className="error">
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}

        <label>Title</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />

        <label>Project type</label>
        <select value={projectType} onChange={(e) => setProjectType(e.target.value)}>
          {projectTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label>Description</label>
        <textarea
          rows="5"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        ></textarea>

        <label>Location</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />

        <label>Budget</label>
        <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} />

        <label>Preferred start date</label>
        <input
          type="date"
          value={preferredStartDate}
          onChange={(e) => setPreferredStartDate(e.target.value)}
        />

        <label>Attachments (max 5 files, 10MB each)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          multiple
          onChange={handleFilesChange}
        />

        {files.length > 0 && (
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        )}

        <div className="form-buttons">
          <button type="submit" disabled={submitting} className="btn">
            {submitting ? 'Sending...' : 'Send Request'}
          </button>

          <Link to="/consultations" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default NewConsultation
