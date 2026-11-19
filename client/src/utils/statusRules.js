const consultationRules = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['Completed'],
  Rejected: [],
  Completed: [],
}

const appointmentRules = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['Completed', 'Cancelled'],
  Rejected: [],
  Completed: [],
  Cancelled: [],
}

const rules = {
  consultation: consultationRules,
  appointment: appointmentRules,
}

export const getNextStatuses = (type, currentStatus) => {
  return rules[type][currentStatus] || []
}
