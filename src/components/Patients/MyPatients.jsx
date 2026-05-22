import React, { useState, useEffect } from 'react';
import { patientsAPI } from '../../services/api';
import { FaUserPlus, FaUser, FaTrash, FaCalendarPlus, FaHistory } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        birth_date: '',
        address: '',
        district_number: ''
    });

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const response = await patientsAPI.getMy();
            if (response.data.success) {
                setPatients(response.data.patients);
            }
        } catch (error) {
            toast.error('Ошибка загрузки списка пациентов');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
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
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Ошибка добавления');
        }
    };

    const handleRemove = async (id, name, isSelf) => {
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
                toast.error('Ошибка удаления');
            }
        }
    };

    return (
        <div className="container mt-4">
            <div className="row">
                {/* Левая колонка */}
                <div className="col-md-4">
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0"><FaUserPlus className="me-2" />Добавить пациента</h5>
                        </div>
                        <div className="card-body">
                            <button className="btn btn-primary w-100 mb-3" onClick={() => setShowAddForm(!showAddForm)}>
                                <FaUserPlus className="me-2" />{showAddForm ? 'Скрыть форму' : 'Добавить члена семьи'}
                            </button>

                            {showAddForm && (
                                <form onSubmit={handleAdd}>
                                    <input type="text" className="form-control mb-2" placeholder="ФИО *" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                                    <input type="date" className="form-control mb-2" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} required />
                                    <input type="text" className="form-control mb-2" placeholder="Адрес" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                                    <input type="number" className="form-control mb-2" placeholder="Номер участка" value={formData.district_number} onChange={e => setFormData({...formData, district_number: e.target.value})} />
                                    <button type="submit" className="btn btn-success w-100">Добавить</button>
                                </form>
                            )}
                        </div>
                    </div>

                    <div className="card shadow-sm">
                        <div className="card-header bg-info text-white">
                            <h6 className="mb-0">ℹ️ Информация</h6>
                        </div>
                        <div className="card-body">
                            <p className="small mb-0">Вы можете добавлять членов семьи. Лимит: до 6 пациентов.</p>
                        </div>
                    </div>
                </div>

                {/* Правая колонка */}
                <div className="col-md-8">
                    <div className="card shadow-sm">
                        <div className="card-header bg-primary text-white">
                            <h5 className="mb-0"><FaUser className="me-2" />Мои пациенты</h5>
                        </div>
                        <div className="card-body">
                            {loading ? (
                                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                            ) : patients.length === 0 ? (
                                <div className="alert alert-info text-center">
                                    <p>У вас пока нет добавленных пациентов</p>
                                    <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
                                        <FaUserPlus className="me-1" />Добавить первого пациента
                                    </button>
                                </div>
                            ) : (
                                <div className="row">
                                    {patients.map((patient) => (
                                        <div key={patient.id} className="col-md-6 mb-3">
                                            <div className="card h-100">
                                                <div className="card-body">
                                                    <div className="d-flex justify-content-between">
                                                        <div>
                                                            <h6>
                                                                {patient.full_name}
                                                                {patient.patient_type === 'self' && <span className="badge bg-primary ms-2">Я</span>}
                                                                {patient.patient_type !== 'self' && <span className="badge bg-secondary ms-2">Член семьи</span>}
                                                            </h6>
                                                            <p className="small text-muted mb-1">Дата рождения: {new Date(patient.birth_date).toLocaleDateString()}</p>
                                                            {patient.address && <p className="small text-muted mb-1">Адрес: {patient.address}</p>}
                                                            <p className="small text-muted">Активных записей: {patient.active_appointments || 0}</p>
                                                        </div>
                                                        <div className="btn-group-vertical">
                                                            <Link to={`/book?patient_id=${patient.id}`} className="btn btn-sm btn-outline-primary mb-1" title="Записать"><FaCalendarPlus /></Link>
                                                            <Link to={`/medical-history/${patient.id}`} className="btn btn-sm btn-outline-info mb-1" title="История"><FaHistory /></Link>
                                                            {patient.patient_type !== 'self' && (
                                                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(patient.id, patient.full_name, false)}><FaTrash /></button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
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

export default MyPatients;