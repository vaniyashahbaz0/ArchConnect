import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import { formatRelativeTime } from '../utils/timeAgo'

function NotificationBell() {
  const { user } = useAuth()
  const userId = user?.id || user?._id

  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const dropdownRef = useRef(null)
  const isOpenRef = useRef(isOpen)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    isOpenRef.current = isOpen
  }, [isOpen])

  const fetchUnreadCount = async () => {
    if (!userId) return

    try {
      const res = await api.get('/notifications/unread-count')
      setUnreadCount(res.data.count)
    } catch (err) {
      // Keep silent on background polling error
    }
  }

  const loadNotifications = async () => {
    if (!userId) return

    setLoading(true)

    try {
      const res = await api.get('/notifications')
      setNotifications(res.data.slice(0, 8))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [userId])

  useEffect(() => {
    if (!userId) {
      return
    }

    fetchUnreadCount()

    const timer = setInterval(() => {
      fetchUnreadCount()

      if (isOpenRef.current) {
        loadNotifications()
      }
    }, 30000)

    return () => clearInterval(timer)
  }, [userId, location.pathname])

  useEffect(() => {
    if (isOpen && userId) {
      loadNotifications()
      fetchUnreadCount()
    }
  }, [isOpen, userId])

  useEffect(() => {
    const handleFocus = () => {
      if (userId) {
        fetchUnreadCount()
        loadNotifications()
      }
    }

    window.addEventListener('focus', handleFocus)

    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [userId])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all')
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error(err)
    }
  }

  const handleItemClick = async (item) => {
    setIsOpen(false)

    if (!item.isRead) {
      try {
        await api.patch(`/notifications/${item._id}/read`)
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, isRead: true } : n))
        )
        setUnreadCount((prev) => Math.max(0, prev - 1))
      } catch (err) {
        console.error(err)
      }
    }

    if (item.link) {
      navigate(item.link)
    }
  }

  if (!user) {
    return null
  }

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="notification-bell-btn"
        aria-label="Notifications"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <h4>Notifications</h4>

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="link-button"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="notification-dropdown-list">
            {loading ? (
              <p className="notification-dropdown-empty">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="notification-dropdown-empty">No notifications yet</p>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  className={`notification-item ${item.isRead ? 'read' : 'unread'}`}
                  onClick={() => handleItemClick(item)}
                >
                  <div className="notification-item-content">
                    <div className="notification-item-message">{item.message}</div>
                    <div className="notification-item-time">{formatRelativeTime(item.createdAt)}</div>
                  </div>

                  {!item.isRead && <span className="unread-dot"></span>}
                </div>
              ))
            )}
          </div>

          <div className="notification-dropdown-footer">
            <Link to="/notifications" onClick={() => setIsOpen(false)}>
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
