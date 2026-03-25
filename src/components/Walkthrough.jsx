import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Walkthrough = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [spotlightStyle, setSpotlightStyle] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [tooltipPosition, setTooltipPosition] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough_v1');
        if (!hasSeenWalkthrough) {
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = (dontShowAgain = false) => {
        setIsVisible(false);
        if (dontShowAgain) {
            localStorage.setItem('hasSeenWalkthrough_v1', 'true');
        }
    };

    const steps = [
        {
            title: "Welcome to Student Manager!",
            description: "Let's take a quick tour to help you get started with your new institutional management system.",
            target: null,
            position: 'center',
            action: () => {
                navigate('/overview');
            }
        },
        {
            title: "Dashboard Overview",
            description: "See all your key metrics like total students and fee collection at a glance here.",
            target: "a[href='/overview']",
            position: 'right',
            action: () => {
                navigate('/overview');
            }
        },
        {
            title: "Recent Activities",
            description: "Keep track of all actions like admissions, fee payments, and TC issuance in real-time.",
            target: "#recent-activities",
            position: 'top',
            action: () => {
                navigate('/overview');
            }
        },
        {
            title: "Manage Students",
            description: "Add, edit, and view student details. This is where you'll spend most of your time.",
            target: "a[href='/students']",
            position: 'right',
            action: () => {
                navigate('/students');
            }
        },
        {
            title: "Add New Student",
            description: "Click the 'Add Student' button to register a new admission.",
            target: "button",
            targetText: "Add Student",
            position: 'bottom',
            action: () => {
                navigate('/students');
            }
        },
        {
            title: "Fee Management",
            description: "Track payments and view history. The system automatically calculates fines!",
            target: "a[href='/payment-history']",
            position: 'right',
            action: () => {
                navigate('/payment-history');
            }
        },
        {
            title: "Admission Status",
            description: "Monitor the status of new admissions (Inquiry, Applied, Admitted, Rejected).",
            target: "a[href='/admission']",
            position: 'right',
            action: () => {
                navigate('/admission');
            }
        },
        {
            title: "Transfer Certificate",
            description: "Issue TCs to active students and view the history of transferred students.",
            target: "a[href='/tc']",
            position: 'right',
            action: () => {
                navigate('/tc');
            }
        },
        {
            title: "Data Management",
            description: "Export your data to CSV for backup or import existing records.",
            target: "a[href='/data']",
            position: 'right',
            action: () => {
                navigate('/data');
            }
        },
        {
            title: "You're All Set!",
            description: "Feel free to explore. The system is designed to streamline your daily administrative tasks efficiently.",
            target: null,
            position: 'center',
            action: () => {
                navigate('/overview');
            }
        }
    ];

    // Update spotlight and tooltip position when step changes
    useEffect(() => {
        if (!isVisible) return;

        const updatePosition = () => {
            const step = steps[currentStep];

            if (!step.target) {
                // Center screen (no target)
                setSpotlightStyle({ top: '50%', left: '50%', width: 0, height: 0, opacity: 0 });
                setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
                return;
            }

            // Find target element
            let element = null;
            if (step.targetText) {
                // Find button by text content (simple helper)
                const buttons = document.querySelectorAll(step.target);
                for (let btn of buttons) {
                    if (btn.textContent.includes(step.targetText)) {
                        element = btn;
                        break;
                    }
                }
            } else {
                element = document.querySelector(step.target);
            }

            if (element) {
                const rect = element.getBoundingClientRect();
                const padding = 8; // Add some breathing room

                setSpotlightStyle({
                    top: rect.top - padding,
                    left: rect.left - padding,
                    width: rect.width + (padding * 2),
                    height: rect.height + (padding * 2),
                    opacity: 1
                });

                // Calculate tooltip position
                let tooltipStyle = {};
                const tooltipGap = 20;
                const isMobile = window.innerWidth < 768;

                if (isMobile) {
                    tooltipStyle = {
                        bottom: '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 110
                    };
                } else if (step.position === 'right') {
                    tooltipStyle = {
                        top: rect.top + (rect.height / 2),
                        left: rect.right + tooltipGap,
                        transform: 'translateY(-50%)'
                    };
                } else if (step.position === 'left') {
                    tooltipStyle = {
                        top: rect.top + (rect.height / 2),
                        right: window.innerWidth - rect.left + tooltipGap,
                        transform: 'translateY(-50%)'
                    };
                } else if (step.position === 'top') {
                    tooltipStyle = {
                        bottom: window.innerHeight - rect.top + tooltipGap,
                        left: rect.left + (rect.width / 2),
                        transform: 'translateX(-50%)'
                    };
                } else if (step.position === 'bottom') {
                    tooltipStyle = {
                        top: rect.bottom + tooltipGap,
                        left: rect.left + (rect.width / 2),
                        transform: 'translateX(-50%)'
                    };
                } else {
                    // Default fallback: place below target, and prevent it from going off right edge of screen if target is wide
                    tooltipStyle = {
                        top: rect.bottom + tooltipGap,
                        left: rect.left + (rect.width / 2),
                        transform: 'translateX(-50%)'
                    };
                }
                setTooltipPosition(tooltipStyle);
            } else {
                // Fallback if element not found
                setSpotlightStyle({ opacity: 0 });
                setTooltipPosition({ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' });
            }
        };

        // Small delay to allow DOM updates (e.g., navigation)
        const timer = setTimeout(updatePosition, 300);
        window.addEventListener('resize', updatePosition);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updatePosition);
        };
    }, [currentStep, isVisible, navigate]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            const currentStepData = steps[currentStep];
            if (currentStepData.action) currentStepData.action();
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose(true);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            const currentStepData = steps[currentStep];
            if (currentStepData.action) currentStepData.action();
            setCurrentStep(prev => prev - 1);
        }
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Spotlight Overlay */}
            {/* We use a huge box-shadow on the spotlight div to create the dark overlay around it */}
            <div
                className="absolute transition-all duration-300 ease-in-out rounded-none pointer-events-none border-[3px] border-[#CCFF00]"
                style={{
                    top: spotlightStyle.top,
                    left: spotlightStyle.left,
                    width: spotlightStyle.width,
                    height: spotlightStyle.height,
                    boxShadow: '0 0 0 9999px rgba(5, 5, 5, 0.85)',
                    opacity: spotlightStyle.opacity === 0 && !step.target ? 0 : 1 // Hide spotlight ring if no target
                }}
            />

            {/* Full screen backdrop for when there is NO target (center steps) */}
            {!step.target && (
                <div className="absolute inset-0 bg-[#050505]/90 transition-opacity duration-300" />
            )}

            {/* Tooltip Card */}
            <div
                className="absolute pointer-events-auto bg-[#0a0a0a] p-8 rounded-none shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] w-[90vw] md:w-full md:max-w-sm transition-all duration-300 ease-in-out border-2 border-white/40 z-[110]"
                style={tooltipPosition}
            >
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-[#CCFF00] text-black text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-none border-2 border-[#CCFF00]">
                            Step {currentStep + 1}/{steps.length}
                        </span>
                    </div>
                    <button onClick={() => handleClose(true)} className="text-white/50 hover:text-white transition-colors">
                        <X size={24} className="stroke-[3px]" />
                    </button>
                </div>

                <h3 className="text-xl font-black text-white mb-3 uppercase tracking-widest">{step.title}</h3>
                <p className="text-white/70 mb-8 leading-relaxed font-mono text-xs uppercase tracking-widest">{step.description}</p>

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${currentStep === 0 ? 'text-white/20 cursor-not-allowed' : 'text-white/50 hover:text-[#CCFF00]'}`}
                    >
                        <ChevronLeft size={16} className="stroke-[3px]" /> Previous
                    </button>

                    <div className="hidden sm:flex gap-3">
                        {/* Dots indicator */}
                        {steps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-none transition-all ${idx === currentStep ? 'bg-[#CCFF00] scale-125' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={handleNext}
                        className="bg-[#CCFF00] hover:bg-transparent hover:text-[#CCFF00] text-black border-2 border-[#CCFF00] px-5 py-3 rounded-none text-[10px] font-black shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] flex items-center gap-3 transition-colors uppercase tracking-widest active:bg-[#CCFF00]/20"
                    >
                        {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
                        {currentStep === steps.length - 1 ? <CheckCircle size={16} className="stroke-[3px]" /> : <ChevronRight size={16} className="stroke-[3px]" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Walkthrough;
