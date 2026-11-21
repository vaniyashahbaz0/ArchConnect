export const getToday = () => {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

export const getDayText = (date) => date.slice(0, 10)

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString(undefined, { timeZone: 'UTC' })
}

export const isUpcoming = (appointment) => {
  const active = appointment.status === 'Pending' || appointment.status === 'Approved'

  return active && getDayText(appointment.date) >= getToday()
}
