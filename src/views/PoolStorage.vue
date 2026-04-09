<template>
  <div class="pool-storage-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('nav.storagePool') }}</h2>
      <div class="button-group">
        <button @click="createPool" class="action-btn create-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {{ $t('common.create') }}
        </button>
        <button @click="fetchPools" class="action-btn refresh-btn" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spinning': loading }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          {{ $t('common.refresh') }}
        </button>
        <button @click="importPools" class="action-btn import-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
          {{ $t('common.import') }}
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchPools" class="retry-btn">{{ $t('common.retry') }}</button>
    </div>

    <!-- 存储池列表 -->
    <div v-else-if="pools.length" class="pools-grid">
      <div
        v-for="pool in pools"
        :key="pool.name"
        class="pool-card"
        @click="goToPoolDetail(pool.name)"
      >
        <div class="pool-header">
          <div class="pool-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
              <path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
          </div>
          <div class="pool-title-section">
            <h3 class="pool-card-name">{{ pool.name }}</h3>
            <div class="pool-title-row">
              <span class="pool-health-badge" :class="getHealthClass(pool.health)">
                {{ pool.health }}
              </span>
              <button 
                class="export-pool-btn-small" 
                @click.stop="showExportConfirm(pool.name)"
                :disabled="exportingPool === pool.name"
              >
                <svg v-if="exportingPool !== pool.name" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" x2="12" y1="15" y2="3"/>
                </svg>
                <span v-else class="spinner-small"></span>
                {{ exportingPool === pool.name ? $t('common.exporting') : $t('common.export') }}
              </button>
              <button 
                class="advanced-setting-btn-small" 
                @click.stop="goToAdvancedSetting(pool.name)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                {{ $t('common.advanced') }}
              </button>
              <button 
                class="checkpoint-btn-small" 
                @click.stop="goToCheckpoint(pool.name)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <circle cx="12" cy="12" r="4"/>
                </svg>
                {{ $t('common.checkpoint') }}
              </button>
            </div>
          </div>
        </div>

        <div class="pool-stats">
          <div class="stat-row">
            <div class="stat">
              <span class="pool-stat-label">{{ $t('pool.size') }}</span>
              <span class="pool-stat-value">{{ pool.size }}</span>
            </div>
            <div class="stat">
              <span class="pool-stat-label">{{ $t('pool.alloc') }}</span>
              <span class="pool-stat-value">{{ pool.alloc }}</span>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat">
              <span class="pool-stat-label">{{ $t('pool.free') }}</span>
              <span class="pool-stat-value">{{ pool.free }}</span>
            </div>
            <div class="stat">
              <span class="pool-stat-label">{{ $t('pool.cap') }}</span>
              <span class="pool-stat-value" :class="getCapacityClass(pool.cap)">{{ pool.cap }}</span>
            </div>
          </div>
        </div>

        <div class="capacity-bar-container">
          <div class="capacity-bar">
            <div class="capacity-used" :style="{ width: pool.cap }"></div>
          </div>
          <div class="capacity-legend">
            <span class="legend-item">
              <span class="legend-dot used"></span>
              {{ $t('pool.used') }} {{ pool.alloc }}
            </span>
            <span class="legend-item">
              <span class="legend-dot free"></span>
              {{ $t('pool.free') }} {{ pool.free }}
            </span>
          </div>
        </div>

        <div class="pool-footer">
          <div class="footer-stat">
            <span class="footer-label">{{ $t('pool.frag') }}</span>
            <span class="footer-value">{{ pool.frag }}</span>
          </div>
          <div class="footer-stat">
            <span class="footer-label">{{ $t('pool.dedup') }}</span>
            <span class="footer-value">{{ pool.dedup }}</span>
          </div>
          <div class="footer-stat">
            <span class="footer-label">{{ $t('pool.canmount') }}</span>
            <span class="footer-value">{{ pool.canmount }}</span>
          </div>
          <div class="footer-stat">
            <span class="footer-label">{{ $t('pool.mountpoint') }}</span>
            <span class="footer-value">{{ pool.mountpoint }}</span>
          </div>
          <div class="view-detail">
            {{ $t('pool.viewDetail') }}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3"/>
          <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
          <path d="M3 12A9 3 0 0 0 21 12"/>
        </svg>
      </div>
      <p class="empty-text">{{ $t('pool.noPools') }}</p>
    </div>
  </div>
  <!-- 导出确认对话框 -->
  <div v-if="showConfirmDialog" class="confirm-dialog-overlay" @click="cancelExport">
    <div class="confirm-dialog" @click.stop>
      <div class="confirm-dialog-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="warning-icon">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <path d="M12 9v4"/>
          <path d="M12 17h.01"/>
        </svg>
        <h3>{{ $t('pool.exportConfirmTitle') }}</h3>
      </div>
      <div class="confirm-dialog-body">
        <p>{{ $t('pool.exportConfirmMessage', { poolName: pendingExportPool }) }}</p>
        <p class="warning-text">{{ $t('pool.exportWarning') }}</p>
      </div>
      <div class="confirm-dialog-footer">
        <button @click="cancelExport" class="btn-cancel">
          {{ $t('common.cancel') }}
        </button>
        <button @click="confirmExport" class="btn-confirm" :disabled="exporting">
          <span v-if="exporting" class="spinner-small"></span>
          {{ exporting ? $t('common.exporting') : $t('common.confirm') }}
        </button>
      </div>
    </div>
  </div>

    <!-- 导出错误提示 -->
    <div v-if="exportError" class="export-error-toast">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="error-content">
        <p class="error-title">{{ $t('pool.exportFailedTitle') }}</p>
        <p class="error-detail">{{ exportError }}</p>
        <p class="error-detail">{{ exportErrorDetail }}</p>
      </div>
      <button class="error-close" @click="exportError = ''">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- 导出成功提示 -->
    <div v-if="exportSuccess" class="export-success-toast">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="success-content">
        <p class="success-title">{{ t('pool.exportSuccessTitle') }}</p>
        <p class="success-detail">{{ exportSuccess }}</p>
      </div>
      <button class="success-close" @click="exportSuccess = ''">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- 导入对话框 -->
    <div v-if="showImportDialog" class="confirm-dialog-overlay" @click="cancelImport">
      <div class="import-dialog" @click.stop>
        <div class="confirm-dialog-header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="import-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
          <h3>{{ $t('pool.importTitle') }}</h3>
        </div>
        <div class="confirm-dialog-body">
          <!-- 加载状态 -->
          <div v-if="loadingOfflinePools" class="import-loading">
            <div class="spinner-small"></div>
            <span>{{ $t('pool.importLoading') }}</span>
          </div>
          
          <!-- 没有数据 -->
          <div v-else-if="offlinePools.length === 0" class="import-empty">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>{{ $t('pool.noOfflinePools') }}</p>
          </div>
          
          <!-- 导入表单 -->
          <div v-else class="import-form">
            <div class="form-group">
              <label>{{ $t('pool.poolName') }}</label>
              <select v-model="selectedPool" class="form-select">
                <option v-for="pool in offlinePools" :key="pool" :value="pool">
                  {{ pool }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>{{ $t('pool.mountpoint') }}</label>
              <input 
                v-model="mountPoint" 
                type="text" 
                class="form-input" 
                :placeholder="$t('pool.mountPointPlaceholder')"
              />
            </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input v-model="bootEnabled" type="checkbox" />
                <span>{{ $t('pool.bootEnabled') }}</span>
              </label>
            </div>
            
            <!-- 错误提示 -->
            <div v-if="importError" class="import-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ importError }}</span>
            </div>
          </div>
        </div>
        <div class="confirm-dialog-footer">
          <button @click="cancelImport" class="btn-cancel">
            {{ $t('common.cancel') }}
          </button>
          <button 
            v-if="offlinePools.length > 0"
            @click="confirmImport" 
            class="btn-confirm import-btn-primary" 
            :disabled="importing"
          >
            <span v-if="importing" class="spinner-small"></span>
            {{ importing ? $t('pool.importing') : $t('pool.confirmImport') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 导入成功提示 -->
    <div v-if="importSuccess" class="export-success-toast">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="success-content">
        <p class="success-title">{{ $t('pool.importSuccessTitle') }}</p>
        <p class="success-detail">{{ importSuccess }}</p>
      </div>
      <button class="success-close" @click="importSuccess = ''">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
    
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storageApi, type Pool, type OfflinePool } from '@/api/storage'
import '@/css/PoolStorage.css'

const { t } = useI18n()

const router = useRouter()
const pools = ref<Pool[]>([])
const loading = ref(false)
const error = ref('')
const showConfirmDialog = ref(false)
const pendingExportPool = ref('')
const exporting = ref(false)
const exportingPool = ref('')
const exportError = ref('')
const exportErrorDetail = ref('')
const exportSuccess = ref('')

// 导入对话框相关
const showImportDialog = ref(false)
const offlinePools = ref<OfflinePool[]>([])
const selectedPool = ref('')
const mountPoint = ref('')
const bootEnabled = ref(false)
const loadingOfflinePools = ref(false)
const importError = ref('')
const importSuccess = ref('')
const importing = ref(false)

// 获取健康状态样式
const getHealthClass = (health: string) => {
  const healthLower = health.toLowerCase()
  if (healthLower === 'online') return 'pool-health-online'
  if (healthLower === 'degraded') return 'pool-health-degraded'
  if (healthLower === 'offline') return 'pool-health-offline'
  if (healthLower === 'faulted') return 'pool-health-faulted'
  return 'pool-health-unknown'
}

// 获取容量使用率样式
const getCapacityClass = (cap: string) => {
  const capNum = parseInt(cap)
  if (capNum >= 90) return 'pool-cap-high'
  if (capNum >= 70) return 'pool-cap-medium'
  return 'pool-cap-low'
}

// 获取存储池数据
const fetchPools = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await storageApi.getOnlinePools()
    if (response.success) {
      pools.value = response.data
    } else {
      error.value = response.error || 'Failed to fetch pools'
    }
  } catch (err: any) {
    error.value = err.message || 'Network error'
  } finally {
    loading.value = false
  }
}

// 跳转到存储池详情
const goToPoolDetail = (poolName: string) => {
  router.push({ name: 'PoolView', params: { name: poolName } })
}

// 跳转到高级设置
const goToAdvancedSetting = (poolName: string) => {
  router.push({ name: 'PoolAdvancedSetting', query: { pool: poolName } })
}

// 跳转到检查点页面
const goToCheckpoint = (poolName: string) => {
  router.push({ name: 'PoolChkpoint', query: { pool: poolName } })
}

// 跳转到创建存储池页面
const createPool = () => {
  router.push('/storage/pool/create')
}

// 导入存储池 - 显示导入对话框
const importPools = async () => {
  showImportDialog.value = true
  loadingOfflinePools.value = true
  importError.value = ''
  offlinePools.value = []
  selectedPool.value = ''
  mountPoint.value = ''
  bootEnabled.value = false
  
  try {
    const response = await storageApi.getOfflinePools()
    if (response.success) {
      offlinePools.value = response.data
      if (response.data.length > 0) {
        selectedPool.value = response.data[0]
      }
    } else {
      importError.value = response.error || t('pool.fetchOfflinePoolsFailed')
    }
  } catch (err: any) {
    importError.value = err.message || t('error.networkError')
  } finally {
    loadingOfflinePools.value = false
  }
}

// 取消导入
const cancelImport = () => {
  showImportDialog.value = false
  selectedPool.value = ''
  mountPoint.value = ''
  bootEnabled.value = false
  importError.value = ''
}

// 确认导入
const confirmImport = async () => {
  if (!selectedPool.value) {
    importError.value = t('pool.selectPoolRequired')
    return
  }
  
  importing.value = true
  importError.value = ''
  
  try {
    const response = await storageApi.importPool(
      selectedPool.value,
      mountPoint.value.trim(),
      bootEnabled.value
    )
    if (response.success) {
      importSuccess.value = t('pool.importSuccess', { poolName: selectedPool.value })
      cancelImport()
      await fetchPools()
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        importSuccess.value = ''
      }, 3000)
    } else {
      const errMsg = response.error || ''
      const unavailableMatch = errMsg.match(/cannot import '([^']+)': one or more devices is currently unavailable/)
      if (unavailableMatch) {
        const poolName = unavailableMatch[1]
        importError.value = t('pool.importFailedDeviceUnavailable', { poolName })
      } else {
        importError.value = response.error || t('pool.importFailed')
      }
    }
  } catch (err: any) {
    importError.value = err.message || t('pool.importFailed')
  } finally {
    importing.value = false
  }
}

// 显示导出确认对话框
const showExportConfirm = (poolName: string) => {
  pendingExportPool.value = poolName
  showConfirmDialog.value = true
}

// 显示导出所有存储池确认
const showExportAllConfirm = () => {
  alert(t('pool.selectPoolToExport'))
}

// 取消导出
const cancelExport = () => {
  showConfirmDialog.value = false
  pendingExportPool.value = ''
}

// 确认导出
const confirmExport = async () => {
  if (!pendingExportPool.value) return
  
  exporting.value = true
  exportingPool.value = pendingExportPool.value
  exportError.value = ''
  exportErrorDetail.value = ''
  
  try {
    const response = await storageApi.exportPool(pendingExportPool.value)
    if (response.success) {
      exportSuccess.value = t('pool.exportSuccess', { poolName: pendingExportPool.value })
      // 刷新列表，但失败不影响导出成功状态
      fetchPools().catch(() => {})
    } else {
      // 从 response.message 提取 pool 名称，如 "Failed to export pool 'one-pool'"
      const match = response.message?.match(/'([^']+)'/)
      const poolName = match ? match[1] : ''
      // const poolName = response.message.match(/pool '([^']+)'/)?.[1]
      console.log(poolName)
      exportError.value = t('pool.exportFailed', { poolName })
      // Check for specific error messages and use i18n translations
      if (response.error?.includes('pool or dataset is busy')) {
        exportErrorDetail.value = t('pool.poolDatasetBusy')
      } else {
        exportErrorDetail.value = response.error || ''
      }
    }
  } catch (err: any) {
    console.log('catch')
    console.log(err)
    // 从 err.response.data 获取服务器返回的错误信息
    const errorData = err.response?.data
    if (errorData?.message?.includes('Permission denied') || err.message?.includes('Permission denied')) {
      exportError.value = t('pool.permissionDenied')
      exportErrorDetail.value = ''
    } else if (errorData) {
      exportError.value = errorData.message || err.message
      exportErrorDetail.value = errorData.error || ''
    } else {
      exportError.value = err.message
      exportErrorDetail.value = ''
    }
  } finally {
    exporting.value = false
    exportingPool.value = ''
    showConfirmDialog.value = false
    pendingExportPool.value = ''
    // 3秒后自动关闭成功提示
    setTimeout(() => {
      exportSuccess.value = ''
    }, 3000)
  }
}

onMounted(() => {
  fetchPools()
})
</script>

<style scoped>
/* Styles moved to src/css/PoolStorage.css */
</style>
