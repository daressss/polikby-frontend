import React, { useState, useEffect } from 'react';
import { FaTimes, FaHistory, FaNotesMedical, FaCalendarAlt, FaPhone, FaMapMarkerAlt, FaBirthdayCake, FaUserMd, FaStethoscope, FaPills, FaFileAlt, FaHeartbeat } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import DiagnosisModal from './DiagnosisModal';

const PatientModal = ({ patient, onClose, onDiagnosisAdded }) => {
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);

    useEffect(() => {
        if (patient && patient.id) {
            loadMedicalHistory();
        }
    }, [patient]);

    const loadMedicalHistory = async () => {
        setLoading(true);
        try {
            const patientId = patient.patient_id || patient.id;
            const response = await api.get(`/medical-history/patient/${patientId}`);
            if (response.data.success) {
                setMedicalHistory(response.data.history);
            }
        } catch (error) {
            console.error('Error loading medical history:', error);
            toast.error('Ошибка загрузки истории болезни');
        } finally {
            setLoading(false);
        }
    };

    const handleDiagnosisAdded = () => {
        loadMedicalHistory();
        if (onDiagnosisAdded) onDiagnosisAdded();
        setShowDiagnosisForm(false);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    if (!patient) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="beauty-patient-modal" onClick={(e) => e.stopPropagation()}>
                <div className="beauty-modal-header">
                    <div className="beauty-header-left">
                        <FaUserMd />
                        <h3>Карта пациента</h3>
                    </div>
                    <button className="beauty-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="beauty-modal-body">
                    {/* Информация о пациенте */}
                    <div className="beauty-patient-card">
                        <div className="beauty-patient-avatar">
                            <FaUserMd />
                        </div>
                        <div className="beauty-patient-details">
                            <h2>{patient.full_name}</h2>
                            <div className="beauty-patient-info-grid">
                                <div className="beauty-info-item">
                                    <FaBirthdayCake />
                                    <span>Дата рождения: <strong>{formatDate(patient.birth_date)}</strong></span>
                                </div>
                                {patient.phone && (
                                    <div className="beauty-info-item">
                                        <FaPhone />
                                        <span>Телефон: <strong>{patient.phone}</strong></span>
                                    </div>
                                )}
                                {patient.address && (
                                    <div className="beauty-info-item">
                                        <FaMapMarkerAlt />
                                        <span>Адрес: <strong>{patient.address}</strong></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Кнопка добавления диагноза */}
                    <button
                        className="beauty-diagnosis-add-btn"
                        onClick={() => setShowDiagnosisForm(!showDiagnosisForm)}
                    >
                        <FaNotesMedical /> {showDiagnosisForm ? 'Скрыть форму' : '+ Добавить диагноз'}
                    </button>

                    {/* Форма добавления диагноза */}
                    {showDiagnosisForm && (
                        <DiagnosisModal
                            patient={patient}
                            onClose={() => setShowDiagnosisForm(false)}
                            onSuccess={handleDiagnosisAdded}
                            isInline={true}
                        />
                    )}

                    {/* История болезни */}
                    <div className="beauty-medical-history">
                        <div className="beauty-history-header">
                            <FaHistory />
                            <h4>История болезни</h4>
                        </div>

                        {loading ? (
                            <div className="beauty-loading">
                                <div className="spinner-border text-success spinner-sm"></div>
                                <p>Загрузка...</p>
                            </div>
                        ) : medicalHistory.length === 0 ? (
                            <div className="beauty-empty-history">
                                <FaHistory />
                                <p>История болезни пуста</p>
                            </div>
                        ) : (
                            <div className="beauty-history-list">
                                {medicalHistory.map((record, index) => (
                                    <div key={record.id} className="beauty-history-record">
                                        <div className="beauty-record-header">
                                            <FaCalendarAlt />
                                            <span className="beauty-record-date">{formatDate(record.visit_date)}</span>
                                            {index === 0 && <span className="beauty-record-badge">Последний</span>}
                                        </div>
                                        <div className="beauty-record-content">
                                            <div className="beauty-record-field">
                                                <FaHeartbeat className="beauty-field-icon" />
                                                <div className="beauty-field-content">
                                                    <div className="beauty-field-label">Диагноз</div>
                                                    <div className="beauty-field-value">{record.diagnosis}</div>
                                                </div>
                                            </div>
                                            {record.prescription && (
                                                <div className="beauty-record-field">
                                                    <FaPills className="beauty-field-icon" />
                                                    <div className="beauty-field-content">
                                                        <div className="beauty-field-label">Назначения</div>
                                                        <div className="beauty-field-value">{record.prescription}</div>
                                                    </div>
                                                </div>
                                            )}
                                            {record.notes && (
                                                <div className="beauty-record-field beauty-notes-field">
                                                    <FaFileAlt className="beauty-field-icon" />
                                                    <div className="beauty-field-content">
                                                        <div className="beauty-field-label">Примечания</div>
                                                        <div className="beauty-field-value">{record.notes}</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="beauty-modal-footer">
                    <button className="beauty-btn-close" onClick={onClose}>Закрыть</button>
                </div>
            </div>
        </div>
    );
};

export default PatientModal;