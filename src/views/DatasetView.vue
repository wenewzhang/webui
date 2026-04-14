<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('nav.storageDataset') }}</h2>
      <button
        @click="fetchDatasets"
        :disabled="loading"
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :class="{ 'animate-spin': loading }"
          class="mr-1.5"
        >
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>
    
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
                    :disabled="!dataset.name.includes('/') || dataset.name.includes('@')"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ $t('dataset.clone') }}
                  </button>
                  <button
                    @click="handleCreate(dataset)"
                    :disabled="dataset.name.includes('@')"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-orange-700 bg-orange-100 hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ $t('dataset.create') }}
                  </button>
                  <button
                    @click="handlePromote(dataset)"
                    :disabled="!dataset.name.includes('/') || dataset.name.includes('@')"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ $t('dataset.promote') }}
                  </button>
                  <button
                    @click="handleStart(dataset)"
                    :disabled="!dataset.name.includes('/') || dataset.name.includes('@') || !dataset.name.startsWith('one-pool')"
                    class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg v-if="dataset.name === bootfsDataset" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {{ $t('dataset.start') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 删除确认 Modal -->
    <ConfirmModal
      v-if="selectedDataset"
      :show="showDeleteModal"
      :title="isPool(selectedDataset.name) ? $t('dataset.deletePoolConfirmTitle') : $t('dataset.deleteConfirmTitle')"
      :message="$t(isPool(selectedDataset.name) ? 'dataset.deletePoolConfirm' : 'dataset.deleteConfirm', { name: selectedDataset.name })"
      :confirm-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- Toast 提示框 -->
    <Toast
      v-model:show="showToast"
      :message="toastMessage"
      :type="toastType"
      @hide="onToastHide"
    />

    <!-- 克隆输入 Modal -->
    <InputModal
      v-if="cloneTargetDataset"
      :show="showCloneModal"
      :title="$t('dataset.cloneConfirmTitle')"
      :message="$t('dataset.cloneConfirmMessage', { name: cloneTargetDataset.name })"
      :placeholder="$t('dataset.clonePlaceholder')"
      :confirm-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @confirm="confirmClone"
      @cancel="cancelClone"
    />

    <!-- 提升确认 Modal -->
    <ConfirmModal
      v-if="promoteTargetDataset"
      :show="showPromoteModal"
      :title="$t('dataset.promoteConfirmTitle')"
      :message="$t('dataset.promoteConfirmMessage', { name: promoteTargetDataset.name })"
      :confirm-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @confirm="confirmPromote"
      @cancel="cancelPromote"
    />

    <!-- 创建 Dataset Modal -->
    <InputModal
      v-if="createTargetDataset"
      :show="showCreateModal"
      :title="$t('dataset.createConfirmTitle')"
      :message="$t('dataset.createConfirmMessage', { name: createTargetDataset.name })"
      :placeholder="$t('dataset.createPlaceholder')"
      :confirm-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @confirm="confirmCreate"
      @cancel="cancelCreate"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { datasetApi } from '@/api/dataset'
import { storageApi } from '@/api/storage'
import type { Dataset } from '@/api/dataset'
import ConfirmModal from '@/components/ConfirmModal.vue'
import Toast from '@/components/Toast.vue'
import InputModal from '@/components/InputModal.vue'

const { t } = useI18n()

const loading = ref(true)
const error = ref<string | null>(null)
const datasets = ref<Dataset[]>([])
const showDeleteModal = ref(false)
const selectedDataset = ref<Dataset | null>(null)

// 克隆相关状态
const showCloneModal = ref(false)
const cloneTargetDataset = ref<Dataset | null>(null)

// 创建相关状态
const showCreateModal = ref(false)
const createTargetDataset = ref<Dataset | null>(null)

// 提升相关状态
const showPromoteModal = ref(false)
const promoteTargetDataset = ref<Dataset | null>(null)

// Bootfs 相关状态
const bootfsDataset = ref<string>('')

// Toast 相关状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

// 显示 Toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
}

// Toast 隐藏回调
const onToastHide = () => {
  toastMessage.value = ''
}

const fetchDatasets = async () => {
  loading.value = true
  error.value = null
  try {
    const [datasetsRes, bootfsRes] = await Promise.all([
      datasetApi.getDatasets(),
      datasetApi.getBootfs()
    ])
    if (datasetsRes.success) {
      datasets.value = datasetsRes.data
    } else {
      error.value = datasetsRes.error || 'Failed to fetch datasets'
    }
    if (bootfsRes.success) {
      bootfsDataset.value = bootfsRes.data?.bootfs
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || 'Failed to fetch datasets'
  } finally {
    loading.value = false
  }
}

const handleDelete = (dataset: Dataset) => {
  selectedDataset.value = dataset
  showDeleteModal.value = true
}

const mapDeleteError = (apiError: string | null | undefined): string => {
  if (!apiError) return t('dataset.deleteFailed')
  const lower = apiError.toLowerCase()
  if (lower.includes('snapshot has dependent clones') || lower.includes("use '-R' to destroy")) {
    // 提取快照名称和依赖的数据集
    const snapshotMatch = apiError.match(/cannot destroy '(.+?)':/)
    const dependentMatch = apiError.match(/destroy the following datasets:\n(.+)/s)
    
    const snapshotName = snapshotMatch ? snapshotMatch[1] : ''
    const dependentDatasets = dependentMatch ? dependentMatch[1].trim() : ''
    
    return t('dataset.deleteErrorDependentClones', { 
      snapshot: snapshotName,
      datasets: dependentDatasets 
    })
  }
  return apiError
}

const isPool = (name: string): boolean => {
  return !name.includes('/') && !name.includes('@')
}

const confirmDelete = async () => {
  if (!selectedDataset.value) return
  
  showDeleteModal.value = false
  
  const name = selectedDataset.value.name
  
  try {
    let res
    if (isPool(name)) {
      // 是 pool，调用 destroy_pool
      res = await storageApi.destroyPool(name)
    } else {
      // 是 dataset，调用 destroy
      res = await datasetApi.deleteDataset(name)
    }
    
    if (res.success) {
      showToastMessage(t('dataset.deleteSuccess', { name }), 'success')
      await fetchDatasets()
    } else {
      showToastMessage(mapDeleteError(res.error), 'error')
    }
  } catch (err: any) {
    showToastMessage(mapDeleteError(err.response?.data?.error), 'error')
  } finally {
    selectedDataset.value = null
  }
}

const cancelDelete = () => {
  showDeleteModal.value = false
  selectedDataset.value = null
}

const mapCloneError = (apiError: string | null | undefined): string => {
  if (!apiError) return t('dataset.cloneFailed')
  const lower = apiError.toLowerCase()
  if (lower.includes('new name must contain only alphanumeric characters, underscores, hyphens, or dots')) {
    return t('dataset.cloneErrorInvalidName')
  }
  return apiError
}

const handleClone = (dataset: Dataset) => {
  cloneTargetDataset.value = dataset
  showCloneModal.value = true
}

const confirmClone = async (newName: string) => {
  if (!cloneTargetDataset.value) return
  
  showCloneModal.value = false
  
  try {
    const res = await datasetApi.cloneDataset(newName, cloneTargetDataset.value.name)
    if (res.success) {
      showToastMessage(t('dataset.cloneSuccess', { name: cloneTargetDataset.value.name, newName }), 'success')
      await fetchDatasets()
    } else {
      showToastMessage(t('dataset.cloneFailed') + ': ' + mapCloneError(res.error), 'error')
    }
  } catch (err: any) {
    showToastMessage(t('dataset.cloneFailed') + ': ' + mapCloneError(err.response?.data?.error), 'error')
  } finally {
    cloneTargetDataset.value = null
  }
}

const cancelClone = () => {
  showCloneModal.value = false
  cloneTargetDataset.value = null
}

const handleCreate = (dataset: Dataset) => {
  createTargetDataset.value = dataset
  showCreateModal.value = true
}

const mapCreateError = (apiError: string | null | undefined): string => {
  if (!apiError) return t('dataset.createFailed')
  const lower = apiError.toLowerCase()
  if (lower.includes('new name must contain only alphanumeric characters, underscores, hyphens, or dots')) {
    return t('dataset.createErrorInvalidName')
  }
  return apiError
}

const confirmCreate = async (newName: string) => {
  if (!createTargetDataset.value) return
  
  showCreateModal.value = false
  
  try {
    const res = await datasetApi.createDataset(createTargetDataset.value.name, newName)
    if (res.success) {
      showToastMessage(t('dataset.createSuccess', { name: createTargetDataset.value.name, newName }), 'success')
      await fetchDatasets()
    } else {
      showToastMessage(t('dataset.createFailed') + ': ' + mapCreateError(res.error), 'error')
    }
  } catch (err: any) {
    showToastMessage(t('dataset.createFailed') + ': ' + mapCreateError(err.response?.data?.error), 'error')
  } finally {
    createTargetDataset.value = null
  }
}

const cancelCreate = () => {
  showCreateModal.value = false
  createTargetDataset.value = null
}

const mapPromoteError = (apiError: string | null | undefined): string => {
  if (!apiError) return t('dataset.promoteFailed')
  const lower = apiError.toLowerCase()
  if (lower.includes('not a cloned filesystem')) {
    // 提取数据集名称
    const match = apiError.match(/cannot promote '(.+?)':/)
    const datasetName = match ? match[1] : ''
    return t('dataset.promoteErrorNotCloned', { name: datasetName })
  }
  return apiError
}

const handlePromote = (dataset: Dataset) => {
  promoteTargetDataset.value = dataset
  showPromoteModal.value = true
}

const confirmPromote = async () => {
  if (!promoteTargetDataset.value) return
  
  showPromoteModal.value = false
  
  try {
    const res = await datasetApi.promoteDataset(promoteTargetDataset.value.name)
    if (res.success) {
      showToastMessage(t('dataset.promoteSuccess', { name: promoteTargetDataset.value.name }), 'success')
      await fetchDatasets()
    } else {
      showToastMessage(mapPromoteError(res.error), 'error')
    }
  } catch (err: any) {
    showToastMessage(mapPromoteError(err.response?.data?.error), 'error')
  } finally {
    promoteTargetDataset.value = null
  }
}

const cancelPromote = () => {
  showPromoteModal.value = false
  promoteTargetDataset.value = null
}

const handleStart = async (dataset: Dataset) => {
  const pool = dataset.name.split('/')[0]
  try {
    const res = await datasetApi.setBootfs(dataset.name, pool)
    if (res.success) {
      showToastMessage(t('dataset.startSuccess'), 'success')
      await fetchDatasets()
    } else {
      showToastMessage(res.error || t('dataset.startError'), 'error')
    }
  } catch (err: any) {
    showToastMessage(err.response?.data?.error || t('dataset.startError'), 'error')
  }
}

onMounted(fetchDatasets)
</script>
