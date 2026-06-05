<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900">{{ $t('systemUpdaterMirror.title') }}</h2>
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

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="ml-3 text-gray-600">{{ $t('systemUpdaterMirror.loading') }}</span>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error && !isEditing" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center space-x-3">
        <div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-semibold text-red-700">{{ $t('systemUpdaterMirror.loadFailed') }}</p>
          <p class="text-sm text-red-600 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- 镜像信息 -->
    <div v-else class="bg-white shadow rounded-lg p-6 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- 更新地址 -->
        <div class="bg-gray-50 rounded-lg p-4">
          <p class="text-sm text-gray-500">{{ $t('systemUpdaterMirror.updateUrl') }}</p>
          <template v-if="isEditing">
            <input
              v-model="form.update_url"
              type="text"
              class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              :placeholder="'http://...'"
            />
          </template>
          <p v-else class="text-lg font-mono font-medium text-gray-900 break-all">{{ mirrorInfo?.update_url || '-' }}</p>
        </div>

        <!-- 通道 -->
        <div :class="isEditing ? 'bg-gray-50' : 'bg-indigo-50'" class="rounded-lg p-4">
          <p :class="isEditing ? 'text-gray-500' : 'text-indigo-600'" class="text-sm">{{ $t('systemUpdaterMirror.channel') }}</p>
          <template v-if="isEditing">
            <select
              v-model="form.channel"
              class="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
            >
              <option value="stable">stable</option>
              <option value="beta">beta</option>
            </select>
          </template>
          <p v-else class="text-lg font-mono font-medium text-indigo-900">{{ mirrorInfo?.channel || '-' }}</p>
        </div>
      </div>

      <!-- 表单错误 -->
      <div v-if="formError" class="bg-red-50 border border-red-200 rounded-lg p-3">
        <p class="text-sm text-red-600">{{ formError }}</p>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-end space-x-3 pt-2">
        <template v-if="isEditing">
          <button
            @click="cancelEdit"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {{ $t('common.cancel') }}
          </button>
          <button
            @click="saveMirror"
            :disabled="saving"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="saving" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ saving ? $t('systemUpdaterMirror.saving') : $t('common.save') }}
          </button>
        </template>
        <template v-else>
          <button
            @click="startEdit"
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            {{ $t('common.edit') }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { systemApi, type SystemUpgradeMirrorResponse } from '@/api/system'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const error = ref<string | null>(null)
const mirrorInfo = ref<SystemUpgradeMirrorResponse | null>(null)

const isEditing = ref(false)
const saving = ref(false)
const formError = ref<string | null>(null)
const form = ref({
  update_url: '',
  channel: 'stable',
})

const goBack = () => {
  router.back()
}

const fetchMirror = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await systemApi.getSystemUpgradeMirror()
    if (res.success) {
      mirrorInfo.value = res
    } else {
      error.value = res.error || res.message || t('systemUpdaterMirror.loadFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    error.value = msg || t('systemUpdaterMirror.loadFailed')
  } finally {
    loading.value = false
  }
}

const startEdit = () => {
  form.value = {
    update_url: mirrorInfo.value?.update_url || '',
    channel: mirrorInfo.value?.channel || 'stable',
  }
  formError.value = null
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  formError.value = null
}

const saveMirror = async () => {
  formError.value = null

  const url = form.value.update_url.trim()
  if (!url) {
    formError.value = t('systemUpdaterMirror.urlRequired')
    return
  }
  if (!/^https?:\/\//i.test(url)) {
    formError.value = t('systemUpdaterMirror.urlInvalid')
    return
  }

  saving.value = true
  try {
    const res = await systemApi.updateSystemUpgradeMirror({
      update_url: url,
      channel: form.value.channel,
    })
    if (res.success) {
      mirrorInfo.value = {
        ...mirrorInfo.value,
        update_url: url,
        channel: form.value.channel,
        success: true,
      }
      isEditing.value = false
    } else {
      formError.value = res.error || res.message || t('systemUpdaterMirror.saveFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    formError.value = msg || t('systemUpdaterMirror.saveFailed')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchMirror()
})
</script>
