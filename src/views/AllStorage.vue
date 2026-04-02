<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('nav.storageAll') }}</h2>

    <div v-if="loading" class="text-gray-600">{{ $t('common.loading') }}</div>
    <div v-else-if="error" class="text-red-600">{{ error }}</div>
    <div v-else-if="disks.length" class="space-y-6">
      <!-- 遍历所有磁盘 -->
      <div
        v-for="disk in disks"
        :key="disk.name"
        class="border-2 border-indigo-200 bg-indigo-50 rounded-lg p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <h3 class="text-lg font-semibold text-indigo-900">{{ disk.name }}</h3>
            <span class="text-sm text-indigo-700">{{ disk.size }} · {{ disk.type }}<template v-if="disk.mountpoint"> · {{ disk.mountpoint }}</template></span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="openPartitionModal(disk)"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('storagePage.createPartition') }}
            </button>
            <button
              @click="handleDelete(disk)"
              class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ $t('common.delete') }}
            </button>
          </div>
        </div>

        <!-- children 子方块 -->
        <div v-if="disk.children && disk.children.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="child in disk.children"
            :key="child.name"
            class="bg-white border border-gray-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div class="text-sm font-medium text-gray-900 mb-1">{{ child.name }}</div>
            <div class="text-xs text-gray-500 space-y-0.5">
              <div><span class="text-gray-400">Size:</span> {{ child.size }}</div>
              <div><span class="text-gray-400">Type:</span> {{ child.type }}</div>
              <div><span class="text-gray-400">Mount:</span> {{ child.mountpoint ?? '-' }}</div>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-500">No partitions</div>
      </div>
    </div>
  </div>

  <!-- Create Partition Modal -->
  <div v-if="showPartitionModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="partition-modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closePartitionModal"></div>
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="partition-modal-title">
              {{ $t('storagePage.createPartitionTitle') }}
            </h3>
            <div class="mt-4 space-y-4">
              <!-- Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700">{{ $t('storagePage.partitionType') }}</label>
                <div class="mt-1 flex items-center space-x-4">
                  <label class="inline-flex items-center">
                    <input v-model="partitionForm.type" type="radio" value="capacity" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">{{ $t('storagePage.capacity') }}</span>
                  </label>
                  <label class="inline-flex items-center">
                    <input v-model="partitionForm.type" type="radio" value="percentage" class="text-indigo-600 focus:ring-indigo-500" />
                    <span class="ml-2 text-sm text-gray-700">{{ $t('storagePage.percentage') }}</span>
                  </label>
                </div>
              </div>
              <!-- Capacity Input -->
              <div v-if="partitionForm.type === 'capacity'" class="flex items-end gap-3">
                <div class="flex-1">
                  <label for="partition-size" class="block text-sm font-medium text-gray-700">{{ $t('storagePage.partitionSize') }}</label>
                  <input
                    id="partition-size"
                    v-model="partitionForm.sizeValue"
                    type="number"
                    min="0"
                    max="65535"
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label for="partition-unit" class="block text-sm font-medium text-gray-700">{{ $t('storagePage.unit') }}</label>
                  <select
                    id="partition-unit"
                    v-model="partitionForm.unit"
                    class="mt-1 block w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="M">M</option>
                    <option value="G">G</option>
                    <option value="T">T</option>
                  </select>
                </div>
              </div>
              <!-- Percentage Input -->
              <div v-else>
                <label for="partition-percentage" class="block text-sm font-medium text-gray-700">{{ $t('storagePage.partitionSize') }}</label>
                <div class="mt-1 flex items-center">
                  <input
                    id="partition-percentage"
                    v-model="partitionForm.sizeValue"
                    type="number"
                    min="0"
                    max="100"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <span class="ml-2 text-sm text-gray-500">%</span>
                </div>
              </div>
              <!-- Error Message -->
              <div v-if="partitionError" class="text-sm text-red-600">
                {{ partitionError }}
              </div>
              <!-- Success Message -->
              <div v-if="partitionSuccess" class="text-sm text-green-600">
                {{ partitionSuccess }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="submitPartition"
            :disabled="creatingPartition"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            <svg v-if="creatingPartition" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ $t('common.confirm') }}
          </button>
          <button
            type="button"
            @click="closePartitionModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { storageApi, type Disk } from '@/api/storage'
import i18n from '@/i18n'

const t = i18n.global.t
const disks = ref<Disk[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Partition modal state
const showPartitionModal = ref(false)
const creatingPartition = ref(false)
const partitionError = ref('')
const partitionSuccess = ref('')
const currentPartitionDisk = ref<Disk | null>(null)

const partitionForm = reactive({
  type: 'capacity' as 'capacity' | 'percentage',
  sizeValue: '',
  unit: 'G' as 'M' | 'G' | 'T',
})

const fetchDisks = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await storageApi.getDisks()
    if (res.success) {
      disks.value = res.data
    } else {
      error.value = res.error || t('error.unknown')
    }
  } catch (err: any) {
    error.value = err.response?.data?.error || t('error.networkError')
  } finally {
    loading.value = false
  }
}

const openPartitionModal = (disk: Disk) => {
  currentPartitionDisk.value = disk
  partitionForm.type = 'capacity'
  partitionForm.sizeValue = ''
  partitionForm.unit = 'G'
  partitionError.value = ''
  partitionSuccess.value = ''
  showPartitionModal.value = true
}

const closePartitionModal = () => {
  showPartitionModal.value = false
  partitionError.value = ''
  partitionSuccess.value = ''
  currentPartitionDisk.value = null
}

const submitPartition = async () => {
  if (!currentPartitionDisk.value) return

  const val = Number(partitionForm.sizeValue)
  if (Number.isNaN(val) || val < 0) {
    partitionError.value = t('storagePage.invalidPartitionSize')
    return
  }

  let sizeStr = ''
  if (partitionForm.type === 'capacity') {
    if (!Number.isInteger(val) || val > 65535) {
      partitionError.value = t('storagePage.invalidPartitionSize')
      return
    }
    sizeStr = `${val}${partitionForm.unit}`
  } else {
    if (val < 0 || val > 100) {
      partitionError.value = t('storagePage.invalidPartitionSize')
      return
    }
    sizeStr = `${val}%`
  }

  creatingPartition.value = true
  partitionError.value = ''
  partitionSuccess.value = ''

  try {
    const res = await storageApi.partDisk(currentPartitionDisk.value.name, sizeStr)
    if (res.success) {
      partitionSuccess.value = t('storagePage.createPartitionSuccess')
      setTimeout(() => {
        closePartitionModal()
        fetchDisks()
      }, 1500)
    } else {
      partitionError.value = res.error || t('storagePage.createPartitionFailed')
    }
  } catch (err: any) {
    partitionError.value = err.response?.data?.error || t('storagePage.createPartitionFailed')
  } finally {
    creatingPartition.value = false
  }
}

const mapDeleteError = (apiError: string | null | undefined): string => {
  if (!apiError) return t('storagePage.deleteDiskFailed')
  const lower = apiError.toLowerCase()
  if (lower.includes('in use by zfs') || lower.includes('does not exist')) {
    return t('storagePage.diskInUseOrNotExist')
  }
  if (lower.includes('only admin users can perform this operation')) {
    return t('storagePage.onlyAdminCanDeleteDisk')
  }
  return apiError
}

const handleDelete = async (disk: Disk) => {
  const message = t('storagePage.deleteDiskConfirmMessage', { diskName: disk.name })
  const confirmed = window.confirm(message)
  if (!confirmed) return

  try {
    const res = await storageApi.deleteDisk(disk.name)
    if (res.success) {
      await fetchDisks()
    } else {
      error.value = mapDeleteError(res.error)
    }
  } catch (err: any) {
    error.value = mapDeleteError(err.response?.data?.error)
  }
}

onMounted(fetchDisks)
</script>
