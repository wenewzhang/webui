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
            <span class="text-sm text-indigo-700">{{ disk.size }} · {{ disk.type }}</span>
          </div>
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
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storageApi, type Disk } from '@/api/storage'
import i18n from '@/i18n'

const t = i18n.global.t
const disks = ref<Disk[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

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

const mapDeleteError = (apiError: string | null | undefined): string => {
  if (!apiError) return t('storagePage.deleteDiskFailed')
  const lower = apiError.toLowerCase()
  if (lower.includes('in use by zfs') || lower.includes('does not exist')) {
    return t('storagePage.diskInUseOrNotExist')
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
