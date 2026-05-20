<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-bold text-gray-900">{{ $t('systemUpdater.title') }}</h2>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="ml-3 text-gray-600">{{ $t('systemUpdater.checking') }}</span>
    </div>

    <!-- 检查结果 -->
    <div v-else-if="result" class="bg-white shadow rounded-lg p-6">
      <!-- 有可用更新 -->
      <div v-if="result.update_available" class="space-y-4">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold text-green-700">{{ $t('systemUpdater.updateAvailable') }}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-sm text-gray-500">{{ $t('systemUpdater.currentVersion') }}</p>
            <p class="text-lg font-mono font-medium text-gray-900">{{ result.current_version }}</p>
          </div>
          <div class="bg-indigo-50 rounded-lg p-4">
            <p class="text-sm text-indigo-600">{{ $t('systemUpdater.latestVersion') }}</p>
            <p class="text-lg font-mono font-medium text-indigo-900">{{ result.latest_version }}</p>
          </div>
        </div>

        <!-- 下载按钮 -->
        <div v-if="!downloadTask" class="flex justify-start mt-4">
          <button
            @click="startDownload"
            :disabled="downloadLoading"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="downloadLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {{ $t('systemUpdater.download') }}
          </button>
        </div>

      </div>

      <!-- 无可用更新 -->
      <div v-else class="space-y-4">
        <div class="flex items-center space-x-3">
          <div class="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p class="text-lg font-semibold text-blue-700">{{ $t('systemUpdater.noUpdate') }}</p>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4 mt-4">
          <p class="text-sm text-gray-500">{{ $t('systemUpdater.currentVersion') }}</p>
          <p class="text-lg font-mono font-medium text-gray-900">{{ result.current_version }}</p>
        </div>
      </div>
    </div>

    <!-- 下载进度（独立显示，不依赖 result） -->
    <div v-if="downloadTask" class="bg-white shadow rounded-lg p-6">
      <div class="border rounded-md p-4 bg-gray-50 space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-medium text-sm text-gray-900">{{ $t('systemUpdater.downloadingUpdate') }}</span>
          <span class="text-xs px-2 py-1 rounded-full" :class="taskStatusClass(downloadTask.status)">
            {{ $t(`systemUpdater.status.${downloadTask.status}`) || downloadTask.status }}
          </span>
        </div>

        <!-- 文件名 -->
        <div v-if="downloadTask.filename" class="text-sm text-gray-700">
          <span class="text-gray-500">{{ $t('systemUpdater.filename') }}:</span>
          <span class="font-mono ml-1 break-all">{{ downloadTask.filename }}</span>
        </div>

        <!-- 进度条 -->
        <div>
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>{{ $t('systemUpdater.progress') }}</span>
            <span>{{ downloadTask.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: downloadTask.progress + '%' }"
            ></div>
          </div>
        </div>

        <!-- 字节进度 -->
        <div class="flex justify-between text-xs text-gray-600">
          <span>
            <span class="text-gray-500">{{ $t('systemUpdater.fileSize') }}:</span>
            {{ formatBytes(downloadTask.downloadedBytes) }} / {{ formatBytes(downloadTask.totalBytes) }}
          </span>
          <span v-if="downloadTask.totalBytes && downloadTask.totalBytes > 0">
            {{ ((downloadTask.downloadedBytes || 0) / downloadTask.totalBytes * 100).toFixed(1) }}%
          </span>
        </div>

        <!-- 消息 -->
        <div v-if="downloadTask.message || downloadTask.detail" class="text-sm text-gray-600 break-all font-mono whitespace-pre-wrap">
          {{ downloadTask.message || downloadTask.detail }}
        </div>

        <!-- 操作按钮 -->
        <div class="flex justify-end pt-2">
          <button
            v-if="downloadTask.status.toLowerCase() === 'completed' && downloadTask.progress === 100"
            @click="startUpgrade"
            :disabled="upgradeLoading"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="upgradeLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ $t('systemUpdater.upgrade') }}
          </button>
          <button
            v-else
            @click="cancelDownload"
            :disabled="cancelLoading"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="cancelLoading"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            {{ $t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 升级进度 -->
    <div v-if="upgradeProgress > 0 || upgradeTimer" class="bg-white shadow rounded-lg p-6">
      <div class="border rounded-md p-4 bg-gray-50 space-y-3">
        <div class="flex justify-between items-center">
          <span class="font-medium text-sm text-gray-900">{{ $t('systemUpdater.upgrading') }}</span>
          <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
            {{ upgradeProgress >= 100 ? $t('systemUpdater.status.completed') : $t('systemUpdater.status.running') }}
          </span>
        </div>

        <!-- 进度条 -->
        <div>
          <div class="flex justify-between text-xs text-gray-600 mb-1">
            <span>{{ $t('systemUpdater.progress') }}</span>
            <span>{{ upgradeProgress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div
              class="bg-green-600 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: upgradeProgress + '%' }"
            ></div>
          </div>
        </div>

        <!-- 消息 -->
        <div v-if="upgradeMessage" class="text-sm text-gray-600 break-all font-mono whitespace-pre-wrap">
          {{ upgradeMessage }}
        </div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
      <div class="flex items-center space-x-3">
        <div class="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-lg font-semibold text-red-700">{{ $t('systemUpdater.checkFailed') }}</p>
          <p class="text-sm text-red-600 mt-1">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- 刷新按钮 -->
    <div class="flex justify-end">
      <button
        @click="checkUpdate"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { systemApi, type UpdateCheckResponse, type UpdateStatusResponse } from '@/api/system'
import type { UpgradeProgressResponse } from '@/api/system'

const { t } = useI18n()

interface DownloadTask {
  taskId: string
  status: string
  detail: string
  progress: number
  timer: ReturnType<typeof setInterval> | null
  filename?: string
  filePath?: string
  downloadedBytes?: number
  totalBytes?: number
  message?: string
}

const loading = ref(false)
const result = ref<UpdateCheckResponse | null>(null)
const error = ref<string | null>(null)
const downloadLoading = ref(false)
const cancelLoading = ref(false)
const upgradeLoading = ref(false)
const downloadTask = ref<DownloadTask | null>(null)

const upgradeProgress = ref<number>(0)
const upgradeMessage = ref<string>('')
const upgradeTimer = ref<ReturnType<typeof setInterval> | null>(null)

const taskStatusClass = (status: string) => {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    running: 'bg-blue-100 text-blue-800',
    downloading: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    error: 'bg-red-100 text-red-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

const formatBytes = (bytes?: number) => {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '-'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const stopTaskTimer = () => {
  if (downloadTask.value?.timer) {
    clearInterval(downloadTask.value.timer)
    downloadTask.value.timer = null
  }
}

const stopUpgradeTimer = () => {
  if (upgradeTimer.value) {
    clearInterval(upgradeTimer.value)
    upgradeTimer.value = null
  }
}

const pollTaskOnce = async () => {
  if (!downloadTask.value) return
  try {
    const res = await systemApi.updateDownloadProgress(downloadTask.value.taskId)
    if (res.success && res.task) {
      const t = res.task
      const task = downloadTask.value
      task.status = t.status || 'running'
      const progressVal = parseFloat(String(t.progress || 0))
      task.progress = isNaN(progressVal) ? 0 : Math.min(100, Math.max(0, progressVal))
      task.detail = t.message || res.message || ''
      task.filename = t.filename
      task.filePath = t.file_path
      task.downloadedBytes = t.downloaded_bytes
      task.totalBytes = t.total_bytes
      task.message = t.message
      const terminalStatuses = ['completed', 'success', 'failed', 'error']
      if (terminalStatuses.includes(task.status.toLowerCase()) && task.progress >= 100) {
        stopTaskTimer()
      }
    } else {
      downloadTask.value.status = 'error'
      downloadTask.value.detail = res.error || res.message || t('systemUpdater.queryTaskFailed')
      stopTaskTimer()
    }
  } catch (err: any) {
    if (downloadTask.value) {
      downloadTask.value.status = 'error'
      downloadTask.value.detail = err.message || t('systemUpdater.queryTaskFailed')
      stopTaskTimer()
    }
  }
}

const startPolling = () => {
  pollTaskOnce()
  if (downloadTask.value) {
    downloadTask.value.timer = setInterval(() => {
      pollTaskOnce()
    }, 3000)
  }
}

const cancelDownload = async () => {
  if (!downloadTask.value) return
  cancelLoading.value = true
  try {
    const res = await systemApi.updateDownloadStop(downloadTask.value.taskId)
    if (res.success) {
      stopTaskTimer()
      downloadTask.value = null
    } else {
      error.value = res.error || res.message || t('systemUpdater.cancelFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    error.value = msg || t('systemUpdater.cancelFailed')
  } finally {
    cancelLoading.value = false
  }
}

const pollUpgradeProgress = async () => {
  try {
    const res: UpgradeProgressResponse = await systemApi.upgradeProgress()
    if (res.success && res.data) {
      const progressVal = parseFloat(String(res.data.progress || 0))
      upgradeProgress.value = isNaN(progressVal) ? 0 : Math.min(100, Math.max(0, progressVal))
      upgradeMessage.value = res.data.state || res.message || ''
      if (upgradeProgress.value >= 100) {
        stopUpgradeTimer()
      }
    } else {
      upgradeMessage.value = res.error || res.message || ''
      stopUpgradeTimer()
    }
  } catch (err: any) {
    upgradeMessage.value = err.message || ''
    stopUpgradeTimer()
  }
}

const startUpgrade = async () => {
  upgradeLoading.value = true
  upgradeProgress.value = 0
  upgradeMessage.value = ''
  try {
    const res = await systemApi.updateDownloadUpgrade(downloadTask.value?.filePath || '')
    if (res.success) {
      upgradeMessage.value = res.message || t('systemUpdater.upgradeStarted')
      stopUpgradeTimer()
      upgradeTimer.value = setInterval(() => {
        pollUpgradeProgress()
      }, 3000)
    } else {
      error.value = res.message || t('systemUpdater.upgradeFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    error.value = msg || t('systemUpdater.upgradeFailed')
  } finally {
    upgradeLoading.value = false
  }
}

const startDownload = async () => {
  downloadLoading.value = true
  error.value = null
  try {
    const res = await systemApi.updateDownloadStart()
    if (res.success && res.task_id) {
      downloadTask.value = {
        taskId: res.task_id,
        status: 'pending',
        detail: '',
        progress: 0,
        timer: null,
      }
      startPolling()
    } else {
      error.value = res.error || res.message || t('systemUpdater.downloadFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    error.value = msg || t('systemUpdater.downloadFailed')
  } finally {
    downloadLoading.value = false
  }
}

const checkUpdate = async () => {
  loading.value = true
  error.value = null
  stopTaskTimer()
  downloadTask.value = null
  try {
    const res = await systemApi.updateCheck()
    if (res.success) {
      result.value = res
    } else {
      error.value = res.error || t('error.unknown')
    }
  } catch (err: any) {
    const msg = err.response?.data?.error || err.message || ''
    error.value = msg || t('error.unknown')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    const statusRes: UpdateStatusResponse = await systemApi.updateStatus()
    if (statusRes.success) {
      if (statusRes.status === 'idle') {
        checkUpdate()
      } else if (statusRes.status === 'downloading' && statusRes.task_id) {
        // 恢复正在进行的下载任务进度
        downloadTask.value = {
          taskId: statusRes.task_id,
          status: statusRes.status,
          detail: '',
          progress: 0,
          timer: null,
        }
        startPolling()
      }
    }
  } catch (err: any) {
    // 静默失败，不自动触发检查
  }
})

onUnmounted(() => {
  stopTaskTimer()
  stopUpgradeTimer()
})
</script>
