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
          <h3 class="text-lg font-semibold text-indigo-900">{{ disk.name }}</h3>
          <span class="text-sm text-indigo-700">{{ disk.size }} · {{ disk.type }}</span>
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

onMounted(async () => {
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
})
</script>
