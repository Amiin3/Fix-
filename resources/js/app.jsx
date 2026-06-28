import { router } from '@inertiajs/react';
import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot, hydrateRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'MilaStore';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        if (import.meta.env.SSR) {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});


// 💓 HEARTBEAT SULTAN: Jaga Sesi & Token Tetap Hidup
setInterval(() => {
    if (window.location.pathname !== '/login') {
        router.reload({ only: ['auth'], preserveScroll: true, preserveState: true });
    }
}, 600000);

// 🛡️ DOKTER SULTAN: VAKSIN ANTI MUNTAH JSON & SERVICE WORKER KILLER
if (typeof window !== 'undefined') {
    // A. Bantai Cache PWA (Biar HP gak nyimpen JSON)
    if ('caches' in window) {
        caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    }

    // B. Tangkap error Axios
    if (window.axios) {
        window.axios.interceptors.response.use(res => res, err => {
            if (err.response && [401, 419].includes(err.response.status)) {
                window.location.href = '/login';
            }
            return Promise.reject(err);
        });
    }

    // C. Matikan Modal Hitam
    document.addEventListener('inertia:invalid', (event) => {
        event.preventDefault();
        window.location.href = '/login';
    });

    // D. Pawang Tidur (Anti-Tab Beku)
    let lastVisibleTime = Date.now();
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            lastVisibleTime = Date.now();
        } else if (document.visibilityState === 'visible') {
            if (Date.now() - lastVisibleTime > 3600000) {
                document.body.innerHTML = '<div style="background:#111; color:#fff; height:100vh; display:flex; align-items:center; justify-content:center; font-family:sans-serif;"><h1>🔄 Menyegarkan Sesi MilaStore...</h1></div>';
                window.location.reload(true);
            }
        }
    });
}
