import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaTachometerAlt, FaUserMd, FaCalendarAlt, FaUsers, FaChartBar, FaSignOutAlt } from 'react-icons/fa';

const AdminSidebar = ({ activeTab, setActiveTab }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { key: 'dashboard', icon: <FaTachometerAlt />, label: 'Панель управления' },
        { key: 'doctors', icon: <FaUserMd />, label: 'Врачи' },
        { key: 'schedules', icon: <FaCalendarAlt />, label: 'Расписание' },
        { key: 'users', icon: <FaUsers />, label: 'Пользователи' },
        { key: 'reports', icon: <FaChartBar />, label: 'Отчеты' }
    ];

    return (
        <div className="admin-sidebar">
            <div className="admin-sidebar-info">
                <div className="admin-avatar">
                    <FaUserMd />
                </div>
                <div className="admin-name">Администратор</div>
                <div className="admin-role">Панель управления</div>
            </div>
            <nav className="admin-sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        className={`admin-sidebar-link ${activeTab === item.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.key)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="admin-sidebar-footer">
                <button className="admin-logout-btn" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>Выйти</span>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebar;