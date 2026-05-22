import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaUserMd, FaStethoscope, FaMapMarkerAlt, FaEnvelope, FaPhone, FaKey } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminDoctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        specialization: '',
        room_number: '',
        district_number: '',
        username: '',
        password: '',
        email: '',
        phone: ''
    });
    const [specializations, setSpecializations] = useState([]);

    useEffect(() => {
        loadDoctors();
        loadSpecializations();
    }, []);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/doctors');
            if (response.data.success) {
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            toast.error('Ошибка загрузки врачей');
        } finally {
            setLoading(false);
        }
    };

    const loadSpecializations = async () => {
        try {
            const response = await api.get('/doctors/specializations');
            if (response.data.success) {
                setSpecializations(response.data.specializations);
            }
        } catch (error) {
            console.error('Error loading specializations:', error);
        }
    };

    const handleOpenModal = (doctor = null) => {
        if (doctor) {
            setEditingDoctor(doctor);
            setFormData({
                full_name: doctor.full_name || '',
                specialization: doctor.specialization || '',
                room_number: doctor.room_number || '',
                district_number: doctor.district_number || '',
                username: doctor.username || '',
                password: '',
                email: doctor.email || '',
                phone: doctor.phone || ''
            });
        } else {
            setEditingDoctor(null);
            setFormData({
                full_name: '',
                specialization: '',
                room_number: '',
                district_number: '',
                username: '',
                password: '',
                email: '',
                phone: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.full_name || !formData.specialization || !formData.room_number) {
            toast.error('Заполните обязательные поля');
            return;
        }

        if (!editingDoctor && (!formData.username || !formData.password)) {
            toast.error('Введите логин и пароль для нового врача');
            return;
        }

        try {
            if (editingDoctor) {
                await api.put(`/admin/doctors/${editingDoctor.id}`, formData);
                toast.success('Информация о враче обновлена');
            } else {
                await api.post('/admin/doctors', formData);
                toast.success('Врач успешно добавлен');
            }
            setShowModal(false);
            loadDoctors();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка сохранения');
        }
    };

    const handleDelete = async (doctor) => {
        if (window.confirm(`Удалить врача "${doctor.full_name}"?`)) {
            try {
                await api.delete(`/admin/doctors/${doctor.id}`);
                toast.success('Врач удален');
                loadDoctors();
            } catch (error) {
                toast.error('Ошибка удаления');
            }
        }
    };

    return (
        <div className="admin-doctors">
            <div className="admin-doctors-header">
                <h2>Управление врачами</h2>
                <button className="btn-primary" onClick={() => handleOpenModal()}>
                    <FaPlus /> Добавить врача
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : doctors.length === 0 ? (
                <div className="admin-empty-state">
                    <FaUserMd className="empty-icon" />
                    <h3>Нет врачей</h3>
                    <p>Добавьте первого врача в систему</p>
                </div>
            ) : (
                <div className="admin-doctors-table-container">
                    <table className="admin-doctors-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>ФИО</th>
                            <th>Специальность</th>
                            <th>Кабинет</th>
                            <th>Участок</th>
                            <th>Логин</th>
                            <th>Записей сегодня</th>
                            <th>Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {doctors.map(doctor => (
                            <tr key={doctor.id}>
                                <td>{doctor.id}</td>
                                <td><strong>{doctor.full_name}</strong></td>
                                <td>{doctor.specialization}</td>
                                <td>{doctor.room_number}</td>
                                <td>{doctor.district_number || '—'}</td>
                                <td>{doctor.username}</td>
                                <td>{doctor.today_appointments || 0}</td>
                                <td className="actions-cell">
                                    <button className="action-btn edit" onClick={() => handleOpenModal(doctor)}>
                                        <FaEdit />
                                    </button>
                                    <button className="action-btn delete" onClick={() => handleDelete(doctor)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Модальное окно добавления/редактирования */}
            {showModal && (
                <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>{editingDoctor ? 'Редактировать врача' : 'Добавить врача'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="admin-modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaUserMd /> ФИО *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FaStethoscope /> Специальность *</label>
                                    <select
                                        className="form-input"
                                        value={formData.specialization}
                                        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                                        required
                                    >
                                        <option value="">Выберите специальность</option>
                                        {specializations.map(spec => (
                                            <option key={spec.specialization} value={spec.specialization}>
                                                {spec.specialization}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaMapMarkerAlt /> Номер кабинета *</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.room_number}
                                        onChange={(e) => setFormData({...formData, room_number: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Номер участка</label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={formData.district_number}
                                        onChange={(e) => setFormData({...formData, district_number: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaKey /> Логин {!editingDoctor && '*'}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required={!editingDoctor}
                                        disabled={!!editingDoctor}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FaKey /> Пароль {!editingDoctor && '*'}</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        placeholder={editingDoctor ? 'Оставьте пустым для сохранения текущего' : 'Введите пароль'}
                                        required={!editingDoctor}
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label><FaEnvelope /> Email</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label><FaPhone /> Телефон</label>
                                    <input
                                        type="tel"
                                        className="form-input"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="admin-modal-buttons">
                                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Отмена</button>
                                <button type="submit" className="btn-primary">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDoctors;