import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { patientsAPI, appointmentsAPI } from '../../services/api';
import { FaUserPlus, FaUser, FaCalendarAlt, FaHistory, FaTrash, FaCalendarPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Breadcrumbs from './Breadcrumbs';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        birth_date: '',
        address: '',
        district_number: ''
    });

    const steps = [
        { key: 'patients', label: 'Пациенты' },
        { key: 'appointments', label: 'Талоны' },
        { key: 'history', label: 'История' }
    ];

    const getCurrentStep = () => {
        switch(activeTab) {
            case 'patients': return 0;
            case 'appointments': return 1;
            case 'history': return 2;
            default: return 0;
        }
    };

    const handleStepClick = (key) => {
        setActiveTab(key);
    };

    useEffect(() => {
        console.log('Active tab changed to:', activeTab);
        if (activeTab === 'patients') {
            loadPatients();
        } else if (activeTab === 'appointments') {
            loadAppointments();
        }
    }, [activeTab]);

    const loadPatients = async () => {
        console.log('=== LOADING PATIENTS ===');
        setLoading(true);
        try {
            const response = await patientsAPI.getMy();
            console.log('Patients API Response:', response);
            console.log('Response data:', response.data);
            console.log('Patients array:', response.data?.patients);

            if (response.data.success) {
                setPatients(response.data.patients);
                console.log('Patients set successfully:', response.data.patients);
            } else {
                console.log('Response was not successful');
                toast.error('Ошибка загрузки списка пациентов');
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            toast.error('Ошибка загрузки списка пациентов');
        } finally {
            setLoading(false);
            console.log('Loading finished');
        }
    };

    const loadAppointments = async () => {
        console.log('=== LOADING APPOINTMENTS ===');
        setLoading(true);
        try {
            const response = await appointmentsAPI.getMy();
            console.log('Appointments API Response:', response);
            if (response.data.success) {
                setAppointments(response.data.appointments);
                console.log('Appointments set:', response.data.appointments);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            toast.error('Ошибка загрузки записей');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPatient = async (e) => {
        e.preventDefault();
        if (!formData.full_name || !formData.birth_date) {
            toast.error('Заполните имя и дату рождения');
            return;
        }

        try {
            const response = await patientsAPI.add(formData);
            console.log('Add patient response:', response);
            if (response.data.success) {
                toast.success('Пациент добавлен!');
                setFormData({ full_name: '', birth_date: '', address: '', district_number: '' });
                setShowAddForm(false);
                loadPatients(); // Перезагружаем список
            } else {
                toast.error(response.data.message || 'Ошибка добавления');
            }
        } catch (error) {
            console.error('Error adding patient:', error);
            toast.error(error.response?.data?.message || 'Ошибка добавления');
        }
    };

    const handleRemovePatient = async (id, name, isSelf) => {
        if (isSelf) {
            toast.error('Нельзя удалить самого себя');
            return;
        }

        if (window.confirm(`Удалить ${name} из списка?`)) {
            try {
                const response = await patientsAPI.remove(id);
                if (response.data.success) {
                    toast.success('Пациент удален');
                    loadPatients();
                }
            } catch (error) {
                console.error('Error removing patient:', error);
                toast.error('Ошибка удаления');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            booked: { class: 'status-booked', text: 'Забронировано' },
            completed: { class: 'status-completed', text: 'Завершено' },
            cancelled: { class: 'status-cancelled', text: 'Отменено' },
            available: { class: 'status-available', text: 'Доступно' }
        };
        const s = statusMap[status] || { class: 'status-default', text: status };
        return <span className={`status-badge ${s.class}`}>{s.text}</span>;
    };

    // Вкладка "Талоны"
    const AppointmentsTab = () => (
        <div className="appointments-tab">
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : appointments.length === 0 ? (
                <div className="tab-content-empty">
                    <FaCalendarAlt className="empty-icon" />
                    <h3>У вас пока нет записей</h3>
                    <p>Запишитесь к врачу, чтобы увидеть свои талоны</p>
                    <Link to="/book/specialization" className="btn-primary">Записаться</Link>
                </div>
            ) : (
                <div className="appointments-list">
                    {appointments.map((apt) => (
                        <div key={apt.id} className="appointment-card">
                            <div className="appointment-date">
                                <span className="date-day">{new Date(apt.appointment_date).toLocaleDateString()}</span>
                                <span className="date-time">{apt.appointment_time?.substring(0, 5)}</span>
                            </div>
                            <div className="appointment-info">
                                <h4>{apt.doctor_name}</h4>
                                <p>{apt.specialization} • Каб. {apt.room_number}</p>
                                {getStatusBadge(apt.status)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Вкладка "История" (заглушка)
    const HistoryTab = () => (
        <div className="tab-content-empty">
            <FaHistory className="empty-icon" />
            <h3>История посещений пуста</h3>
            <p>После приема врача здесь появится история ваших посещений</p>
        </div>
    );

    return (
        <div className="dashboard-page">
            <div className="container">
                <h1 className="dashboard-title">Личный кабинет</h1>

                {/* Хлебные крошки */}
                <Breadcrumbs
                    steps={steps}
                    currentStep={getCurrentStep()}
                    onStepClick={handleStepClick}
                />

                {/* Контент активной вкладки */}
                <div className="dashboard-content">
                    {activeTab === 'patients' && (
                        <div className="patients-tab">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-success"></div>
                                    <p className="mt-2">Загрузка...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="add-patient-card">
                                        <button
                                            className="add-patient-btn"
                                            onClick={() => setShowAddForm(!showAddForm)}
                                        >
                                            <FaUserPlus /> {showAddForm ? 'Скрыть форму' : 'Добавить пациента'}
                                        </button>

                                        {showAddForm && (
                                            <form onSubmit={handleAddPatient} className="add-patient-form">
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="ФИО *"
                                                    value={formData.full_name}
                                                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                                                    required
                                                />
                                                <input
                                                    type="date"
                                                    className="form-input"
                                                    value={formData.birth_date}
                                                    onChange={e => setFormData({...formData, birth_date: e.target.value})}
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    className="form-input"
                                                    placeholder="Адрес"
                                                    value={formData.address}
                                                    onChange={e => setFormData({...formData, address: e.target.value})}
                                                />
                                                <input
                                                    type="number"
                                                    className="form-input"
                                                    placeholder="Номер участка"
                                                    value={formData.district_number}
                                                    onChange={e => setFormData({...formData, district_number: e.target.value})}
                                                />
                                                <button type="submit" className="btn-success">Добавить</button>
                                            </form>
                                        )}
                                    </div>

                                    {patients.length === 0 ? (
                                        <div className="tab-content-empty">
                                            <FaUser className="empty-icon" />
                                            <h3>У вас пока нет пациентов</h3>
                                            <p>Добавьте себя или членов семьи</p>
                                        </div>
                                    ) : (
                                        <div className="patients-list">
                                            {patients.map((patient) => (
                                                <div key={patient.id} className="patient-card">
                                                    <div className="patient-card-header">
                                                        <h3 className="patient-name">
                                                            {patient.full_name}
                                                            {patient.patient_type === 'self' && <span className="badge-self">Я</span>}
                                                            {patient.patient_type !== 'self' && <span className="badge-family">Член семьи</span>}
                                                        </h3>
                                                    </div>
                                                    <div className="patient-info">
                                                        <p><strong>Дата рождения:</strong> {new Date(patient.birth_date).toLocaleDateString()}</p>
                                                        {patient.address && <p><strong>Адрес:</strong> {patient.address}</p>}
                                                        {patient.district_number && <p><strong>Участок:</strong> {patient.district_number}</p>}
                                                        <p><strong>Активных записей:</strong> {patient.active_appointments || 0}</p>
                                                    </div>
                                                    <div className="patient-actions">
                                                        <Link to={`/book/specialization?patient_id=${patient.id}`} className="btn-outline" title="Записать">
                                                            <FaCalendarPlus /> Записаться
                                                        </Link>
                                                        <Link to={`/medical-history/${patient.id}`} className="btn-outline" title="История">
                                                            <FaHistory /> История
                                                        </Link>
                                                        {patient.patient_type !== 'self' && (
                                                            <button className="btn-outline-danger" onClick={() => handleRemovePatient(patient.id, patient.full_name, false)}>
                                                                <FaTrash /> Удалить
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {activeTab === 'appointments' && <AppointmentsTab />}
                    {activeTab === 'history' && <HistoryTab />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;