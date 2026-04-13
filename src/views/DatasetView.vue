<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('nav.storageDataset') }}</h2>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="text-gray-600">
      {{ $t('common.loading') }}
    </div>
    
    <!-- 错误提示 -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">{{ $t('common.error') }}</h3>
          <div class="mt-2 text-sm text-red-700">{{ error }}</div>
        </div>
      </div>
    </div>
    
    <!-- 数据集列表 -->
    <div v-else>
      <div v-if="datasets.length === 0" class="text-gray-500 text-center py-8">
        {{ $t('dataset.noDatasets') }}
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('dataset.name') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('dataset.used') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('dataset.available') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('dataset.referenced') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('dataset.mountpoint') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ $t('common.operation') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="dataset in datasets" :key="dataset.name" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ dataset.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ dataset.used }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ dataset.avail }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ dataset.refer }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ dataset.mountpoint || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-2">
                  <button
                    @click="handleDelete(dataset)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {{ $t('dataset.delete') }}
                  </button>
                  <button
                    @click="handleClone(dataset)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {{ $t('dataset.clone') }}
                  </button>
                  <button
                    @click="handlePromote(dataset)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {{ $t('dataset.promote') }}
                  </button>
                  <button
                    @click="handleStart(dataset)"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {{ $t('dataset.start') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { datasetApi } from '@/api/dataset'
import type { Dataset } from '@/api/dataset'

const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const datasets = ref<Dataset[]>([])

const fetchDatasets = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await datasetApi.getDatasets()
    if (res.success) {
      datasets.value = res.data
    } else {
      error.value = res.error || 'Failed to fetch datasets'
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to fetch datasets'
  } finally {
    loading.value = false
  }
}

const handleDelete = async (dataset: Dataset) => {
  const confirmed = window.confirm(t('dataset.deleteConfirm', { name: dataset.name }))
  if (!confirmed) return
  
  try {
    const res = await datasetApi.deleteDataset(dataset.name)
    if (res.success) {
      alert(t('dataset.deleteSuccess', { name: dataset.name }))
      await fetchDatasets()
    } else {
      alert(t('dataset.deleteFailed') + ': ' + (res.error || ''))
    }
  } catch (err: any) {
    alert(t('dataset.deleteFailed') + ': ' + (err.response?.data?.error || err.message))
  }
}

const handleClone = (dataset: Dataset) => {
  console.log('Clone dataset:', dataset.name)
  // TODO: Implement clone functionality
}

const handlePromote = (dataset: Dataset) => {
  console.log('Promote dataset:', dataset.name)
  // TODO: Implement promote functionality
}

const handleStart = (dataset: Dataset) => {
  console.log('Start dataset:', dataset.name)
  // TODO: Implement start functionality
}

onMounted(fetchDatasets)
</script>
