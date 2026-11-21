import User from '../models/User.js';
import Consultation from '../models/Consultation.js';
import Appointment from '../models/Appointment.js';

const isValidId = (id) => /^[a-fA-F0-9]{24}$/.test(id);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const getClients = async (req, res) => {
  const query = { role: 'client' };

  if (req.query.search && typeof req.query.search === 'string') {
    const search = req.query.search.trim();

    if (search) {
      const searchRegex = new RegExp(escapeRegex(search), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }];
    }
  }

  const clients = await User.find(query).select('-password').sort({ createdAt: -1 });
  const clientIds = clients.map((client) => client._id);

  const consultations = await Consultation.find({ client: { $in: clientIds } }).select('client');
  const appointments = await Appointment.find({ client: { $in: clientIds } }).select('client');

  const consultationCountMap = {};
  consultations.forEach((item) => {
    const key = item.client.toString();
    consultationCountMap[key] = (consultationCountMap[key] || 0) + 1;
  });

  const appointmentCountMap = {};
  appointments.forEach((item) => {
    const key = item.client.toString();
    appointmentCountMap[key] = (appointmentCountMap[key] || 0) + 1;
  });

  const clientsWithCounts = clients.map((client) => {
    const key = client._id.toString();

    return {
      _id: client._id,
      name: client.name,
      email: client.email,
      role: client.role,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
      consultationCount: consultationCountMap[key] || 0,
      appointmentCount: appointmentCountMap[key] || 0,
    };
  });

  res.json(clientsWithCounts);
};

export const getClientById = async (req, res) => {
  if (!isValidId(req.params.id)) {
    return res.status(404).json({ message: 'Client not found' });
  }

  const client = await User.findById(req.params.id).select('-password');

  if (!client || client.role !== 'client') {
    return res.status(404).json({ message: 'Client not found' });
  }

  const consultations = await Consultation.find({ client: client._id }).sort({ createdAt: -1 });

  const appointments = await Appointment.find({ client: client._id })
    .populate('consultation', 'title')
    .sort({ date: 1, timeSlot: 1 });

  res.json({
    client,
    consultations,
    appointments,
  });
};
