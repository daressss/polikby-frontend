import React, { useState } from 'react';
import { FaTimes, FaSave, FaStethoscope, FaPills, FaNotesMedical, FaCalendarAlt, FaUserMd, FaHeartbeat, FaFileAlt } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const DiagnosisModal = ({ patient, onClose, onSuccess, isInline = false }) => {
    const [formData, setFormData] = useState({
        diagnosis: '',
        prescription: '',
        notes: '',
        visit_date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.diagnosis.trim()) {
            toast.error('Введите диагноз');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/medical-history', {
                patient_id: patient.patient_id || patient.id,
                diagnosis: formData.diagnosis,
                prescription: formData.prescription,
                visit_date: formData.visit_date,
                notes: formData.notes
            });
            if (response.data.success) {
                toast.success('Диагноз успешно сохранен');
                if (onSuccess) onSuccess();
                if (!isInline) onClose();
                setFormData({
                    diagnosis: '',
                    prescription: '',
                    notes: '',
                    visit_date: new Date().toISOString().split('T')[0]
                });
            }
        } catch (error) {
            toast.error('Ошибка сохранения диагноза');
        } finally {
            setLoading(false);
        }
    };

    const modalContent = (
        <form onSubmit={handleSubmit} className="beauty-diagnosis-form">
            {/* Дата приема */}
            <div className="beauty-form-field">
                <div className="beauty-field-header">
                    <FaCalendarAlt className="beauty-field-icon" />
                    <label>Дата приема</label>
                </div>
                <input
                    type="date"
                    className="beauty-form-input"
                    value={formData.visit_date}
                    onChange={(e) => setFormData({...formData, visit_date: e.target.value})}
                    required
                />
            </div>

            {/* Диагноз */}
            <div className="beauty-form-field">
                <div className="beauty-field-header">
                    <FaHeartbeat className="beauty-field-icon" />
                    <label className="required-label">Диагноз</label>
                </div>
                <textarea
                    className="beauty-form-textarea"
                    rows="4"
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                    placeholder="Введите диагноз..."
                    required
                />
            </div>

            {/* Назначения */}
            <div className="beauty-form-field">
                <div className="beauty-field-header">
                    <FaPills className="beauty-field-icon" />
                    <label>Назначения / Лечение</label>
                </div>
                <textarea
                    className="beauty-form-textarea"
                    rows="4"
                    value={formData.prescription}
                    onChange={(e) => setFormData({...formData, prescription: e.target.value})}
                    placeholder="Введите назначения..."
                />
            </div>

            {/* Примечания */}
            <div className="beauty-form-field">
                <div className="beauty-field-header">
                    <FaFileAlt className="beauty-field-icon" />
                    <label>Примечания</label>
                </div>
                <textarea
                    className="beauty-form-textarea"
                    rows="3"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Дополнительные примечания..."
                />
            </div>

            {/* Кнопки */}
            <div className="beauty-form-actions">
                {!isInline && (
                    <button type="button" className="beauty-btn-cancel" onClick={onClose}>Отмена</button>
                )}
                <button type="submit" className="beauty-btn-submit" disabled={loading}>
                    <FaSave /> {loading ? 'Сохранение...' : 'Сохранить диагноз'}
                </button>
            </div>
        </form>
    );

    if (isInline) {
        return (
            <div className="beauty-diagnosis-inline">
                <div className="beauty-inline-header">
                    <FaStethoscope />
                    <span>Новая запись</span>
                </div>
                {modalContent}
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="beauty-diagnosis-modal" onClick={(e) => e.stopPropagation()}>
                <div className="beauty-modal-header">
                    <div className="beauty-header-left">
                        <FaStethoscope />
                        <h3>Внесение диагноза</h3>
                    </div>
                    <button className="beauty-modal-close" onClick={onClose}>✕</button>
                </div>

                <div className="beauty-modal-body">
                    <div className="beauty-patient-badge">
                        <FaUserMd />
                        <div>
                            <span>Пациент</span>
                            <p>{patient.full_name}</p>
                        </div>
                    </div>
                    {modalContent}
                </div>
            </div>
        </div>
    );
};

export default DiagnosisModal;