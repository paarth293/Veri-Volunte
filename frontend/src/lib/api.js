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

export const participateInEvent = async (id) => {
  const config = await authHeaders();
  const { data } = await axios.post(`${BASE_URL}/api/events/${id}/participate`, {}, config);
  return data;
};