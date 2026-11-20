import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { formatRelativeTime } from '../utils/timeAgo'

function Notifications() {
  const { user } = useAuth()
  const userId = user?.id || user?._id

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const loadNotifications = async () => {
    if (!userId) return

    setLoading(true)
    setError('')

    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) {
      setError('Could not load notifications')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setNotifications([])
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadNotifications()
    }
  }, [userId, location.key, location.pathname])

  useEffect(() => {
    const handleFocus = () => {
      if (userId) {
        loadNotifications()
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId])

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications(notifications.map((item) => ({ ...item, isRead: true })))
    } catch (err) {
      setError('Could not mark all notifications as read')
    }
  }

  const handleItemClick = async (item) => {
    if (!item.isRead) {
      try {
        await api.patch(`/notifications/${item._id}/read`)
        setNotifications(
          notifications.map((row) => (row._id === item._id ? { ...row, isRead: true } : row))
        )
      } catch (err) {
        console.error(err)
      }
    }

    if (item.link) {
      navigate(item.link)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <h1>Notifications</h1>

        {notifications.length > 0 && (
          <button onClick={handleMarkAllRead} className="btn btn-outline btn-small">
            Mark all as read
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p>No notifications yet</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((item) => (
            <div
              key={item._id}
              className={`notification-card ${item.isRead ? 'read' : 'unread'}`}
              onClick={() => handleItemClick(item)}
            >
              <div className="notification-card-info">
                <h3>{item.message}</h3>
                <p>{formatRelativeTime(item.createdAt)}</p>
              </div>

              {!item.isRead && <span className="unread-dot"></span>}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Notifications
