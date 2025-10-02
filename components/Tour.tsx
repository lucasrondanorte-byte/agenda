import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import type { TourStep } from '../types';

interface TourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: TourStep[];
}

const TourPopover: React.FC<{
  step: TourStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}> = ({ step, currentStep, totalSteps, onNext, onPrev, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const targetElement = document.querySelector(step.element);

  useLayoutEffect(() => {
    if (!popoverRef.current) return;
    
    if (!targetElement) {
        if (step.position === 'center') {
            setPosition({
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
            })
        }
        return;
    };

    const targetRect = targetElement.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const margin = 12;

    let top = 0, left = 0;

    const verticalCenter = targetRect.top + targetRect.height / 2 - popoverRect.height / 2;
    const horizontalCenter = targetRect.left + targetRect.width / 2 - popoverRect.width / 2;

    switch (step.position) {
      case 'top':
        top = targetRect.top - popoverRect.height - margin;
        left = horizontalCenter;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = horizontalCenter;
        break;
      case 'left':
        top = verticalCenter;
        left = targetRect.left - popoverRect.width - margin;
        break;
      case 'right':
        top = verticalCenter;
        left = targetRect.right + margin;
        break;
      case 'center':
        top = window.innerHeight / 2 - popoverRect.height / 2;
        left = window.innerWidth / 2 - popoverRect.width / 2;
        break;
      default: // bottom
        top = targetRect.bottom + margin;
        left = horizontalCenter;
        break;
    }
    
    // Adjust if off-screen
    if (top < margin) top = margin;
    if (left < margin) left = margin;
    if (top + popoverRect.height > window.innerHeight - margin) top = window.innerHeight - popoverRect.height - margin;
    if (left + popoverRect.width > window.innerWidth - margin) left = window.innerWidth - popoverRect.width - margin;


    setPosition({ top, left });
  }, [step, targetElement]);

  return (
    <div
      ref={popoverRef}
      className={`fixed z-[1001] w-80 bg-white rounded-lg shadow-2xl p-5 transform transition-all duration-300 ${step.position === 'center' ? '-translate-x-1/2 -translate-y-1/2' : ''}`}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      onClick={(e) => e.stopPropagation()}
    >
        <h3 className="text-lg font-bold text-zinc-800">{step.title}</h3>
        <p className="text-sm text-zinc-600 mt-2">{step.content}</p>
        <div className="flex justify-between items-center mt-4">
            <span className="text-xs font-medium text-zinc-500">{currentStep + 1} / {totalSteps}</span>
            <div className="flex items-center gap-2">
                <button onClick={onClose} className="text-xs font-bold text-zinc-600 hover:text-zinc-900">Saltar Tour</button>
                {currentStep > 0 && <button onClick={onPrev} className="px-3 py-1 bg-zinc-200 text-sm font-semibold rounded-md hover:bg-zinc-300">Anterior</button>}
                <button onClick={onNext} className="px-3 py-1 bg-teal-600 text-white text-sm font-semibold rounded-md hover:bg-teal-700">
                    {currentStep === totalSteps - 1 ? 'Finalizar' : 'Siguiente'}
                </button>
            </div>
        </div>
    </div>
  );
};

export const Tour: React.FC<TourProps> = ({ isOpen, onClose, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
        // Reset to first step when tour is closed/reopened
        setTimeout(() => setCurrentStep(0), 300);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const targetElement = step ? document.querySelector(step.element) : null;

  const highlightStyle: React.CSSProperties = targetElement
    ? {
        position: 'absolute',
        top: `${targetElement.getBoundingClientRect().top - 4}px`,
        left: `${targetElement.getBoundingClientRect().left - 4}px`,
        width: `${targetElement.getBoundingClientRect().width + 8}px`,
        height: `${targetElement.getBoundingClientRect().height + 8}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 255, 255, 0.7)',
        borderRadius: '8px',
        zIndex: 1000,
        pointerEvents: 'none',
        transition: 'all 0.3s ease-in-out',
      }
    : {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '0px',
        height: '0px',
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        zIndex: 1000,
    };

  return (
    <div className="fixed inset-0 z-[999]" onClick={onClose}>
        {step && (
            <>
                <div style={highlightStyle}></div>
                <TourPopover
                    step={step}
                    currentStep={currentStep}
                    totalSteps={steps.length}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    onClose={onClose}
                />
            </>
        )}
    </div>
  );
};