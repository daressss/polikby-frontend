import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';

const LoginModal = ({ show, onHide }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(username, password);
        setLoading(false);
        if (success) {
            onHide();
            navigate('/dashboard');
        }
    };

    const handleRegisterClick = () => {
        onHide();
        navigate('/register');
    };

    return (
        <Modal show={show} onHide={onHide} centered className="custom-modal">
            <Modal.Header closeButton className="modal-header-custom">
                <Modal.Title className="modal-title-custom">
                    <FaSignInAlt className="modal-icon" /> Вход в личный кабинет
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-custom">
                <form onSubmit={handleSubmit}>
                    <div className="input-group-custom">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            className="form-input-custom"
                            placeholder="Имя пользователя"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="input-group-custom">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            className="form-input-custom"
                            placeholder="Пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>

                <div className="modal-footer-custom">
                    <span className="register-text">Нет аккаунта?</span>
                    <button className="btn-register-link" onClick={handleRegisterClick}>
                        Зарегистрироваться
                    </button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default LoginModal;