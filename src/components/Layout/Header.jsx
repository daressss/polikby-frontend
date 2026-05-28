import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaSearch, FaUser, FaCalendarAlt, FaTicketAlt, FaHome, FaHeartbeat } from 'react-icons/fa';
import LoginModal from '../Auth/LoginModal';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Закрыть dropdown при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/doctors/search?search=${searchTerm}`);
        }
    };

    const handleLogout = () => {
        logout();
        setDropdownOpen(false);
        navigate('/');
    };

    const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

    return (
        <>
            <div className="sticky-header">
                <div className="container">
                    <div className="header-content">
                        <Link to="/" className="logo">
                            <FaHeartbeat className="logo-icon" />
                            ПОЛИК.<span>by</span>
                        </Link>

                        <form onSubmit={handleSearch} className="search-form">
                            <div className="search-container">
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Поиск врача..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <button type="submit" className="search-btn">
                                    <FaSearch />
                                </button>
                            </div>
                        </form>

                        <div className="nav-menu">
                            <Link to="/" className={`nav-btn ${isActive('/') && location.pathname === '/' ? 'active' : ''}`}>
                                <FaHome /> Главная
                            </Link>
                            <Link to="/schedule/specialization" className={`nav-btn ${isActive('/schedule') ? 'active' : ''}`}>
                                <FaCalendarAlt /> Расписание
                            </Link>
                            {isAuthenticated ? (
                                <>
                                    <Link to="/book/specialization" className={`nav-btn ${isActive('/book') ? 'active' : ''}`}>
                                        <FaTicketAlt /> Заказать талон
                                    </Link>
                                    <div className="custom-dropdown" ref={dropdownRef}>
                                        <button
                                            className="nav-btn dropdown-toggle"
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                        >
                                            <FaUser /> {user?.username}
                                        </button>
                                        {dropdownOpen && (
                                            <ul className="custom-dropdown-menu">
                                                <li><Link className="dropdown-item" to="/dashboard" onClick={() => setDropdownOpen(false)}>Личный кабинет</Link></li>
                                                <li><hr className="dropdown-divider" /></li>
                                                <li><button className="dropdown-item" onClick={handleLogout}>Выйти</button></li>
                                            </ul>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <button className="nav-btn" onClick={() => setShowLoginModal(true)}>
                                    <FaUser /> Личный кабинет
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <LoginModal show={showLoginModal} onHide={() => setShowLoginModal(false)} />
        </>
    );
};

export default Header;
