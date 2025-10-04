

// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://superadmin-staff-dash.onrender.com/api/admin', // <-- string required
  withCredentials: true,
});

export default api;
