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
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('samba.createZfsShare') }}</h2>
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

    <div class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.selectDataset') }}
        </label>
        <select
          v-model="selectedDataset"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">{{ $t('samba.selectDatasetPlaceholder') }}</option>
          <option v-for="ds in datasets" :key="ds" :value="ds">{{ ds }}</option>
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
          {{ $t('samba.owner') }}
        </label>
        <select
          v-model="owner"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">{{ $t('samba.selectOwner') }}</option>
          <option v-for="user in users" :key="user.username" :value="user.username">
            {{ user.username }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('samba.quota') }}
        </label>
        <div class="flex gap-2">
          <input
            v-model="quotaValue"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="$t('samba.quotaPlaceholder')"
          />
          <select
            v-model="quotaUnit"
            class="w-20 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :disabled="quotaValue === 'none'"
          >
            <option value="G">G</option>
            <option value="T">T</option>
          </select>
        </div>
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
          :disabled="saving || !selectedDataset || !validateQuota()"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="saving" class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? $t('common.saving') : $t('common.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { sambaApi, type SambaUser } from '@/api/samba'
import Toast from '@/components/Toast.vue'
import { permissionDeniedMessage } from '@/utils/permissionUtils'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const datasets = ref<string[]>([])
const users = ref<SambaUser[]>([])
const saving = ref(false)

const selectedDataset = ref('')
const shareName = ref('')
const owner = ref('')
const quotaValue = ref('none')
const quotaUnit = ref('G')

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

const quotaInput = computed(() => {
  if (quotaValue.value === 'none') {
    return 'none'
  }
  return quotaValue.value + quotaUnit.value
})

const validateQuota = (): boolean => {
  if (quotaValue.value === 'none') {
    return true
  }
  const num = parseInt(quotaValue.value)
  return !isNaN(num) && num >= 1 && num <= 65535
}

const fetchDatasets = async () => {
  loading.value = true
  try {
    const res = await sambaApi.listSambaDatasets()
    if (res.success) {
      datasets.value = res.data.map((d) => d.name) || []
    } else {
      showToast(res.error || t('samba.loadDatasetsFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('error.unknown'))
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const res = await sambaApi.listUsers()
    if (res.success) {
      users.value = res.users || []
    }
  } catch (err: any) {
    // silent fail
  }
}

const handleCreate = async () => {
  if (!selectedDataset.value) return
  if (!validateQuota()) {
    showToast('Quota must be 1-65535 or none')
    return
  }
  saving.value = true
  try {
    const res = await sambaApi.createZfsShare(
      shareName.value || selectedDataset.value.replace(/\//g, '_'),
      selectedDataset.value,
      quotaInput.value,
      owner.value
    )
    if (res.success) {
      router.push('/samba')
    } else {
      showToast(res.error || t('samba.createZfsShareFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || t('error.unknown'))
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
