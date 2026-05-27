import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../../services/api';
import { FaUserMd, FaStethoscope, FaMapMarkerAlt, FaUserClock } from 'react-icons/fa';

const PublicDoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpec, setSelectedSpec] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSpecializations();
    }, []);

    useEffect(() => {
        loadDoctors();
    }, [selectedSpec]);

    const loadSpecializations = async () => {
        try {
            const response = await doctorsAPI.getSpecializations();
            if (response.data.success) {
                setSpecializations(response.data.specializations);
            }
        } catch (error) {
            console.error('Error loading specializations:', error);
        }
    };

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const response = await doctorsAPI.getAll(selectedSpec);
            if (response.data.success) {
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="doctors-page">
            <div className="container">
                <div className="doctors-header">
                    <h1 className="doctors-title">Наши врачи</h1>
                    <p className="doctors-subtitle">Высококвалифицированные специалисты</p>
                </div>

                <div className="doctors-layout">
                    {/* Боковая панель со специализациями */}
                    <div className="doctors-sidebar">
                        <div className="specializations-card">
                            <h3>
                                <FaStethoscope className="card-icon" />
                                Специализации
                            </h3>
                            <ul className="specializations-list">
                                <li 
                                    className={`spec-item ${!selectedSpec ? 'active' : ''}`}
                                    onClick={() => setSelectedSpec('')}
                                >
                                    Все врачи
                                </li>
                                {specializations.map(spec => (
                                    <li 
                                        key={spec.specialization}
                                        className={`spec-item ${selectedSpec === spec.specialization ? 'active' : ''}`}
                                        onClick={() => setSelectedSpec(spec.specialization)}
                                    >
                                        {spec.specialization}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Список врачей */}
                    <div className="doctors-content">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-success"></div>
                                <p className="mt-2">Загрузка...</p>
                            </div>
                        ) : doctors.length === 0 ? (
                            <div className="empty-state">
                                <FaUserMd className="empty-icon" />
                                <h3>Врачи не найдены</h3>
                                <p>Попробуйте выбрать другую специальность</p>
                            </div>
                        ) : (
                            <div className="doctors-grid">
                                {doctors.map(doctor => (
                                    <div key={doctor.id} className="doctor-card">
                                        <div className="doctor-card-inner">
                                            <div className="doctor-avatar">
                                                <FaUserMd />
                                            </div>
                                            <div className="doctor-info">
                                                <h4 className="doctor-name">{doctor.full_name}</h4>
                                                <p className="doctor-specialization">
                                                    <FaStethoscope /> {doctor.specialization}
                                                </p>
                                                <p className="doctor-room">
                                                    <FaMapMarkerAlt /> Кабинет №{doctor.room_number}
                                                </p>
                                                <div className="doctor-stats">
                                                    <FaUserClock /> 
                                                    <span>Предстоящих приёмов: {doctor.upcoming_count || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicDoctorsList;
