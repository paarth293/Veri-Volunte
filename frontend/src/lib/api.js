import axios from 'axios';
import { auth } from './firebase';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.getIdToken();
};

const authHeaders = async () => {
  const token = await getToken();
  return { headers: { Authorization: `Bearer ${token}` } };
};

// ══════════════════════════════════════════════════════════════
//  USER ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const registerUser = async (profileData) => {
  const config = await authHeaders();
  const { data } = await axios.post(`${BASE_URL}/api/users/register`, profileData, config);
  return data;
};

export const getMyProfile = async () => {
  const config = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/api/users/me`, config);
  return data;
};

export const getMyParticipatedEvents = async () => {
  const config = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/api/users/me/events`, config);
  return data;
};

// ══════════════════════════════════════════════════════════════
//  EVENT ENDPOINTS
// ══════════════════════════════════════════════════════════════

export const getAllEvents = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/events`);
  return data;
};

export const getEventById = async (id) => {
  const { data } = await axios.get(`${BASE_URL}/api/events/${id}`);
  return data;
};

export const getMyEvents = async () => {
  const config = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/api/events/my-events`, config);
  return data;
};

export const createEvent = async (eventData) => {
  const config = await authHeaders();
  const { data } = await axios.post(`${BASE_URL}/api/events`, eventData, config);
  return data;
};

export const participateInEvent = async (id, message = '') => {
  const config = await authHeaders();
  const body = {};
  if (message && message.trim()) body.message = message.trim();
  const { data } = await axios.post(`${BASE_URL}/api/events/${id}/participate`, body, config);
  return data;
};

// ══════════════════════════════════════════════════════════════
//  FEATURE 1: NEED EXTRACTION ENDPOINTS
// ══════════════════════════════════════════════════════════════

/**
 * POST /api/needs/extract
 * Extract structured need data from text or image.
 */
export const extractNeed = async (formData) => {
  let config = {};
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) config.headers = { Authorization: `Bearer ${token}` };
  } catch {
    // No auth token — route is open for MVP
  }
  const { data } = await axios.post(`${BASE_URL}/api/needs/extract`, formData, config);
  return data;
};

/**
 * GET /api/needs
 * Fetch all extracted needs.
 */
export const getAllNeeds = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/needs`);
  return data;
};

/**
 * DELETE /api/needs/:id
 * Delete a specific need
 */
export const deleteNeed = async (id) => {
  let config = {};
  try {
    const token = await auth.currentUser?.getIdToken();
    if (token) config.headers = { Authorization: `Bearer ${token}` };
  } catch {
    // open
  }
  const { data } = await axios.delete(`${BASE_URL}/api/needs/${id}`, config);
  return data;
};

// ══════════════════════════════════════════════════════════════
//  FEATURE 2: VOLUNTEER MATCHING ENDPOINTS
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/match/needs
 * Get all open needs available for matching.
 */
export const getOpenNeeds = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/match/needs`);
  return data;
};

/**
 * POST /api/match/:needId
 * Run the matching engine against a specific need.
 */
export const matchVolunteers = async (needId, options = {}) => {
  const { data } = await axios.post(`${BASE_URL}/api/match/${needId}`, options);
  return data;
};

// ══════════════════════════════════════════════════════════════
//  FEATURE 3: MAP ENDPOINTS
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/map/needs
 * Fetch all needs with location data for map visualization.
 */
export const getMapNeeds = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/map/needs`);
  return data;
};

export const getMapVolunteers = async () => {
  const { data } = await axios.get(`${BASE_URL}/api/map/volunteers`);
  return data;
};

// ══════════════════════════════════════════════════════════════
//  FEATURE 4: CERTIFICATE VERIFICATION
// ══════════════════════════════════════════════════════════════

export const uploadCertificate = async (formData) => {
  const config = await authHeaders();
  config.headers['Content-Type'] = 'multipart/form-data';
  const { data } = await axios.post(`${BASE_URL}/api/verify/upload`, formData, config);
  return data;
};

export const getMyVerifications = async () => {
  const config = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/api/verify/mine`, config);
  return data;
};

// ══════════════════════════════════════════════════════════════
//  FEATURE 6: CROSS-NGO TRUST SHARING
// ══════════════════════════════════════════════════════════════

/**
 * GET /api/verify/trust/lookup?email=...
 * NGO looks up a volunteer's trust status by email.
 */
export const lookupVolunteerTrust = async (email) => {
  const config = await authHeaders();
  const { data } = await axios.get(
    `${BASE_URL}/api/verify/trust/lookup?email=${encodeURIComponent(email)}`,
    config
  );
  return data;
};

/**
 * GET /api/verify/trust/:volunteerUid
 * Get trust records for a specific volunteer by UID.
 */
export const getTrustRecordsByUID = async (volunteerUid) => {
  const config = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/api/verify/trust/${volunteerUid}`, config);
  return data;
};

/**
 * GET /api/verify/my-trust
 * Volunteer sees their own cross-NGO trust summary.
 */
export const getMyTrustSummary = async () => {
  const config = await authHeaders();
  const { data } = await axios.get(`${BASE_URL}/api/verify/my-trust`, config);
  return data;
};