import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ProjectCard from '../components/ProjectCard'

function Home() {
  const [latestProjects, setLatestProjects] = useState([])

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/projects')
        setLatestProjects(response.data.slice(0, 3))
      } catch (err) {
        setLatestProjects([])
      }
    }

    loadProjects()
  }, [])

  return (
    <>
      <section className="hero">
        <h1>ArchConnect</h1>
        <p>
          Explore our portfolio, request a consultation and manage your architecture projects in
          one place.
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

      {latestProjects.length > 0 && (
        <section className="page page-wide latest-projects">
          <h2>Latest Projects</h2>

          <div className="project-grid">
            {latestProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>

          <div className="latest-projects-button">
            <Link to="/portfolio" className="btn">
              View full portfolio
            </Link>
          </div>
        </section>
      )}
    </>
  )
}

export default Home
