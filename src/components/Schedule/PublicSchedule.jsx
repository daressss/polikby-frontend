import React, { useState, useEffect } from 'react';
import { schedulesAPI, doctorsAPI } from '../../services/api';
import { FaCalendarAlt, FaClock, FaUserMd } from 'react-icons/fa';

const PublicSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        doctorsAPI.getAll().then(r => { if (r.data.success) { setDoctors(r.data.doctors); if (r.data.doctors.length) setSelectedDoctor(r.data.doctors[0].id); } });
    }, []);

    useEffect(() => {
        if (selectedDoctor) {
            setLoading(true);
            schedulesAPI.getPublic(selectedDoctor).then(r => { if (r.data.success) setSchedules(r.data.schedules); setLoading(false); });
        }
    }, [selectedDoctor]);

    const formatDate = (date) => new Date(date).toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="container mt-4">
            <div className="text-center mb-5"><h1 className="section-title">Расписание врачей</h1><p className="text-muted">Выберите врача и посмотрите график работы</p></div>
            <div className="row">
                <div className="col-md-3 mb-4"><div className="card shadow-sm"><div className="card-header bg-success text-white"><h5><FaUserMd className="me-2" />Врачи</h5></div><div className="card-body p-0"><div className="list-group list-group-flush">{doctors.map(d => (<button key={d.id} className={`list-group-item list-group-item-action ${selectedDoctor == d.id ? 'active bg-success text-white' : ''}`} onClick={() => setSelectedDoctor(d.id)}><strong>{d.full_name}</strong><br /><small>{d.specialization}</small></button>))}</div></div></div></div>
                <div className="col-md-9"><div className="card shadow-sm"><div className="card-header bg-info text-white"><h5><FaCalendarAlt className="me-2" />{doctors.find(d => d.id == selectedDoctor)?.full_name || 'Расписание'}</h5></div><div className="card-body">{loading ? <div className="text-center"><div className="spinner-border text-success"></div></div> : schedules.length === 0 ? <div className="alert alert-info">Расписание не добавлено</div> : schedules.map(s => (<div key={s.id} className="schedule-item"><div><FaCalendarAlt className="me-2 text-success" /><span className="schedule-date">{formatDate(s.work_date)}</span><br /><FaClock className="me-2 text-muted" /><span className="schedule-time">{s.start_time?.substring(0,5)} - {s.end_time?.substring(0,5)}</span></div><div><span className="badge bg-success">Свободно: {(s.total_slots || 0) - (s.booked_slots || 0)} талонов</span></div></div>))}</div></div></div>
            </div>
        </div>
    );
};

export default PublicSchedule;