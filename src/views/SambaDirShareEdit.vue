<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('samba.editDirShare') }}</h2>
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

    <div class="mb-4">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
        :class="shareType === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
      >
        {{ shareType }}
      </span>
      <span class="text-sm text-gray-700 font-medium">{{ shareName }}</span>
    </div>

    <div v-if="loading" class="text-center py-8">
      <svg class="animate-spin h-5 w-5 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-gray-600 mt-2 block">{{ $t('common.loading') }}</span>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>

    <div v-else-if="shareInfo" class="border border-gray-200 rounded-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(value, key) in flattenedInfo" :key="key" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium text-gray-900 w-1/3 bg-gray-50">
              {{ formatKey(key) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700 break-all">
              {{ formatValue(value) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      {{ $t('samba.noShareInfo') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { sambaApi } from '@/api/samba'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const shareName = ref(route.params.name as string)
const shareType = ref(route.params.type as string)
const loading = ref(false)
const error = ref('')
const shareInfo = ref<Record<string, any> | null>(null)

const flattenedInfo = computed(() => {
  if (!shareInfo.value) return {}
  const result: Record<string, string> = {}
  const flatten = (obj: any, prefix = '') => {
    if (obj === null || obj === undefined) {
      result[prefix] = '-'
      return
    }
    if (typeof obj !== 'object') {
      result[prefix] = String(obj)
      return
    }
    if (Array.isArray(obj)) {
      result[prefix] = obj.join(', ')
      return
    }
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key
      flatten(value, newKey)
    })
  }
  flatten(shareInfo.value)
  return result
})

const formatKey = (key: string): string => {
  // 优先尝试从 i18n 获取，否则直接返回 key
  const i18nKey = `samba.${key}`
  const translated = t(i18nKey)
  if (translated !== i18nKey) {
    return translated
  }
  return key
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

const fetchShareInfo = async () => {
  if (!shareName.value || !shareType.value) {
    error.value = t('error.unknown')
    return
  }
  loading.value = true
  error.value = ''
  shareInfo.value = null
  try {
    let res
    if (shareType.value === 'public') {
      res = await sambaApi.getPublicShareInfo(shareName.value)
    } else {
      res = await sambaApi.getPrivateShareInfo(shareName.value)
    }
    if (res.success) {
      // 后端直接返回字段在响应体中，过滤掉元数据字段
      const { success: _s, message: _m, error: _e, ...info } = res as any
      shareInfo.value = info
    } else {
      error.value = res.error || t('samba.loadShareInfoFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('error.unknown')
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push('/samba')
}

onMounted(() => {
  fetchShareInfo()
})
</script>
