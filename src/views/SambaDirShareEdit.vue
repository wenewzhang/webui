<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('samba.editDirShare') }}</h2>
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

    <div class="mb-4">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2"
        :class="shareType === 'public' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
      >
        {{ $t(`samba.${shareType}`) }}
      </span>
      <span class="text-sm text-gray-700 font-medium">{{ shareName }}</span>
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

    <div v-else-if="shareInfo" class="border border-gray-200 rounded-md overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(value, key) in flattenedInfo" :key="key" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm font-medium text-gray-900 w-1/3 bg-gray-50">
              {{ formatKey(key) }}
            </td>
            <td class="px-4 py-3 text-sm text-gray-700 break-all">
              {{ formatValue(value) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      {{ $t('samba.noShareInfo') }}
    </div>

    <!-- Edit form -->
    <div v-if="shareInfo" class="mt-6 border border-gray-200 rounded-md p-4">
      <h3 class="text-lg font-medium text-gray-900 mb-4">{{ $t('samba.modifySettings') }}</h3>
      <div class="grid grid-cols-1 gap-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('samba.browseable') }}</label>
            <select
              v-model="editBrowseable"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('samba.readOnly') }}</label>
            <select
              v-model="editReadOnly"
              class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
            >
              <option value="yes">yes</option>
              <option value="no">no</option>
            </select>
          </div>
        </div>

        <!-- Public only -->
        <div v-if="shareType === 'public'" class="sm:w-1/2">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('samba.guestOk') }}</label>
          <select
            v-model="editGuestOk"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md border"
          >
            <option value="yes">yes</option>
            <option value="no">no</option>
          </select>
        </div>

        <!-- Private only -->
        <template v-if="shareType === 'private'">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('samba.validUsers') }}</label>
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
                    v-model="editValidUsers"
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
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ $t('samba.writeList') }}</label>
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
                    v-model="editWriteList"
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
      </div>
      <div class="mt-4">
        <button
          @click="confirmUpdate"
          :disabled="saving"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? $t('common.saving') : $t('common.confirmUpdate') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { sambaApi, type SambaUser } from '@/api/samba'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const shareName = ref(route.params.name as string)
const shareType = ref(route.params.type as string)
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const shareInfo = ref<Record<string, any> | null>(null)

const editBrowseable = ref('yes')
const editReadOnly = ref('yes')
const editGuestOk = ref('yes')
const editValidUsers = ref<string[]>([])
const editWriteList = ref<string[]>([])

const users = ref<SambaUser[]>([])
const usersLoading = ref(false)

const flattenedInfo = computed(() => {
  if (!shareInfo.value) return {}
  const result: Record<string, string> = {}
  const flatten = (obj: any, prefix = '') => {
    if (obj === null || obj === undefined) {
      result[prefix] = '-'
      return
    }
    if (typeof obj !== 'object') {
      result[prefix] = String(obj)
      return
    }
    if (Array.isArray(obj)) {
      result[prefix] = obj.join(', ')
      return
    }
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key
      flatten(value, newKey)
    })
  }
  flatten(shareInfo.value)
  return result
})

const formatKey = (key: string): string => {
  // 优先尝试从 i18n 获取，否则直接返回 key
  const i18nKey = `samba.${key}`
  const translated = t(i18nKey)
  if (translated !== i18nKey) {
    return translated
  }
  return key
}

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
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

const fetchShareInfo = async () => {
  if (!shareName.value || !shareType.value) {
    error.value = t('error.unknown')
    return
  }
  loading.value = true
  error.value = ''
  shareInfo.value = null
  try {
    let res
    if (shareType.value === 'public') {
      res = await sambaApi.getPublicShareInfo(shareName.value)
    } else {
      res = await sambaApi.getPrivateShareInfo(shareName.value)
    }
    if (res.success) {
      // 后端直接返回字段在响应体中，过滤掉元数据字段
      const { success: _s, message: _m, error: _e, ...info } = res as any
      shareInfo.value = info
      editBrowseable.value = info.browseable || 'yes'
      editReadOnly.value = info.read_only || 'yes'
      if (shareType.value === 'public') {
        editGuestOk.value = info.guest_ok || 'yes'
      } else {
        editValidUsers.value = Array.isArray(info.valid_users)
          ? info.valid_users
          : (info.valid_users ? String(info.valid_users).split(',').map(s => s.trim()).filter(Boolean) : [])
        editWriteList.value = Array.isArray(info.write_list)
          ? info.write_list
          : (info.write_list ? String(info.write_list).split(',').map(s => s.trim()).filter(Boolean) : [])
      }
    } else {
      error.value = res.error || t('samba.loadShareInfoFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('error.unknown')
  } finally {
    loading.value = false
  }
}

const confirmUpdate = async () => {
  saving.value = true
  error.value = ''
  try {
    let res
    if (shareType.value === 'public') {
      res = await sambaApi.updatePublicShare(
        shareName.value,
        editBrowseable.value,
        editReadOnly.value,
        editGuestOk.value
      )
    } else {
      const validUsernames = new Set(users.value.map(u => u.username))
      res = await sambaApi.updatePrivateShare(
        shareName.value,
        editBrowseable.value,
        editReadOnly.value,
        editValidUsers.value.filter(u => validUsernames.has(u)),
        editWriteList.value.filter(u => validUsernames.has(u))
      )
    }
    if (res.success) {
      await fetchShareInfo()
    } else {
      error.value = res.error === 'valid_users cannot be empty'
        ? t('samba.validUsersCannotBeEmpty')
        : res.error || t('samba.updateShareFailed')
    }
  } catch (err: any) {
    const data = err.response?.data
    if (data?.error === 'valid_users cannot be empty') {
      error.value = t('samba.validUsersCannotBeEmpty')
    } else {
      error.value = data?.error || data?.message || err.message || t('error.unknown')
    }
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/samba')
}

onMounted(() => {
  fetchShareInfo()
  fetchUsers()
})
</script>
