import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

function ManageClients() {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadClients = async (query = '') => {
    setLoading(true)
    setError('')

    try {
      const params = {}

      if (query.trim()) {
        params.search = query.trim()
      }

      const response = await api.get('/users/clients', { params })
      setClients(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load clients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    loadClients(searchTerm)
  }

  const handleClear = () => {
    setSearchTerm('')
    loadClients('')
  }

  return (
    <section className="page page-wide">
      <div className="page-header">
        <h1>Clients</h1>
      </div>

      <form onSubmit={handleSearchSubmit} className="search-form">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button type="submit" className="btn btn-small">
          Search
        </button>

        {searchTerm && (
          <button type="button" onClick={handleClear} className="btn btn-outline btn-small">
            Clear
          </button>
        )}
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : clients.length === 0 ? (
        <p>No clients found</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Joined</th>
                <th>Requests</th>
                <th>Appointments</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => (
                <tr key={client._id}>
                  <td>{client.name}</td>
                  <td>{client.email}</td>
                  <td>{new Date(client.createdAt).toLocaleDateString()}</td>
                  <td>{client.consultationCount}</td>
                  <td>{client.appointmentCount}</td>

                  <td>
                    <Link to={`/admin/clients/${client._id}`} className="btn btn-outline btn-small">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ManageClients
