import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserMd, FaCalendarAlt, FaHistory, FaNotesMedical } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PatientModal from './PatientModal';
import DiagnosisModal from './DiagnosisModal';

const DoctorPatients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments/doctor/patients/upcoming');
            if (response.data.success) {
                setPatients(response.data.patients);
            }
        } catch (error) {
            console.error('Error loading patients:', error);
            toast.error('Ошибка загрузки пациентов');
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient =>
        patient.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openPatientCard = (patient) => {
        setSelectedPatient(patient);
        setShowPatientModal(true);
    };

    const openDiagnosisModal = (patient) => {
        setSelectedPatient(patient);
        setShowDiagnosisModal(true);
    };

    return (
        <div className="doctor-patients">
            <div className="patients-header">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по имени..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : filteredPatients.length === 0 ? (
                <div className="empty-state">
                    <FaUserMd className="empty-icon" />
                    <h3>Нет пациентов</h3>
                    <p>У вас пока нет запланированных приемов</p>
                </div>
            ) : (
                <div className="patients-list">
                    {filteredPatients.map(patient => (
                        <div key={patient.id} className="patient-card">
                            <div className="patient-avatar">
                                <FaUserMd />
                            </div>
                            <div className="patient-info">
                                <div className="patient-name-row">
                                    <h3>{patient.full_name}</h3>
                                    <span className="patient-date">
                                        <FaCalendarAlt /> {new Date(patient.appointment_date).toLocaleDateString()} в {patient.appointment_time?.substring(0,5)}
                                    </span>
                                </div>
                                <div className="patient-details">
                                    <p><strong>Дата рождения:</strong> {new Date(patient.birth_date).toLocaleDateString()}</p>
                                    {patient.phone && <p><strong>Телефон:</strong> {patient.phone}</p>}
                                </div>
                                <div className="patient-actions">
                                    <button className="btn-outline" onClick={() => openDiagnosisModal(patient)}>
                                        <FaNotesMedical /> Внести диагноз
                                    </button>
                                    <button className="btn-outline" onClick={() => openPatientCard(patient)}>
                                        <FaHistory /> История
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showPatientModal && selectedPatient && (
                <PatientModal
                    patient={selectedPatient}
                    onClose={() => setShowPatientModal(false)}
                    onDiagnosisAdded={loadPatients}
                />
            )}

            {showDiagnosisModal && selectedPatient && (
                <DiagnosisModal
                    patient={selectedPatient}
                    onClose={() => setShowDiagnosisModal(false)}
                    onSuccess={loadPatients}
                />
            )}
        </div>
    );
};

export default DoctorPatients;