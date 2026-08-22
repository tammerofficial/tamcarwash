<template>
  <div class="help-section">
    <!-- Help Button -->
    <CButton
      color="info"
      variant="outline"
      size="sm"
      @click="openHelp"
      class="help-trigger"
      title="Get help for this page"
    >
      <CIcon icon="cil-question" class="me-2" />
      <span class="d-none d-sm-inline">{{ $t('common.help') }}</span>
    </CButton>

    <!-- Help Sidebar / Modal -->
    <transition name="slide">
      <div v-if="isHelpOpen" class="help-panel">
        <!-- Close Button -->
        <div class="help-header">
          <h5 class="mb-0">{{ currentHelp?.title[locale] }}</h5>
          <CButton
            color="secondary"
            variant="ghost"
            size="sm"
            @click="closeHelp"
            class="p-0"
          >
            <CIcon icon="cil-x" />
          </CButton>
        </div>

        <!-- Description -->
        <div class="help-description">
          {{ currentHelp?.description[locale] }}
        </div>

        <!-- Video (if available) -->
        <div v-if="currentHelp?.videoUrl" class="help-video mb-3">
          <div class="video-container">
            <iframe
              :src="currentHelp.videoUrl"
              width="100%"
              height="250"
              frameborder="0"
              allowfullscreen
            ></iframe>
          </div>
        </div>

        <!-- Tips / Sections -->
        <div v-if="currentHelp?.sections || currentHelp?.tips" class="help-tips">
          <div
            v-for="(tip, index) in currentHelp?.sections || currentHelp?.tips"
            :key="index"
            class="tip-item mb-3"
          >
            <h6 class="tip-title">
              {{ tip.title[locale] }}
            </h6>
            <p class="tip-content mb-0">
              {{ tip.content[locale] }}
            </p>
          </div>
        </div>

        <!-- Learn More Link -->
        <div v-if="currentHelp?.learnMoreUrl" class="help-footer">
          <CButton
            :href="currentHelp.learnMoreUrl"
            target="_blank"
            color="primary"
            size="sm"
            variant="outline"
            class="w-100"
          >
            <CIcon icon="cil-external-link" class="me-2" />
            {{ $t('common.learnMore') }}
          </CButton>
        </div>
      </div>
    </transition>

    <!-- Overlay -->
    <transition name="fade">
      <div v-if="isHelpOpen" class="help-overlay" @click="closeHelp"></div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { getPageHelp } from '@/utils/helpContent'

const props = defineProps({
  pageKey: {
    type: String,
    required: true,
  },
})

const { locale } = useI18n()
const isHelpOpen = ref(false)

const currentHelp = computed(() => {
  return getPageHelp(props.pageKey)
})

const openHelp = () => {
  isHelpOpen.value = true
}

const closeHelp = () => {
  isHelpOpen.value = false
}
</script>

<style scoped lang="scss">
.help-section {
  position: relative;
}

.help-trigger {
  &:hover {
    transform: scale(1.05);
    transition: transform 0.2s ease;
  }
}

.help-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  max-width: 400px;
  height: 100vh;
  background: var(--bs-white);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  z-index: 1050;
  padding: var(--spacing-lg);

  @media (max-width: 576px) {
    max-width: 100%;
  }
}

.help-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--bs-border-color);

  h5 {
    color: var(--text-primary);
    font-weight: 600;
  }
}

.help-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  line-height: 1.6;
}

.help-video {
  .video-container {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-md);
    background: var(--bs-gray-200);

    iframe {
      display: block;
    }
  }
}

.help-tips {
  margin: var(--spacing-lg) 0;

  .tip-item {
    padding: var(--spacing-md);
    background: var(--bs-gray-100);
    border-left: 3px solid var(--primary);
    border-radius: var(--radius-sm);

    .tip-title {
      color: var(--primary);
      font-weight: 600;
      margin-bottom: var(--spacing-sm);
    }

    .tip-content {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }
  }
}

.help-footer {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--bs-border-color);
}

.help-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

/* Animations */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from {
  transform: translateX(100%);
}

.slide-leave-to {
  transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
