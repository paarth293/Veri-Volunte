const { db, admin } = require('../config/firebase');
const { geocodeLocation } = require('./needController');   // Reuse the improved geocode function

// @desc    Create a new volunteering event
// @route   POST /api/events
// @access  Private (NGO Only)
const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, maxParticipants } = req.body;
    
    if (!title || !description || !date || !location) {
      return res.status(400).json({ 
        error: 'Please provide all required fields (title, description, date, location)' 
      });
    }

    // Geocode the user-entered location (Delhi-focused)
    const coords = await geocodeLocation(location);

    const newEvent = {
      title,
      description,
      date,
      location,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : 0, 
      createdBy: req.user.uid,
      participants: [], 
      createdAt: new Date().toISOString(),
      lat: coords.lat,           // ← Saved for Map
      lng: coords.lng            // ← Saved for Map
    };

    const eventRef = await db.collection('events').add(newEvent);

    res.status(201).json({
      message: 'Event successfully created!',
      eventId: eventRef.id,
      event: newEvent
    });

  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event in database' });
  }
};

// @desc    Fetch all upcoming events
// @route   GET /api/events
// @access  Public
const getAllEvents = async (req, res) => {
  try {
    const eventsSnapshot = await db.collection('events').orderBy('createdAt', 'desc').get();
    
    const events = [];
    eventsSnapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
};

// @desc    Get a single event by its ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const eventId = req.params.id;
    const eventDoc = await db.collection('events').doc(eventId).get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.status(200).json({ id: eventDoc.id, ...eventDoc.data() });

  } catch (error) {
    console.error('Error fetching event by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve event' });
  }
};

// @desc    Register a volunteer for an event
// @route   POST /api/events/:id/participate
// @access  Private
const participateInEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const { uid } = req.user;
    const { message } = req.body;

    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (!eventDoc.exists) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const eventData = eventDoc.data();

    // Check if event is full
    if (eventData.maxParticipants > 0 && eventData.participants.length >= eventData.maxParticipants) {
      return res.status(400).json({ error: 'This event is currently full.' });
    }

    // Check if already registered
    if (eventData.participants.includes(uid)) {
      return res.status(400).json({ error: 'You are already registered for this event!' });
    }

    // Add to participants array
    await eventRef.update({
      participants: admin.firestore.FieldValue.arrayUnion(uid)
    });

    // Store detailed participation record
    const participationRecord = {
      uid,
      registeredAt: new Date().toISOString(),
    };
    if (message && message.trim()) {
      participationRecord.message = message.trim();
    }

    await eventRef.collection('participations').doc(uid).set(participationRecord);

    res.status(200).json({ message: 'Successfully signed up for the event!' });

  } catch (error) {
    console.error('Error participating in event:', error);
    res.status(500).json({ error: 'Failed to complete registration for event' });
  }
};

// @desc    Get all events created by the currently logged-in NGO
// @route   GET /api/events/my-events
// @access  Private (NGO Only)
const getMyEvents = async (req, res) => {
  try {
    const { uid } = req.user;

    const eventsSnapshot = await db
      .collection('events')
      .where('createdBy', '==', uid)
      .get();

    const events = [];
    eventsSnapshot.forEach(doc => {
      events.push({ id: doc.id, ...doc.data() });
    });

    // Sort in memory
    events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(events);

  } catch (error) {
    console.error('Error fetching NGO events:', error);
    res.status(500).json({ error: 'Failed to retrieve your events' });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  getMyEvents,
  participateInEvent
};