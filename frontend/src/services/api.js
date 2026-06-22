import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// ── Response interceptor: unwrap data, surface errors ──────────────────────
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// ── Dashboard ──────────────────────────────────────────────────────────────
export const getDashboard = () => api.get('/dashboard');

// ── Components ─────────────────────────────────────────────────────────────
export const getComponents    = (includeInactive = false) =>
  api.get(`/components${includeInactive ? '?include_inactive=true' : ''}`);
export const getComponent     = (id) => api.get(`/components/${id}`);
export const createComponent  = (data) => api.post('/components', data);
export const updateComponent  = (id, data) => api.put(`/components/${id}`, data);
export const deleteComponent  = (id) => api.delete(`/components/${id}`);
export const getCategories    = () => api.get('/components/categories');

// ── Price History ──────────────────────────────────────────────────────────
export const getPriceHistory  = (componentId) => api.get(`/components/${componentId}/prices`);
export const addPrice         = (componentId, data) => api.post(`/components/${componentId}/prices`, data);

// ── Bicycles ───────────────────────────────────────────────────────────────
export const getBicycles     = () => api.get('/bicycles');
export const getBicycle      = (id) => api.get(`/bicycles/${id}`);
export const createBicycle   = (data) => api.post('/bicycles', data);
export const updateBicycle   = (id, data) => api.put(`/bicycles/${id}`, data);
export const deleteBicycle   = (id) => api.delete(`/bicycles/${id}`);

// ── Bicycle Components ─────────────────────────────────────────────────────
export const addBicycleComponent    = (bicycleId, data) => api.post(`/bicycles/${bicycleId}/components`, data);
export const updateBicycleComponent = (bicycleId, componentId, data) => api.put(`/bicycles/${bicycleId}/components/${componentId}`, data);
export const removeBicycleComponent = (bicycleId, componentId) => api.delete(`/bicycles/${bicycleId}/components/${componentId}`);

// ── Pricing ────────────────────────────────────────────────────────────────
export const getBicyclePricing = (id) => api.get(`/bicycles/${id}/pricing`);
