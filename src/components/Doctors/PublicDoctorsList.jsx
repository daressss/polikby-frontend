import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../../services/api';
import { FaUserMd, FaStethoscope, FaMapMarkerAlt } from 'react-icons/fa';

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
        <div className="container mt-4">
            <div className="text-center mb-5">
                <h1 className="section-title">Наши врачи</h1>
                <p className="text-muted">Высококвалифицированные специалисты</p>
            </div>

            <div className="row">
                {/* Боковая панель со специализациями */}
                <div className="col-md-3 mb-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0"><FaStethoscope className="me-2" />Специализации</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="list-group list-group-flush">
                                <button 
                                    className={`list-group-item list-group-item-action ${!selectedSpec ? 'active bg-success text-white' : ''}`}
                                    onClick={() => setSelectedSpec('')}
                                >
                                    Все врачи
                                </button>
                                {specializations.map(spec => (
                                    <button 
                                        key={spec.specialization}
                                        className={`list-group-item list-group-item-action ${selectedSpec === spec.specialization ? 'active bg-success text-white' : ''}`}
                                        onClick={() => setSelectedSpec(spec.specialization)}
                                    >
                                        {spec.specialization}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Список врачей */}
                <div className="col-md-9">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-success"></div>
                        </div>
                    ) : doctors.length === 0 ? (
                        <div className="alert alert-info text-center">
                            <p>Врачи не найдены</p>
                        </div>
                    ) : (
                        <div className="row">
                            {doctors.map(doctor => (
                                <div key={doctor.id} className="col-md-6 mb-4">
                                    <div className="doctor-card">
                                        <div className="doctor-avatar">
                                            <FaUserMd />
                                        </div>
                                        <div className="doctor-info">
                                            <h4 className="doctor-name">{doctor.full_name}</h4>
                                            <p className="doctor-specialization">
                                                <FaStethoscope className="me-1" /> {doctor.specialization}
                                            </p>
                                            <p className="text-muted">
                                                <FaMapMarkerAlt className="me-1" /> Кабинет №{doctor.room_number}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicDoctorsList;
