import { ref, computed } from 'vue'
import { helpContent, videoTutorials, searchHelp, getPageHelp, getVideosByCategory } from '@/utils/helpContent'

export function useHelp() {
  const isHelpOpen = ref(false)
  const currentPage = ref(null)
  const searchQuery = ref('')
  const searchResults = ref([])
  const selectedHelp = ref(null)

  /**
   * Open help for specific page
   */
  const openPageHelp = (pageKey) => {
    currentPage.value = pageKey
    selectedHelp.value = getPageHelp(pageKey)
    isHelpOpen.value = true
  }

  /**
   * Close help
   */
  const closeHelp = () => {
    isHelpOpen.value = false
    currentPage.value = null
    selectedHelp.value = null
    searchQuery.value = ''
    searchResults.value = []
  }

  /**
   * Search help
   */
  const performSearch = () => {
    if (!searchQuery.value) {
      searchResults.value = []
      return
    }

    searchResults.value = searchHelp(searchQuery.value)
  }

  /**
   * Get videos for current page
   */
  const currentVideos = computed(() => {
    if (!currentPage.value) return []
    return getVideosByCategory(currentPage.value)
  })

  /**
   * Rate FAQ as helpful
   */
  const rateFaqHelpful = async (faqId) => {
    try {
      const response = await fetch(`/api/faqs/${faqId}/helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error rating FAQ:', error)
    }
  }

  /**
   * Rate FAQ as not helpful
   */
  const rateFaqNotHelpful = async (faqId) => {
    try {
      const response = await fetch(`/api/faqs/${faqId}/not-helpful`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        return data
      }
    } catch (error) {
      console.error('Error rating FAQ:', error)
    }
  }

  /**
   * Get all help content
   */
  const getAllHelp = () => {
    return Object.entries(helpContent).map(([key, content]) => ({
      key,
      ...content,
    }))
  }

  /**
   * Get all video tutorials
   */
  const getAllVideos = () => {
    return videoTutorials
  }

  /**
   * Open FAQ for editing (admin only)
   */
  const openFaqEditor = (faqId) => {
    // Navigate to FAQ editor
    window.location.href = `/admin/faqs/${faqId}/edit`
  }

  return {
    // State
    isHelpOpen,
    currentPage,
    searchQuery,
    searchResults,
    selectedHelp,

    // Methods
    openPageHelp,
    closeHelp,
    performSearch,
    rateFaqHelpful,
    rateFaqNotHelpful,
    getAllHelp,
    getAllVideos,
    openFaqEditor,

    // Computed
    currentVideos,
  }
}

export default useHelp
