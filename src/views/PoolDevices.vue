<template>
  <div class="pool-devices-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('pool.devices') }}</h2>
      <div class="button-group">
        <button @click="fetchDevices" class="action-btn refresh-btn" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spinning': loading }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          {{ $t('common.refresh') }}
        </button>
        <button @click="goBack" class="action-btn back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ $t('common.back') }}
        </button>
      </div>
    </div>

    <div class="pool-info-card">
      <h3>{{ poolName }}</h3>
      <p>{{ $t('pool.devicesDescription') }}</p>
    </div>

    <!-- 设备列表 -->
    <div class="devices-list">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchDevices" class="retry-btn">{{ $t('common.retry') }}</button>
      </div>
      <div v-else-if="devices.length === 0" class="empty-state">
        <p>{{ $t('pool.noDevices') }}</p>
      </div>
      <div v-else class="devices-content">
        <div 
          v-for="device in devices" 
          :key="device.name" 
          class="device-item"
          :class="{ 'selected': isPoolDeviceSelected(device.name) }"
          @click="selectPoolDevice(device.name)"
        >
          <div class="device-icon">
            <svg v-if="!isPoolDeviceSelected(device.name)" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div class="device-info">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-size">{{ device.size }}</div>
          </div>
          <button 
            @click.stop="handleDetach(device.name)" 
            class="detach-btn"
            :disabled="detaching"
          >
            <svg v-if="detaching && selectedPoolDevice === device.name" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinning">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            {{ $t('pool.detach') || 'Detach' }}
          </button>
          <div v-if="isPoolDeviceSelected(device.name)" class="check-indicator">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 可用磁盘 -->
    <div class="free-disks-section">
      <div class="section-header">
        <h3 class="section-title">{{ $t('pool.availableDisks') || '可用磁盘' }}</h3>
        <button @click="fetchFreeDisksAndParts" class="refresh-btn-small" :disabled="freeDiskLoading">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spinning': freeDiskLoading }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
        </button>
      </div>
      
      <div class="disks-list">
        <div v-if="freeDiskLoading" class="loading-state">
          <div class="spinner"></div>
          <p>{{ $t('common.loading') }}</p>
        </div>
        <div v-else-if="freeDiskError" class="error-state">
          <p class="error-message">{{ freeDiskError }}</p>
          <button @click="fetchFreeDisksAndParts" class="retry-btn">{{ $t('common.retry') }}</button>
        </div>
        <div v-else-if="freeDisks.length === 0 && freeParts.length === 0" class="empty-state">
          <p>{{ $t('pool.noFreeDisks') || '没有可用的磁盘或分区' }}</p>
        </div>
        <div v-else class="disks-content">
          <!-- 可用磁盘 -->
          <div 
            v-for="disk in freeDisks" 
            :key="disk.name" 
            class="disk-item"
            :class="{ 'selected': isDiskSelected(disk.name) }"
            @click="selectDisk(disk.name)"
          >
            <div class="disk-icon">
              <svg v-if="!isDiskSelected(disk.name)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z"/>
                <path d="M12 12 2.1 10.5"/>
                <path d="M12 12v10"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="disk-info">
              <div class="disk-name">{{ disk.name }}</div>
              <div class="disk-details">
                <span class="disk-size">{{ disk.size }}</span>
                <span class="disk-type">{{ disk.type }}</span>
              </div>
            </div>
            <div v-if="isDiskSelected(disk.name)" class="check-indicator">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
          
          <!-- 可用分区 -->
          <div 
            v-for="part in freeParts" 
            :key="part.name" 
            class="disk-item partition-item"
            :class="{ 'selected': isPartSelected(part.name) }"
            @click="selectPart(part.name)"
          >
            <div class="disk-icon partition-icon">
              <svg v-if="!isPartSelected(part.name)" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="3" width="16" height="18" rx="2" ry="2"/>
                <line x1="8" y1="3" x2="8" y2="21"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div class="disk-info">
              <div class="disk-name">{{ part.name }}</div>
              <div class="disk-details">
                <span class="disk-size">{{ part.size }}</span>
                <span class="disk-type">{{ part.type }}</span>
              </div>
            </div>
            <div v-if="isPartSelected(part.name)" class="check-indicator">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Replace 和 Attach 按钮区域 -->
    <div class="replace-section">
      <div class="action-buttons-row">
        <button 
          @click="handleReplace" 
          class="replace-btn"
          :disabled="!canReplace || replacing"
        >
          <svg v-if="replacing" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinning">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
            <circle cx="12" cy="10" r="3"/>
            <path d="M9 17l3-3 3 3"/>
            <path d="M12 14v7"/>
          </svg>
          {{ replacing ? $t('common.processing') : $t('pool.replace') }}
        </button>
        <button 
          @click="handleAttach" 
          class="attach-btn-large"
          :disabled="!canAttach || attaching"
        >
          <svg v-if="attaching" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinning">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ attaching ? $t('common.processing') : $t('pool.attach') }}
        </button>
      </div>
    </div>
  </div>
  <!-- Toast 提示框 -->
  <Teleport to="body">
    <Transition name="toast">
      <div v-if="showToast" class="toast-overlay">
        <div class="toast-content" :class="{ 'toast-error': toastType === 'error', 'toast-success': toastType === 'success' }">
          <svg v-if="toastType === 'success'" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <span class="toast-message" style="white-space: pre-line">{{ toastMessage }}</span>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storageApi, type PoolDevice, type FreeDisk, type FreePart } from '@/api/storage'
import type { DeviceReplaceResponse, DetachDeviceResponse, AttachDeviceResponse } from '@/api/storage'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const poolName = ref('')
const loading = ref(false)
const devices = ref<PoolDevice[]>([])
const error = ref('')

// 可用磁盘和分区
const freeDisks = ref<FreeDisk[]>([])
const freeParts = ref<FreePart[]>([])
const freeDiskLoading = ref(false)
const freeDiskError = ref('')

// 选中的设备（磁盘或分区，只能选择一个）
const selectedDevice = ref<{ name: string; type: 'disk' | 'part' } | null>(null)

// 选中的池设备（只能选择一个）
const selectedPoolDevice = ref<string | null>(null)

// Replace 相关状态
const replacing = ref(false)

// Detach 相关状态
const detaching = ref(false)
const detachError = ref('')
const detachSuccess = ref('')

// Attach 相关状态
const attaching = ref(false)

// Toast 相关状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')
let toastTimer: ReturnType<typeof setTimeout> | null = null

// 显示 Toast
const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  showToast.value = true
  
  // 清除之前的定时器
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  
  // 3秒后自动隐藏
  toastTimer = setTimeout(() => {
    showToast.value = false
    toastMessage.value = ''
  }, 6000)
}

// 计算是否可以执行 Replace
const canReplace = computed(() => {
  return selectedPoolDevice.value !== null && selectedDevice.value !== null
})

// 计算是否可以执行 Attach
const canAttach = computed(() => {
  return selectedPoolDevice.value !== null && selectedDevice.value !== null
})

const goBack = () => {
  router.push({ name: 'StoragePool' })
}

const fetchDevices = async () => {
  if (!poolName.value) {
    error.value = t('pool.selectPoolRequired')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await storageApi.getPoolDevices(poolName.value)
    if (response.success) {
      devices.value = response.data
    } else {
      error.value = response.error || t('error.unknown')
    }
  } catch (err: any) {
    error.value = err.message || t('error.networkError')
  } finally {
    loading.value = false
  }
}

// 获取可用磁盘和分区
const fetchFreeDisksAndParts = async () => {
  freeDiskLoading.value = true
  freeDiskError.value = ''
  
  try {
    const [disksResponse, partsResponse] = await Promise.all([
      storageApi.getFreeDisks(),
      storageApi.getFreeParts()
    ])
    
    if (disksResponse.success) {
      freeDisks.value = disksResponse.data
    } else {
      freeDiskError.value = disksResponse.error || t('error.unknown')
    }
    
    if (partsResponse.success) {
      freeParts.value = partsResponse.data
    } else {
      freeDiskError.value = partsResponse.error || t('error.unknown')
    }
  } catch (err: any) {
    freeDiskError.value = err.message || t('error.networkError')
  } finally {
    freeDiskLoading.value = false
  }
}

// 选择磁盘（单选）
const selectDisk = (diskName: string) => {
  if (selectedDevice.value?.name === diskName && selectedDevice.value?.type === 'disk') {
    // 如果已选中则取消选择
    selectedDevice.value = null
  } else {
    // 选择新的磁盘（会取消之前的选择）
    selectedDevice.value = { name: diskName, type: 'disk' }
  }
}

// 选择分区（单选）
const selectPart = (partName: string) => {
  if (selectedDevice.value?.name === partName && selectedDevice.value?.type === 'part') {
    // 如果已选中则取消选择
    selectedDevice.value = null
  } else {
    // 选择新的分区（会取消之前的选择）
    selectedDevice.value = { name: partName, type: 'part' }
  }
}

// 判断是否选中磁盘
const isDiskSelected = (diskName: string): boolean => {
  return selectedDevice.value?.name === diskName && selectedDevice.value?.type === 'disk'
}

// 判断是否选中分区
const isPartSelected = (partName: string): boolean => {
  return selectedDevice.value?.name === partName && selectedDevice.value?.type === 'part'
}

// 选择池设备（单选）
const selectPoolDevice = (deviceName: string) => {
  if (selectedPoolDevice.value === deviceName) {
    // 如果已选中则取消选择
    selectedPoolDevice.value = null
  } else {
    // 选择新的设备
    selectedPoolDevice.value = deviceName
  }
}

// 判断是否选中池设备
const isPoolDeviceSelected = (deviceName: string): boolean => {
  return selectedPoolDevice.value === deviceName
}

onMounted(() => {
  poolName.value = route.query.pool as string || ''
  fetchDevices()
  fetchFreeDisksAndParts()
})

// 执行 Replace 操作
const handleReplace = async () => {
  if (!canReplace.value) return
  
  replacing.value = true
  
  try {
    // Extract the part after "/" from the old device name (e.g., "mirror-0/ata-xxx" -> "ata-xxx")
    const oldDevice = selectedPoolDevice.value!.split('/').pop() || selectedPoolDevice.value!
    const response: DeviceReplaceResponse = await storageApi.deviceReplace(
      poolName.value,
      oldDevice,
      selectedDevice.value!.name
    )
    
    if (response.success) {
      // 显示成功 toast
      showToastMessage(t('pool.replaceSuccess'), 'success')
      // 刷新设备列表
      await fetchDevices()
      await fetchFreeDisksAndParts()
      // 清空选择
      selectedPoolDevice.value = null
      selectedDevice.value = null
    } else {
      // Handle specific error messages with i18n
      const errorMsg = response.error || ''
      let toastErrorMsg = ''
      if (errorMsg.includes('device is too small')) {
        // Extract old and new device names from error message
        // Format: "cannot replace {oldDevice} with {newDevice}: device is too small"
        const match = errorMsg.match(/cannot replace (.+?) with (.+?): device is too small/)
        if (match) {
          const [, oldDev, newDev] = match
          toastErrorMsg = t('pool.replaceDeviceTooSmall', { oldDevice: oldDev, newDevice: newDev })
        } else {
          toastErrorMsg = errorMsg
        }
      } else if (errorMsg.includes('is part of exported pool')) {
        // Extract device and pool name from error message
        // Format: "... /dev/disk/by-id/xxx is part of exported pool 'poolname'"
        const match = errorMsg.match(/(\S+) is part of exported pool '([^']+)'/)
        if (match) {
          const [, device, poolName] = match
          toastErrorMsg = t('pool.replaceDeviceInExportedPool', { device, poolName })
        } else {
          toastErrorMsg = errorMsg
        }
      } else {
        toastErrorMsg = errorMsg || t('error.unknown')
      }
      showToastMessage(`${t('pool.replaceFailed', { poolName: poolName.value })}\n${toastErrorMsg}`, 'error')
    }
  } catch (err: any) {
    showToastMessage(`${t('pool.replaceFailed', { poolName: poolName.value })}\n${err.message || t('error.networkError')}`, 'error')
  } finally {
    replacing.value = false
  }
}

// 执行 Detach 操作
const handleDetach = async (deviceName: string) => {
  if (detaching.value) return
  
  detaching.value = true
  detachError.value = ''
  detachSuccess.value = ''
  selectedPoolDevice.value = deviceName
  const deviceName2 = deviceName!.split('/').pop() || deviceName!

  try {
    const response: DetachDeviceResponse = await storageApi.detachDevice(
      poolName.value,
      deviceName2
    )
    
    if (response.success) {
      detachSuccess.value = t('pool.detachSuccess') || 'Detach successful'
      // 显示成功 toast
      const displayDeviceName = deviceName2
      showToastMessage(t('pool.detachSuccess', { deviceName: displayDeviceName, poolName: poolName.value }), 'success')
      // 刷新设备列表
      await fetchDevices()
      await fetchFreeDisksAndParts()
    } else {
      detachError.value = response.error || t('error.unknown')
      // 显示错误 toast
      let errorMsg = response.error || 'Unknown error'
      // 处理特定错误消息的 i18n
      if (errorMsg.includes('only applicable to mirror and replacing vdevs')) {
        errorMsg = t('pool.detachOnlyMirrorOrReplacing')
      }
      showToastMessage(`${t('pool.detachFailed', { poolName: poolName.value })}\n${errorMsg}`, 'error')
    }
  } catch (err: any) {
    detachError.value = err.message || t('error.networkError')
    // 显示网络错误 toast
    showToastMessage(`${t('pool.detachFailed', { poolName: poolName.value })}\n${err.message || t('error.networkError')}`, 'error')
  } finally {
    detaching.value = false
    selectedPoolDevice.value = null
    // 3秒后清除成功消息
    if (detachSuccess.value) {
      setTimeout(() => {
        detachSuccess.value = ''
      }, 3000)
    }
  }
}

// 执行 Attach 操作
const handleAttach = async () => {
  if (!canAttach.value) return
  
  attaching.value = true
  
  try {
    // Extract the part after "/" from the device name (e.g., "mirror-0/ata-xxx" -> "ata-xxx")
    const device = selectedPoolDevice.value!.split('/').pop() || selectedPoolDevice.value!
    const newDevice = selectedDevice.value!.name
    
    const response: AttachDeviceResponse = await storageApi.attachDevice(
      poolName.value,
      device,
      newDevice
    )
    
    if (response.success) {
      // 显示成功 toast
      showToastMessage(t('pool.attachSuccess', { newDevice, device, poolName: poolName.value }), 'success')
      // 刷新设备列表
      await fetchDevices()
      await fetchFreeDisksAndParts()
      // 清空选择
      selectedPoolDevice.value = null
      selectedDevice.value = null
    } else {
      // 显示错误 toast
      let errorMsg = response.error || 'Unknown error'
      // 处理特定错误消息的 i18n
      if (errorMsg.includes('is in use and contains a unknown filesystem') || errorMsg.includes('is in use and contains an unknown filesystem')) {
        errorMsg = t('pool.deviceInUseWithUnknownFilesystem')
      }
      showToastMessage(`${t('pool.attachFailed', { poolName: poolName.value })}\n${errorMsg}`, 'error')
    }
  } catch (err: any) {
    // 显示网络错误 toast
    showToastMessage(`${t('pool.attachFailed', { poolName: poolName.value })}\n${err.message || t('error.networkError')}`, 'error')
  } finally {
    attaching.value = false
  }
}
</script>

<style scoped>
.pool-devices-container {
  padding: 1.5rem;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
}

.button-group {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.back-btn {
  background-color: var(--bg-secondary, #f3f4f6);
  color: var(--text-primary, #1f2937);
  border-color: var(--border-color, #e5e7eb);
}

.back-btn:hover {
  background-color: var(--bg-hover, #e5e7eb);
}

.refresh-btn {
  background-color: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.refresh-btn:hover:not(:disabled) {
  background-color: #2563eb;
  border-color: #2563eb;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.pool-info-card {
  background: var(--bg-card, white);
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
}

.pool-info-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.pool-info-card p {
  margin: 0;
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
}

.devices-list {
  background: var(--bg-card, white);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--text-secondary, #6b7280);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.error-message {
  color: #dc2626;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1.5rem;
  background: #3b82f6;
  border: none;
  border-radius: 0.375rem;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary, #6b7280);
}

.devices-content {
  padding: 1rem;
}

.device-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
  background: var(--bg-secondary, #f9fafb);
  transition: all 0.2s;
  cursor: pointer;
  user-select: none;
}

.device-item:last-child {
  margin-bottom: 0;
}

.device-item:hover {
  border-color: #a855f7;
  background: #faf5ff;
}

.device-item.selected {
  border-color: #a855f7;
  background: #f3e8ff;
  box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.2);
}

.device-item.selected .device-icon {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.device-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.device-info {
  flex: 1;
  min-width: 0;
}

.device-name {
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  font-size: 0.9375rem;
  word-break: break-all;
}

.device-size {
  color: var(--text-secondary, #6b7280);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* 可用磁盘部分样式 */
.free-disks-section {
  margin-top: 1.5rem;
  background: var(--bg-card, white);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
  padding: 1.25rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
  margin: 0;
}

.refresh-btn-small {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  background: var(--bg-secondary, #f3f4f6);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-secondary, #6b7280);
}

.refresh-btn-small:hover:not(:disabled) {
  background: var(--bg-hover, #e5e7eb);
  color: var(--text-primary, #1f2937);
}

.refresh-btn-small:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.disks-list {
  min-height: 100px;
}

.disks-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.disk-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 0.375rem;
  padding: 0.75rem;
  background: var(--bg-secondary, #f9fafb);
  transition: all 0.2s;
}

.disk-item:hover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.disk-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.partition-icon {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.disk-info {
  flex: 1;
  min-width: 0;
}

.disk-name {
  font-weight: 500;
  color: var(--text-primary, #1f2937);
  font-size: 0.875rem;
  word-break: break-all;
}

.disk-details {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.25rem;
}

.disk-size {
  color: var(--text-secondary, #6b7280);
  font-size: 0.8125rem;
}

.disk-type {
  color: var(--text-tertiary, #9ca3af);
  font-size: 0.8125rem;
  text-transform: uppercase;
  padding: 0.125rem 0.375rem;
  background: var(--bg-tertiary, #e5e7eb);
  border-radius: 0.25rem;
}

.partition-item {
  border-left: 3px solid #10b981;
}

/* 选中状态样式 */
.disk-item {
  cursor: pointer;
  user-select: none;
}

.disk-item.selected {
  border-color: #3b82f6;
  background: #eff6ff;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.disk-item.partition-item.selected {
  border-color: #10b981;
  background: #ecfdf5;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
}

.disk-item.selected .disk-icon {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.disk-item.partition-item.selected .disk-icon.partition-icon {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.check-indicator {
  color: #22c55e;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding-left: 0.5rem;
}

.disk-item.partition-item.selected .check-indicator {
  color: #10b981;
}

/* Replace 按钮区域样式 */
.replace-section {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--bg-card, white);
  border-radius: 0.5rem;
  border: 1px solid var(--border-color, #e5e7eb);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.replace-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);
}

.replace-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  box-shadow: 0 4px 8px rgba(245, 158, 11, 0.4);
  transform: translateY(-1px);
}

.replace-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  box-shadow: none;
}

.detach-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.5rem;
}

.detach-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

.detach-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-buttons-row {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.attach-btn-large {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.attach-btn-large:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.attach-btn-large:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
  box-shadow: none;
}

/* Toast 样式 */
.toast-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.3);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  font-size: 1rem;
  font-weight: 500;
  max-width: 90vw;
  word-break: break-word;
  color: white;
}

.toast-success {
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
}

.toast-error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.toast-message {
  line-height: 1.5;
}

/* Toast 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
