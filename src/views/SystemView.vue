<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">
      {{ isRestart ? $t('system.restartTitle') : $t('system.shutdownTitle') }}
    </h2>
    <p class="text-gray-600 mb-6">
      {{ isRestart ? $t('system.restartConfirm') : $t('system.shutdownConfirm') }}
    </p>
    <div class="flex space-x-4">
      <button
        @click="handleAction"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white"
        :class="isRestart ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        {{ isRestart ? $t('system.restart') : $t('system.shutdown') }}
      </button>
      <button
        @click="$router.back()"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {{ $t('common.cancel') }}
      </button>
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
import { systemApi } from '@/api/system'
import Toast from '@/components/Toast.vue'

const route = useRoute()
const isRestart = computed(() => route.path.includes('/restart'))

const loading = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

const handleAction = async () => {
  loading.value = true
  try {
    const res = isRestart.value ? await systemApi.reboot() : await systemApi.shutdown()
    if (res.success) {
      toastType.value = 'success'
      toastMessage.value = isRestart.value ? 'Restarting...' : 'Shutting down...'
    } else {
      toastType.value = 'error'
      toastMessage.value = res.message || 'Action failed'
    }
  } catch (err: any) {
    toastType.value = 'error'
    toastMessage.value = err.message || 'Action failed'
  } finally {
    loading.value = false
    showToast.value = true
  }
}
</script>
