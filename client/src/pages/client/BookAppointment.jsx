import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import { getToday } from '../../utils/appointmentDate'

const meetingTypes = ['In Person', 'Online']

function BookAppointment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [date, setDate] = useState('')
  const [slots, setSlots] = useState([])
  const [timeSlot, setTimeSlot] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [meetingType, setMeetingType] = useState('In Person')
  const [consultations, setConsultations] = useState([])
  const [consultation, setConsultation] = useState(searchParams.get('consultation') || '')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const loadConsultations = async () => {
      try {
        const response = await api.get('/consultations/my')
        setConsultations(response.data)
      } catch (err) {
        setConsultations([])
      }
    }

    loadConsultations()
  }, [])

  const getErrorMessages = (err) => {
    const data = err.response?.data

    if (data && data.errors && data.errors.length > 0) {
      return data.errors.map((item) => item.msg)
    }

    return [data?.message || 'Could not reach the server']
  }

  const handleDateChange = async (e) => {
    const newDate = e.target.value

    setDate(newDate)
    setTimeSlot('')
    setSlots([])
    setErrors([])

    if (!newDate) return

    setLoadingSlots(true)

    try {
      const response = await api.get('/appointments/available', { params: { date: newDate } })
      setSlots(response.data.availableSlots)
    } catch (err) {
      setErrors(getErrorMessages(err))
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])

    if (!date || !timeSlot) {
      setErrors(['Please choose a date and a time slot'])
      return
    }

    setSubmitting(true)

    const data = { date, timeSlot, meetingType }

    if (consultation) {
      data.consultation = consultation
    }

    if (notes) {
      data.notes = notes
    }

    try {
      await api.post('/appointments', data)
      navigate('/appointments')
    } catch (err) {
      setErrors(getErrorMessages(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="form-card project-form">
        <h2>Book Appointment</h2>

        {errors.length > 0 && (
          <ul className="error">
            {errors.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        )}

        <label>Date</label>
        <input type="date" min={getToday()} value={date} onChange={handleDateChange} />

        {date && (
          <>
            <label>Time slot</label>

            {loadingSlots ? (
              <p>Loading slots...</p>
            ) : slots.length === 0 ? (
              <p>No free slots on this date</p>
            ) : (
              <div className="slot-list">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setTimeSlot(slot)}
                    className={slot === timeSlot ? 'btn btn-small' : 'btn btn-outline btn-small'}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        <label>Meeting type</label>
        <select value={meetingType} onChange={(e) => setMeetingType(e.target.value)}>
          {meetingTypes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label>Link to a consultation request (optional)</label>
        <select value={consultation} onChange={(e) => setConsultation(e.target.value)}>
          <option value="">None</option>
          {consultations.map((item) => (
            <option key={item._id} value={item._id}>
              {item.title}
            </option>
          ))}
        </select>

        <label>Notes (optional)</label>
        <textarea rows="4" value={notes} onChange={(e) => setNotes(e.target.value)}></textarea>

        <div className="form-buttons">
          <button type="submit" disabled={submitting} className="btn">
            {submitting ? 'Booking...' : 'Book Appointment'}
          </button>

          <Link to="/appointments" className="btn btn-outline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}

export default BookAppointment
