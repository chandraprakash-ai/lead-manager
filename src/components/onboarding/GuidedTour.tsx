import { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import './GuidedTour.css';

interface TourStep {
    target: string; // CSS selector
    title: string;
    content: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
    {
        target: '.nav-item[href="/"]',
        title: 'Dashboard',
        content: 'Your command center. See pipeline stats, follow-ups, and insights at a glance.',
        position: 'right',
    },
    {
        target: '.nav-item[href="/leads"]',
        title: 'Leads',
        content: 'All your leads in one place. Add, filter, and manage your entire pipeline.',
        position: 'right',
    },
    {
        target: '.nav-item[href="/niches"]',
        title: 'Niches',
        content: 'Organize leads by industry or niche. Great for targeting specific markets.',
        position: 'right',
    },
    {
        target: '.user-menu__trigger',
        title: 'Your Account',
        content: 'Access settings, billing, and your profile from here.',
        position: 'top',
    },
];

interface GuidedTourProps {
    onComplete: () => void;
}

export function GuidedTour({ onComplete }: GuidedTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [visible, setVisible] = useState(false);

    const step = TOUR_STEPS[currentStep];
    const isLast = currentStep === TOUR_STEPS.length - 1;

    const updateTargetRect = useCallback(() => {
        const target = document.querySelector(step.target);
        if (target) {
            setTargetRect(target.getBoundingClientRect());
        }
    }, [step.target]);

    useEffect(() => {
        updateTargetRect();
        const timer = setTimeout(() => setVisible(true), 100);

        window.addEventListener('resize', updateTargetRect);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateTargetRect);
        };
    }, [currentStep, updateTargetRect]);

    const handleNext = () => {
        if (isLast) {
            onComplete();
        } else {
            setVisible(false);
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 200);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setVisible(false);
            setTimeout(() => {
                setCurrentStep(prev => prev - 1);
            }, 200);
        }
    };

    if (!targetRect) return null;

    // Calculate tooltip position
    const getTooltipStyle = () => {
        const padding = 12;
        const tooltipWidth = 280;

        switch (step.position) {
            case 'right':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.right + padding,
                    transform: 'translateY(-50%)',
                };
            case 'left':
                return {
                    top: targetRect.top + targetRect.height / 2,
                    left: targetRect.left - tooltipWidth - padding,
                    transform: 'translateY(-50%)',
                };
            case 'top':
                return {
                    top: targetRect.top - padding,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translate(-50%, -100%)',
                };
            case 'bottom':
                return {
                    top: targetRect.bottom + padding,
                    left: targetRect.left + targetRect.width / 2,
                    transform: 'translateX(-50%)',
                };
            default:
                return {};
        }
    };

    return (
        <div className="tour-overlay">
            {/* Spotlight */}
            <div
                className="tour-spotlight"
                style={{
                    top: targetRect.top - 4,
                    left: targetRect.left - 4,
                    width: targetRect.width + 8,
                    height: targetRect.height + 8,
                }}
            />

            {/* Tooltip */}
            <div
                className={`tour-tooltip ${visible ? 'tour-tooltip--visible' : ''}`}
                style={getTooltipStyle()}
            >
                <button className="tour-close" onClick={onComplete}>
                    <X size={16} />
                </button>

                <div className="tour-progress">
                    {TOUR_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`tour-progress__dot ${i === currentStep ? 'active' : ''} ${i < currentStep ? 'done' : ''}`}
                        />
                    ))}
                </div>

                <h3 className="tour-title">{step.title}</h3>
                <p className="tour-content">{step.content}</p>

                <div className="tour-actions">
                    {currentStep > 0 && (
                        <button className="tour-btn tour-btn--ghost" onClick={handlePrev}>
                            <ChevronLeft size={16} /> Back
                        </button>
                    )}
                    <button className="tour-btn tour-btn--primary" onClick={handleNext}>
                        {isLast ? 'Finish' : 'Next'} {!isLast && <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
