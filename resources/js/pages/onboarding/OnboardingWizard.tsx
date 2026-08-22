import React, { useEffect, useState } from 'react'
import { useOnboarding } from '@/hooks/useOnboarding'
import './OnboardingWizard.css'

// Main Wizard Component
export const OnboardingWizard: React.FC = () => {
  const {
    loading,
    error,
    loadingMessage,
    currentStep,
    totalSteps,
    progressPercentage,
    initializeOnboarding,
    getProgress,
    getReview,
  } = useOnboarding()

  const [reviewData, setReviewData] = useState<any>(null)

  useEffect(() => {
    const initiate = async () => {
      try {
        const existingProgress = await getProgress()
        if (!existingProgress) {
          await initializeOnboarding()
        }
      } catch (err) {
        console.error('Failed to initialize onboarding:', err)
      }
    }
    initiate()
  }, [])

  useEffect(() => {
    if (currentStep === 7 && !reviewData) {
      const loadReview = async () => {
        try {
          const data = await getReview()
          setReviewData(data)
        } catch (err) {
          console.error('Failed to load review data:', err)
        }
      }
      loadReview()
    }
  }, [currentStep])

  return (
    <div className="onboarding-wizard">
      <div className="wizard-header">
        <div className="progress-container">
          <div className="progress-info">
            <h1 className="wizard-title">Welcome to TAM Car Wash! 👋</h1>
            <p className="wizard-subtitle">Let's set up your business in {totalSteps} easy steps</p>
          </div>
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: progressPercentage + '%' }}></div>
            </div>
            <p className="progress-text">{currentStep} of {totalSteps} steps completed</p>
          </div>
        </div>
      </div>

      <div className="steps-indicator">
        {Array.from({ length: totalSteps }).map((_: unknown, i: number) => {
          const stepNum = i + 1
          return (
            <div
              key={stepNum}
              className={`step-badge ${stepNum === currentStep ? 'active' : stepNum < currentStep ? 'completed' : ''}`}
            >
              {stepNum < currentStep ? '✓' : stepNum}
            </div>
          )
        })}
      </div>

      <div className="steps-container">
        <p>Onboarding Step {currentStep}</p>
        <p>This is a placeholder. Full implementation coming soon.</p>
      </div>

      {loading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>{loadingMessage || 'Loading...'}</p>
        </div>
      )}

      {error && (
        <div className="error-notification">
          <p>{error}</p>
          <button onClick={() => {}}>Dismiss</button>
        </div>
      )}
    </div>
  )
}

export default OnboardingWizard
