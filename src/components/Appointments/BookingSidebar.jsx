import React from 'react';
import { useNavigate } from 'react-router-dom';

const BookingSidebar = ({ currentStep, selectedData = {} }) => {
    const navigate = useNavigate();

    const menuItems = [
        { key: 'specialization', label: 'Специальность', step: 0, path: '/book/specialization' },
        { key: 'doctor', label: 'Врач', step: 1, path: selectedData.specialization ? `/book/doctor?spec=${encodeURIComponent(selectedData.specialization)}` : null },
        { key: 'datetime', label: 'Дата и время', step: 2, path: selectedData.doctorId ? `/book/datetime?doctor_id=${selectedData.doctorId}&doctor_name=${encodeURIComponent(selectedData.doctorName || '')}&spec=${encodeURIComponent(selectedData.specialization || '')}` : null },
        { key: 'personal', label: 'Личные данные', step: 3, path: '/book/personal' },
        { key: 'confirm', label: 'Подтверждение', step: 4, path: '/book/confirm' }
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
            <h3>Этапы записи</h3>
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

export default BookingSidebar;