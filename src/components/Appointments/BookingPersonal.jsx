import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { patientsAPI } from '../../services/api';
import BookingBreadcrumbs from './BookingBreadcrumbs';
import BookingSidebar from './BookingSidebar';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BookingPersonal = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const slotId = searchParams.get('slot_id');
    const doctorId = searchParams.get('doctor_id');
    const doctorName = searchParams.get('doctor_name');
    const specialization = searchParams.get('spec');
    const date = searchParams.get('date');
    const time = searchParams.get('time');

    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const response = await patientsAPI.getMy();
            if (response.data.success) {
                setPatients(response.data.patients);
                if (response.data.patients.length > 0) {
                    setSelectedPatient(response.data.patients[0].id);
                }
            }
        } catch (error) {
            toast.error('Ошибка загрузки списка пациентов');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPatient) {
            toast.error('Выберите пациента');
            return;
        }

        // Переход на страницу подтверждения
        navigate(`/book/confirm?slot_id=${slotId}&patient_id=${selectedPatient}&doctor_id=${doctorId}&doctor_name=${encodeURIComponent(doctorName)}&spec=${encodeURIComponent(specialization)}&date=${date}&time=${time}`);
    };

    const selectedData = { specialization, doctorId, doctorName };

    return (
        <div className="booking-page">
            <div className="container">
                <h1 className="booking-title">Заказ талона</h1>
                <p className="booking-subtitle">Личные данные</p>

                <BookingBreadcrumbs currentStep={3} selectedData={selectedData} />

                <div className="booking-layout">
                    <BookingSidebar currentStep={3} selectedData={selectedData} />

                    <div className="booking-content">
                        <div className="selected-info">
                            <div>Специальность: <strong>{specialization}</strong></div>
                            <div>Врач: <strong>{doctorName}</strong></div>
                            <div>Дата: <strong>{date}</strong></div>
                            <div>Время: <strong>{time?.substring(0, 5)}</strong></div>
                        </div>

                        <form onSubmit={handleSubmit} className="personal-form">
                            <div className="form-group">
                                <label>Выберите пациента:</label>
                                {loading ? (
                                    <div className="text-center"><div className="spinner-border text-success spinner-sm"></div></div>
                                ) : (
                                    <select
                                        className="form-input"
                                        value={selectedPatient}
                                        onChange={(e) => setSelectedPatient(e.target.value)}
                                        required
                                    >
                                        {patients.map(patient => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.full_name} {patient.patient_type === 'self' ? '(Я)' : `(${patient.relationship || 'Член семьи'})`}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <button type="submit" className="btn-primary btn-block">Продолжить</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPersonal;