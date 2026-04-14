<template>
  <div class="fixed inset-0 z-50 bg-black/60 flex items-center justify-center">
    <div class="bg-gray-900 border border-gray-700 shadow-2xl rounded-xl p-10 max-w-md w-full text-center">
      <div
        class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
        :class="iconClass"
      >
        <svg v-if="isRestart" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <svg v-else-if="isForceRestart" xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-white mb-3">
        {{ $t(pageTitle) }}
      </h2>
      <p class="text-gray-400 mb-6">
        {{ $t(pageConfirm) }}
      </p>

      <label class="flex items-center justify-center space-x-2 mb-8 cursor-pointer select-none">
        <input
          v-model="confirmed"
          type="checkbox"
          class="h-4 w-4 rounded border-gray-600 bg-gray-800 text-indigo-600 focus:ring-indigo-500"
        />
        <span class="text-sm text-gray-300">{{ $t('system.confirmLabel') }}</span>
      </label>

      <div class="flex justify-center space-x-4">
        <button
          @click="handleAction"
          :disabled="loading || !confirmed"
          class="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
          :class="buttonClass"
        >
          <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ $t(buttonText) }}
        </button>
        <button
          @click="$router.back()"
          class="inline-flex items-center px-5 py-2.5 border border-gray-600 text-sm font-medium rounded-md text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition"
        >
          {{ $t('common.cancel') }}
        </button>
      </div>
    </div>

    <Toast
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
      @hide="showToast = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { systemApi } from '@/api/system'
import Toast from '@/components/Toast.vue'

const route = useRoute()
const { t } = useI18n()
const isRestart = computed(() => route.path.includes('/restart') && !route.path.includes('/reboot_force'))
const isForceRestart = computed(() => route.path.includes('/reboot_force'))

const iconClass = computed(() => {
  if (isForceRestart.value) return 'bg-red-900/50 text-red-400'
  if (isRestart.value) return 'bg-orange-900/50 text-orange-400'
  return 'bg-red-900/50 text-red-400'
})

const pageTitle = computed(() => {
  if (isForceRestart.value) return 'system.restartForceTitle'
  if (isRestart.value) return 'system.restartTitle'
  return 'system.shutdownTitle'
})

const pageConfirm = computed(() => {
  if (isForceRestart.value) return 'system.restartForceConfirm'
  if (isRestart.value) return 'system.restartConfirm'
  return 'system.shutdownConfirm'
})

const buttonClass = computed(() => {
  if (isForceRestart.value) return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
  if (isRestart.value) return 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500'
  return 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
})

const buttonText = computed(() => {
  if (isForceRestart.value) return 'system.restart'
  if (isRestart.value) return 'system.restart'
  return 'system.shutdown'
})

const confirmed = ref(false)
const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const handleAction = async () => {
  loading.value = true
  try {
    let res
    if (isForceRestart.value) {
      res = await systemApi.reboot_force()
    } else if (isRestart.value) {
      res = await systemApi.reboot()
    } else {
      res = await systemApi.shutdown()
    }
    if (res.success) {
      toastType.value = 'success'
      toastMessage.value = isForceRestart.value ? t('system.forceRestarting') : isRestart.value ? t('system.restarting') : t('system.shuttingDown')
    } else {
      toastType.value = 'error'
      toastMessage.value = res.message?.toLowerCase().includes('permission denied')
        ? t('system.permissionDenied')
        : (res.message || t('error.unknown'))
    }
  } catch (err: any) {
    toastType.value = 'error'
    const msg = err.response?.data?.message || err.message || ''
    toastMessage.value = msg.toLowerCase().includes('permission denied')
      ? t('system.permissionDenied')
      : (msg || t('error.unknown'))
  } finally {
    loading.value = false
    showToast.value = true
  }
}
</script>
