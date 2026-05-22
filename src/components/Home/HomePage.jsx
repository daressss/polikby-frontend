import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaTicketAlt, FaUserMd, FaArrowRight } from 'react-icons/fa';
import { doctorsAPI } from '../../services/api';

const HomePage = () => {
    const [featuredDoctors, setFeaturedDoctors] = useState([]);

    useEffect(() => {
        const loadDoctors = async () => {
            const response = await doctorsAPI.getAll();
            if (response.data.success) {
                setFeaturedDoctors(response.data.doctors.slice(0, 4));
            }
        };
        loadDoctors();
    }, []);

    return (
        <div>
            {/* Hero блок с фотографией */}
            <div className="hero-section">
                <div className="hero-overlay"></div>
                <div className="container hero-content">
                    <h1>Добро пожаловать в ПОЛИК.by</h1>
                </div>
            </div>

            {/* Три карточки под героем */}
            <div className="container cards-section">
                <div className="cards-grid">
                    {/* Карточка 1 - Расписание */}
                    <div className="feature-card">
                        <div className="feature-icon green">
                            <FaCalendarAlt />
                        </div>
                        <h3 className="feature-title">Расписание</h3>
                        <p className="feature-description">
                            Удобное расписание работы врачей. Выберите удобное время для посещения.
                        </p>
                        <Link to="/schedule" className="feature-btn">
                            Посмотреть <FaArrowRight className="btn-icon" />
                        </Link>
                    </div>

                    {/* Карточка 2 - Талоны */}
                    <div className="feature-card">
                        <div className="feature-icon green">
                            <FaTicketAlt />
                        </div>
                        <h3 className="feature-title">Талоны</h3>
                        <p className="feature-description">
                            Онлайн запись к врачу. Выберите специалиста и удобное время.
                        </p>
                        <Link to="/book" className="feature-btn">
                            Заказать <FaArrowRight className="btn-icon" />
                        </Link>
                    </div>

                    {/* Карточка 3 - Врачи */}
                    <div className="feature-card">
                        <div className="feature-icon green">
                            <FaUserMd />
                        </div>
                        <h3 className="feature-title">Врачи</h3>
                        <p className="feature-description">
                            Наши специалисты - профессионалы с большим опытом работы.
                        </p>
                        <Link to="/doctors" className="feature-btn">
                            Узнать <FaArrowRight className="btn-icon" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Статистика (оставляем как есть) */}
            <div className="container stats-section">
                <div className="stats-grid">
                    <div className="stat-item">
                        <h2>15+</h2>
                        <p>Врачей</p>
                    </div>
                    <div className="stat-item">
                        <h2>50+</h2>
                        <p>Талонов в день</p>
                    </div>
                    <div className="stat-item">
                        <h2>1000+</h2>
                        <p>Пациентов</p>
                    </div>
                    <div className="stat-item">
                        <h2>10+</h2>
                        <p>Лет работы</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;