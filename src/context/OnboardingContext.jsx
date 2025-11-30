import React, { createContext, useContext, useState, useEffect } from 'react';

const OnboardingContext = createContext();

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};

const ONBOARDING_STEPS = [
  { id: 'add-charger', route: '/chargers/add', title: 'Add Your Charger' },
  { id: 'configure-settings', route: '/chargers/:id/settings', title: 'Configure Settings' },
  { id: 'payments', route: '/payments', title: 'Payment & Payouts' },
  { id: 'access-control', route: '/access', title: 'Access Control' },
  { id: 'monitor-analyze', route: '/analytics/energy', title: 'Monitor & Analyze' },
];

export function OnboardingProvider({ children }) {
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [chargerId, setChargerId] = useState(null);

  useEffect(() => {
    // Check if onboarding was started
    const onboardingActive = localStorage.getItem('onboarding_active') === 'true';
    const savedStep = parseInt(localStorage.getItem('onboarding_step') || '0');
    const savedCompleted = JSON.parse(localStorage.getItem('onboarding_completed') || '[]');
    const savedChargerId = localStorage.getItem('onboarding_charger_id');
    
    if (onboardingActive) {
      setIsOnboarding(true);
      setCurrentStep(savedStep);
      setCompletedSteps(savedCompleted);
      if (savedChargerId) {
        setChargerId(savedChargerId);
      }
    }
  }, []);

  const startOnboarding = () => {
    setIsOnboarding(true);
    setCurrentStep(0);
    setCompletedSteps([]);
    setChargerId(null);
    localStorage.setItem('onboarding_active', 'true');
    localStorage.setItem('onboarding_step', '0');
    localStorage.setItem('onboarding_completed', '[]');
    localStorage.removeItem('onboarding_charger_id');
  };

  const setChargerIdForOnboarding = (id) => {
    setChargerId(id);
    localStorage.setItem('onboarding_charger_id', id);
  };

  const completeStep = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      const newCompleted = [...completedSteps, stepId];
      setCompletedSteps(newCompleted);
      localStorage.setItem('onboarding_completed', JSON.stringify(newCompleted));
    }
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      localStorage.setItem('onboarding_step', next.toString());
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    setIsOnboarding(false);
    setCurrentStep(0);
    setCompletedSteps([]);
    setChargerId(null);
    localStorage.removeItem('onboarding_active');
    localStorage.removeItem('onboarding_step');
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_charger_id');
  };

  const getCurrentStepInfo = () => {
    return ONBOARDING_STEPS[currentStep];
  };

  const getProgress = () => {
    return {
      current: currentStep + 1,
      total: ONBOARDING_STEPS.length,
      percentage: ((currentStep + 1) / ONBOARDING_STEPS.length) * 100,
    };
  };

  const getStepRoute = (stepIndex) => {
    const step = ONBOARDING_STEPS[stepIndex];
    if (!step) return null;
    
    // Replace :id with actual charger ID if available
    if (step.route.includes(':id') && chargerId) {
      return step.route.replace(':id', chargerId);
    }
    return step.route;
  };

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        completedSteps,
        chargerId,
        startOnboarding,
        setChargerIdForOnboarding,
        completeStep,
        nextStep,
        finishOnboarding,
        getCurrentStepInfo,
        getProgress,
        getStepRoute,
        steps: ONBOARDING_STEPS,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

