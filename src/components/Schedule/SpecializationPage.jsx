import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../../services/api';
import ScheduleBreadcrumbs from './ScheduleBreadcrumbs';
import ScheduleSidebar from './ScheduleSidebar';
import { FaStethoscope } from 'react-icons/fa';
const SpecializationPage = () => {
    return (
        <div style={{ padding: '50px', textAlign: 'center' }}>
            <h1>Страница выбора специальности</h1>
            <p>Если вы видите этот текст — компонент работает!</p>
        </div>
    );
};

export default SpecializationPage;
const SpecializationPage = () => {
    const navigate = useNavigate();
    const [specializations, setSpecializations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSpecializations();
    }, []);

    const loadSpecializations = async () => {
        setLoading(true);
        try {
            const response = await doctorsAPI.getSpecializations();
            if (response.data.success) {
                setSpecializations(response.data.specializations);
            }
        } catch (error) {
            console.error('Error loading specializations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSpecializationClick = (specialization) => {
        navigate(`/schedule/doctor?spec=${encodeURIComponent(specialization.specialization)}`);
    };

    return (
        <div className="booking-page">
            <div className="container">
                <h1 className="booking-title">Расписание</h1>
                <p className="booking-subtitle">Выбор специальности</p>

                <ScheduleBreadcrumbs currentStep={0} />

                <div className="booking-layout">
                    <ScheduleSidebar currentStep={0} />

                    <div className="booking-content">
                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                        ) : (
                            <div className="specializations-grid">
                                {specializations.map((spec) => (
                                    <button
                                        key={spec.specialization}
                                        className="specialization-card"
                                        onClick={() => handleSpecializationClick(spec)}
                                    >
                                        <FaStethoscope className="spec-icon" />
                                        <span>{spec.specialization}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpecializationPage;
