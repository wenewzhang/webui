<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('route.dockerSearch') }}</h2>

    <!-- 搜索栏 -->
    <div class="flex items-center gap-3 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        class="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        :placeholder="$t('dockerSearch.placeholder')"
        @keyup.enter="handleSearch"
      />
      <button
        @click="handleSearch"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ $t('common.search') }}
      </button>
    </div>

    <!-- 提示信息 -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <div v-if="message" class="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
      {{ message }}
    </div>

    <!-- 进行中的拉取任务 -->
    <div v-if="activeTasks.length > 0" class="mb-6 space-y-3">
      <h3 class="text-lg font-semibold text-gray-900">{{ $t('dockerSearch.activeTasks') }}</h3>
      <div
        v-for="task in activeTasks"
        :key="task.taskId"
        class="border rounded-md p-4 bg-gray-50"
      >
        <div class="flex justify-between items-center mb-2">
          <span class="font-medium text-sm text-gray-900">{{ task.imageName }}</span>
          <span class="text-xs px-2 py-1 rounded-full" :class="taskStatusClass(task.status)">
            {{ $t(`dockerSearch.status.${task.status}`) || task.status }}
          </span>
        </div>
        <div class="mb-2">
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>{{ $t('dockerSearch.progress') }}</span>
            <span>{{ task.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: task.progress + '%' }"
            ></div>
          </div>
        </div>
        <div class="text-sm text-gray-600 break-all font-mono whitespace-pre-wrap">
          {{ task.detail || $t('dockerSearch.waitingForProgress') }}
        </div>
      </div>
    </div>

    <!-- 搜索结果表格 -->
    <div v-if="results.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerSearch.name') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerSearch.stars') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerSearch.official') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerSearch.description') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('common.action') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in results" :key="item.name" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.stars }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span
                v-if="item.official"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {{ item.official }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ item.description }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button
                @click="handleInstall(item.name)"
                :disabled="installingMap[item.name] || isImageInstalled(item.name)"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="installingMap[item.name]"
                  class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {{ $t('dockerSearch.install') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="searched && !loading" class="text-center py-8 text-gray-500">
      {{ $t('dockerSearch.noResults') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { dockerApi } from '@/api/docker'

const { t } = useI18n()

interface PullTask {
  imageName: string
  taskId: string
  status: string
  detail: string
  progress: number
  timer: ReturnType<typeof setInterval> | null
}

const searchQuery = ref('')
const loading = ref(false)
const results = ref<any[]>([])
const message = ref('')
const error = ref('')
const searched = ref(false)
const installingMap = ref<Record<string, boolean>>({})
const activeTasks = ref<PullTask[]>([])
const localImageTags = ref<string[]>([])

const isImageInstalled = (name: string): boolean => {
  if (!name) return false
  const lowerName = name.toLowerCase()
  return localImageTags.value.some((tag) => tag.toLowerCase().includes(lowerName))
}

const taskStatusClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    pulling: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const stopTaskTimer = (task: PullTask) => {
  if (task.timer) {
    clearInterval(task.timer)
    task.timer = null
  }
}

const startPolling = (task: PullTask) => {
  // 立即查询一次
  pollTaskOnce(task)
  // 每5秒轮询
  task.timer = setInterval(() => {
    pollTaskOnce(task)
  }, 3000)
}

const pollTaskOnce = async (task: PullTask) => {
  try {
    const res = await dockerApi.getPullImageTask(task.taskId)
    if (res.success) {
      const mytask = res.task
      task.status = mytask.status || res.status || 'running'
      const progressVal = parseFloat(String(mytask.progress || 0))
      task.progress = isNaN(progressVal) ? 0 : Math.min(100, Math.max(0, progressVal))
      if (mytask.message && mytask.message.includes('Image pulled successfully')) {
        task.detail = t('dockerSearch.imageDownloadComplete')
      } else if (mytask.message.includes('Starting pull')) {
        task.detail = t('dockerSearch.startingPull')
      } else if (mytask.message.includes('Downloading')) {
        task.detail = t('dockerSearch.downloading')
      } else {
        task.detail = mytask.message || JSON.stringify(res, null, 2)
      }
      const terminalStatuses = ['completed', 'success', 'failed', 'error']
      if (terminalStatuses.includes(mytask.status) || mytask.progress >= 100) {
        stopTaskTimer(task)
      }
    } else {
      task.status = 'error'
      task.detail = res.message || t('dockerSearch.queryTaskFailed')
      stopTaskTimer(task)
    }
  } catch (err: any) {
    task.status = 'error'
    task.detail = err.message || t('dockerSearch.queryTaskFailed')
    stopTaskTimer(task)
  }
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  loading.value = true
  error.value = ''
  message.value = ''
  results.value = []
  searched.value = true

  try {
    const res = await dockerApi.search(query)
    if (res.success) {
      results.value = res.results || []
      message.value = res.message || ''
    } else {
      error.value = res.message || t('dockerSearch.searchFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerSearch.searchFailed')
  } finally {
    loading.value = false
  }
}

const handleInstall = async (imageName: string) => {
  installingMap.value[imageName] = true
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.pullImageStart(imageName)
    if (res.success && res.task_id) {
      const task: PullTask = {
        imageName,
        taskId: res.task_id,
        status: 'pending',
        detail: '',
        progress: 0,
        timer: null,
      }
      activeTasks.value.push(task)
      startPolling(activeTasks.value[activeTasks.value.length - 1])
      localImageTags.value.push(imageName)
      message.value = t('dockerSearch.installSuccess', { name: imageName })
    } else {
      error.value = res.message || t('dockerSearch.installFailed', { name: imageName })
    }
  } catch (err: any) {
    error.value = err.message || t('dockerSearch.installFailed', { name: imageName })
  } finally {
    installingMap.value[imageName] = false
  }
}

onMounted(async () => {
  try {
    const res = await dockerApi.getImages()
    if (res.success && res.images) {
      localImageTags.value = res.images.flatMap((img) => img.repo_tags || [])
    }
  } catch {
    // silently ignore local images fetch failure
  }
})

onUnmounted(() => {
  activeTasks.value.forEach((task) => stopTaskTimer(task))
})
</script>
