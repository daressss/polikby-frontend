import React, { useState, useEffect } from 'react';
import { doctorsAPI } from '../../services/api';
import { FaUserMd, FaStethoscope, FaMapMarkerAlt } from 'react-icons/fa';

const PublicDoctorsList = () => {
    const [doctors, setDoctors] = useState([]);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpec, setSelectedSpec] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        doctorsAPI.getSpecializations().then(r => { if (r.data.success) setSpecializations(r.data.specializations); });
    }, []);

    useEffect(() => {
        setLoading(true);
        doctorsAPI.getAll(selectedSpec).then(r => { if (r.data.success) setDoctors(r.data.doctors); setLoading(false); });
    }, [selectedSpec]);

    return (
        <div className="container mt-4">
            <div className="text-center mb-5"><h1 className="section-title">Наши врачи</h1><p className="text-muted">Высококвалифицированные специалисты</p></div>
            <div className="row">
                <div className="col-md-3 mb-4"><div className="card shadow-sm"><div className="card-header bg-success text-white"><h5><FaStethoscope className="me-2" />Специализации</h5></div><div className="card-body p-0"><div className="list-group list-group-flush"><button className={`list-group-item list-group-item-action ${!selectedSpec ? 'active bg-success text-white' : ''}`} onClick={() => setSelectedSpec('')}>Все врачи</button>{specializations.map(s => <button key={s.specialization} className={`list-group-item list-group-item-action ${selectedSpec === s.specialization ? 'active bg-success text-white' : ''}`} onClick={() => setSelectedSpec(s.specialization)}>{s.specialization}</button>)}</div></div></div></div>
                <div className="col-md-9">
                    {loading ? <div className="text-center"><div className="spinner-border text-success"></div></div> : doctors.length === 0 ? <div className="alert alert-info">Врачи не найдены</div> : (
                        <div className="row">{doctors.map(d => (<div key={d.id} className="col-md-6 mb-4"><div className="doctor-card"><div className="doctor-avatar"><FaUserMd /></div><div className="doctor-info"><h4 className="doctor-name">{d.full_name}</h4><p className="doctor-specialization"><FaStethoscope className="me-1" /> {d.specialization}</p><p className="text-muted"><FaMapMarkerAlt className="me-1" /> Кабинет №{d.room_number}</p></div></div></div>))}</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicDoctorsList;