import React, { useState, useEffect } from 'react';
import { FaHistory, FaSearch, FaUserMd, FaCalendarAlt, FaClock, FaBirthdayCake, FaStethoscope, FaFileMedical, FaPills, FaNotesMedical } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DoctorHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    useEffect(() => {
        loadHistory();
    }, []);

    const loadHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/appointments/doctor/history');
            if (response.data.success) {
                setHistory(response.data.history);
            }
        } catch (error) {
            console.error('Error loading history:', error);
            toast.error('Ошибка загрузки истории');
        } finally {
            setLoading(false);
        }
    };

    const filteredHistory = history.filter(record =>
        record.patient_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const openDetailsModal = (record) => {
        setSelectedRecord(record);
        setShowDetailsModal(true);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'completed':
                return <span className="history-status completed">✓ Завершен</span>;
            case 'no_show':
                return <span className="history-status no-show">✗ Не явился</span>;
            default:
                return <span className="history-status cancelled">Отменен</span>;
        }
    };

    return (
        <div className="doctor-history">
            <div className="history-header">
                <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Поиск по имени пациента..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : filteredHistory.length === 0 ? (
                <div className="empty-state">
                    <FaHistory className="empty-icon" />
                    <h3>История приемов пуста</h3>
                    <p>У вас пока нет завершенных приемов</p>
                </div>
            ) : (
                <div className="history-list">
                    {filteredHistory.map(record => (
                        <div key={record.id} className="history-card">
                            <div className="history-card-header">
                                <div className="history-date">
                                    <FaCalendarAlt />
                                    <span>{formatDate(record.appointment_date)}</span>
                                    <FaClock className="ms-2" />
                                    <span className="history-time">{record.appointment_time?.substring(0, 5)}</span>
                                </div>
                                {getStatusBadge(record.status)}
                            </div>

                            <div className="history-card-body">
                                <div className="patient-info-row">
                                    <div className="patient-icon-large">
                                        <FaUserMd />
                                    </div>
                                    <div className="patient-details-full">
                                        <div className="patient-name-large">{record.patient_name}</div>
                                        <div className="patient-meta">
                                            <span><FaBirthdayCake /> {formatDate(record.birth_date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {record.diagnosis && (
                                    <div className="diagnosis-section">
                                        <div className="diagnosis-title">
                                            <FaFileMedical /> <span>Диагноз</span>
                                        </div>
                                        <div className="diagnosis-text">
                                            <p>{record.diagnosis}</p>
                                        </div>

                                        {record.prescription && (
                                            <>
                                                <div className="diagnosis-title" style={{ marginTop: '15px' }}>
                                                    <FaPills /> <span>Назначения</span>
                                                </div>
                                                <div className="diagnosis-text">
                                                    <p>{record.prescription}</p>
                                                </div>
                                            </>
                                        )}

                                        {record.notes && (
                                            <>
                                                <div className="diagnosis-title" style={{ marginTop: '15px' }}>
                                                    <FaNotesMedical /> <span>Примечания</span>
                                                </div>
                                                <div className="diagnosis-text">
                                                    <p>{record.notes}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="history-card-footer">
                                <button className="btn-outline" onClick={() => openDetailsModal(record)}>
                                    Подробнее
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модальное окно деталей */}
            {showDetailsModal && selectedRecord && (
                <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>📋 Детали приема</h3>
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            {/* Секция Пациент */}
                            <div className="detail-section">
                                <h4>👤 Пациент</h4>
                                <div className="detail-row">
                                    <span className="detail-label">ФИО:</span>
                                    <span className="detail-value"><strong>{selectedRecord.patient_name}</strong></span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Дата рождения:</span>
                                    <span className="detail-value">{new Date(selectedRecord.birth_date).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                            </div>

                            {/* Секция Прием */}
                            <div className="detail-section">
                                <h4>📅 Прием</h4>
                                <div className="detail-row">
                                    <span className="detail-label">Дата:</span>
                                    <span className="detail-value">{new Date(selectedRecord.appointment_date).toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Время:</span>
                                    <span className="detail-value">{selectedRecord.appointment_time?.substring(0, 5)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Статус:</span>
                                    <span className="detail-value">
                            <span className={`status-badge-modal ${selectedRecord.status === 'completed' ? 'completed' : 'no-show'}`}>
                                {selectedRecord.status === 'completed' ? '✓ Завершен' : '✗ Не явился'}
                            </span>
                        </span>
                                </div>
                            </div>

                            {/* Секция Медицинская информация (если есть) */}
                            {selectedRecord.diagnosis && (
                                <div className="detail-section">
                                    <h4>🩺 Медицинская информация</h4>
                                    <div className="detail-row">
                                        <span className="detail-label">Диагноз:</span>
                                        <span className="detail-value">{selectedRecord.diagnosis}</span>
                                    </div>
                                    {selectedRecord.prescription && (
                                        <div className="detail-row">
                                            <span className="detail-label">Назначения:</span>
                                            <span className="detail-value">{selectedRecord.prescription}</span>
                                        </div>
                                    )}
                                    {selectedRecord.notes && (
                                        <div className="detail-row">
                                            <span className="detail-label">Примечания:</span>
                                            <span className="detail-value">{selectedRecord.notes}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="modal-buttons">
                            <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorHistory;