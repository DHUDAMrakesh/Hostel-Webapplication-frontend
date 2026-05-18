import axios from 'axios';

const api = axios.create({
    baseURL: `${window.location.protocol}//${window.location.hostname}:5001/api`,
    timeout: 12000, // 12s timeout — avoids hanging requests
});

// ─── In-memory GET cache (30 s TTL) ──────────────────────────
const cache = new Map(); // key → { data, ts }
const CACHE_TTL = 30_000; // 30 seconds

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('hostel_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// Connection monitoring system
let isConnected = true;
const listeners = new Set();
const notify = (status) => {
    if (isConnected !== status) {
        isConnected = status;
        listeners.forEach(l => l(status));
    }
};

export const onConnectivityChange = (cb) => {
    listeners.add(cb);
    return () => listeners.delete(cb);
};

// Response interceptor: cache GETs + auto-retry once on network error
api.interceptors.response.use(
    (response) => {
        notify(true); // Successful response means we are connected
        if (response.config.method === 'get') {
            const key = response.config.url + (localStorage.getItem('hostel_token') || '');
            cache.set(key, { data: response.data, ts: Date.now() });
        }
        return response;
    },
    async (error) => {
        const cfg = error.config;
        
        // No response means network error / backend down
        if (!error.response) {
            notify(false);
            // Auto-retry once on network error (no response received)
            if (!cfg._retry) {
                cfg._retry = true;
                return api(cfg);
            }
        } else {
            notify(true); // Received a response, so server is up (even if it's 4xx/5xx)
        }

        // 401 → clear stale credentials
        if (error.response?.status === 401) {
            localStorage.removeItem('hostel_token');
            localStorage.removeItem('hostel_user');
            cache.clear();
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);

/** Cached GET — returns cached data if fresh, otherwise fetches */
export async function cachedGet(url, config = {}) {
    const token = localStorage.getItem('hostel_token') || '';
    const key = url + token;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
        return { data: cached.data };
    }
    return api.get(url, config);
}

/** Invalidate all cache entries (call after mutations) */
export function invalidateCache() {
    cache.clear();
}

export default api;

