import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = await login(email, password)
      navigate(user.role === 'admin' ? '/admin' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reach the server')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <form onSubmit={handleSubmit} className="form-card">
        <h2>Login</h2>

        {error && <p className="error">{error}</p>}

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Logging in...' : 'Login'}
        </button>

        <p className="form-footer">
          No account yet? <Link to="/register">Register</Link>
        </p>
      </form>
    </div>
  )
}

export default Login
