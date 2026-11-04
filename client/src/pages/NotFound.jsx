import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <section className="page">
      <h1>404</h1>
      <p>This page does not exist.</p>
      <Link to="/" className="btn">
        Back to Home
      </Link>
    </section>
  )
}

export default NotFound
