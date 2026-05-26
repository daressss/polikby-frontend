import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaHistory, FaUserMd, FaCalendarAlt, FaArrowLeft, FaStethoscope, FaPills, FaNotesMedical } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MedicalHistory = () => {
    const { patientId } = useParams();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [patientName, setPatientName] = useState('');

    useEffect(() => {
        if (patientId) {
            loadMedicalHistory();
            loadPatientInfo();
        }
    }, [patientId]);

    const loadMedicalHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/medical-history/patient/${patientId}`);
            if (response.data.success) {
                setHistory(response.data.history);
            }
        } catch (error) {
            console.error('Error loading medical history:', error);
            toast.error('Ошибка загрузки истории болезни');
        } finally {
            setLoading(false);
        }
    };

    const loadPatientInfo = async () => {
        try {
            const response = await api.get(`/patients/${patientId}`);
            if (response.data.success) {
                setPatientName(response.data.patient.full_name);
            }
        } catch (error) {
            console.error('Error loading patient info:', error);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (loading) {
        return <div className="text-center py-5"><div className="spinner-border text-success"></div></div>;
    }

    return (
        <div className="medical-history-page">
            <div className="container">
                <Link to="/dashboard" className="back-link"><FaArrowLeft /> Назад в личный кабинет</Link>

                <div className="medical-history-header">
                    <FaHistory className="header-icon" />
                    <h1>История болезни</h1>
                    {patientName && <p>Пациент: <strong>{patientName}</strong></p>}
                </div>

                {history.length === 0 ? (
                    <div className="empty-history">
                        <FaHistory className="empty-icon" />
                        <h3>История болезни пуста</h3>
                        <p>У этого пациента пока нет записей о посещениях</p>
                        <Link to="/dashboard" className="btn-primary mt-3">Вернуться</Link>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((record) => (
                            <div key={record.id} className="history-card">
                                <div className="history-date"><FaCalendarAlt /><span>{formatDate(record.visit_date)}</span></div>
                                <div className="history-doctor"><FaUserMd /><span>{record.doctor_name} ({record.specialization})</span></div>
                                <div className="history-diagnosis"><strong>Диагноз:</strong> {record.diagnosis}</div>
                                {record.prescription && <div className="history-prescription"><strong>Назначения:</strong> {record.prescription}</div>}
                                {record.notes && <div className="history-notes"><strong>Примечания:</strong> {record.notes}</div>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalHistory;
