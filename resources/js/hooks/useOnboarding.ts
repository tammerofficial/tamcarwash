import { useState, useEffect, useCallback } from 'react'
import { api } from '@/lib/api'

export function useOnboarding() {
  const [progress, setProgress] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedData, setSavedData] = useState<any>({})
  const [loadingMessage, setLoadingMessage] = useState('')

  const loadSavedData = useCallback(() => {
    try {
      const saved = localStorage.getItem('onboarding-data')
      if (saved) setSavedData(JSON.parse(saved))
    } catch (e) {
      console.error('Error loading saved data:', e)
    }
  }, [])

  const saveToLocalStorage = useCallback((key: string, data: any) => {
    try {
      setSavedData((prev: any) => {
        const updated = { ...prev, [key]: data }
        localStorage.setItem('onboarding-data', JSON.stringify(updated))
        return updated
      })
    } catch (e) {
      console.error('Error saving data:', e)
    }
  }, [])

  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem('onboarding-data')
      setSavedData({})
    } catch (e) {
      console.error('Error clearing saved data:', e)
    }
  }, [])

  const initializeOnboarding = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = (await api.post('/onboarding/initialize')) as any
      setProgress(res.data?.data)
      return res.data?.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const getProgress = useCallback(async () => {
    try {
      const res = (await api.get('/onboarding/progress')) as any
      setProgress(res.data?.data)
      return res.data?.data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const saveBusinessInfo = useCallback(
    async (data: any) => {
      setLoadingMessage('Saving business information...')
      try {
        saveToLocalStorage('businessInfo', data)
        const res = (await api.post('/onboarding/business-info', data)) as any
        setProgress(res.data?.data)
        return res.data?.data
      } finally {
        setLoadingMessage('')
      }
    },
    [saveToLocalStorage]
  )

  const saveFirstBranch = useCallback(
    async (data: any) => {
      setLoadingMessage('Setting up your first branch...')
      try {
        saveToLocalStorage('branchInfo', data)
        const res = (await api.post('/onboarding/first-branch', data)) as any
        setProgress(res.data?.data)
        return res.data?.data
      } finally {
        setLoadingMessage('')
      }
    },
    [saveToLocalStorage]
  )

  const saveServices = useCallback(
    async (data: any) => {
      setLoadingMessage('Creating your services...')
      try {
        saveToLocalStorage('services', data)
        const res = (await api.post('/onboarding/services', data)) as any
        setProgress(res.data?.data)
        return res.data?.data
      } finally {
        setLoadingMessage('')
      }
    },
    [saveToLocalStorage]
  )

  const saveStaff = useCallback(
    async (data: any) => {
      setLoadingMessage('Saving staff information...')
      try {
        saveToLocalStorage('staff', data)
        const res = (await api.post('/onboarding/staff', data)) as any
        setProgress(res.data?.data)
        return res.data?.data
      } finally {
        setLoadingMessage('')
      }
    },
    [saveToLocalStorage]
  )

  const savePaymentMethods = useCallback(
    async (data: any) => {
      setLoadingMessage('Configuring payment methods...')
      try {
        saveToLocalStorage('paymentMethods', data)
        const res = (await api.post('/onboarding/payment-methods', data)) as any
        setProgress(res.data?.data)
        return res.data?.data
      } finally {
        setLoadingMessage('')
      }
    },
    [saveToLocalStorage]
  )

  const saveTaxSetup = useCallback(
    async (data: any) => {
      setLoadingMessage('Setting up tax configuration...')
      try {
        saveToLocalStorage('taxSetup', data)
        const res = (await api.post('/onboarding/tax-setup', data)) as any
        setProgress(res.data?.data)
        return res.data?.data
      } finally {
        setLoadingMessage('')
      }
    },
    [saveToLocalStorage]
  )

  const completeOnboarding = useCallback(
    async (data: any = {}) => {
      setLoadingMessage('Activating your business...')
      try {
        const res = (await api.post('/onboarding/complete', data)) as any
        setProgress(res.data?.data)
        clearSavedData()
        return res.data?.data
      } finally {
        setLoadingMessage('')
      }
    },
    [clearSavedData]
  )

  const getReview = useCallback(async () => {
    try {
      const res = (await api.get('/onboarding/review')) as any
      return res.data?.data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const getSuggestedActions = useCallback(async () => {
    try {
      const res = (await api.get('/onboarding/suggested-actions')) as any
      return res.data?.data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [])

  const skipStep = useCallback(async (stepNumber: number) => {
    setLoadingMessage('Skipping step...')
    try {
      const res = (await api.post('/onboarding/skip-step', { step: stepNumber })) as any
      setProgress(res.data?.data)
      return res.data?.data
    } finally {
      setLoadingMessage('')
    }
  }, [])

  useEffect(() => {
    loadSavedData()
  }, [loadSavedData])

  return {
    progress,
    loading,
    error,
    loadingMessage,
    savedData,
    currentStep: progress?.current_step || 1,
    totalSteps: progress?.total_steps || 7,
    progressPercentage: progress?.progress_percentage || 0,
    isCompleted: progress?.status === 'completed',
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
    getSuggestedActions,
    skipStep,
  }
}
