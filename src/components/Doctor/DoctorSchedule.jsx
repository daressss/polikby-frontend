import React, { useState, useEffect } from 'react';
import { FaUserMd } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PatientModal from './PatientModal';

const DoctorSchedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
    const [showPatientModal, setShowPatientModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    useEffect(() => {
        loadWeekSchedule();
    }, [selectedDate]);

    // Функция для форматирования даты без часового пояса
    const formatLocalDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Получение дней недели для выбранной даты
    const getWeekDays = () => {
        const selected = new Date(selectedDate);
        let dayOfWeek = selected.getDay();
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(selected);
        monday.setDate(selected.getDate() - diffToMonday);

        const days = [];
        const today = new Date();
        const todayStr = formatLocalDate(today);

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            const dateStr = formatLocalDate(date);
            days.push({
                name: ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'][i],
                date: dateStr,
                dayNumber: date.getDate(),
                isToday: dateStr === todayStr,
                fullDate: date
            });
        }
        return days;
    };

    // Загрузка талонов для всей недели
    const loadWeekSchedule = async () => {
        setLoading(true);
        try {
            const weekDays = getWeekDays();
            const dates = weekDays.map(day => day.date);

            // Загружаем талоны для каждого дня недели параллельно
            const promises = dates.map(date =>
                api.get(`/appointments/doctor/schedule?date=${date}`)
            );

            const responses = await Promise.all(promises);

            // Объединяем все талоны в один массив
            let allAppointments = [];
            responses.forEach(response => {
                if (response.data.success) {
                    allAppointments = [...allAppointments, ...response.data.appointments];
                }
            });

            setAppointments(allAppointments);
            console.log('Week appointments loaded:', allAppointments.length);

        } catch (error) {
            console.error('Error loading week schedule:', error);
            toast.error('Ошибка загрузки расписания');
        } finally {
            setLoading(false);
        }
    };

    const handleAppointmentComplete = async (appointmentId) => {
        try {
            const response = await api.post('/appointments/complete', { appointment_id: appointmentId });
            if (response.data.success) {
                toast.success('Прием отмечен как завершенный');
                loadWeekSchedule();
            }
        } catch (error) {
            toast.error('Ошибка');
        }
    };

    const handlePatientNoShow = async (appointmentId) => {
        if (window.confirm('Отметить пациента как не явившегося?')) {
            try {
                const response = await api.post('/appointments/no-show', { appointment_id: appointmentId });
                if (response.data.success) {
                    toast.success('Пациент отмечен как не явившийся');
                    loadWeekSchedule();
                }
            } catch (error) {
                toast.error('Ошибка');
            }
        }
    };

    const openPatientCard = (appointment) => {
        setSelectedPatient({
            id: appointment.patient_id,
            patient_id: appointment.patient_id,
            full_name: appointment.patient_name,
            birth_date: appointment.birth_date,
            phone: appointment.phone,
            address: appointment.address
        });
        setShowPatientModal(true);
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'booked':
                return <span className="status-badge status-booked">Забронирован</span>;
            case 'completed':
                return <span className="status-badge status-completed">Завершен</span>;
            case 'cancelled':
                return <span className="status-badge status-cancelled">Отменен</span>;
            case 'no_show':
                return <span className="status-badge status-no-show">Не явился</span>;
            default:
                return <span className="status-badge status-available">Свободен</span>;
        }
    };

    const weekDays = getWeekDays();

    // Временные слоты (с 9:00 до 17:00 с интервалом 30 минут)
    const timeSlots = [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
        '15:00', '15:30', '16:00', '16:30'
    ];

    const getAppointmentForSlot = (date, time) => {
        return appointments.find(a => {
            const aptTime = a.appointment_time ? a.appointment_time.substring(0, 5) : null;
            return a.appointment_date === date && aptTime === time;
        });
    };

    return (
        <div className="doctor-schedule">
            <div className="schedule-header">
                <div className="date-selector">
                    <label>Выберите дату для отображения недели: </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="form-input"
                        style={{ width: '200px', marginLeft: '10px' }}
                    />
                </div>
                <div className="week-navigation" style={{ marginTop: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button className="week-nav-btn" onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() - 7);
                        setSelectedDate(formatLocalDate(newDate));
                    }}>← Прошлая неделя</button>
                    <button className="week-nav-btn" onClick={() => {
                        const today = new Date();
                        setSelectedDate(formatLocalDate(today));
                    }}>Сегодня</button>
                    <button className="week-nav-btn" onClick={() => {
                        const newDate = new Date(selectedDate);
                        newDate.setDate(newDate.getDate() + 7);
                        setSelectedDate(formatLocalDate(newDate));
                    }}>Следующая неделя →</button>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : (
                <div className="schedule-table-container">
                    <table className="doctor-schedule-table">
                        <thead>
                        <tr>
                            <th className="time-col">Время</th>
                            {weekDays.map((day, idx) => (
                                <th key={idx} className={day.isToday ? 'today' : ''}>
                                    {day.name}<br />
                                    <span className="date-num">{day.dayNumber}</span>
                                    <span style={{ fontSize: '10px', display: 'block', color: '#888' }}>{day.date}</span>
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {timeSlots.map(time => (
                            <tr key={time}>
                                <td className="time-cell">{time}</td>
                                {weekDays.map((day, idx) => {
                                    const appointment = getAppointmentForSlot(day.date, time);
                                    const hasPatient = appointment && appointment.patient_id;
                                    return (
                                        <td key={idx} className="slot-cell">
                                            {appointment ? (
                                                <div className="appointment-slot">
                                                    <div className="patient-name">
                                                        {hasPatient ? appointment.patient_name : 'Свободно'}
                                                    </div>
                                                    {hasPatient && (
                                                        <div className="slot-actions">
                                                            <button
                                                                className="slot-btn view"
                                                                onClick={() => openPatientCard(appointment)}
                                                                title="Просмотр"
                                                            >
                                                                👁️
                                                            </button>
                                                            <button
                                                                className="slot-btn complete"
                                                                onClick={() => handleAppointmentComplete(appointment.id)}
                                                                title="Принят"
                                                            >
                                                                ✓
                                                            </button>
                                                            <button
                                                                className="slot-btn cancel"
                                                                onClick={() => handlePatientNoShow(appointment.id)}
                                                                title="Не явился"
                                                            >
                                                                ✗
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div style={{ marginTop: '5px' }}>
                                                        {getStatusBadge(appointment.status)}
                                                    </div>
                                                    {!hasPatient && appointment.ticket_number && (
                                                        <div style={{ fontSize: '10px', textAlign: 'center', marginTop: '5px', color: '#888' }}>
                                                            Талон {appointment.ticket_number}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="empty-slot">Нет талона</div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showPatientModal && selectedPatient && (
                <PatientModal
                    patient={selectedPatient}
                    onClose={() => setShowPatientModal(false)}
                    onDiagnosisAdded={loadWeekSchedule}
                />
            )}
        </div>
    );
};

export default DoctorSchedule;