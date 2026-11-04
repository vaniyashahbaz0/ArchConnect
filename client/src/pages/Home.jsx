import { Link } from 'react-router-dom'

function Home() {
  return (
    <section className="hero">
      <h1>ArchConnect</h1>
      <p>
        Explore our portfolio, request a consultation and manage your architecture projects in one
        place.
      </p>

      <div className="hero-buttons">
        <Link to="/register" className="btn">
          Get Started
        </Link>
        <Link to="/login" className="btn btn-outline">
          Login
        </Link>
      </div>
    </section>
  )
}

export default Home
