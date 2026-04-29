<template>
  <div class="bg-white shadow rounded-lg p-6">
    <!-- Toast -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @update:show="toast.show = $event"
    />

    <!-- Config Modal -->
    <InputModal
      :show="showConfigModal"
      :title="t('systemServices.configTitle', { name: pendingServiceName })"
      :message="t('systemServices.configMessage')"
      :placeholder="t('systemServices.configPlaceholder')"
      :confirm-text="t('common.save')"
      :cancel-text="t('common.cancel')"
      @confirm="onConfirmConfig"
      @cancel="onCancelConfig"
    />

    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('route.systemServices') }}</h2>
      <button
        @click="fetchServices"
        :disabled="loading"
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="loading"
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

    <div v-if="services.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('systemServices.name') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('common.status') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('systemServices.autostart') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('common.action') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in services" :key="item.name" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                :class="[
                  'inline-flex items-center px-3 py-1.5 text-sm rounded-full tracking-wide shadow-sm',
                  item.active === 'active'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-400 text-white'
                ]"
              >
                <span
                  :class="[
                    'mr-1.5 h-2 w-2 rounded-full',
                    item.active === 'active' ? 'bg-white' : 'bg-white'
                  ]"
                ></span>
                {{ item.active }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                :class="[
                  'inline-flex items-center px-3 py-1.5 text-sm font-bold rounded-full uppercase tracking-wide shadow-sm',
                  item.enabled
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-400 text-white'
                ]"
              >
                <span class="mr-1.5 h-2.5 w-2.5 rounded-full bg-white"></span>
                {{ item.enabled ? $t('common.yes') : $t('common.no') }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex space-x-2">
                <button
                  @click="handleStart(item.name)"
                  :disabled="actionMap[item.name] || item.active === 'active'"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.name] && currentActionMap[item.name] === 'start'"
                    class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                  {{ $t('common.start') }}
                </button>
                <button
                  @click="handleRestart(item.name)"
                  :disabled="actionMap[item.name] || item.active === 'active'"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.name] && currentActionMap[item.name] === 'restart'"
                    class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                  {{ $t('common.restart') }}
                </button>
                <button
                  @click="handleStop(item.name)"
                  :disabled="actionMap[item.name] || item.active !== 'active'"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.name] && currentActionMap[item.name] === 'stop'"
                    class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                  {{ $t('common.stop') }}
                </button>
                <button
                  @click="handleConfig(item.name)"
                  :disabled="actionMap[item.name]"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.name] && currentActionMap[item.name] === 'config'"
                    class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                  {{ $t('common.settings') }}
                </button>
                <button
                  @click="handleAutostart(item.name, !item.enabled)"
                  :disabled="actionMap[item.name]"
                  :class="[
                    'inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
                    item.enabled
                      ? 'text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500'
                      : 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                  ]"
                >
                  <svg
                    v-if="actionMap[item.name] && currentActionMap[item.name] === 'autostart'"
                    class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
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
                  {{ item.enabled ? $t('systemServices.disableAutostart') : $t('systemServices.enableAutostart') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading" class="text-center py-8 text-gray-500">
      {{ $t('systemServices.noServices') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { systemApi, type ServiceStatus } from '@/api/system'
import Toast from '@/components/Toast.vue'
import InputModal from '@/components/InputModal.vue'
import { permissionDeniedMessage } from '@/utils/permissionUtils'

const { t } = useI18n()

const services = ref<ServiceStatus[]>([])
const loading = ref(false)
const actionMap = ref<Record<string, boolean>>({})
const currentActionMap = ref<Record<string, string>>({})
const showConfigModal = ref(false)
const pendingServiceName = ref('')

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

const fetchServices = async () => {
  loading.value = true
  try {
    const res = await systemApi.servicesStatus()
    if (res.success) {
      services.value = res.data || []
    } else {
      showToast(res.message || t('systemServices.fetchFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('systemServices.fetchFailed'))
  } finally {
    loading.value = false
  }
}

const setAction = (name: string, action: string, active: boolean) => {
  actionMap.value[name] = active
  currentActionMap.value[name] = action
}

const handleStart = async (name: string) => {
  setAction(name, 'start', true)
  try {
    const res = await systemApi.serviceStart(name)
    if (res.success) {
      showToast(t('systemServices.startSuccess', { name }), 'success')
      await fetchServices()
    } else {
      showToast(res.message || t('systemServices.startFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('systemServices.startFailed'))
  } finally {
    setAction(name, 'start', false)
  }
}

const handleRestart = async (name: string) => {
  setAction(name, 'restart', true)
  try {
    const res = await systemApi.serviceRestart(name)
    if (res.success) {
      showToast(t('systemServices.restartSuccess', { name }), 'success')
      await fetchServices()
    } else {
      showToast(res.message || t('systemServices.restartFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('systemServices.restartFailed'))
  } finally {
    setAction(name, 'restart', false)
  }
}

const handleStop = async (name: string) => {
  setAction(name, 'stop', true)
  try {
    const res = await systemApi.serviceStop(name)
    if (res.success) {
      showToast(t('systemServices.stopSuccess', { name }), 'success')
      await fetchServices()
    } else {
      showToast(res.message || t('systemServices.stopFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('systemServices.stopFailed'))
  } finally {
    setAction(name, 'stop', false)
  }
}

const handleConfig = (name: string) => {
  pendingServiceName.value = name
  showConfigModal.value = true
}

const onConfirmConfig = async (value: string) => {
  const name = pendingServiceName.value
  if (!name) return
  showConfigModal.value = false
  setAction(name, 'config', true)
  try {
    const res = await systemApi.serviceSetConfig(name, value)
    if (res.success) {
      showToast(t('systemServices.configSuccess', { name }), 'success')
      await fetchServices()
    } else {
      showToast(res.message || t('systemServices.configFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('systemServices.configFailed'))
  } finally {
    setAction(name, 'config', false)
    pendingServiceName.value = ''
  }
}

const onCancelConfig = () => {
  showConfigModal.value = false
  pendingServiceName.value = ''
}

const handleAutostart = async (name: string, enable: boolean) => {
  setAction(name, 'autostart', true)
  try {
    const res = await systemApi.serviceSetAutostart(name, enable)
    if (res.success) {
      showToast(
        enable
          ? t('systemServices.enableAutostartSuccess', { name })
          : t('systemServices.disableAutostartSuccess', { name }),
        'success'
      )
      await fetchServices()
    } else {
      showToast(res.message || t('systemServices.autostartFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('systemServices.autostartFailed'))
  } finally {
    setAction(name, 'autostart', false)
  }
}

onMounted(() => {
  fetchServices()
})
</script>
