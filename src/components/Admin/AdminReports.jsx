import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCalendarAlt, FaUserMd, FaFileExcel, FaFilePdf, FaDownload, FaChartBar, FaChartPie } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminReports = () => {
    const [doctors, setDoctors] = useState([]);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        start_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        doctor_id: ''
    });
    const [summary, setSummary] = useState({
        total: 0,
        booked: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0
    });

    useEffect(() => {
        loadDoctors();
    }, []);

    useEffect(() => {
        if (filters.start_date && filters.end_date) {
            loadReport();
        }
    }, [filters]);

    const loadDoctors = async () => {
        try {
            const response = await api.get('/admin/doctors');
            if (response.data.success) {
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        }
    };

    const loadReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.start_date) params.start_date = filters.start_date;
            if (filters.end_date) params.end_date = filters.end_date;
            if (filters.doctor_id) params.doctor_id = filters.doctor_id;

            const response = await api.get('/admin/reports/appointments', { params });
            if (response.data.success) {
                setReportData(response.data.report);
                calculateSummary(response.data.report);
            }
        } catch (error) {
            console.error('Error loading report:', error);
            toast.error('Ошибка загрузки отчета');
        } finally {
            setLoading(false);
        }
    };

    const calculateSummary = (data) => {
        const summary = {
            total: 0,
            booked: 0,
            completed: 0,
            cancelled: 0,
            no_show: 0
        };

        data.forEach(item => {
            summary.total += item.total;
            summary.booked += item.booked;
            summary.completed += item.completed;
            summary.cancelled += item.cancelled;
            summary.no_show += item.no_show;
        });

        setSummary(summary);
    };

    const exportToExcel = () => {
        if (reportData.length === 0) {
            toast.error('Нет данных для экспорта');
            return;
        }

        // Формируем CSV
        const headers = ['Дата', 'Врач', 'Специальность', 'Всего', 'Забронировано', 'Завершено', 'Отменено', 'Не явились'];
        const rows = reportData.map(item => [
            item.date,
            item.doctor_name,
            item.specialization,
            item.total,
            item.booked,
            item.completed,
            item.cancelled,
            item.no_show
        ]);

        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute('download', `report_${filters.start_date}_to_${filters.end_date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success('Отчет экспортирован');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('ru-RU');
    };

    const getStatusPercent = (value) => {
        if (summary.total === 0) return 0;
        return Math.round((value / summary.total) * 100);
    };

    // Группировка данных по дням для графика
    const getDailyData = () => {
        const daily = {};
        reportData.forEach(item => {
            if (!daily[item.date]) {
                daily[item.date] = { date: item.date, total: 0, booked: 0 };
            }
            daily[item.date].total += item.total;
            daily[item.date].booked += item.booked;
        });
        return Object.values(daily).slice(0, 10);
    };

    const dailyData = getDailyData();
    const maxTotal = Math.max(...dailyData.map(d => d.total), 1);

    return (
        <div className="admin-reports">
            <div className="admin-reports-header">
                <h2>Отчеты и аналитика</h2>
            </div>

            {/* Фильтры */}
            <div className="admin-filters">
                <div className="filter-group">
                    <label><FaCalendarAlt /> С даты:</label>
                    <input
                        type="date"
                        className="form-input"
                        value={filters.start_date}
                        onChange={(e) => setFilters({...filters, start_date: e.target.value})}
                    />
                </div>
                <div className="filter-group">
                    <label><FaCalendarAlt /> По дату:</label>
                    <input
                        type="date"
                        className="form-input"
                        value={filters.end_date}
                        onChange={(e) => setFilters({...filters, end_date: e.target.value})}
                    />
                </div>
                <div className="filter-group">
                    <label><FaUserMd /> Врач:</label>
                    <select
                        className="form-input"
                        value={filters.doctor_id}
                        onChange={(e) => setFilters({...filters, doctor_id: e.target.value})}
                    >
                        <option value="">Все врачи</option>
                        {doctors.map(doctor => (
                            <option key={doctor.id} value={doctor.id}>
                                {doctor.full_name} ({doctor.specialization})
                            </option>
                        ))}
                    </select>
                </div>
                <button className="btn-outline" onClick={() => setFilters({
                    start_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
                    end_date: new Date().toISOString().split('T')[0],
                    doctor_id: ''
                })}>
                    Сбросить
                </button>
                <button className="btn-success" onClick={exportToExcel}>
                    <FaFileExcel /> Экспорт в Excel
                </button>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : reportData.length === 0 ? (
                <div className="admin-empty-state">
                    <FaChartLine className="empty-icon" />
                    <h3>Нет данных для отображения</h3>
                    <p>За выбранный период нет записей</p>
                </div>
            ) : (
                <>
                    {/* Сводная статистика */}
                    <div className="report-summary">
                        <div className="summary-card">
                            <div className="summary-icon total">
                                <FaChartBar />
                            </div>
                            <div className="summary-info">
                                <h3>{summary.total}</h3>
                                <p>Всего записей</p>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon booked">
                                <FaChartLine />
                            </div>
                            <div className="summary-info">
                                <h3>{summary.booked}</h3>
                                <p>Забронировано ({getStatusPercent(summary.booked)}%)</p>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon completed">
                                <FaChartLine />
                            </div>
                            <div className="summary-info">
                                <h3>{summary.completed}</h3>
                                <p>Завершено ({getStatusPercent(summary.completed)}%)</p>
                            </div>
                        </div>
                        <div className="summary-card">
                            <div className="summary-icon cancelled">
                                <FaChartLine />
                            </div>
                            <div className="summary-info">
                                <h3>{summary.cancelled + summary.no_show}</h3>
                                <p>Отмены и неявки ({getStatusPercent(summary.cancelled + summary.no_show)}%)</p>
                            </div>
                        </div>
                    </div>

                    {/* Простая диаграмма загруженности по дням */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <FaChartBar />
                            <h3>Динамика записей по дням</h3>
                        </div>
                        <div className="daily-chart">
                            {dailyData.map(day => (
                                <div key={day.date} className="chart-bar-item">
                                    <div className="chart-label">{formatDate(day.date)}</div>
                                    <div className="chart-bar-container">
                                        <div
                                            className="chart-bar booked-bar"
                                            style={{ width: `${(day.booked / maxTotal) * 100}%` }}
                                        >
                                            <span className="bar-value">{day.booked}</span>
                                        </div>
                                        <div
                                            className="chart-bar total-bar"
                                            style={{ width: `${(day.total / maxTotal) * 100}%` }}
                                        >
                                            <span className="bar-value">{day.total}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="chart-legend">
                            <span className="legend-item"><span className="legend-color booked"></span> Забронировано</span>
                            <span className="legend-item"><span className="legend-color total"></span> Всего слотов</span>
                        </div>
                    </div>

                    {/* Таблица с детальным отчетом */}
                    <div className="report-section">
                        <div className="report-section-header">
                            <FaChartPie />
                            <h3>Детальный отчет по записям</h3>
                        </div>
                        <div className="report-table-container">
                            <table className="report-table">
                                <thead>
                                <tr>
                                    <th>Дата</th>
                                    <th>Врач</th>
                                    <th>Специальность</th>
                                    <th>Всего</th>
                                    <th>Забронировано</th>
                                    <th>Завершено</th>
                                    <th>Отменено</th>
                                    <th>Не явились</th>
                                    <th>Загрузка</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reportData.map((item, index) => {
                                    const loadPercent = item.total > 0 ? Math.round((item.booked / item.total) * 100) : 0;
                                    return (
                                        <tr key={index}>
                                            <td>{formatDate(item.date)}</td>
                                            <td><strong>{item.doctor_name}</strong></td>
                                            <td>{item.specialization}</td>
                                            <td>{item.total}</td>
                                            <td className="booked-cell">{item.booked}</td>
                                            <td className="completed-cell">{item.completed}</td>
                                            <td className="cancelled-cell">{item.cancelled}</td>
                                            <td className="no-show-cell">{item.no_show}</td>
                                            <td className="load-cell">
                                                <div className="table-load-bar">
                                                    <div className="table-load-fill" style={{ width: `${loadPercent}%` }}></div>
                                                    <span className="load-text">{loadPercent}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReports;