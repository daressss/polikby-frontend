import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaUserMd, FaCalendarCheck, FaChartLine, FaStethoscope, FaUserClock, FaCalendarAlt, FaFileMedical } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';
import AdminSidebar from './AdminSidebar';
import AdminDoctors from './AdminDoctors';
import AdminSchedules from './AdminSchedules';
import AdminUsers from './AdminUsers';
import AdminReports from './AdminReports';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({
        todayAppointments: 0,
        activeDoctors: 0,
        newPatients: 0,
        weekAppointments: 0
    });
    const [doctorLoad, setDoctorLoad] = useState([]);
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (activeTab === 'dashboard') {
            loadDashboardData();
        }
    }, [activeTab]);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/dashboard/stats');
            if (response.data.success) {
                setStats(response.data.stats);
                setDoctorLoad(response.data.doctorLoad);
                setRecentAppointments(response.data.recentAppointments);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            toast.error('Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            booked: { class: 'status-booked', text: 'Забронировано' },
            completed: { class: 'status-completed', text: 'Завершено' },
            cancelled: { class: 'status-cancelled', text: 'Отменено' },
            no_show: { class: 'status-no-show', text: 'Не явился' }
        };
        const s = statusMap[status] || { class: 'status-default', text: status };
        return <span className={`admin-status-badge ${s.class}`}>{s.text}</span>;
    };

    const renderContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return (
                    <div className="admin-dashboard-content">
                        {/* Статистика */}
                        <div className="admin-stats-grid">
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon purple">
                                    <FaCalendarCheck />
                                </div>
                                <div className="admin-stat-info">
                                    <h3>{stats.todayAppointments}</h3>
                                    <p>Записей на сегодня</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon blue">
                                    <FaUserMd />
                                </div>
                                <div className="admin-stat-info">
                                    <h3>{stats.activeDoctors}</h3>
                                    <p>Активных врачей</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon green">
                                    <FaUsers />
                                </div>
                                <div className="admin-stat-info">
                                    <h3>{stats.newPatients}</h3>
                                    <p>Новых пациентов за неделю</p>
                                </div>
                            </div>
                            <div className="admin-stat-card">
                                <div className="admin-stat-icon orange">
                                    <FaChartLine />
                                </div>
                                <div className="admin-stat-info">
                                    <h3>{stats.weekAppointments}</h3>
                                    <p>Записей за неделю</p>
                                </div>
                            </div>
                        </div>

                        {/* Загруженность врачей */}
                        <div className="admin-section">
                            <div className="admin-section-header">
                                <FaStethoscope />
                                <h3>Загруженность врачей</h3>
                            </div>
                            <div className="admin-doctor-load">
                                {doctorLoad.map(doctor => (
                                    <div key={doctor.id} className="doctor-load-item">
                                        <div className="doctor-load-info">
                                            <span className="doctor-name">{doctor.full_name}</span>
                                            <span className="doctor-spec">{doctor.specialization}</span>
                                            <span className="doctor-load-percent">{doctor.load_percent || 0}%</span>
                                        </div>
                                        <div className="doctor-load-bar">
                                            <div
                                                className="doctor-load-fill"
                                                style={{ width: `${doctor.load_percent || 0}%` }}
                                            ></div>
                                        </div>
                                        <div className="doctor-load-stats">
                                            <span>Забронировано: {doctor.booked_count || 0}</span>
                                            <span>Всего слотов: {doctor.total_slots || 0}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Последние записи */}
                        <div className="admin-section">
                            <div className="admin-section-header">
                                <FaUserClock />
                                <h3>Последние записи</h3>
                            </div>
                            <div className="admin-recent-table-container">
                                <table className="admin-recent-table">
                                    <thead>
                                    <tr>
                                        <th>Время</th>
                                        <th>Пациент</th>
                                        <th>Врач</th>
                                        <th>Специальность</th>
                                        <th>Статус</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recentAppointments.map(apt => (
                                        <tr key={apt.id}>
                                            <td>{apt.appointment_time?.substring(0, 5)}</td>
                                            <td>{apt.patient_name || '—'}</td>
                                            <td>{apt.doctor_name}</td>
                                            <td>{apt.specialization}</td>
                                            <td>{getStatusBadge(apt.status)}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                );
            case 'doctors':
                return <AdminDoctors />;
            case 'schedules':
                return <AdminSchedules />;
            case 'users':
                return <AdminUsers />;
            case 'reports':
                return <AdminReports />;
            default:
                return null;
        }
    };

    return (
        <div className="admin-dashboard-page">
            <div className="container">
                <div className="admin-dashboard-header">
                    <h1 className="admin-title">Панель управления администратора</h1>
                    <p className="admin-subtitle">Добро пожаловать, {user?.username}!</p>
                </div>

                <div className="admin-layout">
                    <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="admin-main">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;