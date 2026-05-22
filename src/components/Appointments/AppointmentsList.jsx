import React, { useState, useEffect } from 'react';
import { appointmentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AppointmentsList = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => { loadAppointments(); }, []);

    const loadAppointments = async () => {
        const response = await appointmentsAPI.getMy();
        if (response.data.success) setAppointments(response.data.appointments);
        setLoading(false);
    };

    const handleCancel = async (id) => {
        if (window.confirm('Отменить запись?')) {
            const response = await appointmentsAPI.cancel(id);
            if (response.data.success) { toast.success('Запись отменена'); loadAppointments(); }
            else toast.error(response.data.message);
        }
    };

    const getStatusBadge = (status) => {
        const s = { booked: 'bg-warning', completed: 'bg-success', cancelled: 'bg-danger', available: 'bg-secondary' };
        const t = { booked: 'Забронировано', completed: 'Завершено', cancelled: 'Отменено', available: 'Доступно' };
        return <span className={`badge ${s[status] || 'bg-secondary'}`}>{t[status] || status}</span>;
    };

    return (
        <div className="container mt-4">
            <div className="card shadow-sm">
                <div className="card-header bg-success text-white"><h5>Мои записи</h5></div>
                <div className="card-body">
                    {loading ? <div className="text-center"><div className="spinner-border"></div></div> : appointments.length === 0 ? <div className="alert alert-info">Нет записей</div> : (
                        <div className="table-responsive"><table className="table"><thead><tr><th>Дата</th><th>Время</th><th>Врач</th><th>Специализация</th><th>Статус</th><th></th></tr></thead><tbody>{appointments.map(a => (<tr key={a.id}><td>{new Date(a.appointment_date).toLocaleDateString()}</td><td>{a.appointment_time?.substring(0,5)}</td><td>{a.doctor_name}</td><td>{a.specialization}</td><td>{getStatusBadge(a.status)}</td><td>{a.status === 'booked' && <button className="btn btn-sm btn-danger" onClick={() => handleCancel(a.id)}>Отменить</button>}</td></tr>))}</tbody></table></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppointmentsList;