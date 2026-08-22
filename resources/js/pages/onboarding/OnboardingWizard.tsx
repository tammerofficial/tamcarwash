import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '@/hooks/useOnboarding'
import './OnboardingWizard.css'

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface StepComponentProps {
  onNext: (data: any) => void
  onSkip: () => void
  savedData?: any
}

// Step 1: Business Info
const StepBusinessInfo: React.FC<StepComponentProps> = ({ onNext, onSkip, savedData }) => {
  const [formData, setFormData] = useState(
    savedData || { business_name: '', phone: '', email: '' }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Business Information</h2>
        <p className="step-description">Tell us about your car wash business</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-group">
          <label htmlFor="business_name">Business Name *</label>
          <input
            id="business_name"
            name="business_name"
            value={formData.business_name}
            onChange={handleChange}
            type="text"
            placeholder="e.g., TAM Premium Car Wash"
            className="form-input"
            required
          />
          <small className="help-text">This is the name customers will see</small>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            type="tel"
            placeholder="e.g., +968 9XXX XXXX"
            className="form-input"
            required
          />
          <small className="help-text">Best contact number for your business</small>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address *</label>
          <input
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            placeholder="e.g., owner@tamcarwash.com"
            className="form-input"
            required
          />
          <small className="help-text">We'll use this for important notifications</small>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onSkip} className="btn-secondary">
            Skip
          </button>
          <button type="submit" className="btn-primary">
            Continue to Next Step
          </button>
        </div>
      </form>
    </div>
  )
}

// Step 2: First Branch
const StepFirstBranch: React.FC<StepComponentProps> = ({ onNext, onSkip, savedData }) => {
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

  const [formData, setFormData] = useState(
    savedData || {
      branch_name: 'Main Branch',
      address: '',
      city: '',
      phone: '',
      email: '',
    }
  )

  const [workingHours, setWorkingHours] = useState(
    savedData?.working_hours || [
      { day: 'saturday', is_open: true, start_time: '08:00', end_time: '18:00' },
      { day: 'sunday', is_open: true, start_time: '08:00', end_time: '18:00' },
      { day: 'monday', is_open: true, start_time: '08:00', end_time: '18:00' },
      { day: 'tuesday', is_open: true, start_time: '08:00', end_time: '18:00' },
      { day: 'wednesday', is_open: true, start_time: '08:00', end_time: '18:00' },
      { day: 'thursday', is_open: true, start_time: '08:00', end_time: '18:00' },
      { day: 'friday', is_open: false, start_time: '10:00', end_time: '20:00' },
    ]
  )

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleWorkingHourChange = (index: number, field: string, value: any) => {
    const updated = [...workingHours]
    updated[index] = { ...updated[index], [field]: value }
    setWorkingHours(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({ ...formData, working_hours: workingHours })
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>First Branch/Location</h2>
        <p className="step-description">Set up your main car wash location</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="form-group">
          <label htmlFor="branch_name">Branch Name *</label>
          <input
            id="branch_name"
            name="branch_name"
            value={formData.branch_name}
            onChange={handleFormChange}
            type="text"
            placeholder="e.g., Main Branch - Muscat"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="address">Address *</label>
          <input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleFormChange}
            type="text"
            placeholder="Street address"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleFormChange}
            type="text"
            placeholder="e.g., Muscat"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Branch Phone *</label>
          <input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleFormChange}
            type="tel"
            placeholder="e.g., +968 9XXX XXXX"
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label className="label-title">Working Hours</label>
          <div className="working-hours">
            {workingHours.map((hours, index) => (
              <div key={index} className="day-hours">
                <div className="day-checkbox">
                  <input
                    id={`day_${index}`}
                    type="checkbox"
                    checked={hours.is_open}
                    onChange={(e) => handleWorkingHourChange(index, 'is_open', e.target.checked)}
                    className="checkbox"
                  />
                  <label htmlFor={`day_${index}`} className="day-label">
                    {days[index]}
                  </label>
                </div>
                {hours.is_open && (
                  <div className="time-inputs">
                    <input
                      type="time"
                      value={hours.start_time}
                      onChange={(e) => handleWorkingHourChange(index, 'start_time', e.target.value)}
                      className="form-input"
                      required
                    />
                    <span className="time-separator">to</span>
                    <input
                      type="time"
                      value={hours.end_time}
                      onChange={(e) => handleWorkingHourChange(index, 'end_time', e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onSkip} className="btn-secondary">
            Skip
          </button>
          <button type="submit" className="btn-primary">
            Continue to Next Step
          </button>
        </div>
      </form>
    </div>
  )
}

// Step 3: Services
const StepServicesSetup: React.FC<StepComponentProps> = ({ onNext, onSkip, savedData }) => {
  const [services, setServices] = useState(
    savedData?.services || [
      {
        name: 'Standard Wash',
        name_ar: 'غسيل قياسي',
        description: 'Quick exterior wash',
        base_price: 3.0,
        duration_minutes: 20,
        vat_included: true,
      },
    ]
  )

  const addService = () => {
    setServices([
      ...services,
      {
        name: '',
        name_ar: '',
        description: '',
        base_price: 0,
        duration_minutes: 30,
        vat_included: true,
      },
    ])
  }

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index))
  }

  const updateService = (index: number, field: string, value: any) => {
    const updated = [...services]
    updated[index] = { ...updated[index], [field]: value }
    setServices(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (services.length === 0) {
      alert('Please add at least one service')
      return
    }
    onNext({ services })
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Services Setup</h2>
        <p className="step-description">Add at least one service to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="services-list">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-header">
                <h3>Service {index + 1}</h3>
                {services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="btn-remove"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="form-group">
                <label>Service Name (English) *</label>
                <input
                  type="text"
                  value={service.name}
                  onChange={(e) => updateService(index, 'name', e.target.value)}
                  placeholder="e.g., Standard Wash"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Service Name (Arabic)</label>
                <input
                  type="text"
                  value={service.name_ar}
                  onChange={(e) => updateService(index, 'name_ar', e.target.value)}
                  placeholder="e.g., غسيل قياسي"
                  className="form-input"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (OMR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={service.base_price}
                    onChange={(e) => updateService(index, 'base_price', parseFloat(e.target.value))}
                    placeholder="3.00"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="5"
                    max="480"
                    value={service.duration_minutes}
                    onChange={(e) =>
                      updateService(index, 'duration_minutes', parseInt(e.target.value))
                    }
                    placeholder="30"
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-group checkbox">
                <input
                  id={`vat_${index}`}
                  type="checkbox"
                  checked={service.vat_included}
                  onChange={(e) => updateService(index, 'vat_included', e.target.checked)}
                  className="checkbox"
                />
                <label htmlFor={`vat_${index}`}>Include 5% VAT in price (Oman Tax)</label>
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addService} className="btn-add-service">
          + Add Another Service
        </button>

        <div className="form-actions">
          <button type="button" onClick={onSkip} className="btn-secondary">
            Skip
          </button>
          <button type="submit" className="btn-primary">
            Continue to Next Step
          </button>
        </div>
      </form>
    </div>
  )
}

// Step 4: Staff
const StepStaffSetup: React.FC<StepComponentProps> = ({ onNext, onSkip, savedData }) => {
  const [staffMembers, setStaffMembers] = useState(savedData?.staff_members || [])

  const addStaff = () => {
    setStaffMembers([...staffMembers, { name: '', role: '', email: '' }])
  }

  const removeStaff = (index: number) => {
    setStaffMembers(staffMembers.filter((_, i) => i !== index))
  }

  const updateStaff = (index: number, field: string, value: any) => {
    const updated = [...staffMembers]
    updated[index] = { ...updated[index], [field]: value }
    setStaffMembers(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext({
      owner: { name: 'Business Owner', role: 'owner' },
      staff_count: staffMembers.length,
      staff_members: staffMembers,
    })
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Staff Setup</h2>
        <p className="step-description">Add your team members (you're the owner)</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="section">
          <h3>Owner Profile</h3>
          <div className="owner-card">
            <div className="owner-icon">👤</div>
            <div className="owner-info">
              <p>
                <strong>Role:</strong> Owner
              </p>
            </div>
          </div>
        </div>

        <div className="section">
          <h3>Team Members (Optional)</h3>
          <p className="section-description">Add cashiers, workers, or other staff members</p>

          <div className="staff-list">
            {staffMembers.map((member, index) => (
              <div key={index} className="staff-card">
                <div className="staff-header">
                  <h4>Staff Member {index + 1}</h4>
                  <button type="button" onClick={() => removeStaff(index)} className="btn-remove">
                    Remove
                  </button>
                </div>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) => updateStaff(index, 'name', e.target.value)}
                    placeholder="e.g., Ahmed Ali"
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={member.role}
                    onChange={(e) => updateStaff(index, 'role', e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select a role</option>
                    <option value="cashier">Cashier</option>
                    <option value="worker">Worker</option>
                    <option value="supervisor">Supervisor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={(e) => updateStaff(index, 'email', e.target.value)}
                    placeholder="email@example.com"
                    className="form-input"
                  />
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addStaff} className="btn-add-service">
            + Add Team Member
          </button>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onSkip} className="btn-secondary">
            Skip
          </button>
          <button type="submit" className="btn-primary">
            Continue to Next Step
          </button>
        </div>
      </form>
    </div>
  )
}

// Step 5: Payment Methods
const StepPaymentMethods: React.FC<StepComponentProps> = ({ onNext, onSkip, savedData }) => {
  const availableMethods = [
    {
      type: 'cash',
      name: 'Cash',
      icon: '💵',
      description: 'Accept cash payments at your location',
    },
    {
      type: 'card',
      name: 'Credit/Debit Card',
      icon: '💳',
      description: 'Accept Visa, Mastercard, and other cards',
    },
    {
      type: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Accept bank transfers and online payments',
    },
    {
      type: 'mobile_wallet',
      name: 'Mobile Wallet',
      icon: '📱',
      description: 'Accept Apple Pay, Google Pay, and mobile wallets',
    },
  ]

  const [selectedMethods, setSelectedMethods] = useState(
    savedData?.payment_methods || [{ name: 'Cash', type: 'cash', is_active: true }]
  )

  const isMethodSelected = (type: string) => selectedMethods.some((m) => m.type === type)

  const toggleMethod = (method: any) => {
    if (isMethodSelected(method.type)) {
      setSelectedMethods(selectedMethods.filter((m) => m.type !== method.type))
    } else {
      setSelectedMethods([
        ...selectedMethods,
        { name: method.name, type: method.type, is_active: true },
      ])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedMethods.length === 0) {
      alert('Please select at least one payment method')
      return
    }
    onNext({ payment_methods: selectedMethods })
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Payment Methods</h2>
        <p className="step-description">Select accepted payment types for your customers</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="payment-methods">
          {availableMethods.map((method) => (
            <div
              key={method.type}
              className={`payment-card ${isMethodSelected(method.type) ? 'selected' : ''}`}
              onClick={() => toggleMethod(method)}
            >
              <input
                type="checkbox"
                checked={isMethodSelected(method.type)}
                onChange={() => {}}
                className="checkbox"
              />
              <div className="method-icon">{method.icon}</div>
              <div className="method-name">{method.name}</div>
              <div className="method-description">{method.description}</div>
            </div>
          ))}
        </div>

        {selectedMethods.length === 0 && (
          <div className="warning">
            <p>⚠️ Please select at least one payment method</p>
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onSkip} className="btn-secondary">
            Skip
          </button>
          <button type="submit" disabled={selectedMethods.length === 0} className="btn-primary">
            Continue to Next Step
          </button>
        </div>
      </form>
    </div>
  )
}

// Step 6: Tax Setup
const StepTaxSetup: React.FC<StepComponentProps> = ({ onNext, onSkip, savedData }) => {
  const [formData, setFormData] = useState(
    savedData || { vat_enabled: true, tax_id: '' }
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onNext(formData)
  }

  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Tax Setup</h2>
        <p className="step-description">Configure your tax settings for Oman</p>
      </div>

      <form onSubmit={handleSubmit} className="step-form">
        <div className="tax-info-card">
          <div className="tax-icon">📋</div>
          <div className="tax-details">
            <h3>Oman VAT (Value Added Tax)</h3>
            <p>
              <strong>Rate:</strong> 5%
            </p>
            <p>
              <strong>Country:</strong> Oman
            </p>
            <p>
              <strong>Currency:</strong> OMR (Omani Rial)
            </p>
          </div>
        </div>

        <div className="vat-toggle">
          <div className="toggle-header">
            <label htmlFor="vat_enabled">Enable VAT in Pricing?</label>
            <span className="toggle-description">This will add 5% to your service prices</span>
          </div>
          <div className="toggle-switch">
            <input
              id="vat_enabled"
              name="vat_enabled"
              type="checkbox"
              checked={formData.vat_enabled}
              onChange={handleChange}
              className="checkbox"
            />
            <label htmlFor="vat_enabled" className="switch-label">
              <span className="switch-slider"></span>
            </label>
          </div>
        </div>

        {formData.vat_enabled && (
          <div className="vat-preview">
            <h4>Price Example with VAT</h4>
            <div className="price-row">
              <span>Service Price (Before VAT):</span>
              <span className="price">3.00 OMR</span>
            </div>
            <div className="price-row">
              <span>VAT (5%):</span>
              <span className="price">0.15 OMR</span>
            </div>
            <div className="price-row total">
              <span>Total Price:</span>
              <span className="price">3.15 OMR</span>
            </div>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="tax_id">Tax Registration ID (Optional)</label>
          <input
            id="tax_id"
            name="tax_id"
            value={formData.tax_id}
            onChange={handleChange}
            type="text"
            placeholder="Your tax ID or CR number"
            className="form-input"
          />
          <small className="help-text">Enter your commercial registration number if applicable</small>
        </div>

        <div className="compliance-notice">
          <p>✅ By enabling these settings, you confirm compliance with Omani tax regulations for the year 2026.</p>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onSkip} className="btn-secondary">
            Skip
          </button>
          <button type="submit" className="btn-primary">
            Continue to Next Step
          </button>
        </div>
      </form>
    </div>
  )
}

// Step 7: Review & Activate
const StepReviewActivate: React.FC<{
  reviewData: any
  onComplete: () => void
  loading: boolean
}> = ({ reviewData, onComplete, loading }) => {
  return (
    <div className="step-container">
      <div className="step-header">
        <h2>Review & Activate</h2>
        <p className="step-description">Review your setup and activate your business</p>
      </div>

      {!loading && (
        <div className="checkmark-animation">
          <div className="checkmark-circle">✓</div>
        </div>
      )}

      {reviewData && (
        <div className="review-sections">
          {reviewData.business_info && (
            <div className="review-section">
              <h3>Business Information</h3>
              <div className="review-items">
                {Object.entries(reviewData.business_info).map(([key, value]) => (
                  <div key={key} className="review-item">
                    <span className="label">{key.replace(/_/g, ' ')}:</span>
                    <span className="value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewData.services && (
            <div className="review-section">
              <h3>Services ({reviewData.services.length})</h3>
              <div className="services-grid">
                {reviewData.services.map((service: any) => (
                  <div key={service.id || service.name} className="service-item">
                    <div className="service-name">{service.name}</div>
                    <div className="service-price">{service.price} OMR</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reviewData.payment_methods && (
            <div className="review-section">
              <h3>Payment Methods</h3>
              <div className="payment-badges">
                {reviewData.payment_methods.map((method: any) => (
                  <span key={method.type} className="badge">
                    {method.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="progress-section">
        <p className="progress-label">Setup Completion</p>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: (reviewData?.progress || 0) + '%' }}
          ></div>
        </div>
        <p className="progress-text">{reviewData?.progress || 0}% Complete</p>
      </div>

      <div className="activation-message">
        <p>🚀 Your business is ready to go live! Click the button below to activate and start accepting orders.</p>
      </div>

      <div className="form-actions">
        <button onClick={onComplete} disabled={loading} className="btn-activate">
          {loading ? 'Activating...' : '✓ Go Live & Activate'}
        </button>
      </div>
    </div>
  )
}

// Main Wizard Component
export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate()
  const {
    progress,
    loading,
    error,
    loadingMessage,
    savedData,
    currentStep,
    totalSteps,
    progressPercentage,
    initializeOnboarding,
    getProgress,
    saveBusinessInfo,
    saveFirstBranch,
    saveServices,
    saveStaff,
    savePaymentMethods,
    saveTaxSetup,
    completeOnboarding,
    getReview,
    skipStep,
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

  const handleBusinessInfoNext = async (data: any) => {
    try {
      await saveBusinessInfo(data)
    } catch (err) {
      console.error('Failed to save business info:', err)
    }
  }

  const handleBranchNext = async (data: any) => {
    try {
      await saveFirstBranch(data)
    } catch (err) {
      console.error('Failed to save branch:', err)
    }
  }

  const handleServicesNext = async (data: any) => {
    try {
      await saveServices(data)
    } catch (err) {
      console.error('Failed to save services:', err)
    }
  }

  const handleStaffNext = async (data: any) => {
    try {
      await saveStaff(data)
    } catch (err) {
      console.error('Failed to save staff:', err)
    }
  }

  const handlePaymentMethodsNext = async (data: any) => {
    try {
      await savePaymentMethods(data)
    } catch (err) {
      console.error('Failed to save payment methods:', err)
    }
  }

  const handleTaxSetupNext = async (data: any) => {
    try {
      await saveTaxSetup(data)
    } catch (err) {
      console.error('Failed to save tax setup:', err)
    }
  }

  const handleSkipStep = async () => {
    try {
      await skipStep(currentStep)
    } catch (err) {
      console.error('Failed to skip step:', err)
    }
  }

  const handleComplete = async () => {
    try {
      await completeOnboarding()
      navigate('/onboarding/welcome')
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
    }
  }

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
              <div
                className="progress-fill"
                style={{ width: progressPercentage + '%' }}
              ></div>
            </div>
            <p className="progress-text">{currentStep} of {totalSteps} steps completed</p>
          </div>
        </div>
      </div>

      <div className="steps-indicator">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const stepNum = i + 1
          return (
            <div
              key={stepNum}
              className={`step-badge ${
                stepNum === currentStep ? 'active' : stepNum < currentStep ? 'completed' : ''
              }`}
            >
              {stepNum < currentStep ? '✓' : stepNum}
            </div>
          )
        })}
      </div>

      <div className="steps-container">
        {currentStep === 1 && (
          <StepBusinessInfo
            onNext={handleBusinessInfoNext}
            onSkip={handleSkipStep}
            savedData={savedData.businessInfo}
          />
        )}
        {currentStep === 2 && (
          <StepFirstBranch
            onNext={handleBranchNext}
            onSkip={handleSkipStep}
            savedData={savedData.branchInfo}
          />
        )}
        {currentStep === 3 && (
          <StepServicesSetup
            onNext={handleServicesNext}
            onSkip={handleSkipStep}
            savedData={savedData.services}
          />
        )}
        {currentStep === 4 && (
          <StepStaffSetup
            onNext={handleStaffNext}
            onSkip={handleSkipStep}
            savedData={savedData.staff}
          />
        )}
        {currentStep === 5 && (
          <StepPaymentMethods
            onNext={handlePaymentMethodsNext}
            onSkip={handleSkipStep}
            savedData={savedData.paymentMethods}
          />
        )}
        {currentStep === 6 && (
          <StepTaxSetup
            onNext={handleTaxSetupNext}
            onSkip={handleSkipStep}
            savedData={savedData.taxSetup}
          />
        )}
        {currentStep === 7 && (
          <StepReviewActivate
            reviewData={reviewData}
            onComplete={handleComplete}
            loading={loading}
          />
        )}
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
