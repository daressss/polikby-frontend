import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FaStethoscope } from 'react-icons/fa';
import DoctorSidebar from './DoctorSidebar';
import DoctorSchedule from './DoctorSchedule';
import DoctorPatients from './DoctorPatients';
import DoctorHistory from './DoctorHistory';

const DoctorDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('schedule');

    const renderContent = () => {
        switch(activeTab) {
            case 'schedule':
                return <DoctorSchedule />;
            case 'patients':
                return <DoctorPatients />;
            case 'history':
                return <DoctorHistory />;
            default:
                return <DoctorSchedule />;
        }
    };

    return (
        <div className="doctor-dashboard">
            <div className="container">
                <div className="doctor-layout">
                    <DoctorSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="doctor-main">
                        <div className="doctor-welcome">
                            <FaStethoscope className="doctor-icon" />
                            <div>
                                <h1>Личный кабинет врача</h1>
                                <p>Добро пожаловать, {user?.username}!</p>
                            </div>
                        </div>
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDashboard;