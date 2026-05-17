import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

export const diseaseService = {
    analyze: (formData) => api.post('/disease/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    getHistory: () => api.get('/disease/history'),
};

export default api;
