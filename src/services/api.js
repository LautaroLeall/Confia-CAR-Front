// src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

// Instancia base de axios
const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    withCredentials: true,
    timeout: 30000, // 30 segundos tiempo límite para despertar containers en Render
});

let isWakingUpToastActive = false;

// Interceptor de Peticiones (Injectar Token JWT)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('confia_car_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor de Respuestas (Detección de Servidor Dormido en Render + Reintentos)
api.interceptors.response.use(
    (response) => {
        if (isWakingUpToastActive) {
            toast.dismiss('backend-waking-up');
            toast.success('¡Servidor conectado exitosamente!', { id: 'backend-ready', duration: 3000 });
            isWakingUpToastActive = false;
        }
        return response;
    },
    async (error) => {
        const { response, config } = error;

        // Detección de caída de servidor / backend durmiendo (Render Free Tier 502/503/504 o Network Error)
        if (!response || [502, 503, 504].includes(response?.status)) {
            if (!isWakingUpToastActive) {
                isWakingUpToastActive = true;
                toast.loading('Iniciando servidor backend (Render)... Por favor aguardá unos segundos 🚀', {
                    id: 'backend-waking-up',
                    duration: 25000,
                });
            }

            // Reintentar automáticamente la petición después de 3 segundos
            if (!config._retryCount) {
                config._retryCount = 1;
            } else {
                config._retryCount += 1;
            }

            if (config._retryCount <= 3) {
                await new Promise((resolve) => setTimeout(resolve, 3000));
                return api(config);
            }
        }

        // Manejo de token expirado (401 Unauthorized)
        if (response?.status === 401 && !config.url.includes('/api/auth/login')) {
            localStorage.removeItem('confia_car_token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
                toast.error('Tu sesión ha expirado. Por favor ingresá nuevamente.');
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;
