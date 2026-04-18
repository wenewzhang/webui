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

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.type') }}
        </label>
        <select
          v-model="shareType"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="public">{{ $t('samba.public') }}</option>
          <option value="private">{{ $t('samba.private') }}</option>
        </select>
      </div>

      <div v-if="shareType === 'public'">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.guestOk') }}
        </label>
        <select
          v-model="guestOk"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="yes">yes</option>
          <option value="no">no</option>
        </select>
      </div>

      <template v-if="shareType === 'private'">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('samba.validUsers') }}
          </label>
          <div class="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
            <div v-if="usersLoading" class="text-sm text-gray-500">{{ $t('common.loading') }}</div>
            <div v-else-if="users.length === 0" class="text-sm text-gray-500">{{ $t('samba.noUsers') }}</div>
            <div v-else class="space-y-2">
              <label
                v-for="user in users"
                :key="user.username"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="validUsers"
                  type="checkbox"
                  :value="user.username"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-700">{{ user.username }}</span>
              </label>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('samba.writeList') }}
          </label>
          <div class="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
            <div v-if="usersLoading" class="text-sm text-gray-500">{{ $t('common.loading') }}</div>
            <div v-else-if="users.length === 0" class="text-sm text-gray-500">{{ $t('samba.noUsers') }}</div>
            <div v-else class="space-y-2">
              <label
                v-for="user in users"
                :key="user.username"
                class="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  v-model="writeList"
                  type="checkbox"
                  :value="user.username"
                  class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span class="text-sm text-gray-700">{{ user.username }}</span>
              </label>
            </div>
          </div>
        </div>
      </template>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.browseable') }}
        </label>
        <select
          v-model="browseable"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="yes">yes</option>
          <option value="no">no</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.readOnly') }}
        </label>
        <select
          v-model="readOnly"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="yes">yes</option>
          <option value="no">no</option>
        </select>
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
import { sambaApi, type SambaUser } from '@/api/samba'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const datasets = ref<{ name: string; mountpoint: string }[]>([])
const saving = ref(false)

const selectedDataset = ref('')
const shareName = ref('')
const shareType = ref('public')
const guestOk = ref('yes')
const browseable = ref('yes')
const readOnly = ref('yes')

const users = ref<SambaUser[]>([])
const usersLoading = ref(false)
const validUsers = ref<string[]>([])
const writeList = ref<string[]>([])

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

const fetchUsers = async () => {
  usersLoading.value = true
  try {
    const res = await sambaApi.listUsers()
    if (res.success) {
      users.value = res.users || []
    }
  } catch (err: any) {
    // silent fail
  } finally {
    usersLoading.value = false
  }
}

const handleCreate = async () => {
  if (!selectedDataset.value) return
  saving.value = true
  error.value = ''
  try {
    if (shareType.value === 'public') {
      const ds = datasets.value.find(d => d.name === selectedDataset.value)
      const mountpoint = ds?.mountpoint || ''
      const directory = shareName.value ? `${mountpoint}/${shareName.value}` : mountpoint
      const res = await sambaApi.createPublicShare(
        directory,
        browseable.value,
        readOnly.value,
        guestOk.value
      )
      if (res.success) {
        router.push('/samba')
      } else {
        error.value = res.error || t('samba.createDirShareFailed')
      }
    } else {
      const ds = datasets.value.find(d => d.name === selectedDataset.value)
      const mountpoint = ds?.mountpoint || ''
      const directory = shareName.value ? `${mountpoint}/${shareName.value}` : mountpoint
      const res = await sambaApi.createPrivateShare(
        directory,
        browseable.value,
        readOnly.value,
        validUsers.value,
        writeList.value
      )
      if (res.success) {
        router.push('/samba')
      } else {
        error.value = res.error || t('samba.createDirShareFailed')
      }
    }
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
  fetchUsers()
})
</script>
