import React from 'react';
import { useNavigate } from 'react-router-dom';

const ScheduleBreadcrumbs = ({ currentStep, selectedData = {} }) => {
    const navigate = useNavigate();

    const steps = [
        {
            key: 'specialization',
            label: 'Специальность',
            path: '/schedule/specialization',
            enabled: true
        },
        {
            key: 'doctor',
            label: 'Врач',
            path: selectedData.specialization ? `/schedule/doctor?spec=${encodeURIComponent(selectedData.specialization)}` : '#',
            enabled: currentStep >= 1
        },
        {
            key: 'schedule',
            label: 'Расписание',
            path: selectedData.doctorId ? `/schedule/calendar?doctor_id=${selectedData.doctorId}&doctor_name=${encodeURIComponent(selectedData.doctorName || '')}&spec=${encodeURIComponent(selectedData.specialization || '')}` : '#',
            enabled: currentStep >= 2
        }
    ];

    const handleStepClick = (step) => {
        if (step.enabled && step.path !== '#') {
            navigate(step.path);
        }
    };

    return (
        <div className="booking-breadcrumbs-container">
            <div className="booking-breadcrumbs">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        <button
                            className={`step-btn ${index < currentStep ? 'completed' : index === currentStep ? 'active' : 'upcoming'}`}
                            onClick={() => handleStepClick(step)}
                            disabled={!step.enabled}
                        >
                            {index < currentStep ? '✓' : index + 1}
                        </button>
                        {index < steps.length - 1 && (
                            <div className={`line ${index < currentStep ? 'completed' : 'upcoming'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className="booking-breadcrumbs-labels">
                {steps.map((step, index) => (
                    <span
                        key={index}
                        className={`label ${index <= currentStep ? 'active' : ''}`}
                        onClick={() => handleStepClick(step)}
                        style={{ cursor: step.enabled ? 'pointer' : 'default' }}
                    >
                        {step.label}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default ScheduleBreadcrumbs;