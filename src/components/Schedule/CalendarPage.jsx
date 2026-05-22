import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { schedulesAPI } from '../../services/api';
import ScheduleBreadcrumbs from './ScheduleBreadcrumbs';
import ScheduleSidebar from './ScheduleSidebar';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

const CalendarPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const doctorId = searchParams.get('doctor_id');
    const doctorName = searchParams.get('doctor_name');
    const specialization = searchParams.get('spec');

    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (doctorId) {
            loadSchedule();
        }
    }, [doctorId]);

    const loadSchedule = async () => {
        setLoading(true);
        try {
            const response = await schedulesAPI.getPublic(doctorId);
            if (response.data.success) {
                setSchedules(response.data.schedules);
            }
        } catch (error) {
            console.error('Error loading schedule:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const weekDays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
    const schedulesByDay = {};

    schedules.forEach(schedule => {
        const date = new Date(schedule.work_date);
        const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
        const dayName = weekDays[dayIndex];

        if (!schedulesByDay[dayName]) {
            schedulesByDay[dayName] = [];
        }
        schedulesByDay[dayName].push(schedule);
    });

    const selectedData = { specialization, doctorId, doctorName };

    return (
        <div className="booking-page">
            <div className="container">
                <h1 className="booking-title">Расписание</h1>
                <p className="booking-subtitle">Расписание врача</p>

                <ScheduleBreadcrumbs currentStep={2} selectedData={selectedData} />

                <div className="booking-layout">
                    <ScheduleSidebar currentStep={2} selectedData={selectedData} />

                    <div className="booking-content">
                        <div className="selected-info">
                            <div>Специальность: <strong>{specialization}</strong></div>
                            <div>Врач: <strong>{doctorName}</strong></div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
                        ) : schedules.length === 0 ? (
                            <div className="tab-content-empty">
                                <FaCalendarAlt className="empty-icon" />
                                <h3>Расписание не добавлено</h3>
                                <p>У данного врача пока нет доступного расписания</p>
                            </div>
                        ) : (
                            <div className="calendar-table-container">
                                <table className="calendar-table">
                                    <thead>
                                    <tr>
                                        {weekDays.map(day => (
                                            <th key={day}>{day}</th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        {weekDays.map(day => (
                                            <td key={day} className="calendar-cell">
                                                {schedulesByDay[day] && schedulesByDay[day].map((schedule, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="slot-card"
                                                        onClick={() => navigate(`/book/specialization?doctor_id=${doctorId}&schedule_id=${schedule.id}&date=${schedule.work_date}`)}
                                                    >
                                                        <div className="slot-date">
                                                            {new Date(schedule.work_date).getDate()}
                                                        </div>
                                                        <div className="slot-time">
                                                            <FaClock /> {schedule.start_time?.substring(0, 5)}-{schedule.end_time?.substring(0, 5)}
                                                        </div>
                                                        <div className="slot-available">
                                                            Свободно: { (schedule.total_slots || 0) - (schedule.booked_slots || 0) }
                                                        </div>
                                                    </div>
                                                ))}
                                            </td>
                                        ))}
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;