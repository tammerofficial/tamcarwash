import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/hooks/useOnboarding'
import './WelcomeScreen.css'

export const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate()
  const { getSuggestedActions } = useOnboarding()

  const [suggestedActions, setSuggestedActions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadActions = async () => {
      try {
        const actions = await getSuggestedActions()
        setSuggestedActions(actions)
      } catch (err) {
        console.error('Failed to load suggested actions:', err)
      } finally {
        setLoading(false)
      }
    }

    loadActions()
  }, [])

  const handleActionClick = (action: any) => {
    navigate(`/${action.action}`)
  }

  const goToDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-container">
        <div className="welcome-header">
          <div className="success-icon">🎉</div>
          <h1>Welcome to TAM Car Wash!</h1>
          <p className="subtitle">Your business is now live and ready to serve customers</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <p className="stat-label">Branch Created</p>
              <p className="stat-value">1</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🧼</div>
            <div className="stat-content">
              <p className="stat-label">Services Setup</p>
              <p className="stat-value">1+</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💳</div>
            <div className="stat-content">
              <p className="stat-label">Payment Methods</p>
              <p className="stat-value">1+</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <p className="stat-label">VAT Configured</p>
              <p className="stat-value">5%</p>
            </div>
          </div>
        </div>

        {!loading && suggestedActions.length > 0 && (
          <div className="next-actions">
            <h2>What's Next?</h2>
            <div className="action-list">
              {suggestedActions.map((action: any) => (
                <div
                  key={action.action}
                  className="action-item"
                  onClick={() => handleActionClick(action)}
                >
                  <div className="action-icon">
                    {action.icon === 'building-2' ? '🏢' : action.icon === 'sparkles' ? '✨' : '👥'}
                  </div>
                  <div className="action-content">
                    <h3>{action.title}</h3>
                    <p>{action.description}</p>
                  </div>
                  <div className="action-arrow">→</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button onClick={goToDashboard} className="btn-dashboard">
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export default WelcomeScreen
