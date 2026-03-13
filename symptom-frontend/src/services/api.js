/**
 * services/api.js
 * Axios instance
 */

import axios from "axios";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* ================= AUTH ================= */

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) =>
    api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getMe: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

/* ================= SYMPTOMS ================= */

export const symptomAPI = {
  check: (data) => api.post("/symptoms/check", data),
  getHistory: (params) => api.get("/symptoms/history", { params }),
  deleteLog: (id) => api.delete(`/symptoms/${id}`),
};

/* ================= DOCTORS ================= */

export const doctorAPI = {
  getNearby: (params) => api.get("/doctors/nearby", { params }),
  getDetail: (placeId) => api.get(`/doctors/${placeId}`),
};

/* ================= BOOKINGS ================= */

export const bookingAPI = {
  create: (data) => api.post("/bookings", data),
  getAll: () => api.get("/bookings"),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
};

/* ================= REMINDERS ================= */

export const reminderAPI = {
  create: (data) => api.post("/reminders", data),
  getAll: () => api.get("/reminders"),
  update: (id, data) => api.patch(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
};

export default api;