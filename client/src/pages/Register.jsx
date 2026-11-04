import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState([])
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setSubmitting(true)

    try {
      await register(name, email, password)
      navigate('/dashboard')
    } catch (err) {
      const data = err.response?.data

      if (data?.errors) {
        setErrors(data.errors.map((item) => item.msg))
      } else {
        setErrors([data?.message || 'Could not reach the server'])
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="form-card">
        <h2>Create an account</h2>

        {errors.length > 0 && (
          <ul className="error">
            {errors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        )}

        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />

        <label>Email</label>
        <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} />

        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>

        <p className="form-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  )
}

export default Register
