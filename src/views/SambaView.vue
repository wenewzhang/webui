<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('nav.samba') }}</h2>
      <button
        @click="handleRefresh"
        :disabled="loading"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-flex items-center px-4 py-2">
        <svg class="animate-spin h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-600">{{ $t('common.loading') }}</span>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-red-600">{{ error }}</p>
    </div>

    <div v-else class="space-y-8">
      <!-- Dir Shares -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-3">{{ $t('samba.dirShares') }}</h3>
        <div v-if="dirShares.length === 0" class="text-center py-6 bg-gray-50 rounded-lg">
          <p class="text-gray-500">{{ $t('samba.noDirShares') }}</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('samba.name') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('samba.type') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="share in dirShares" :key="share.name" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ share.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    share.type === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  ]">
                    {{ share.type }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ZFS Shares -->
      <div>
        <h3 class="text-lg font-medium text-gray-900 mb-3">{{ $t('samba.zfsShares') }}</h3>
        <div v-if="zfsShares.length === 0" class="text-center py-6 bg-gray-50 rounded-lg">
          <p class="text-gray-500">{{ $t('samba.noZfsShares') }}</p>
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('samba.name') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('samba.dataset') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(share, index) in zfsShares" :key="index" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ share.dataset.replace(/\//g, '_') }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ share.dataset }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { sambaApi, type DirShare, type ZfsShare } from '@/api/samba'

const { t } = useI18n()

const loading = ref(false)
const error = ref('')
const dirShares = ref<DirShare[]>([])
const zfsShares = ref<ZfsShare[]>([])

const fetchShares = async () => {
  loading.value = true
  error.value = ''
  try {
    const [dirRes, zfsRes] = await Promise.all([
      sambaApi.listDirShares(),
      sambaApi.listZfsShares(),
    ])

    if (dirRes.success) {
      dirShares.value = dirRes.shares || []
    } else {
      error.value = dirRes.error || t('samba.loadDirSharesFailed')
    }

    if (zfsRes.success) {
      zfsShares.value = zfsRes.shares || []
    } else {
      error.value = zfsRes.error || t('samba.loadZfsSharesFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('error.unknown')
  } finally {
    loading.value = false
  }
}

const handleRefresh = () => {
  fetchShares()
}

onMounted(() => {
  fetchShares()
})
</script>
