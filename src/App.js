import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Header from './components/Layout/Header';
import HomePage from './components/Home/HomePage';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import MedicalHistory from './components/MedicalHistory/MedicalHistory';
import DoctorDashboard from './components/Doctor/DoctorDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import PublicDoctorsList from './components/Doctors/PublicDoctorsList';

import SpecializationPage from './components/Schedule/SpecializationPage';
import DoctorPage from './components/Schedule/DoctorPage';
import CalendarPage from './components/Schedule/CalendarPage';

import BookingSpecialization from './components/Appointments/BookingSpecialization';
import BookingDoctor from './components/Appointments/BookingDoctor';
import BookingDateTime from './components/Appointments/BookingDateTime';
import BookingPersonal from './components/Appointments/BookingPersonal';
import BookingConfirm from './components/Appointments/BookingConfirm';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
        return <div className="text-center mt-5">Загрузка...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    // Перенаправление по ролям
    if (user?.role === 'admin' && window.location.pathname !== '/admin/dashboard') {
        return <Navigate to="/admin/dashboard" />;
    }

    if (user?.role === 'doctor' && window.location.pathname !== '/doctor/dashboard') {
        return <Navigate to="/doctor/dashboard" />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="App">
                    <Header />
                    <Toaster position="top-right" />
                    <Routes>
                        {/* Публичные маршруты */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/doctors" element={<PublicDoctorsList />} />

                        {/* Маршруты расписания */}
                        <Route path="/schedule/specialization" element={<SpecializationPage />} />
                        <Route path="/schedule/doctor" element={<DoctorPage />} />
                        <Route path="/schedule/calendar" element={<CalendarPage />} />

                        {/* Маршруты заказа талона */}
                        <Route path="/book/specialization" element={
                            <ProtectedRoute allowedRoles={['patient', 'admin']}>
                                <BookingSpecialization />
                            </ProtectedRoute>
                        } />
                        <Route path="/book/doctor" element={
                            <ProtectedRoute allowedRoles={['patient', 'admin']}>
                                <BookingDoctor />
                            </ProtectedRoute>
                        } />
                        <Route path="/book/datetime" element={
                            <ProtectedRoute allowedRoles={['patient', 'admin']}>
                                <BookingDateTime />
                            </ProtectedRoute>
                        } />
                        <Route path="/book/personal" element={
                            <ProtectedRoute allowedRoles={['patient', 'admin']}>
                                <BookingPersonal />
                            </ProtectedRoute>
                        } />
                        <Route path="/book/confirm" element={
                            <ProtectedRoute allowedRoles={['patient', 'admin']}>
                                <BookingConfirm />
                            </ProtectedRoute>
                        } />

                        {/* Защищенные маршруты пациента */}
                        <Route path="/dashboard" element={
                            <ProtectedRoute allowedRoles={['patient', 'admin']}>
                                <Dashboard />
                            </ProtectedRoute>
                        } />

                        <Route path="/medical-history/:patientId?" element={
                            <ProtectedRoute allowedRoles={['patient', 'admin', 'doctor']}>
                                <MedicalHistory />
                            </ProtectedRoute>
                        } />

                        {/* Маршруты доктора */}
                        <Route path="/doctor/dashboard" element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <DoctorDashboard />
                            </ProtectedRoute>
                        } />

                        {/* Маршруты администратора */}
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </AuthProvider>
        </Router>
    );
}

export default App;
