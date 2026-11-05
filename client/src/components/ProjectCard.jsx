import { Link } from 'react-router-dom'
import { getImageUrl } from '../utils/imageUrl'

function ProjectCard({ project }) {
  const firstImage = project.images && project.images.length > 0 ? project.images[0] : ''

  return (
    <Link to={`/portfolio/${project._id}`} className="project-card">
      {firstImage ? (
        <img src={getImageUrl(firstImage)} alt={project.title} className="project-card-image" />
      ) : (
        <div className="project-card-image project-card-empty">No image</div>
      )}

      <div className="project-card-body">
        <h3>{project.title}</h3>

        <div className="project-card-meta">
          <span>{project.category}</span>
          <span className={`badge badge-${project.status}`}>{project.status}</span>
        </div>
      </div>
    </Link>
  )
}

export default ProjectCard
