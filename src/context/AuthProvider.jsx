// src/context/AuthProvider.jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { AuthContext } from "./AuthContext";
import api from "../services/api";

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("confia_car_token");
        if (storedUser && storedToken) {
            try {
                return JSON.parse(storedUser);
            } catch {
                localStorage.removeItem("user");
                localStorage.removeItem("confia_car_token");
                return null;
            }
        }
        return null;
    });

    const loading = false;

    // Al iniciar la app, validar token en segundo plano si existe sesión
    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem("confia_car_token");
            const storedUser = localStorage.getItem("user");
            if (token && storedUser) {
                try {
                    const { data } = await api.get('/api/auth/profile').catch(() => ({ data: null }));
                    if (data) {
                        setUser(prev => ({ ...prev, ...data }));
                        localStorage.setItem("user", JSON.stringify({ ...JSON.parse(storedUser), ...data }));
                    }
                } catch {
                    // Si falla por token vencido, api.js manejará el 401
                }
            }
        };
        validateToken();
    }, []);

    const login = useCallback(async (email, password) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            if (data.token) {
                localStorage.setItem('confia_car_token', data.token);
            }
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Error al iniciar sesión';
            return { success: false, error: message };
        }
    }, []);

    const register = useCallback(async (name, email, password) => {
        try {
            const parts = name.trim().split(' ');
            const firstName = parts[0] || 'Usuario';
            const lastName = parts.slice(1).join(' ') || 'ConfiaCAR';

            const { data } = await api.post('/api/auth/register', {
                firstName,
                lastName,
                email,
                password
            });

            if (data.token) {
                localStorage.setItem('confia_car_token', data.token);
            }
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            console.error('Register error:', error);
            const message = error.response?.data?.message || 'Error al registrarse';
            return { success: false, error: message };
        }
    }, []);

    const googleLogin = useCallback(async (tokenId) => {
        try {
            const { data } = await api.post('/api/auth/google-auth', { tokenId });
            if (data.token) {
                localStorage.setItem('confia_car_token', data.token);
            }
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
            return { success: true, user: data };
        } catch (error) {
            console.error('Google Auth error:', error);
            const message = error.response?.data?.message || 'Error al autenticarse con Google';
            return { success: false, error: message };
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/api/auth/logout');
        } catch (err) {
            console.error('Error closing session on backend:', err);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('confia_car_token');
        }
    }, []);

    const value = useMemo(() => ({
        user,
        loading,
        login,
        register,
        googleLogin,
        logout
    }), [user, loading, login, register, googleLogin, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;
