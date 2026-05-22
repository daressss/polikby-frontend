import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doctorsAPI } from '../../services/api';
import BookingBreadcrumbs from './BookingBreadcrumbs';
import BookingSidebar from './BookingSidebar';
import { FaUserMd } from 'react-icons/fa';

const BookingDoctor = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const specialization = searchParams.get('spec');

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (specialization) {
            loadDoctors();
        }
    }, [specialization]);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const response = await doctorsAPI.getAll(specialization);
            if (response.data.success) {
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDoctorClick = (doctor) => {
        navigate(`/book/datetime?doctor_id=${doctor.id}&doctor_name=${encodeURIComponent(doctor.full_name)}&spec=${encodeURIComponent(specialization)}`);
    };

    const selectedData = { specialization };

    return (
        <div className="booking-page">
            <div className="container">
                <h1 className="booking-title">Заказ талона</h1>
                <p className="booking-subtitle">Выбор врача</p>

                <BookingBreadcrumbs currentStep={1} selectedData={selectedData} />

                <div className="booking-layout">
                    <BookingSidebar currentStep={1} selectedData={selectedData} />

                    <div className="booking-content">
                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                        ) : (
                            <>
                                <div className="selected-info">
                                    Специальность: <strong>{specialization}</strong>
                                </div>
                                <div className="doctors-grid">
                                    {doctors.map((doctor) => (
                                        <button
                                            key={doctor.id}
                                            className="doctor-card-btn"
                                            onClick={() => handleDoctorClick(doctor)}
                                        >
                                            <FaUserMd className="doctor-icon" />
                                            <div className="doctor-info">
                                                <div className="doctor-name">{doctor.full_name}</div>
                                                <div className="doctor-room">Каб. {doctor.room_number}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDoctor;