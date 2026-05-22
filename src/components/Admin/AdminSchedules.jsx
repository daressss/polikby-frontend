import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaPlus, FaTrash, FaClock, FaUserMd, FaStethoscope } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminSchedules = () => {
    const [schedules, setSchedules] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        doctor_id: '',
        work_date: '',
        start_time: '09:00',
        end_time: '17:00'
    });
    const [filters, setFilters] = useState({
        doctor_id: '',
        start_date: '',
        end_date: ''
    });

    useEffect(() => {
        loadDoctors();
        loadSchedules();
    }, [filters]);

    const loadDoctors = async () => {
        try {
            const response = await api.get('/admin/doctors');
            if (response.data.success) {
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    };

    const loadSchedules = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.doctor_id) params.doctor_id = filters.doctor_id;
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;

            const response = await api.get('/admin/schedules', { params });
            if (response.data.success) {
                setSchedules(response.data.schedules);
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
            toast.error('Ошибка загрузки расписаний');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.doctor_id || !formData.work_date || !formData.start_time || !formData.end_time) {
            toast.error('Заполните все поля');
            return;
        }

        try {
            const response = await api.post('/admin/schedules', formData);
            if (response.data.success) {
                toast.success('Расписание создано');
                setShowModal(false);
                setFormData({
                    doctor_id: '',
                    work_date: '',
                    start_time: '09:00',
                    end_time: '17:00'
                });
                loadSchedules();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка создания расписания');
        }
    };

    const handleDelete = async (schedule) => {
        if (window.confirm(`Удалить расписание на ${new Date(schedule.work_date).toLocaleDateString()}? Все связанные талоны будут удалены.`)) {
            try {
                await api.delete(`/admin/schedules/${schedule.id}`);
                toast.success('Расписание удалено');
                loadSchedules();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getAvailableSlots = (schedule) => {
        const total = schedule.total_slots || 0;
        const booked = schedule.booked_slots || 0;
        return total - booked;
    };

    const getLoadPercent = (schedule) => {
        const total = schedule.total_slots || 0;
        const booked = schedule.booked_slots || 0;
        if (total === 0) return 0;
        return Math.round((booked / total) * 100);
    };

    return (
        <div className="admin-schedules">
            <div className="admin-schedules-header">
                <h2>Управление расписанием</h2>
                <button className="btn-primary" onClick={() => setShowModal(true)}>
                    <FaPlus /> Создать расписание
                </button>
            </div>

            {/* Фильтры */}
            <div className="admin-filters">
                <div className="filter-group">
                    <label>Врач:</label>
                    <select
                        className="form-input"
                        value={filters.doctor_id}
                        onChange={(e) => setFilters({...filters, doctor_id: e.target.value})}
                    >
                        <option value="">Все врачи</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.full_name} ({doctor.specialization})
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <label>С даты:</label>
                    <input
                        type="date"
                        className="form-input"
                        value={filters.start_date}
                        onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                    />
                </div>
                <div className="filter-group">
                    <label>По дату:</label>
                    <input
                        type="date"
                        className="form-input"
                        value={filters.end_date}
                        onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                    />
                </div>
                <button className="btn-outline" onClick={() => setFilters({ doctor_id: '', start_date: '', end_date: '' })}>
                    Сбросить
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : schedules.length === 0 ? (
                <div className="admin-empty-state">
                    <FaCalendarAlt className="empty-icon" />
                    <h3>Нет расписаний</h3>
                    <p>Создайте первое расписание для врача</p>
                </div>
            ) : (
                <div className="admin-schedules-list">
                    {schedules.map(schedule => (
                        <div key={schedule.id} className="admin-schedule-card">
                            <div className="schedule-card-header">
                                <div className="schedule-doctor">
                                    <FaUserMd className="doctor-icon" />
                                    <div>
                                        <h4>{schedule.doctor_name}</h4>
                                        <p><FaStethoscope /> {schedule.specialization}</p>
                                    </div>
                                </div>
                                <div className="schedule-load">
                                    <div className="load-percent">{getLoadPercent(schedule)}%</div>
                                    <div className="load-bar">
                                        <div className="load-fill" style={{ width: `${getLoadPercent(schedule)}%` }}></div>
                                    </div>
                                    <div className="load-stats">
                                        <span>Забронировано: {schedule.booked_slots || 0}</span>
                                        <span>Свободно: {getAvailableSlots(schedule)}</span>
                                        <span>Всего: {schedule.total_slots || 0}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="schedule-card-body">
                                <div className="schedule-info">
                                    <FaCalendarAlt />
                                    <span className="schedule-date">{formatDate(schedule.work_date)}</span>
                                    <FaClock />
                                    <span className="schedule-time">
                                        {schedule.start_time?.substring(0,5)} - {schedule.end_time?.substring(0,5)}
                                    </span>
                                </div>
                            </div>
                            <div className="schedule-card-footer">
                                <button className="btn-outline-danger" onClick={() => handleDelete(schedule)}>
                                    <FaTrash /> Удалить расписание
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модальное окно создания расписания */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Создание расписания</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-modal-form">
                            <div className="form-group">
                                <label>Врач *</label>
                                <select
                                    className="form-input"
                                    value={formData.doctor_id}
                                    onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                                    required
                                >
                                    <option value="">Выберите врача</option>
                                    {doctors.map(doctor => (
                                        <option key={doctor.id} value={doctor.id}>
                                            {doctor.full_name} ({doctor.specialization})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Дата *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={formData.work_date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({...formData, work_date: e.target.value})}
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Время начала *</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Время окончания *</label>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="admin-modal-buttons">
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Отмена</button>
                                <button type="submit" className="btn-primary">Создать расписание</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSchedules;