import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScheduleSidebar = ({ currentStep, selectedData = {} }) => {
    const navigate = useNavigate();

    const menuItems = [
        { key: 'specialization', label: 'Специальность', step: 0, path: '/schedule/specialization' },
        { key: 'doctor', label: 'Врач', step: 1, path: selectedData.specialization ? `/schedule/doctor?spec=${encodeURIComponent(selectedData.specialization)}` : null },
        { key: 'schedule', label: 'Расписание', step: 2, path: selectedData.doctorId ? `/schedule/calendar?doctor_id=${selectedData.doctorId}&doctor_name=${encodeURIComponent(selectedData.doctorName || '')}&spec=${encodeURIComponent(selectedData.specialization || '')}` : null }
    ];

    const getItemClass = (step) => {
        if (step < currentStep) return 'completed';
        if (step === currentStep) return 'active';
        return 'upcoming';
    };

    const handleClick = (item) => {
        if (item.step <= currentStep && item.path) {
            navigate(item.path);
        }
    };

    return (
        <div className="booking-sidebar">
            <h3>Навигация</h3>
            <ul className="sidebar-menu">
                {menuItems.map((item) => (
                    <li
                        key={item.key}
                        className={`sidebar-item ${getItemClass(item.step)}`}
                        onClick={() => handleClick(item)}
                        style={{ cursor: item.step <= currentStep && item.path ? 'pointer' : 'default' }}
                    >
                        <span className="sidebar-marker"></span>
                        <span className="sidebar-label">{item.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ScheduleSidebar;