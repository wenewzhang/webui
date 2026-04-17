<template>
  <div class="bg-white shadow rounded-lg p-6">
    <!-- Toast -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @update:show="toast.show = $event"
    />

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
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-medium text-gray-900">{{ $t('samba.zfsShares') }}</h3>
          <button
            @click="router.push('/samba/zfs/create')"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ $t('common.create') }}
          </button>
        </div>
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
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('samba.owner') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('samba.permission') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('samba.guest_permission') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('common.operation') }}
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
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ share.owner }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ share.permission }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ share.guest_permission }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div class="flex space-x-2">
                    <button
                      @click="handleEditZfsShare(share)"
                      class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      {{ $t('common.edit') }}
                    </button>
                    <button
                      @click="handleCloseZfsShare(share)"
                      :disabled="closingShare === share.dataset"
                      class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg v-if="closingShare !== share.dataset" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      <svg v-else class="animate-spin h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {{ closingShare === share.dataset ? $t('common.processing') : $t('common.close') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ZFS Share Info Modal -->
    <SambaZFSshare
      :show="showZfsShareModal"
      :dataset="selectedZfsShare?.dataset || ''"
      @close="showZfsShareModal = false"
      @saved="handleZfsShareSaved"
    />

    <!-- Confirm Modal -->
    <ConfirmModal
      :show="showConfirmModal"
      :title="$t('common.confirm')"
      :message="t('samba.closeZfsShareConfirm', { dataset: confirmModalShare?.dataset || '' })"
      :confirm-text="$t('common.confirm')"
      :cancel-text="$t('common.cancel')"
      @confirm="handleConfirmClose"
      @cancel="handleCancelClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { sambaApi, type DirShare, type ZfsShare } from '@/api/samba'
import SambaZFSshare from './SambaZFSshare.vue'
import Toast from '@/components/Toast.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const dirShares = ref<DirShare[]>([])
const zfsShares = ref<ZfsShare[]>([])
const showZfsShareModal = ref(false)
const selectedZfsShare = ref<ZfsShare | null>(null)
const closingShare = ref('')
const showConfirmModal = ref(false)
const confirmModalShare = ref<ZfsShare | null>(null)
const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

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

const handleEditZfsShare = (share: ZfsShare) => {
  selectedZfsShare.value = share
  showZfsShareModal.value = true
}

const handleCloseZfsShare = (share: ZfsShare) => {
  confirmModalShare.value = share
  showConfirmModal.value = true
}

const handleConfirmClose = async () => {
  if (!confirmModalShare.value) return
  showConfirmModal.value = false
  closingShare.value = confirmModalShare.value.dataset
  try {
    const res = await sambaApi.closeZfsShare(confirmModalShare.value.dataset)
    if (res.success) {
      await fetchShares()
    } else {
      error.value = res.error || t('samba.closeZfsShareFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('error.unknown')
  } finally {
    closingShare.value = ''
    confirmModalShare.value = null
  }
}

const handleCancelClose = () => {
  showConfirmModal.value = false
  confirmModalShare.value = null
}

const handleZfsShareSaved = (success: boolean, message?: string) => {
  showZfsShareModal.value = false
  if (success) {
    toast.message = message || t('samba.updateZfsShareSuccess')
    toast.type = 'success'
  } else {
    toast.message = message || t('error.unknown')
    toast.type = 'error'
  }
  toast.show = true
  fetchShares()
}

onMounted(() => {
  fetchShares()
})
</script>
