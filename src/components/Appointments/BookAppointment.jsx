import React, { useState, useEffect } from 'react';
import { doctorsAPI, appointmentsAPI, patientsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const BookAppointment = () => {
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [patients, setPatients] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [selectedPatient, setSelectedPatient] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDoctors();
        loadSpecializations();
        loadMyPatients();
    }, []);

    useEffect(() => {
        if (selectedDoctor && selectedDate) loadAvailableSlots();
    }, [selectedDoctor, selectedDate]);

    const loadDoctors = async (specialization = '') => {
        const response = await doctorsAPI.getAll(specialization);
        if (response.data.success) setDoctors(response.data.doctors);
    };

    const loadSpecializations = async () => {
        const response = await doctorsAPI.getSpecializations();
        if (response.data.success) setSpecializations(response.data.specializations);
    };

    const loadMyPatients = async () => {
        const response = await patientsAPI.getMy();
        if (response.data.success) {
            setPatients(response.data.patients);
            if (response.data.patients.length > 0) setSelectedPatient(response.data.patients[0].id);
        }
    };

    const loadAvailableSlots = async () => {
        setLoading(true);
        const response = await appointmentsAPI.getAvailable(selectedDoctor, selectedDate);
        if (response.data.success) setAvailableSlots(response.data.slots);
        setLoading(false);
    };

    const handleBook = async (appointmentId) => {
        if (!selectedPatient) { toast.error('Выберите пациента'); return; }
        const response = await appointmentsAPI.book(appointmentId, selectedPatient);
        if (response.data.success) {
            toast.success('Талон забронирован!');
            loadAvailableSlots();
        } else toast.error(response.data.message);
    };

    const minDate = new Date().toISOString().split('T')[0];

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-md-4">
                    <div className="card shadow-sm">
                        <div className="card-header bg-success text-white"><h5>Выбор врача и даты</h5></div>
                        <div className="card-body">
                            <select className="form-select mb-3" onChange={(e) => loadDoctors(e.target.value)}><option value="">Все специальности</option>{specializations.map(s => <option key={s.specialization} value={s.specialization}>{s.specialization}</option>)}</select>
                            <select className="form-select mb-3" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}><option value="">Выберите врача</option>{doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} ({d.specialization})</option>)}</select>
                            <select className="form-select mb-3" value={selectedPatient} onChange={(e) => setSelectedPatient(e.target.value)}>{patients.map(p => <option key={p.id} value={p.id}>{p.full_name} {p.patient_type === 'self' ? '(Я)' : `(${p.relationship})`}</option>)}</select>
                            <input type="date" className="form-control" min={minDate} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-info text-white"><h5>Доступные талоны</h5></div>
                        <div className="card-body">
                            {loading && <div className="text-center"><div className="spinner-border text-success"></div></div>}
                            {!loading && availableSlots.length === 0 && selectedDoctor && selectedDate && <div className="alert alert-warning">Нет доступных талонов</div>}
                            {!loading && !selectedDoctor && !selectedDate && <div className="alert alert-info">Выберите врача и дату</div>}
                            {availableSlots.map(slot => (
                                <div key={slot.id} className="schedule-item"><div><strong>{slot.appointment_time?.substring(0, 5)}</strong><br /><small>Каб. {slot.room_number}</small><br /><small>Талон №{slot.ticket_number}</small></div><button className="btn btn-sm btn-success" onClick={() => handleBook(slot.id)}>Записаться</button></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookAppointment;