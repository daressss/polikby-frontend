import React from 'react';

const Breadcrumbs = ({ steps, currentStep, onStepClick }) => {
    return (
        <div className="breadcrumbs-container">
            {/* Линия с кружками */}
            <div className="breadcrumbs">
                {steps.map((step, index) => (
                    <React.Fragment key={index}>
                        {/* Круг-этап */}
                        <div className={`step ${index < currentStep ? 'completed' : index === currentStep ? 'active' : 'upcoming'}`}>
                            {index < currentStep && <span className="step-check">✓</span>}
                        </div>

                        {/* Соединительная линия (кроме последнего элемента) */}
                        {index < steps.length - 1 && (
                            <div className={`line ${index < currentStep ? 'completed' : 'upcoming'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Кнопки-подписи под кружками */}
            <div className="breadcrumbs-buttons">
                {steps.map((step, index) => (
                    <button
                        key={index}
                        className={`step-button ${index === currentStep ? 'active' : ''}`}
                        onClick={() => onStepClick(step.key)}
                    >
                        {step.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Breadcrumbs;