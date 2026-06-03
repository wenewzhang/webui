<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900">{{ $t('systemUpdaterMirror.title') }}</h2>
      <button
        @click="goBack"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ $t('common.back') }}
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="ml-3 text-gray-600">{{ $t('systemUpdaterMirror.loading') }}</span>
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
          <p class="text-lg font-semibold text-red-700">{{ $t('systemUpdaterMirror.loadFailed') }}</p>
          <p class="text-sm text-red-600 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- 镜像信息 -->
    <div v-else class="bg-white shadow rounded-lg p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">{{ $t('systemUpdaterMirror.updateUrl') }}</p>
          <p class="text-lg font-mono font-medium text-gray-900 break-all">{{ mirrorInfo?.UPDATE_URL || '-' }}</p>
        </div>
        <div class="bg-indigo-50 rounded-lg p-4">
          <p class="text-sm text-indigo-600">{{ $t('systemUpdaterMirror.channel') }}</p>
          <p class="text-lg font-mono font-medium text-indigo-900">{{ mirrorInfo?.CHANNEL || '-' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { systemApi, type SystemUpgradeMirrorResponse } from '@/api/system'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const mirrorInfo = ref<SystemUpgradeMirrorResponse | null>(null)

const goBack = () => {
  router.back()
}

const fetchMirror = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await systemApi.getSystemUpgradeMirror()
    if (res.success) {
      mirrorInfo.value = res
    } else {
      error.value = res.error || res.message || t('systemUpdaterMirror.loadFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    error.value = msg || t('systemUpdaterMirror.loadFailed')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMirror()
})
</script>
