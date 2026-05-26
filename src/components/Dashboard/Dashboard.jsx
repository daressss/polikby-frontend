import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { patientsAPI, appointmentsAPI } from '../../services/api';
import { FaUserPlus, FaUser, FaCalendarAlt, FaHistory, FaTrash, FaCalendarPlus, FaClock, FaCheckCircle, FaTimesCircle, FaUserEdit } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Breadcrumbs from './Breadcrumbs';
import api from '../../services/api';

const Dashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('patients');
    const [patients, setPatients] = useState([]);
    const [activeAppointments, setActiveAppointments] = useState([]);
    const [historyAppointments, setHistoryAppointments] = useState([]);
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
        { key: 'history', label: 'История' },
        { key: 'profile', label: 'Профиль' }
    ];

    const getCurrentStep = () => {
        switch(activeTab) {
            case 'patients': return 0;
            case 'appointments': return 1;
            case 'history': return 2;
            case 'profile': return 3;
            default: return 0;
        }
    };

    const handleStepClick = (key) => {
        setActiveTab(key);
    };

    useEffect(() => {
        if (activeTab === 'patients') {
            loadPatients();
        } else if (activeTab === 'appointments') {
            loadAppointments();
        } else if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const response = await patientsAPI.getMy();
            if (response.data.success) {
                setPatients(response.data.patients);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            toast.error('Ошибка загрузки списка пациентов');
        } finally {
            setLoading(false);
        }
    };

    const loadAppointments = async () => {
        setLoading(true);
        try {
            const response = await appointmentsAPI.getMy();
            if (response.data.success) {
                setActiveAppointments(response.data.active || []);
            }
        } catch (error) {
            console.error('Error loading appointments:', error);
            toast.error('Ошибка загрузки записей');
        } finally {
            setLoading(false);
        }
    };

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await appointmentsAPI.getMy();
            if (response.data.success) {
                setHistoryAppointments(response.data.history || []);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error('Ошибка загрузки истории');
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
            if (response.data.success) {
                toast.success('Пациент добавлен!');
                setFormData({ full_name: '', birth_date: '', address: '', district_number: '' });
                setShowAddForm(false);
                loadPatients();
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

    const handleCancelAppointment = async (id) => {
        if (window.confirm('Отменить запись?')) {
            try {
                const response = await appointmentsAPI.cancel(id);
                if (response.data.success) {
                    toast.success('Запись отменена');
                    loadAppointments();
                } else {
                    toast.error(response.data.message);
                }
            } catch (error) {
                toast.error('Ошибка отмены');
            }
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            booked: { class: 'status-booked', text: 'Забронировано', icon: <FaClock /> },
            completed: { class: 'status-completed', text: 'Завершено', icon: <FaCheckCircle /> },
            cancelled: { class: 'status-cancelled', text: 'Отменено', icon: <FaTimesCircle /> },
            no_show: { class: 'status-no-show', text: 'Не явился', icon: <FaTimesCircle /> }
        };
        const s = statusMap[status] || { class: 'status-default', text: status, icon: null };
        return (
            <span className={`status-badge ${s.class}`}>
                {s.icon} {s.text}
            </span>
        );
    };

    // ============ ВКЛАДКА ПРОФИЛЬ ============
    const ProfileTab = () => {
        const [profileData, setProfileData] = useState({
            email: '',
            phone: '',
            address: '',
            district_number: ''
        });
        const [loading, setLoading] = useState(false);
        const [saving, setSaving] = useState(false);

        useEffect(() => {
            loadProfile();
        }, []);

        const loadProfile = async () => {
            setLoading(true);
            try {
                const userResponse = await api.get('/auth/me');
                if (userResponse.data.success) {
                    setProfileData(prev => ({
                        ...prev,
                        email: userResponse.data.user.email || '',
                        phone: userResponse.data.user.phone || ''
                    }));
                }
                
                const patientResponse = await patientsAPI.getMy();
                if (patientResponse.data.success && patientResponse.data.patients.length > 0) {
                    const selfPatient = patientResponse.data.patients.find(p => p.patient_type === 'self');
                    if (selfPatient) {
                        setProfileData(prev => ({
                            ...prev,
                            address: selfPatient.address || '',
                            district_number: selfPatient.district_number || ''
                        }));
                    }
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                toast.error('Ошибка загрузки профиля');
            } finally {
                setLoading(false);
            }
        };

        const handleSave = async () => {
            setSaving(true);
            try {
                await api.put('/users/profile', {
                    email: profileData.email,
                    phone: profileData.phone
                });
                
                await api.put('/patients/profile', {
                    address: profileData.address,
                    district_number: profileData.district_number
                });
                
                toast.success('Профиль обновлен');
            } catch (error) {
                console.error('Error saving profile:', error);
                toast.error('Ошибка сохранения');
            } finally {
                setSaving(false);
            }
        };

        if (loading) {
            return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
        }

        return (
            <div className="profile-tab">
                <div className="profile-card">
                    <h3><FaUserEdit /> Редактирование профиля</h3>
                    
                    <div className="form-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            className="form-input"
                            value={profileData.email} 
                            onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                            placeholder="Ваш email"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Телефон</label>
                        <input 
                            type="tel" 
                            className="form-input"
                            value={profileData.phone} 
                            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                            placeholder="Ваш телефон"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Адрес</label>
                        <textarea 
                            className="form-textarea"
                            rows="2"
                            value={profileData.address} 
                            onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                            placeholder="Ваш адрес"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Номер участка</label>
                        <input 
                            type="number" 
                            className="form-input"
                            value={profileData.district_number} 
                            onChange={(e) => setProfileData({...profileData, district_number: e.target.value})}
                            placeholder="Номер участка"
                        />
                    </div>
                    
                    <button className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                </div>
            </div>
        );
    };

    // Вкладка "Пациенты"
    const PatientsTab = () => (
        <div className="patients-tab">
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-success"></div>
                    <p className="mt-2">Загрузка...</p>
                </div>
            ) : (
                <>
                    <div className="add-patient-card">
                        <button className="add-patient-btn" onClick={() => setShowAddForm(!showAddForm)}>
                            <FaUserPlus /> {showAddForm ? 'Скрыть форму' : 'Добавить пациента'}
                        </button>

                        {showAddForm && (
                            <form onSubmit={handleAddPatient} className="add-patient-form">
                                <input type="text" className="form-input" placeholder="ФИО *" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                                <input type="date" className="form-input" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} required />
                                <input type="text" className="form-input" placeholder="Адрес" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                <input type="number" className="form-input" placeholder="Номер участка" value={formData.district_number} onChange={e => setFormData({...formData, district_number: e.target.value})} />
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
    );

    // Вкладка "Талоны" (активные записи)
    const AppointmentsTab = () => (
        <div className="appointments-tab">
            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : activeAppointments.length === 0 ? (
                <div className="tab-content-empty">
                    <FaCalendarAlt className="empty-icon" />
                    <h3>У вас пока нет активных записей</h3>
                    <p>Запишитесь к врачу, чтобы увидеть свои талоны</p>
                    <Link to="/book/specialization" className="btn-primary">Записаться</Link>
                </div>
            ) : (
                <div className="appointments-list">
                    {activeAppointments.map((apt) => (
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
                            {apt.status === 'booked' && (
                                <button className="cancel-appointment-btn" onClick={() => handleCancelAppointment(apt.id)}>
                                    <FaTimesCircle /> Отменить
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // Вкладка "История" (завершенные приемы)
    const HistoryTab = () => {
        const [history, setHistory] = useState([]);
        const [loadingHistory, setLoadingHistory] = useState(true);

        useEffect(() => {
            loadHistoryData();
        }, []);

        const loadHistoryData = async () => {
            setLoadingHistory(true);
            try {
                const response = await appointmentsAPI.getMy();
                if (response.data.success) {
                    setHistory(response.data.history || []);
                }
            } catch (error) {
                console.error('Error loading history:', error);
                toast.error('Ошибка загрузки истории');
            } finally {
                setLoadingHistory(false);
            }
        };

        if (loadingHistory) {
            return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
        }

        if (history.length === 0) {
            return (
                <div className="tab-content-empty">
                    <FaHistory className="empty-icon" />
                    <h3>История посещений пуста</h3>
                    <p>После приема врача здесь появится история ваших посещений</p>
                </div>
            );
        }

        return (
            <div className="history-list">
                {history.map((apt) => (
                    <div key={apt.id} className="history-card">
                        <div className="history-date">
                            <span className="date-day">{new Date(apt.appointment_date).toLocaleDateString()}</span>
                            <span className="date-time">{apt.appointment_time?.substring(0, 5)}</span>
                        </div>
                        <div className="history-info">
                            <h4>{apt.doctor_name}</h4>
                            <p>{apt.specialization} • Каб. {apt.room_number}</p>
                            {getStatusBadge(apt.status)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="dashboard-page">
            <div className="container">
                <h1 className="dashboard-title">Личный кабинет</h1>

                <Breadcrumbs steps={steps} currentStep={getCurrentStep()} onStepClick={handleStepClick} />

                <div className="dashboard-content">
                    {activeTab === 'patients' && <PatientsTab />}
                    {activeTab === 'appointments' && <AppointmentsTab />}
                    {activeTab === 'history' && <HistoryTab />}
                    {activeTab === 'profile' && <ProfileTab />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
