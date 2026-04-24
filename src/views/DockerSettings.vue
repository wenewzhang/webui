<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900">{{ $t('route.dockerSettings') }}</h2>

    <!-- Toast -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @update:show="toast.show = $event"
    />

    <div class="mt-6 space-y-6">
      <!-- Docker 源地址 -->
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('dockerSettings.registryTitle') }}</h3>
          <button
            @click="fetchRegistry"
            :disabled="loadingRegistry"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="loadingRegistry"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ $t('common.refresh') }}
          </button>
        </div>

        <div class="space-y-4">
          <!-- 快速选择 Registry -->
          <div class="relative inline-block">
            <button
              @click="showRegistrySelector = !showRegistrySelector"
              type="button"
              class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ $t('dockerSettings.quickSelect') }}
              <svg class="ml-2 -mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="showRegistrySelector"
              class="absolute z-10 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
            >
              <div class="py-1" role="menu">
                <button
                  v-for="opt in registryOptions"
                  :key="opt"
                  @click="selectRegistry(opt)"
                  class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                >
                  {{ opt }}
                </button>
              </div>
            </div>
          </div>

          <!-- prefix -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">prefix</label>
            <input
              v-model="registryForm.prefix"
              list="prefix-options"
              class="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              :placeholder="t('dockerSettings.inputPrefix')"
            />
            <datalist id="prefix-options">
              <option value="docker.io" />
              <option value="quay.io" />
              <option value="ghcr.io" />
            </datalist>
          </div>

          <!-- location -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">location</label>
            <input
              v-model="registryForm.location"
              list="location-options"
              class="block w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
              :placeholder="t('dockerSettings.inputLocation')"
            />
            <datalist id="location-options">
              <option value="docker.io" />
              <option value="quay.io" />
              <option value="ghcr.io" />
            </datalist>
          </div>

          <!-- insecure -->
          <div class="flex items-center">
            <input
              id="insecure"
              v-model="registryForm.insecure"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label for="insecure" class="ml-2 block text-sm text-gray-900">
              insecure
            </label>
          </div>

          <!-- 确认修改按钮 -->
          <div class="pt-2">
            <button
              @click="saveRegistry"
              :disabled="!registryChanged || savingRegistry"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                v-if="savingRegistry"
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ $t('common.confirmUpdate') }}
            </button>
          </div>
        </div>
      </div>

      <!-- 下载镜像地址 -->
      <div class="border border-gray-200 rounded-lg p-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-lg font-semibold text-gray-800">{{ $t('dockerSettings.mirrorTitle') }}</h3>
          <button
            @click="fetchMirror"
            :disabled="loadingMirror"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="loadingMirror"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ $t('common.refresh') }}
          </button>
        </div>
        <div v-if="mirrorData !== null" class="bg-gray-50 rounded-md p-3">
          <pre class="text-sm text-gray-700 whitespace-pre-wrap font-mono">{{ formatData(mirrorData) }}</pre>
        </div>
        <div v-else-if="!loadingMirror" class="text-gray-500 text-sm">
          {{ $t('dockerSettings.noData') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { dockerApi, type DockerRegistryConfig } from '@/api/docker'
import Toast from '@/components/Toast.vue'
import { permissionDeniedMessage } from '@/utils/permissionUtils'

const { t } = useI18n()

const DEFAULT_REGISTRY: DockerRegistryConfig = {
  prefix: '',
  location: '',
  insecure: false,
}

const registryOriginal = ref<DockerRegistryConfig>({ ...DEFAULT_REGISTRY })
const registryForm = reactive<DockerRegistryConfig>({ ...DEFAULT_REGISTRY })
const mirrorData = ref<any>(null)
const loadingRegistry = ref(false)
const loadingMirror = ref(false)
const savingRegistry = ref(false)
const showRegistrySelector = ref(false)

const registryOptions = ['docker.io', 'quay.io', 'ghcr.io']

const selectRegistry = (value: string) => {
  registryForm.prefix = value
  registryForm.location = value
  showRegistrySelector.value = false
}

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

const registryChanged = computed(() => {
  return (
    registryForm.prefix !== registryOriginal.value.prefix ||
    registryForm.location !== registryOriginal.value.location ||
    registryForm.insecure !== registryOriginal.value.insecure
  )
})

const extractRegistryConfig = (res: any): DockerRegistryConfig => {
  if (!res || typeof res !== 'object') return { ...DEFAULT_REGISTRY }
  // Try to find prefix/location/insecure directly or nested
  const findValue = (obj: any, key: string): any => {
    if (obj[key] !== undefined) return obj[key]
    for (const k of Object.keys(obj)) {
      if (typeof obj[k] === 'object' && obj[k] !== null) {
        const v = findValue(obj[k], key)
        if (v !== undefined) return v
      }
    }
    return undefined
  }
  return {
    prefix: findValue(res, 'prefix') ?? '',
    location: findValue(res, 'location') ?? '',
    insecure: findValue(res, 'insecure') ?? false,
  }
}

const formatData = (data: any): string => {
  if (data === null || data === undefined) return ''
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    if (data.length === 0) return t('dockerSettings.noData')
    return data.map((item) => (typeof item === 'string' ? item : JSON.stringify(item, null, 2))).join('\n')
  }
  return JSON.stringify(data, null, 2)
}

const fetchRegistry = async () => {
  loadingRegistry.value = true
  try {
    const res = await dockerApi.getSettingRegistry()
    if (res.success) {
      const config = extractRegistryConfig(res)
      registryOriginal.value = { ...config }
      registryForm.prefix = config.prefix
      registryForm.location = config.location
      registryForm.insecure = config.insecure
    } else {
      showToast(res.message || t('dockerSettings.fetchRegistryFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('dockerSettings.fetchRegistryFailed'))
  } finally {
    loadingRegistry.value = false
  }
}

const saveRegistry = async () => {
  savingRegistry.value = true
  try {
    const payload: DockerRegistryConfig = {
      prefix: registryForm.prefix,
      location: registryForm.location,
      insecure: registryForm.insecure,
    }
    const res = await dockerApi.updateSettingRegistry(payload)
    if (res.success) {
      showToast(t('dockerSettings.updateRegistrySuccess'), 'success')
      registryOriginal.value = { ...payload }
    } else {
      showToast(res.message || t('dockerSettings.updateRegistryFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('dockerSettings.updateRegistryFailed'))
  } finally {
    savingRegistry.value = false
  }
}

const fetchMirror = async () => {
  loadingMirror.value = true
  try {
    const res = await dockerApi.getSettingMirror()
    if (res.success) {
      mirrorData.value = extractMirrorData(res)
    } else {
      showToast(res.message || t('dockerSettings.fetchMirrorFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('dockerSettings.fetchMirrorFailed'))
  } finally {
    loadingMirror.value = false
  }
}

const extractMirrorData = (res: any): any => {
  if (!res || typeof res !== 'object') return res
  const { success, message, ...rest } = res
  const keys = Object.keys(rest)
  if (keys.length === 1) {
    return rest[keys[0]]
  }
  return rest
}

onMounted(() => {
  fetchRegistry()
  fetchMirror()
})
</script>
