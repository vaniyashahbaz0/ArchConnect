import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { formatFileSize } from '../../utils/downloadAttachment'

const projectTypes = ['Residential', 'Commercial', 'Interior', 'Landscape', 'Renovation', 'Other']
const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'webp', 'doc', 'docx', 'dwg']
const maxFiles = 5
const maxFileSize = 10 * 1024 * 1024

function NewConsultation() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [projectType, setProjectType] = useState('Residential')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [preferredStartDate, setPreferredStartDate] = useState('')
  const [files, setFiles] = useState([])
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const getErrorMessages = (err) => {
    const data = err.response?.data

    if (data && data.errors && data.errors.length > 0) {
      return data.errors.map((item) => item.msg)
    }

    return [data?.message || 'Could not reach the server']
  }

  const handleFilesChange = (e) => {
    const picked = Array.from(e.target.files)
    const messages = []
    const accepted = []

    picked.forEach((file) => {
      const extension = file.name.split('.').pop().toLowerCase()

      if (!allowedExtensions.includes(extension)) {
        messages.push(file.name + ' is not an allowed file type')
        return
      }

      if (file.size > maxFileSize) {
        messages.push(file.name + ' is larger than 10MB')
        return
      }

      accepted.push(file)
    })

    if (files.length + accepted.length > maxFiles) {
      messages.push('You can upload a maximum of 5 files')
      setErrors(messages)
      e.target.value = ''
      return
    }

    setFiles([...files, ...accepted])
    setErrors(messages)
    e.target.value = ''
  }

  const handleRemoveFile = (index) => {
    setFiles(files.filter((file, fileIndex) => fileIndex !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setSubmitting(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('projectType', projectType)
    formData.append('description', description)

    if (budget) {
      formData.append('budget', budget)
    }

    if (location) {
      formData.append('location', location)
    }

    if (preferredStartDate) {
      formData.append('preferredStartDate', preferredStartDate)
    }

    files.forEach((file) => formData.append('attachments', file))

    try {
      await api.post('/consultations', formData)
      navigate('/dashboard/consultations')
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
          {projectTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <label>Description</label>
        <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)}></textarea>

        <label>Budget</label>
        <input type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} />

        <label>Location</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />

        <label>Preferred start date</label>
        <input
          type="date"
          value={preferredStartDate}
          onChange={(e) => setPreferredStartDate(e.target.value)}
        />

        <label>Documents</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.dwg"
          multiple
          onChange={handleFilesChange}
        />
        <p className="field-note">Up to 5 files. Each file must be 10MB or smaller.</p>

        {files.length > 0 && (
          <ul className="file-list">
            {files.map((file, index) => (
              <li key={file.name + index}>
                <span>
                  {file.name} ({formatFileSize(file.size)})
                </span>

                <button type="button" onClick={() => handleRemoveFile(index)} className="btn btn-outline btn-small">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="form-buttons">
          <button type="submit" disabled={submitting} className="btn">
            {submitting ? 'Sending...' : 'Submit Request'}
          </button>

          <Link to="/dashboard/consultations" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default NewConsultation
