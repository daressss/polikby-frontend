import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { appointmentsAPI } from '../../services/api';
import BookingBreadcrumbs from './BookingBreadcrumbs';
import BookingSidebar from './BookingSidebar';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';
import toast from 'react-hot-toast';

const BookingDateTime = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const doctorId = searchParams.get('doctor_id');
    const doctorName = searchParams.get('doctor_name');
    const specialization = searchParams.get('spec');

    const [availableSlots, setAvailableSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [dates, setDates] = useState([]);

    useEffect(() => {
        if (doctorId) {
            // Генерируем доступные даты на ближайшие 14 дней
            const generatedDates = [];
            for (let i = 1; i <= 14; i++) {
                const date = new Date();
                date.setDate(date.getDate() + i);
                generatedDates.push(date.toISOString().split('T')[0]);
            }
            setDates(generatedDates);
            if (generatedDates.length > 0) {
                setSelectedDate(generatedDates[0]);
            }
        }
    }, [doctorId]);

    useEffect(() => {
        if (doctorId && selectedDate) {
            loadAvailableSlots();
        }
    }, [doctorId, selectedDate]);

    const loadAvailableSlots = async () => {
        setLoading(true);
        try {
            const response = await appointmentsAPI.getAvailable(doctorId, selectedDate);
            if (response.data.success) {
                setAvailableSlots(response.data.slots);
            }
        } catch (error) {
            toast.error('Ошибка загрузки свободных талонов');
        } finally {
            setLoading(false);
        }
    };

    const handleSlotClick = (slot) => {
        navigate(`/book/personal?slot_id=${slot.id}&doctor_id=${doctorId}&doctor_name=${encodeURIComponent(doctorName)}&spec=${encodeURIComponent(specialization)}&date=${selectedDate}&time=${slot.appointment_time}`);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const selectedData = { specialization, doctorId, doctorName };

    return (
        <div className="booking-page">
            <div className="container">
                <h1 className="booking-title">Заказ талона</h1>
                <p className="booking-subtitle">Дата и время</p>

                <BookingBreadcrumbs currentStep={2} selectedData={selectedData} />

                <div className="booking-layout">
                    <BookingSidebar currentStep={2} selectedData={selectedData} />

                    <div className="booking-content">
                        <div className="selected-info">
                            <div>Специальность: <strong>{specialization}</strong></div>
                            <div>Врач: <strong>{doctorName}</strong></div>
                        </div>

                        <div className="date-selector">
                            <label>Выберите дату:</label>
                            <select
                                className="form-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            >
                                {dates.map(date => (
                                    <option key={date} value={date}>{formatDate(date)}</option>
                                ))}
                            </select>
                        </div>

                        <div className="time-slots">
                            <h3>Доступное время:</h3>
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                            ) : availableSlots.length === 0 ? (
                                <div className="no-slots">Нет доступных талонов на выбранную дату</div>
                            ) : (
                                <div className="slots-grid">
                                    {availableSlots.map((slot) => (
                                        <button
                                            key={slot.id}
                                            className="slot-card"
                                            onClick={() => handleSlotClick(slot)}
                                        >
                                            <FaClock className="slot-icon" />
                                            <span className="slot-time">{slot.appointment_time?.substring(0, 5)}</span>
                                            <span className="slot-ticket">Талон №{slot.ticket_number}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingDateTime;