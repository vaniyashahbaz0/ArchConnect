function StatusBadge({ status }) {
  const className = status ? status.toLowerCase() : ''

  return <span className={`badge badge-${className}`}>{status}</span>
}

export default StatusBadge
