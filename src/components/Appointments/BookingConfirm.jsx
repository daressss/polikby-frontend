import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import BookingBreadcrumbs from './BookingBreadcrumbs';
import BookingSidebar from './BookingSidebar';
import { FaCheckCircle, FaCalendarAlt, FaUserMd, FaClock, FaUser } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookingConfirm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const slotId = searchParams.get('slot_id');
    const patientId = searchParams.get('patient_id');
    const doctorId = searchParams.get('doctor_id');
    const doctorName = searchParams.get('doctor_name');
    const specialization = searchParams.get('spec');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const [loading, setLoading] = useState(false);
    const [confirmed, setConfirmed] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const response = await appointmentsAPI.book(slotId, patientId);
            if (response.data.success) {
                setConfirmed(true);
                toast.success('Талон успешно забронирован!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('Ошибка при бронировании');
        } finally {
            setLoading(false);
        }
    };

    const selectedData = { specialization, doctorId, doctorName };

    if (confirmed) {
        return (
            <div className="booking-page">
                <div className="container">
                    <div className="booking-success">
                        <FaCheckCircle className="success-icon" />
                        <h1>Вы успешно записаны!</h1>
                        <div className="success-details">
                            <div className="detail-item">
                                <FaUserMd />
                                <div>
                                    <strong>Врач:</strong> {doctorName}
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaCalendarAlt />
                                <div>
                                    <strong>Дата:</strong> {date}
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaClock />
                                <div>
                                    <strong>Время:</strong> {time?.substring(0, 5)}
                                </div>
                            </div>
                            <div className="detail-item">
                                <FaUser />
                                <div>
                                    <strong>Специальность:</strong> {specialization}
                                </div>
                            </div>
                        </div>
                        <div className="success-actions">
                            <button className="btn-primary" onClick={() => navigate('/')}>Вернуться на главную</button>
                            <button className="btn-outline" onClick={() => navigate('/dashboard')}>Посмотреть в личном кабинете</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="booking-page">
            <div className="container">
                <h1 className="booking-title">Заказ талона</h1>
                <p className="booking-subtitle">Подтверждение записи</p>

                <BookingBreadcrumbs currentStep={4} selectedData={selectedData} />

                <div className="booking-layout">
                    <BookingSidebar currentStep={4} selectedData={selectedData} />

                    <div className="booking-content">
                        <div className="confirm-info">
                            <h3>Проверьте данные записи:</h3>
                            <div className="info-card">
                                <div className="info-row">
                                    <span className="info-label">Специальность:</span>
                                    <span className="info-value">{specialization}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Врач:</span>
                                    <span className="info-value">{doctorName}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Дата:</span>
                                    <span className="info-value">{date}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Время:</span>
                                    <span className="info-value">{time?.substring(0, 5)}</span>
                                </div>
                            </div>

                            <div className="confirm-actions">
                                <button
                                    className="btn-primary btn-block"
                                    onClick={handleConfirm}
                                    disabled={loading}
                                >
                                    {loading ? 'Бронирование...' : 'Подтвердить запись'}
                                </button>
                                <button
                                    className="btn-outline btn-block"
                                    onClick={() => navigate(-1)}
                                >
                                    Назад
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirm;