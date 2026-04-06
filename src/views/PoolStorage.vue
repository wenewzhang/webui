<template>
  <div class="pool-storage-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('nav.storagePool') }}</h2>
      <div class="button-group">
        <button @click="fetchPools" class="action-btn refresh-btn" :disabled="loading">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spinning': loading }">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
            <path d="M16 16h5v5"/>
          </svg>
          {{ $t('common.refresh') || '刷新' }}
        </button>
        <button @click="importPools" class="action-btn import-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" x2="12" y1="3" y2="15"/>
          </svg>
          {{ $t('common.import') }}
        </button>
        <button @click="showExportAllConfirm" class="action-btn export-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" x2="12" y1="15" y2="3"/>
          </svg>
          {{ $t('common.export') }}
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
      <button @click="fetchPools" class="retry-btn">{{ $t('common.retry') || '重试' }}</button>
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
            <h3 class="pool-name">{{ pool.name }}</h3>
            <span class="health-badge" :class="getHealthClass(pool.health)">
              {{ pool.health }}
            </span>
          </div>
        </div>

        <div class="pool-stats">
          <div class="stat-row">
            <div class="stat">
              <span class="stat-label">{{ $t('pool.size') || '总容量' }}</span>
              <span class="stat-value">{{ pool.size }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">{{ $t('pool.alloc') || '已用' }}</span>
              <span class="stat-value">{{ pool.alloc }}</span>
            </div>
          </div>
          <div class="stat-row">
            <div class="stat">
              <span class="stat-label">{{ $t('pool.free') || '可用' }}</span>
              <span class="stat-value">{{ pool.free }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">{{ $t('pool.cap') || '使用率' }}</span>
              <span class="stat-value" :class="getCapacityClass(pool.cap)">{{ pool.cap }}</span>
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
              {{ $t('pool.used') || '已用' }} {{ pool.alloc }}
            </span>
            <span class="legend-item">
              <span class="legend-dot free"></span>
              {{ $t('pool.free') || '可用' }} {{ pool.free }}
            </span>
          </div>
        </div>

        <div class="pool-footer">
          <div class="footer-stat">
            <span class="footer-label">{{ $t('pool.frag') || '碎片' }}</span>
            <span class="footer-value">{{ pool.frag }}</span>
          </div>
          <div class="footer-stat">
            <span class="footer-label">{{ $t('pool.dedup') || '去重' }}</span>
            <span class="footer-value">{{ pool.dedup }}</span>
          </div>
          <button 
            class="export-pool-btn" 
            @click.stop="showExportConfirm(pool.name)"
            :disabled="exportingPool === pool.name"
          >
            <svg v-if="exportingPool !== pool.name" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" x2="12" y1="15" y2="3"/>
            </svg>
            <span v-else class="spinner-small"></span>
            {{ exportingPool === pool.name ? $t('common.exporting') || '导出中...' : ($t('common.export') || '导出') }}
          </button>
          <div class="view-detail">
            {{ $t('pool.viewDetail') || '查看详情' }}
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
      <p class="empty-text">{{ $t('pool.noPools') || '暂无存储池' }}</p>
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
        <h3>{{ $t('pool.exportConfirmTitle') || '确认导出存储池' }}</h3>
      </div>
      <div class="confirm-dialog-body">
        <p>{{ $t('pool.exportConfirmMessage', { poolName: pendingExportPool }) }}</p>
        <p class="warning-text">{{ $t('pool.exportWarning') || '导出后该存储池将不再可用，但数据会被保留。' }}</p>
      </div>
      <div class="confirm-dialog-footer">
        <button @click="cancelExport" class="btn-cancel">
          {{ $t('common.cancel') || '取消' }}
        </button>
        <button @click="confirmExport" class="btn-confirm" :disabled="exporting">
          <span v-if="exporting" class="spinner-small"></span>
          {{ exporting ? ($t('common.exporting') || '导出中...') : ($t('common.confirm') || '确认') }}
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
        <p class="error-title">{{ $t('pool.exportFailed') || '导出失败' }}</p>
        <p class="error-detail">{{ exportError }}</p>
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
                <option v-for="pool in offlinePools" :key="pool.id" :value="pool.name">
                  {{ pool.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>{{ $t('pool.mountPoint') }}</label>
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
  if (healthLower === 'online') return 'health-online'
  if (healthLower === 'degraded') return 'health-degraded'
  if (healthLower === 'offline') return 'health-offline'
  if (healthLower === 'faulted') return 'health-faulted'
  return 'health-unknown'
}

// 获取容量使用率样式
const getCapacityClass = (cap: string) => {
  const capNum = parseInt(cap)
  if (capNum >= 90) return 'cap-high'
  if (capNum >= 70) return 'cap-medium'
  return 'cap-low'
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
        selectedPool.value = response.data[0].name
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
  if (!mountPoint.value.trim()) {
    importError.value = t('pool.mountPointRequired')
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
      importError.value = response.error || t('pool.importFailed')
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
  alert(t('pool.selectPoolToExport') || '请选择一个存储池进行导出')
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
  
  try {
    const response = await storageApi.exportPool(pendingExportPool.value)
    if (response.success) {
      exportSuccess.value = t('pool.exportSuccess', { poolName: pendingExportPool.value })
      await fetchPools()
    } else {
      const errorMsg = response.message 
        ? `${response.message}: ${response.error}` 
        : (response.error || (t('pool.exportFailed') || '导出失败'))
      exportError.value = errorMsg
    }
  } catch (err: any) {
    exportError.value = err.message || (t('pool.exportFailed') || '导出失败')
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
.pool-storage-container {
  padding: 24px;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.button-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 加载状态 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
}

/* 错误状态 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
}

.error-message {
  color: #dc2626;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 24px;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #2563eb;
}

/* 存储池网格 */
.pools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.pool-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pool-card:hover {
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #3b82f6;
}

.pool-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.pool-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.pool-title-section {
  flex: 1;
}

.pool-name {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px 0;
}

.health-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.health-online {
  background: #d1fae5;
  color: #065f46;
}

.health-degraded {
  background: #fef3c7;
  color: #92400e;
}

.health-offline,
.health-faulted {
  background: #fee2e2;
  color: #991b1b;
}

.health-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

/* 统计数据 */
.pool-stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.stat-row {
  display: flex;
  gap: 16px;
}

.stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.cap-high {
  color: #dc2626;
}

.cap-medium {
  color: #f59e0b;
}

.cap-low {
  color: #10b981;
}

/* 容量条 */
.capacity-bar-container {
  margin-bottom: 20px;
}

.capacity-bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 12px;
}

.capacity-used {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
  border-radius: 6px;
  transition: width 0.5s ease;
}

.capacity-legend {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #6b7280;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.used {
  background: #3b82f6;
}

.legend-dot.free {
  background: #e5e7eb;
}

/* 底部 */
.pool-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.footer-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-label {
  font-size: 11px;
  color: #9ca3af;
}

.footer-value {
  font-size: 13px;
  font-weight: 500;
  color: #4b5563;
}

.view-detail {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #3b82f6;
  font-weight: 500;
  transition: gap 0.2s;
}

.pool-card:hover .view-detail {
  gap: 8px;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px;
  color: #9ca3af;
}

.empty-icon {
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
}

/* 导出按钮 */
.export-pool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: #fef3c7;
  border: 1px solid #fbbf24;
  border-radius: 6px;
  color: #92400e;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.export-pool-btn:hover:not(:disabled) {
  background: #fde68a;
  border-color: #f59e0b;
}

.export-pool-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid #fbbf24;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

/* 确认对话框 */
.confirm-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 420px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: dialog-appear 0.2s ease;
}

@keyframes dialog-appear {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.confirm-dialog-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.warning-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.confirm-dialog-body {
  padding: 20px 24px;
}

.confirm-dialog-body p {
  margin: 0 0 12px 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.5;
}

.confirm-dialog-body p:last-child {
  margin-bottom: 0;
}

.warning-text {
  color: #92400e;
  background: #fef3c7;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
}

.confirm-dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #4b5563;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f59e0b;
  border: none;
  border-radius: 6px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-confirm:hover:not(:disabled) {
  background: #d97706;
}

.btn-confirm:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 导出错误提示 */
.export-error-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #fecaca;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 2000;
  animation: toast-appear 0.3s ease;
}

@keyframes toast-appear {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.export-error-toast .error-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #fee2e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #dc2626;
}

.error-content {
  flex: 1;
}

.error-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #991b1b;
}

.error-detail {
  margin: 0;
  font-size: 13px;
  color: #b91c1c;
  word-break: break-word;
}

.error-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #9ca3af;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-close:hover {
  color: #6b7280;
}

/* 导出成功提示 */
.export-success-toast {
  position: fixed;
  top: 24px;
  right: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: #fff;
  border: 1px solid #86efac;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  z-index: 2000;
  animation: toast-appear 0.3s ease;
}

.export-success-toast .success-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: #dcfce7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #16a34a;
}

.success-content {
  flex: 1;
}

.success-title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #166534;
}

.success-detail {
  margin: 0;
  font-size: 13px;
  color: #15803d;
  word-break: break-word;
}

.success-close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: #86efac;
  transition: color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-close:hover {
  color: #16a34a;
}

/* 导入对话框样式 */
.import-dialog {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: dialog-appear 0.2s ease;
}

.import-icon {
  color: #3b82f6;
  flex-shrink: 0;
}

.import-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #6b7280;
}

.import-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px;
  color: #9ca3af;
}

.import-empty svg {
  color: #d1d5db;
}

.import-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-select,
.form-input {
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #1f2937;
  background: #fff;
  transition: all 0.2s;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}

.checkbox-group {
  margin-top: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 400 !important;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  cursor: pointer;
  accent-color: #3b82f6;
}

.import-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  font-size: 13px;
}

.import-btn-primary {
  background: #3b82f6 !important;
}

.import-btn-primary:hover:not(:disabled) {
  background: #2563eb !important;
}

/* 响应式 */
@media (max-width: 768px) {
  .pools-grid {
    grid-template-columns: 1fr;
  }

  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
