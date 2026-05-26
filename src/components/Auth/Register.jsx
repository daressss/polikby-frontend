import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaUser, FaLock, FaEnvelope, FaPhone, FaUserMd, FaCalendarAlt, FaHome, FaMapMarkerAlt } from 'react-icons/fa';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        phone: '',
        full_name: '',
        birth_date: '',
        address: '',
        district_number: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Пароли не совпадают');
            return;
        }
        setLoading(true);
        const { confirmPassword, ...submitData } = formData;
        const success = await register(submitData);
        setLoading(false);
        if (success) navigate('/');
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>Регистрация</h1>
                    <p>Создайте аккаунт для записи к врачу</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-row">
                        <div className="form-group-custom full-width">
                            <FaUser className="input-icon" />
                            <input
                                type="text"
                                className="form-input-custom"
                                placeholder="Имя пользователя *"
                                name="username"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group-custom">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                className="form-input-custom"
                                placeholder="Пароль *"
                                name="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group-custom">
                            <FaLock className="input-icon" />
                            <input
                                type="password"
                                className="form-input-custom"
                                placeholder="Подтверждение пароля *"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group-custom full-width">
                            <FaUserMd className="input-icon" />
                            <input
                                type="text"
                                className="form-input-custom"
                                placeholder="ФИО *"
                                name="full_name"
                                value={formData.full_name}
                                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group-custom">
                            <FaCalendarAlt className="input-icon" />
                            <input
                                type="date"
                                className="form-input-custom"
                                placeholder="Дата рождения *"
                                name="birth_date"
                                value={formData.birth_date}
                                onChange={(e) => setFormData({...formData, birth_date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group-custom">
                            <FaMapMarkerAlt className="input-icon" />
                            <input
                                type="number"
                                className="form-input-custom"
                                placeholder="Номер участка"
                                name="district_number"
                                value={formData.district_number}
                                onChange={(e) => setFormData({...formData, district_number: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group-custom">
                            <FaEnvelope className="input-icon" />
                            <input
                                type="email"
                                className="form-input-custom"
                                placeholder="Email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="form-group-custom">
                            <FaPhone className="input-icon" />
                            <input
                                type="tel"
                                className="form-input-custom"
                                placeholder="Телефон"
                                name="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group-custom full-width">
                            <FaHome className="input-icon" />
                            <textarea
                                className="form-textarea-custom"
                                placeholder="Адрес"
                                name="address"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                rows="2"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="register-footer">
                    <span>Уже есть аккаунт?</span>
                    <Link to="/" className="login-link">Войти</Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
