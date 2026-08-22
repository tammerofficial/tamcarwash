<template>
  <div class="help-center-page">
    <!-- Header -->
    <div class="page-header">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="page-title">
              <CIcon icon="cil-question-circle" class="me-3" />
              {{ $t('support.helpCenter') }}
            </h1>
            <p class="page-subtitle">
              {{ $t('support.helpCenterDesc') }}
            </p>
          </div>
          <div class="col-md-4">
            <img
              src="@/assets/illustrations/help.svg"
              alt="Help"
              class="img-fluid"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="search-section">
      <div class="container">
        <div class="search-container">
          <div class="input-group">
            <span class="input-group-text">
              <CIcon icon="cil-search" />
            </span>
            <input
              v-model="searchQuery"
              @input="performSearch"
              type="text"
              class="form-control"
              :placeholder="$t('support.searchFaq')"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container mt-5">
      <div class="row">
        <!-- Categories Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="categories-card">
            <h5 class="card-title">
              <CIcon icon="cil-folder" class="me-2" />
              {{ $t('support.categories') }}
            </h5>
            <div class="category-list">
              <div
                v-for="(label, key) in categories"
                :key="key"
                @click="selectCategory(key)"
                :class="[
                  'category-item',
                  { active: selectedCategory === key },
                ]"
              >
                <span>{{ label }}</span>
                <span class="badge">{{ getCategoryCount(key) }}</span>
              </div>
            </div>
          </div>

          <!-- Video Tutorials Card -->
          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">
                <CIcon icon="cil-video" class="me-2" />
                {{ $t('support.videoTutorials') }}
              </h5>
              <p class="card-text text-secondary small">
                {{ $t('support.learnFromVideos') }}
              </p>
              <CButton
                href="/support/videos"
                color="primary"
                size="sm"
                class="w-100"
              >
                <CIcon icon="cil-play" class="me-2" />
                {{ $t('support.viewVideos') }}
              </CButton>
            </div>
          </div>

          <!-- Contact Support Card -->
          <div class="card mt-4">
            <div class="card-body">
              <h5 class="card-title">
                <CIcon icon="cil-chat-bubble" class="me-2" />
                {{ $t('support.contactSupport') }}
              </h5>
              <p class="card-text text-secondary small">
                {{ $t('support.cantFindAnswer') }}
              </p>
              <CButton
                href="/support/contact"
                color="info"
                size="sm"
                class="w-100"
              >
                <CIcon icon="cil-send" class="me-2" />
                {{ $t('support.createTicket') }}
              </CButton>
            </div>
          </div>
        </div>

        <!-- FAQ List -->
        <div class="col-lg-9">
          <!-- Search Results Info -->
          <div v-if="searchQuery" class="alert alert-info mb-4">
            <strong>{{ searchResults.length }}</strong>
            {{ $t('support.resultsFound') }}
            <span v-if="searchResults.length === 0">
              - {{ $t('support.noResults') }}
            </span>
          </div>

          <!-- FAQs Accordion -->
          <div class="faq-container">
            <div v-if="displayedFaqs.length === 0" class="text-center py-5">
              <CIcon
                icon="cil-info"
                size="3xl"
                class="mb-3 text-secondary"
              />
              <p class="text-secondary">
                {{ $t('support.noFaqsInCategory') }}
              </p>
            </div>

            <div
              v-for="(faq, index) in displayedFaqs"
              :key="faq.id"
              class="faq-item mb-3"
            >
              <div
                @click="expandFaq(faq.id)"
                :class="[
                  'faq-question',
                  { expanded: expandedFaq === faq.id },
                ]"
              >
                <div class="faq-question-content">
                  <CIcon
                    :icon="expandedFaq === faq.id ? 'cil-chevron-bottom' : 'cil-chevron-right'"
                    class="me-3"
                  />
                  <span>{{ faq.question }}</span>
                </div>
                <span class="faq-number">{{ index + 1 }}</span>
              </div>

              <transition name="expand">
                <div v-if="expandedFaq === faq.id" class="faq-answer">
                  <div class="faq-answer-content">
                    {{ faq.answer }}
                  </div>

                  <!-- Helpful Rating -->
                  <div class="faq-rating">
                    <span class="rating-label">
                      {{ $t('support.wasHelpful') }}
                    </span>
                    <div class="rating-buttons">
                      <CButton
                        size="sm"
                        variant="ghost"
                        @click="markHelpful(faq.id)"
                        class="btn-helpful"
                      >
                        <CIcon icon="cil-thumb-up" class="me-1" />
                        {{ $t('common.yes') }}
                      </CButton>
                      <CButton
                        size="sm"
                        variant="ghost"
                        @click="markNotHelpful(faq.id)"
                        class="btn-not-helpful"
                      >
                        <CIcon icon="cil-thumb-down" class="me-1" />
                        {{ $t('common.no') }}
                      </CButton>
                    </div>
                  </div>
                </div>
              </transition>
            </div>
          </div>

          <!-- Pagination -->
          <nav
            v-if="totalPages > 1"
            aria-label="FAQ Pagination"
            class="mt-5"
          >
            <ul class="pagination justify-content-center">
              <li :class="['page-item', { disabled: currentPage === 1 }]">
                <CButton
                  @click="goToPage(currentPage - 1)"
                  :disabled="currentPage === 1"
                >
                  {{ $t('common.previous') }}
                </CButton>
              </li>

              <li
                v-for="page in pageNumbers"
                :key="page"
                :class="['page-item', { active: currentPage === page }]"
              >
                <CButton @click="goToPage(page)">
                  {{ page }}
                </CButton>
              </li>

              <li :class="['page-item', { disabled: currentPage === totalPages }]">
                <CButton
                  @click="goToPage(currentPage + 1)"
                  :disabled="currentPage === totalPages"
                >
                  {{ $t('common.next') }}
                </CButton>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import api from '@/core/api'
import { Faq } from '@/modules/Support/Models'

const { t } = useI18n()
const router = useRouter()

// State
const faqs = ref([])
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref(null)
const expandedFaq = ref(null)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const categories = ref({})
const searchResults = ref([])

// Fetch FAQs
const fetchFaqs = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      per_page: pageSize.value,
    }

    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    const response = await api.get('/faqs', { params })
    faqs.value = response.data.data
    total.value = response.data.total
  } catch (error) {
    console.error('Error fetching FAQs:', error)
  } finally {
    loading.value = false
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await api.get('/faqs/meta/categories')
    categories.value = response.data.data
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Perform search
const performSearch = () => {
  currentPage.value = 1
  fetchFaqs()
}

// Select category
const selectCategory = (category) => {
  selectedCategory.value = selectedCategory.value === category ? null : category
  currentPage.value = 1
  fetchFaqs()
}

// Expand FAQ
const expandFaq = (faqId) => {
  expandedFaq.value = expandedFaq.value === faqId ? null : faqId
}

// Mark as helpful
const markHelpful = async (faqId) => {
  try {
    await api.post(`/faqs/${faqId}/helpful`)
    // Refresh FAQs
    fetchFaqs()
  } catch (error) {
    console.error('Error marking FAQ helpful:', error)
  }
}

// Mark as not helpful
const markNotHelpful = async (faqId) => {
  try {
    await api.post(`/faqs/${faqId}/not-helpful`)
    // Refresh FAQs
    fetchFaqs()
  } catch (error) {
    console.error('Error marking FAQ not helpful:', error)
  }
}

// Get category count
const getCategoryCount = (category) => {
  return faqs.value.filter(faq => faq.category === category).length
}

// Go to page
const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    fetchFaqs()
  }
}

// Computed properties
const displayedFaqs = computed(() => {
  if (searchQuery.value) {
    return searchResults.value
  }
  return faqs.value
})

const totalPages = computed(() => {
  return Math.ceil(total.value / pageSize.value)
})

const pageNumbers = computed(() => {
  const pages = []
  const maxPages = 5
  let startPage = Math.max(1, currentPage.value - Math.floor(maxPages / 2))
  let endPage = Math.min(totalPages.value, startPage + maxPages - 1)

  if (endPage - startPage < maxPages - 1) {
    startPage = Math.max(1, endPage - maxPages + 1)
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i)
  }

  return pages
})

// Lifecycle
onMounted(() => {
  fetchFaqs()
  fetchCategories()
})
</script>

<style scoped lang="scss">
.help-center-page {
  background: var(--bs-light);
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  color: var(--bs-white);
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xxl);

  .page-title {
    font-size: 2.5rem;
    font-weight: 700;
    display: flex;
    align-items: center;
  }

  .page-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-top: var(--spacing-md);
  }
}

.search-section {
  background: var(--bs-white);
  padding: var(--spacing-lg) 0;
  margin-bottom: var(--spacing-xl);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .search-container {
    max-width: 600px;
    margin: 0 auto;

    .input-group {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border-radius: var(--radius-lg);
      overflow: hidden;

      input {
        border: none;
        padding: var(--spacing-md) var(--spacing-lg);
        font-size: 1.1rem;

        &:focus {
          box-shadow: none;
          outline: none;
        }
      }
    }
  }
}

.categories-card {
  background: var(--bs-white);
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  .card-title {
    color: var(--text-primary);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
  }
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);

  .category-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-md);
    background: var(--bs-gray-100);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: var(--bs-gray-200);
      transform: translateX(4px);
    }

    &.active {
      background: var(--primary);
      color: var(--bs-white);

      .badge {
        background: rgba(255, 255, 255, 0.2);
        color: var(--bs-white);
      }
    }

    .badge {
      background: var(--bs-gray-300);
      color: var(--text-primary);
      font-size: 0.85rem;
    }
  }
}

.faq-container {
  background: var(--bs-white);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.faq-item {
  border-bottom: 1px solid var(--bs-border-color);

  &:last-child {
    border-bottom: none;
  }
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--bs-gray-50);
  }

  &.expanded {
    background: var(--bs-primary-light);
    border-bottom: 2px solid var(--primary);
  }

  .faq-question-content {
    display: flex;
    align-items: center;
    flex: 1;
    color: var(--text-primary);
    font-weight: 500;
    font-size: 1.05rem;
  }

  .faq-number {
    background: var(--bs-gray-200);
    color: var(--text-secondary);
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85rem;
  }
}

.faq-answer {
  padding: var(--spacing-lg);
  background: var(--bs-gray-50);
  border-top: 2px solid var(--bs-border-color);

  .faq-answer-content {
    color: var(--text-secondary);
    line-height: 1.8;
    margin-bottom: var(--spacing-lg);
  }
}

.faq-rating {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bs-white);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--primary);

  .rating-label {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .rating-buttons {
    display: flex;
    gap: var(--spacing-sm);

    .btn-helpful,
    .btn-not-helpful {
      font-size: 0.85rem;

      &:hover {
        color: var(--primary);
      }
    }
  }
}

// Animations
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
}

.expand-enter-from {
  opacity: 0;
  max-height: 0;
}

.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

// Responsive
@media (max-width: 768px) {
  .page-header {
    .page-title {
      font-size: 1.8rem;
    }
  }

  .faq-question {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .faq-rating {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
