import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// FIX: Global Interceptor untuk memblokir JSON saat sesi habis (Poling)
window.axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && (error.response.status === 401 || error.response.status === 419)) {
            // Sesi habis? Langsung tendang halus ke halaman login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);