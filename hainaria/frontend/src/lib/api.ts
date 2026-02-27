import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 120000, // 120 secunde
});

// Auto-attach JWT (admin or regular user)
api.interceptors.request.use((config) => {
    const isAdminRoute = config.url?.includes('/admin/');
    const token = isAdminRoute
        ? localStorage.getItem('admin_token')
        : localStorage.getItem('hainaria_token');

    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Extract meaningful error message
export function getErrorMessage(error: any): string {
    return (
        error?.response?.data?.message ||
        error?.message ||
        'A apărut o eroare neașteptată.'
    );
}

export default api;
