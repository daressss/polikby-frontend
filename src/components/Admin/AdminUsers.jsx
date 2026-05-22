import React, { useState, useEffect } from 'react';
import { FaUsers, FaSearch, FaKey, FaUserTag, FaEnvelope, FaPhone, FaCalendarAlt, FaUserCheck, FaUserClock } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [showResetModal, setShowResetModal] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [showRoleModal, setShowRoleModal] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const response = await api.get('/admin/users');
            if (response.data.success) {
                setUsers(response.data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
            toast.error('Ошибка загрузки пользователей');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (userId) => {
        try {
            const response = await api.post(`/admin/users/${userId}/reset-password`);
            if (response.data.success) {
                setNewPassword(response.data.new_password);
                toast.success(`Новый пароль: ${response.data.new_password}`);
                setShowResetModal(null);
            }
        } catch (error) {
            toast.error('Ошибка сброса пароля');
        }
    };

    const handleChangeRole = async (userId, newRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success(`Роль изменена на "${getRoleName(newRole)}"`);
            setShowRoleModal(null);
            loadUsers();
        } catch (error) {
            toast.error('Ошибка изменения роли');
        }
    };

    const getRoleName = (role) => {
        const roles = {
            patient: 'Пациент',
            doctor: 'Врач',
            admin: 'Администратор'
        };
        return roles[role] || role;
    };

    const getRoleBadge = (role) => {
        const roleMap = {
            patient: { class: 'role-patient', text: 'Пациент', icon: '👤' },
            doctor: { class: 'role-doctor', text: 'Врач', icon: '👨‍⚕️' },
            admin: { class: 'role-admin', text: 'Администратор', icon: '👑' }
        };
        const r = roleMap[role] || { class: 'role-default', text: role, icon: '❓' };
        return <span className={`role-badge ${r.class}`}>{r.icon} {r.text}</span>;
    };

    const getRoleIcon = (role) => {
        switch(role) {
            case 'admin': return '👑';
            case 'doctor': return '👨‍⚕️';
            default: return '👤';
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = filterRole === 'all' || user.role === filterRole;

        return matchesSearch && matchesRole;
    });

    const formatDate = (date) => {
        if (!date) return '—';
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const stats = {
        total: users.length,
        patients: users.filter(u => u.role === 'patient').length,
        doctors: users.filter(u => u.role === 'doctor').length,
        admins: users.filter(u => u.role === 'admin').length
    };

    return (
        <div className="admin-users">
            <div className="admin-users-header">
                <h2>Управление пользователями</h2>
                <div className="users-stats-cards">
                    <div className="users-stat-card">
                        <span className="stat-icon">👥</span>
                        <div>
                            <div className="stat-number">{stats.total}</div>
                            <div className="stat-label">Всего</div>
                        </div>
                    </div>
                    <div className="users-stat-card patient">
                        <span className="stat-icon">👤</span>
                        <div>
                            <div className="stat-number">{stats.patients}</div>
                            <div className="stat-label">Пациенты</div>
                        </div>
                    </div>
                    <div className="users-stat-card doctor">
                        <span className="stat-icon">👨‍⚕️</span>
                        <div>
                            <div className="stat-number">{stats.doctors}</div>
                            <div className="stat-label">Врачи</div>
                        </div>
                    </div>
                    <div className="users-stat-card admin">
                        <span className="stat-icon">👑</span>
                        <div>
                            <div className="stat-number">{stats.admins}</div>
                            <div className="stat-label">Админы</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Фильтры и поиск */}
            <div className="users-filters-bar">
                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Поиск по логину, имени или email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-wrapper">
                    <select
                        className="filter-select"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">Все роли</option>
                        <option value="patient">👤 Пациенты</option>
                        <option value="doctor">👨‍⚕️ Врачи</option>
                        <option value="admin">👑 Администраторы</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
            ) : filteredUsers.length === 0 ? (
                <div className="admin-empty-state">
                    <FaUsers className="empty-icon" />
                    <h3>Пользователи не найдены</h3>
                    <p>Попробуйте изменить параметры поиска</p>
                </div>
            ) : (
                <div className="users-cards-grid">
                    {filteredUsers.map(user => (
                        <div key={user.id} className="user-card">
                            <div className="user-card-header">
                                <div className="user-avatar">
                                    {getRoleIcon(user.role)}
                                </div>
                                <div className="user-info">
                                    <div className="user-login">{user.username}</div>
                                    <div className="user-name">{user.full_name || '—'}</div>
                                </div>
                                {getRoleBadge(user.role)}
                            </div>

                            <div className="user-card-details">
                                {user.email && (
                                    <div className="detail-item">
                                        <FaEnvelope className="detail-icon" />
                                        <span>{user.email}</span>
                                    </div>
                                )}
                                {user.phone && (
                                    <div className="detail-item">
                                        <FaPhone className="detail-icon" />
                                        <span>{user.phone}</span>
                                    </div>
                                )}
                                <div className="detail-item">
                                    <FaCalendarAlt className="detail-icon" />
                                    <span>Регистрация: {formatDate(user.created_at)}</span>
                                </div>
                                {user.last_login && (
                                    <div className="detail-item">
                                        <FaUserClock className="detail-icon" />
                                        <span>Последний вход: {formatDate(user.last_login)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="user-card-actions">
                                <button
                                    className="action-btn reset"
                                    onClick={() => setShowResetModal(user)}
                                    title="Сбросить пароль"
                                >
                                    <FaKey /> Сбросить пароль
                                </button>
                                <button
                                    className="action-btn role"
                                    onClick={() => {
                                        setShowRoleModal(user);
                                        setSelectedRole(user.role);
                                    }}
                                    title="Сменить роль"
                                >
                                    <FaUserTag /> Сменить роль
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Модальное окно сброса пароля */}
            {showResetModal && (
                <div className="admin-modal-overlay" onClick={() => setShowResetModal(null)}>
                    <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Сброс пароля</h3>
                            <button className="modal-close" onClick={() => setShowResetModal(null)}>✕</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="reset-confirm">
                                <p>Вы уверены, что хотите сбросить пароль для пользователя <strong>{showResetModal.username}</strong>?</p>
                                <p className="text-muted">Новый пароль будет сгенерирован автоматически и показан после подтверждения.</p>
                            </div>
                        </div>
                        <div className="admin-modal-buttons">
                            <button className="btn-outline" onClick={() => setShowResetModal(null)}>Отмена</button>
                            <button className="btn-primary" onClick={() => handleResetPassword(showResetModal.id)}>Сбросить пароль</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно с новым паролем */}
            {newPassword && (
                <div className="admin-modal-overlay" onClick={() => setNewPassword('')}>
                    <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header success">
                            <h3>✅ Пароль сброшен</h3>
                            <button className="modal-close" onClick={() => setNewPassword('')}>✕</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="new-password-box">
                                <label>Новый пароль для пользователя:</label>
                                <code>{newPassword}</code>
                                <p className="text-muted small">Сохраните этот пароль. Он будет показан только один раз.</p>
                            </div>
                        </div>
                        <div className="admin-modal-buttons">
                            <button className="btn-primary" onClick={() => setNewPassword('')}>Закрыть</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Модальное окно смены роли */}
            {showRoleModal && (
                <div className="admin-modal-overlay" onClick={() => setShowRoleModal(null)}>
                    <div className="admin-modal small" onClick={(e) => e.stopPropagation()}>
                        <div className="admin-modal-header">
                            <h3>Смена роли</h3>
                            <button className="modal-close" onClick={() => setShowRoleModal(null)}>✕</button>
                        </div>
                        <div className="admin-modal-body">
                            <div className="role-change">
                                <p>Пользователь: <strong>{showRoleModal.username}</strong></p>
                                <p>Текущая роль: {getRoleBadge(showRoleModal.role)}</p>
                                <div className="role-selector">
                                    <label>Новая роль:</label>
                                    <select
                                        className="form-input"
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value)}
                                    >
                                        <option value="patient">👤 Пациент</option>
                                        <option value="doctor">👨‍⚕️ Врач</option>
                                        <option value="admin">👑 Администратор</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-buttons">
                            <button className="btn-outline" onClick={() => setShowRoleModal(null)}>Отмена</button>
                            <button className="btn-primary" onClick={() => handleChangeRole(showRoleModal.id, selectedRole)}>Сохранить</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;