<template>
  <div class="bg-white shadow rounded-lg p-6">
    <!-- Toast -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @update:show="toast.show = $event"
    />

    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('route.systemLogger') }}</h2>
    </div>

    <!-- Log Type Buttons -->
    <div class="flex items-center gap-3 mb-4">
      <button
        v-for="type in logTypes"
        :key="type.key"
        @click="switchLogType(type.key)"
        :disabled="loading"
        :class="[
          'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          activeType === type.key
            ? 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
            : 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
        ]"
      >
        <svg
          v-if="loading && activeType === type.key"
          class="animate-spin -ml-1 mr-2 h-4 w-4"
          :class="activeType === type.key ? 'text-white' : 'text-gray-700'"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ type.label }}
      </button>
    </div>

    <!-- Controls -->
    <div v-if="activeType" class="flex flex-wrap items-center gap-4 mb-4">
      <div class="flex items-center gap-2">
        <label class="text-sm text-gray-700">{{ $t('systemLogger.pageSize') }}:</label>
        <select
          v-model="pageSize"
          @change="onPageSizeChange"
          class="block w-24 pl-3 pr-8 py-1.5 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md shadow-sm border"
        >
          <option :value="50">50</option>
          <option :value="100">100</option>
          <option :value="200">200</option>
        </select>
      </div>

      <div v-if="totalLines > 0" class="text-sm text-gray-500">
        {{ $t('systemLogger.totalLines') }}: {{ totalLines }}
      </div>
    </div>

    <!-- Logs -->
    <div v-if="loading && logs.length === 0" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <div v-else-if="!activeType" class="text-center py-8 text-gray-500">
      {{ $t('systemLogger.noLogs') }}
    </div>

    <div v-else-if="logs.length === 0" class="text-center py-8 text-gray-500">
      {{ $t('systemLogger.noLogs') }}
    </div>

    <div v-else class="overflow-hidden rounded-md border border-gray-200">
      <div class="bg-gray-900 p-4 overflow-x-auto max-h-[600px] overflow-y-auto">
        <pre class="text-xs text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-all">{{ logs.join('\n') }}</pre>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4">
      <div class="flex items-center gap-2">
        <button
          @click="firstPage"
          :disabled="page <= 1 || loading"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
            <polyline points="11 17 6 12 11 7"/>
            <polyline points="18 17 13 12 18 7"/>
          </svg>
          {{ $t('common.first') }}
        </button>
        <button
          @click="prevPage"
          :disabled="page <= 1 || loading"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {{ $t('common.previous') }}
        </button>
      </div>

      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-700">
          {{ $t('systemLogger.pageInfo', { page, totalPages }) }}
        </span>
        <div class="flex items-center gap-1">
          <input
            v-model.number="jumpPage"
            type="number"
            min="1"
            :max="totalPages"
            class="w-16 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            @keyup.enter="goToPage"
          />
          <button
            @click="goToPage"
            :disabled="loading"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.go') }}
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="nextPage"
          :disabled="page >= totalPages || loading"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ $t('common.next') }}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
        <button
          @click="lastPage"
          :disabled="page >= totalPages || loading"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ $t('common.last') }}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-1">
            <polyline points="13 17 18 12 13 7"/>
            <polyline points="6 17 11 12 6 7"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { systemApi } from '@/api/system'
import Toast from '@/components/Toast.vue'
import { permissionDeniedMessage } from '@/utils/permissionUtils'

const { t } = useI18n()

const logs = ref<string[]>([])
const loading = ref(false)
const activeType = ref('')
const page = ref(1)
const pageSize = ref(100)
const totalLines = ref(0)
const totalPages = ref(0)
const jumpPage = ref(1)

const logTypes = computed(() => [
  { key: 'zuti', label: t('systemLogger.zuti') },
  { key: 'zuti-helper', label: t('systemLogger.zutiHelper') },
  { key: 'zuti-updater', label: t('systemLogger.zutiUpdater') },
])

const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  toast.message = message || t('error.unknown')
  toast.type = type
  toast.show = true
}

const fetchLog = async (type: string) => {
  loading.value = true
  try {
    const params = { page: page.value, page_size: pageSize.value }
    let res
    switch (type) {
      case 'zuti':
        res = await systemApi.getZutiLog(params)
        break
      case 'zuti-helper':
        res = await systemApi.getZutiHelperLog(params)
        break
      case 'zuti-updater':
        res = await systemApi.getZutiUpdaterLog(params)
        break
      default:
        return
    }
    if (res.success) {
      logs.value = res.logs || []
      totalLines.value = res.total_lines || 0
      page.value = res.page || 1
      pageSize.value = res.page_size || 100
      totalPages.value = res.total_pages || 1
      jumpPage.value = page.value
    } else {
      showToast(res.message || t('systemLogger.fetchFailed'))
      logs.value = []
      totalLines.value = 0
      totalPages.value = 0
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('systemLogger.fetchFailed'))
    logs.value = []
    totalLines.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

const switchLogType = (type: string) => {
  if (activeType.value === type) return
  activeType.value = type
  page.value = 1
  pageSize.value = 100
  totalLines.value = 0
  totalPages.value = 0
  logs.value = []
  fetchLog(type)
}

const onPageSizeChange = () => {
  page.value = 1
  if (activeType.value) {
    fetchLog(activeType.value)
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    fetchLog(activeType.value)
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    fetchLog(activeType.value)
  }
}

const firstPage = () => {
  if (page.value > 1) {
    page.value = 1
    fetchLog(activeType.value)
  }
}

const lastPage = () => {
  if (page.value < totalPages.value) {
    page.value = totalPages.value
    fetchLog(activeType.value)
  }
}

const goToPage = () => {
  let target = Math.floor(Number(jumpPage.value))
  if (isNaN(target) || target < 1) target = 1
  if (target > totalPages.value) target = totalPages.value
  if (target !== page.value) {
    page.value = target
    fetchLog(activeType.value)
  }
  jumpPage.value = target
}
</script>
