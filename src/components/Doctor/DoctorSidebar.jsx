import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaCalendarAlt, FaUsers, FaHistory, FaSignOutAlt, FaStethoscope, FaUserMd } from 'react-icons/fa';

const DoctorSidebar = ({ activeTab, setActiveTab }) => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { key: 'schedule', icon: <FaCalendarAlt />, label: 'Мой график' },
        { key: 'patients', icon: <FaUsers />, label: 'Мои пациенты' },
        { key: 'history', icon: <FaHistory />, label: 'История приемов' }
    ];

    return (
        <div className="doctor-sidebar">
            <div className="sidebar-doctor-info">
                <div className="doctor-avatar">
                    <FaUserMd />
                </div>
                <div className="doctor-name">{user?.username}</div>
                <div className="doctor-role">Врач</div>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map((item) => (
                    <button
                        key={item.key}
                        className={`sidebar-nav-link ${activeTab === item.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.key)}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>
            <div className="sidebar-footer">
                <button className="sidebar-logout" onClick={handleLogout}>
                    <FaSignOutAlt />
                    <span>Выйти</span>
                </button>
            </div>
        </div>
    );
};

export default DoctorSidebar;