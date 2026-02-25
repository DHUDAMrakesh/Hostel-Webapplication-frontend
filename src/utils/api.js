import axios from 'axios';

const api = axios.create({
    baseURL: `${window.location.protocol}//${window.location.hostname}:5001/api`,
});


// Attach JWT token from localStorage to every request automatically
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hostel_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If 401 received, clear stale token (user will be redirected by ProtectedRoute)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('hostel_token');
            localStorage.removeItem('hostel_user');
        }
        return Promise.reject(error);
    }
);

export default api;
