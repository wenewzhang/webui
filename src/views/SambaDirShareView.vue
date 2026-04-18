<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('samba.createDirShare') }}</h2>
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

    <div v-else class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.selectDataset') }}
        </label>
        <select
          v-model="selectedDataset"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">{{ $t('samba.selectDatasetPlaceholder') }}</option>
          <option v-for="ds in datasets" :key="ds.name" :value="ds.name">{{ ds.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.shareName') }}
        </label>
        <input
          v-model="shareName"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          :placeholder="$t('samba.shareNamePlaceholder')"
        />
      </div>

      <div class="flex justify-end space-x-3">
        <button
          @click="goBack"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="handleCreate"
          :disabled="saving || !selectedDataset"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="saving" class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? $t('common.creating') : $t('common.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { sambaApi } from '@/api/samba'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const datasets = ref<{ name: string; mountpoint: string }[]>([])
const saving = ref(false)

const selectedDataset = ref('')
const shareName = ref('')

const fetchDatasets = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await sambaApi.listSambaDatasets()
    if (res.success) {
      datasets.value = res.data || []
    } else {
      error.value = res.error || t('samba.loadDatasetsFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('error.unknown')
  } finally {
    loading.value = false
  }
}

const handleCreate = async () => {
  if (!selectedDataset.value) return
  saving.value = true
  error.value = ''
  try {
    // TODO: implement createDirShare API when available
    // For now, just go back after a short delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push('/samba')
  } catch (err: any) {
    error.value = err.message || t('error.unknown')
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/samba')
}

onMounted(() => {
  fetchDatasets()
})
</script>
