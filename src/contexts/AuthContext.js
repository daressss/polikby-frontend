import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

axios.defaults.baseURL = 'http://localhost:5000/api';
axios.defaults.withCredentials = true;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get('/auth/me');
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const response = await axios.post('/auth/login', { username, password });
            if (response.data.success) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                toast.success('Добро пожаловать!');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка входа');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/auth/register', userData);
            if (response.data.success) {
                toast.success('Регистрация успешна! Теперь вы можете войти.');
                return true;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка регистрации');
            return false;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/auth/logout');
            setUser(null);
            setIsAuthenticated(false);
            toast.success('Вы вышли из системы');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, register, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};