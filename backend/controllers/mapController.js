const { db } = require('../config/firebase');

// GET /api/map/needs - Already exists, but make sure it returns lat/lng
const getAllNeedsForMap = async (req, res) => {
  try {
    const snapshot = await db.collection('needs').get();
    const needs = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.lat && data.lng) {
        needs.push({
          id: doc.id,
          title: data.title || 'Untitled Need',
          lat: data.lat,
          lng: data.lng,
          urgency: data.urgency || 'medium',
          skill: data.skill_required || '',
          people_required: data.people_needed || 1,
          location: data.location || '',
          type: 'need'   // ← Helpful for frontend
        });
      }
    });

    return res.status(200).json(needs);
  } catch (error) {
    console.error('[mapController] Error fetching needs:', error);
    return res.status(500).json({ error: 'Failed to fetch map data' });
  }
};

// NEW: GET /api/map/events - Show events on map
const getAllEventsForMap = async (req, res) => {
  try {
    const snapshot = await db.collection('events').get();
    const events = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.lat && data.lng) {
        events.push({
          id: doc.id,
          title: data.title || 'Untitled Event',
          lat: data.lat,
          lng: data.lng,
          date: data.date,
          location: data.location || '',
          maxParticipants: data.maxParticipants || 0,
          participantsCount: data.participants ? data.participants.length : 0,
          type: 'event'   // ← Helpful for frontend
        });
      }
    });

    return res.status(200).json(events);
  } catch (error) {
    console.error('[mapController] Error fetching events:', error);
    return res.status(500).json({ error: 'Failed to fetch events for map' });
  }
};

const getVolunteersForMap = async (req, res) => {
  try {
    const snapshot = await db.collection('users')
      .where('role', '==', 'Volunteer')
      .get();

    const volunteers = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.lat && data.lng) {
        volunteers.push({
          id: doc.id,
          name: data.name || 'Volunteer',
          lat: data.lat,
          lng: data.lng,
          skills: data.skills || '',
          location: data.location || '',
          type: 'volunteer'
        });
      }
    });

    return res.status(200).json(volunteers);
  } catch (error) {
    console.error('[mapController] Error fetching volunteers:', error);
    return res.status(500).json({ error: 'Failed to fetch volunteer data' });
  }
};

module.exports = { 
  getAllNeedsForMap, 
  getAllEventsForMap,   // ← New
  getVolunteersForMap 
};