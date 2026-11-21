import Consultation from '../models/Consultation.js';
import Appointment from '../models/Appointment.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

const getToday = () => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return new Date(`${now.getFullYear()}-${month}-${day}T00:00:00.000Z`);
};

export const getClientDashboard = async (req, res) => {
  const clientId = req.user._id;

  const consultations = await Consultation.find({ client: clientId });

  const counts = {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Completed: 0,
    total: consultations.length,
  };

  consultations.forEach((item) => {
    if (counts[item.status] !== undefined) {
      counts[item.status] += 1;
    }
  });

  const upcomingAppointments = await Appointment.find({
    client: clientId,
    date: { $gte: getToday() },
    status: { $ne: 'Cancelled' },
  })
    .populate('consultation', 'title')
    .sort({ date: 1, timeSlot: 1 })
    .limit(3);

  const recentConsultations = await Consultation.find({ client: clientId })
    .sort({ updatedAt: -1 })
    .limit(5);

  const recentAppointments = await Appointment.find({ client: clientId })
    .populate('consultation', 'title')
    .sort({ updatedAt: -1 })
    .limit(5);

  const consultationUpdates = recentConsultations.map((item) => ({
    id: item._id,
    type: 'consultation',
    title: item.title,
    status: item.status,
    link: `/consultations/${item._id}`,
    updatedAt: item.updatedAt,
  }));

  const appointmentUpdates = recentAppointments.map((item) => ({
    id: item._id,
    type: 'appointment',
    title: item.consultation?.title || `${item.meetingType} Appointment`,
    status: item.status,
    link: '/appointments',
    updatedAt: item.updatedAt,
  }));

  const recentUpdates = [...consultationUpdates, ...appointmentUpdates]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  res.json({
    consultationCounts: counts,
    upcomingAppointments,
    recentUpdates,
  });
};

export const getAdminDashboard = async (req, res) => {
  const projectCount = await Project.countDocuments();
  const clientCount = await User.countDocuments({ role: 'client' });

  const consultations = await Consultation.find().select('status');
  const consultationCounts = {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Completed: 0,
    total: consultations.length,
  };

  consultations.forEach((item) => {
    if (consultationCounts[item.status] !== undefined) {
      consultationCounts[item.status] += 1;
    }
  });

  const appointments = await Appointment.find().select('status');
  const appointmentCounts = {
    Pending: 0,
    Approved: 0,
    Rejected: 0,
    Completed: 0,
    Cancelled: 0,
    total: appointments.length,
  };

  appointments.forEach((item) => {
    if (appointmentCounts[item.status] !== undefined) {
      appointmentCounts[item.status] += 1;
    }
  });

  const recentConsultations = await Consultation.find()
    .populate('client', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  const upcomingAppointments = await Appointment.find({
    date: { $gte: getToday() },
    status: { $ne: 'Cancelled' },
  })
    .populate('client', 'name email')
    .populate('consultation', 'title')
    .sort({ date: 1, timeSlot: 1 })
    .limit(5);

  res.json({
    totals: {
      projects: projectCount,
      clients: clientCount,
      consultations: consultationCounts,
      appointments: appointmentCounts,
    },
    projects: projectCount,
    clients: clientCount,
    consultationCounts,
    appointmentCounts,
    recentConsultations,
    upcomingAppointments,
  });
};
