<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900">{{ $t('systemUpdater.title') }}</h2>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="ml-3 text-gray-600">{{ $t('systemUpdater.checking') }}</span>
    </div>

    <!-- 检查结果 -->
    <div v-else-if="result" class="bg-white shadow rounded-lg p-6">
      <!-- 有可用更新 -->
      <div v-if="result.update_available" class="space-y-4">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold text-green-700">{{ $t('systemUpdater.updateAvailable') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500">{{ $t('systemUpdater.currentVersion') }}</p>
            <p class="text-lg font-mono font-medium text-gray-900">{{ result.current_version }}</p>
          </div>
          <div class="bg-indigo-50 rounded-lg p-4">
            <p class="text-sm text-indigo-600">{{ $t('systemUpdater.latestVersion') }}</p>
            <p class="text-lg font-mono font-medium text-indigo-900">{{ result.latest_version }}</p>
          </div>
        </div>
      </div>

      <!-- 无可用更新 -->
      <div v-else class="space-y-4">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold text-blue-700">{{ $t('systemUpdater.noUpdate') }}</p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mt-4">
          <p class="text-sm text-gray-500">{{ $t('systemUpdater.currentVersion') }}</p>
          <p class="text-lg font-mono font-medium text-gray-900">{{ result.current_version }}</p>
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center space-x-3">
        <div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-semibold text-red-700">{{ $t('systemUpdater.checkFailed') }}</p>
          <p class="text-sm text-red-600 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- 刷新按钮 -->
    <div class="flex justify-end">
      <button
        @click="checkUpdate"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { systemApi, type UpdateCheckResponse, type UpdateStatusResponse } from '@/api/system'

const { t } = useI18n()

const loading = ref(false)
const result = ref<UpdateCheckResponse | null>(null)
const error = ref<string | null>(null)

const checkUpdate = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await systemApi.updateCheck()
    if (res.success) {
      result.value = res
    } else {
      error.value = res.error || t('error.unknown')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    error.value = msg || t('error.unknown')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const statusRes: UpdateStatusResponse = await systemApi.updateStatus()
    if (statusRes.success && statusRes.status === 'idle') {
      checkUpdate()
    }
  } catch (err: any) {
    // 静默失败，不自动触发检查
  }
})
</script>
