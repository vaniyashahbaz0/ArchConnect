import { useAuth } from '../context/AuthContext'

function ClientDashboard() {
  const { user } = useAuth()

  return (
    <section className="page">
      <h1>Client Dashboard</h1>
      <p>Name: {user.name}</p>
      <p>Role: {user.role}</p>
    </section>
  )
}

export default ClientDashboard
