import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { doctorsAPI } from '../../services/api';
import { FaUserMd, FaStethoscope, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

const SearchDoctors = () => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [specializations, setSpecializations] = useState([]);

    useEffect(() => {
        // Получаем search-параметр из URL
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [location.search]);

    useEffect(() => {
        loadDoctors();
        loadSpecializations();
    }, []);

    useEffect(() => {
        if (searchTerm) {
            filterDoctors();
        } else {
            loadDoctors();
        }
    }, [searchTerm]);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const response = await doctorsAPI.getAll();
            if (response.data.success) {
                setDoctors(response.data.doctors);
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadSpecializations = async () => {
        try {
            const response = await doctorsAPI.getSpecializations();
            if (response.data.success) {
                setSpecializations(response.data.specializations);
            }
        } catch (error) {
            console.error('Error loading specializations:', error);
        }
    };

    const filterDoctors = () => {
        if (!searchTerm.trim()) {
            loadDoctors();
            return;
        }

        const filtered = doctors.filter(doctor =>
            doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDoctors(filtered);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        filterDoctors();
    };

    return (
        <div className="search-doctors-page">
            <div className="container">
                <div className="search-header">
                    <h1>Поиск врачей</h1>
                    <p>Найдите специалиста по имени или специальности</p>
                </div>

                <div className="search-form-container">
                    <form onSubmit={handleSearch} className="search-form-large">
                        <div className="search-input-wrapper">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                className="search-input-large"
                                placeholder="Введите имя врача или специальность..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-search">Найти</button>
                    </form>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-success"></div>
                    </div>
                ) : doctors.length === 0 ? (
                    <div className="no-results">
                        <FaUserMd className="no-results-icon" />
                        <h3>Ничего не найдено</h3>
                        <p>Попробуйте изменить поисковый запрос</p>
                        <Link to="/doctors" className="btn-primary">Смотреть всех врачей</Link>
                    </div>
                ) : (
                    <div className="search-results">
                        <div className="results-header">
                            <h3>Результаты поиска ({doctors.length})</h3>
                        </div>
                        <div className="doctors-grid">
                            {doctors.map((doctor) => (
                                <div key={doctor.id} className="doctor-card">
                                    <div className="doctor-avatar">
                                        <FaUserMd />
                                    </div>
                                    <div className="doctor-info">
                                        <h4 className="doctor-name">{doctor.full_name}</h4>
                                        <p className="doctor-specialization">
                                            <FaStethoscope className="me-1" /> {doctor.specialization}
                                        </p>
                                        <p className="text-muted">
                                            <FaMapMarkerAlt className="me-1" /> Каб. {doctor.room_number}
                                        </p>
                                        <Link to={`/schedule/doctor?spec=${encodeURIComponent(doctor.specialization)}`} className="btn-sm btn-outline-success mt-2">
                                            Выбрать
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchDoctors;