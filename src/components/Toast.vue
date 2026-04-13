<template>
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="show" class="toast-overlay">
        <div class="toast-content" :class="{ 'toast-error': type === 'error', 'toast-success': type === 'success' }">
          <svg v-if="type === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span class="toast-message" style="white-space: pre-line">{{ message }}</span>
          <button class="toast-close-btn" @click="hideToast">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch } from 'vue'

interface Props {
  show: boolean
  message: string
  type?: 'success' | 'error'
  duration?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'success',
  duration: 6000
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'hide'): void
}>()

let toastTimer: ReturnType<typeof setTimeout> | null = null

const hideToast = () => {
  emit('update:show', false)
  emit('hide')
  if (toastTimer) {
    clearTimeout(toastTimer)
    toastTimer = null
  }
}

// 监听 show 变化，自动隐藏
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 清除之前的定时器
    if (toastTimer) {
      clearTimeout(toastTimer)
    }
    // 自动隐藏
    toastTimer = setTimeout(() => {
      hideToast()
    }, props.duration)
  }
})
</script>

<style scoped>
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 80px;
  z-index: 9999;
  pointer-events: none;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
  min-width: 300px;
  max-width: 600px;
  background-color: #10b981;
  color: white;
}

.toast-error {
  background-color: #ef4444;
}

.toast-success {
  background-color: #10b981;
}

.toast-message {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
}

.toast-close-btn {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.toast-close-btn:hover {
  opacity: 1;
}

/* Toast 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
