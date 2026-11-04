import { useAuth } from '../context/AuthContext'

function AdminDashboard() {
  const { user } = useAuth()

  return (
    <section className="page">
      <h1>Admin Dashboard</h1>
      <p>Name: {user.name}</p>
      <p>Role: {user.role}</p>
    </section>
  )
}

export default AdminDashboard
