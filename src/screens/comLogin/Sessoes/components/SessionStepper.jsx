import React from 'react';
import { FaInfoCircle, FaListUl, FaFileAlt, FaSignature, FaRocket } from 'react-icons/fa';

const SessionStepper = ({ currentStep, steps = [] }) => {
    const defaultSteps = [
        { label: 'Nova Sessão', icon: <FaInfoCircle /> },
        { label: 'Pautas e Urgências', icon: <FaListUl /> },
        { label: 'Gerar Edital', icon: <FaFileAlt /> },
        { label: 'Assinar Edital', icon: <FaSignature /> },
        { label: 'Agendar/Abrir', icon: <FaRocket /> }
    ];

    const displaySteps = steps.length > 0 ? steps : defaultSteps;

    return (
        <div className="stepper-container" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            position: 'relative',
            padding: '0 20px'
        }}>
            {/* Progress Bar Background */}
            <div style={{
                position: 'absolute',
                top: '25px',
                left: '60px',
                right: '60px',
                height: '4px',
                background: '#e0e0e0',
                zIndex: 0,
                borderRadius: '2px'
            }}>
                {/* Active Progress */}
                <div style={{
                    width: `${((currentStep - 1) / (displaySteps.length - 1)) * 100}%`,
                    height: '100%',
                    background: 'var(--primary-color, #126B5E)',
                    transition: 'width 0.5s ease-in-out',
                    borderRadius: '2px'
                }}></div>
            </div>

            {displaySteps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;

                return (
                    <div key={index} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        zIndex: 1,
                        flex: 1
                    }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isCompleted ? 'var(--primary-color, #126B5E)' : (isActive ? '#fff' : '#f0f2f5'),
                            color: isCompleted ? '#fff' : (isActive ? 'var(--primary-color, #126B5E)' : '#999'),
                            border: isActive ? '3px solid var(--primary-color, #126B5E)' : '3px solid transparent',
                            boxShadow: isActive ? '0 0 15px rgba(18, 107, 94, 0.3)' : 'none',
                            transition: 'all 0.3s ease',
                            fontSize: '1.2rem',
                            cursor: 'default'
                        }}>
                            {isCompleted ? <FaRocket style={{ transform: 'rotate(0deg)' }} /> : step.icon}
                        </div>
                        <span style={{
                            marginTop: '10px',
                            fontSize: '0.85rem',
                            fontWeight: isActive ? '700' : '500',
                            color: isActive ? '#333' : '#999',
                            textAlign: 'center',
                            maxWidth: '100px'
                        }}>
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

export default SessionStepper;
