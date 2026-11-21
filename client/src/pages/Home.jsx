import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import ProjectCard from '../components/ProjectCard'

const CONTACT_INFO = {
  email: 'info@archconnect.com',
  phone: '+1 (555) 019-2834',
  address: '124 Design Avenue, Suite 400, New York, NY 10001',
  hours: 'Monday - Friday: 9:00 AM - 6:00 PM'
}

function Home() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await api.get('/projects')
        setProjects(response.data.slice(0, 6))
      } catch (err) {
        setProjects([])
      } finally {
        setLoading(false)
      }
    }

    loadProjects()
  }, [])

  useEffect(() => {
    if (window.location.hash === '#contact') {
      const contactSection = document.getElementById('contact')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [])

  const consultationLink = user ? '/consultations/new' : '/login'

  return (
    <div className="home-page">
      <section className="hero">
        <h1>ArchConnect</h1>
        <p>Crafting visionary spaces with innovative architecture and mindful design.</p>

        <div className="hero-buttons">
          <Link to="/portfolio" className="btn">
            View Portfolio
          </Link>
          <Link to={consultationLink} className="btn btn-outline">
            Book a Consultation
          </Link>
        </div>
      </section>

      <section className="page page-wide landing-section">
        <div className="section-header">
          <h2>Featured Projects</h2>
          <Link to="/portfolio" className="section-link">
            View all projects &rarr;
          </Link>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : projects.length === 0 ? (
          <p>No projects yet</p>
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}

        <div className="section-footer-cta">
          <Link to="/portfolio" className="btn btn-outline">
            View all projects
          </Link>
        </div>
      </section>

      <section className="page page-wide landing-section">
        <div className="about-block">
          <h2>About ArchConnect</h2>
          <p className="about-text">
            At ArchConnect, we bridge architectural imagination and reality. We partner with clients
            to create spaces that inspire, function seamlessly, and endure over time. From residential
            sanctuaries to modern commercial landmarks, our collaborative approach ensures that every
            detail reflects your unique vision and lifestyle.
          </p>
        </div>

        <div className="services-block">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Architectural Design</h3>
              <p>Custom concept planning, structural layouts, and sustainable blueprints crafted to bring your vision to life.</p>
            </div>

            <div className="service-card">
              <h3>Interior Design</h3>
              <p>Harmonious spatial planning, material selection, lighting, and finishes designed for modern living.</p>
            </div>

            <div className="service-card">
              <h3>Project Consultation</h3>
              <p>Expert feasibility assessments, site evaluations, permitting guidance, and budget planning from start to finish.</p>
            </div>

            <div className="service-card">
              <h3>3D Visualization</h3>
              <p>Photorealistic 3D renderings and immersive virtual walkthroughs to experience your space before construction.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page page-wide landing-section">
        <h2>How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Browse our work</h3>
            <p>Explore our portfolio of completed and ongoing projects to find ideas and inspiration for your space.</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Sign in and request a consultation</h3>
            <p>Create an account and submit your project requirements, goals, and budget to get professional guidance.</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Book an appointment</h3>
            <p>Schedule a one-on-one session with our lead architects to review designs, timelines, and next steps.</p>
          </div>
        </div>
      </section>

      <section id="contact" className="page page-wide landing-section contact-section">
        <h2>Contact Us</h2>
        <p className="contact-intro">
          Have a question about a project or want to collaborate? Get in touch with our team.
        </p>

        <div className="contact-grid">
          <div className="contact-card">
            <h3>Email</h3>
            <p>
              <a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a>
            </p>
          </div>

          <div className="contact-card">
            <h3>Phone</h3>
            <p>
              <a href={`tel:${CONTACT_INFO.phone}`}>{CONTACT_INFO.phone}</a>
            </p>
          </div>

          <div className="contact-card">
            <h3>Address</h3>
            <p>{CONTACT_INFO.address}</p>
          </div>

          <div className="contact-card">
            <h3>Working Hours</h3>
            <p>{CONTACT_INFO.hours}</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
