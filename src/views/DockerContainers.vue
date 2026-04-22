<template>
  <div class="bg-white shadow rounded-lg p-6">
    <ConfirmModal
      :show="showConfirmModal"
      :title="t('dockerContainers.deleteConfirmTitle')"
      :message="t('dockerContainers.deleteConfirm', { id: pendingActionId })"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('route.dockerContainers') }}</h2>
      <button
        @click="fetchContainers"
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

    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <div v-if="message" class="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
      {{ message }}
    </div>

    <div v-if="containers.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerContainers.name') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerContainers.image') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerContainers.status') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerContainers.created') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('common.action') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in containers" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
              {{ item.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ item.image }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ item.status }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(item.created) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <div class="flex space-x-2">
                <button
                  @click="handleStart(item.id)"
                  :disabled="actionMap[item.id] || item.status.startsWith('Up')"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.id] && currentAction === 'start'"
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
                  @click="handleRestart(item.id)"
                  :disabled="actionMap[item.id]"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.id] && currentAction === 'restart'"
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
                  @click="handleStop(item.id)"
                  :disabled="actionMap[item.id] || item.status.startsWith('Exited')"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.id] && currentAction === 'stop'"
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
                  @click="handleDelete(item.id)"
                  :disabled="actionMap[item.id] || item.status.startsWith('Up')"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    v-if="actionMap[item.id] && currentAction === 'delete'"
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
                  {{ $t('common.delete') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading" class="text-center py-8 text-gray-500">
      {{ $t('dockerContainers.noContainers') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { dockerApi } from '@/api/docker'
import ConfirmModal from '@/components/ConfirmModal.vue'

const { t } = useI18n()

interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  created: number
}

const containers = ref<DockerContainer[]>([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const actionMap = ref<Record<string, boolean>>({})
const currentAction = ref('')
const showConfirmModal = ref(false)
const pendingActionId = ref('')

const formatDate = (timestamp: number): string => {
  if (!timestamp) return '-'
  const date = new Date(timestamp * 1000)
  return date.toLocaleString()
}

const fetchContainers = async () => {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.getContainers()
    if (res.success) {
      containers.value = res.containers || []
    } else {
      error.value = res.message || t('dockerContainers.fetchFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerContainers.fetchFailed')
  } finally {
    loading.value = false
  }
}

const handleStart = async (containerId: string) => {
  actionMap.value[containerId] = true
  currentAction.value = 'start'
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.startContainer(containerId)
    if (res.success) {
      message.value = t('dockerContainers.startSuccess', { id: containerId })
      await fetchContainers()
    } else {
      error.value = res.message || t('dockerContainers.startFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerContainers.startFailed')
  } finally {
    actionMap.value[containerId] = false
    currentAction.value = ''
  }
}

const handleRestart = async (containerId: string) => {
  actionMap.value[containerId] = true
  currentAction.value = 'restart'
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.restartContainer(containerId)
    if (res.success) {
      message.value = t('dockerContainers.restartSuccess', { id: containerId })
      await fetchContainers()
    } else {
      error.value = res.message || t('dockerContainers.restartFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerContainers.restartFailed')
  } finally {
    actionMap.value[containerId] = false
    currentAction.value = ''
  }
}

const handleStop = async (containerId: string) => {
  actionMap.value[containerId] = true
  currentAction.value = 'stop'
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.stopContainer(containerId)
    if (res.success) {
      message.value = t('dockerContainers.stopSuccess', { id: containerId })
      await fetchContainers()
    } else {
      error.value = res.message || t('dockerContainers.stopFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerContainers.stopFailed')
  } finally {
    actionMap.value[containerId] = false
    currentAction.value = ''
  }
}

const handleDelete = (containerId: string) => {
  pendingActionId.value = containerId
  showConfirmModal.value = true
}

const onConfirmDelete = async () => {
  showConfirmModal.value = false
  const containerId = pendingActionId.value
  if (!containerId) return

  actionMap.value[containerId] = true
  currentAction.value = 'delete'
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.removeContainer(containerId)
    if (res.success) {
      message.value = t('dockerContainers.deleteSuccess', { id: containerId })
      containers.value = containers.value.filter((c) => c.id !== containerId)
    } else {
      error.value = res.message || t('dockerContainers.deleteFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerContainers.deleteFailed')
  } finally {
    actionMap.value[containerId] = false
    currentAction.value = ''
    pendingActionId.value = ''
  }
}

const onCancelDelete = () => {
  showConfirmModal.value = false
  pendingActionId.value = ''
}

onMounted(() => {
  fetchContainers()
})
</script>
