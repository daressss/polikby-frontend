import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { doctorsAPI } from '../../services/api';
import { FaUserMd, FaStethoscope, FaMapMarkerAlt, FaSearch } from 'react-icons/fa';

const SearchDoctors = () => {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [allDoctors, setAllDoctors] = useState([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const search = params.get('search');
        if (search) {
            setSearchTerm(search);
        }
    }, [location.search]);

    useEffect(() => {
        loadAllDoctors();
    }, []);

    useEffect(() => {
        if (allDoctors.length > 0 && searchTerm) {
            filterDoctors();
        } else if (allDoctors.length > 0 && !searchTerm) {
            setDoctors(allDoctors);
            setLoading(false);
        }
    }, [searchTerm, allDoctors]);

    const loadAllDoctors = async () => {
        setLoading(true);
        try {
            const response = await doctorsAPI.getAll();
            if (response.data.success) {
                setAllDoctors(response.data.doctors);
                // Если есть поисковый запрос, фильтруем сразу
                if (searchTerm) {
                    filterDoctors(response.data.doctors);
                } else {
                    setDoctors(response.data.doctors);
                    setLoading(false);
                }
            }
        } catch (error) {
            console.error('Error loading doctors:', error);
            setLoading(false);
        }
    };

    const filterDoctors = (doctorList = allDoctors) => {
        if (!searchTerm.trim()) {
            setDoctors(doctorList);
            setLoading(false);
            return;
        }

        const filtered = doctorList.filter(doctor =>
            doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDoctors(filtered);
        setLoading(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            filterDoctors();
            // Обновляем URL
            navigate(`/doctors/search?search=${searchTerm}`, { replace: true });
        } else {
            setDoctors(allDoctors);
        }
    };

    const navigate = useNavigate();

    if (loading && allDoctors.length === 0) {
        return (
            <div className="search-doctors-page">
                <div className="container">
                    <div className="text-center py-5">
                        <div className="spinner-border text-success"></div>
                    </div>
                </div>
            </div>
        );
    }

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

                {doctors.length === 0 && searchTerm ? (
                    <div className="no-results">
                        <FaUserMd className="no-results-icon" />
                        <h3>Ничего не найдено</h3>
                        <p>По запросу "{searchTerm}" ничего не найдено</p>
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
