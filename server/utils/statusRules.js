const consultationRules = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['Completed'],
  Rejected: [],
  Completed: [],
};

const appointmentRules = {
  Pending: ['Approved', 'Rejected'],
  Approved: ['Completed', 'Cancelled'],
  Rejected: [],
  Completed: [],
  Cancelled: [],
};

const rules = {
  consultation: consultationRules,
  appointment: appointmentRules,
};

export const getNextStatuses = (type, currentStatus) => {
  return rules[type][currentStatus] || [];
};

export const getStatusError = (type, currentStatus, newStatus) => {
  const allowed = getNextStatuses(type, currentStatus);

  if (allowed.length === 0) {
    return `A ${currentStatus} ${type} is final and its status cannot be changed`;
  }

  if (!allowed.includes(newStatus)) {
    return `Cannot change a ${type} from ${currentStatus} to ${newStatus}. Allowed: ${allowed.join(', ')}`;
  }

  return '';
};
