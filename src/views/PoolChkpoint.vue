<template>
  <div class="pool-chkpoint-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('pool.checkpoint') }}</h2>
      <div class="button-group">
        <button @click="createCheckpoint" class="action-btn create-btn" :disabled="creating || !canCreateCheckpoint">
          <svg v-if="!creating" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span v-else class="spinner-small"></span>
          {{ creating ? $t('common.creating') : $t('common.create') }}
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
      <p>{{ $t('pool.checkpointDescription') }}</p>
    </div>

    <!-- 检查点列表 -->
    <div class="chkpoint-list">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>
      <div v-else-if="error && !showRollbackHelp" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchCheckpoints" class="retry-btn">{{ $t('common.retry') }}</button>
      </div>
      <div v-else-if="!checkpoint" class="empty-state">
        <p>{{ $t('pool.noCheckpoints') }}</p>
      </div>
      <div v-else class="checkpoint-detail">
        <div class="checkpoint-item">
          <div class="checkpoint-row">
            <span class="checkpoint-label">{{ $t('pool.poolLabel') }}:</span>
            <span class="checkpoint-value">{{ checkpoint.pool }}</span>
          </div>
          <div class="checkpoint-row">
            <span class="checkpoint-label">{{ $t('pool.propertyLabel') }}:</span>
            <span class="checkpoint-value">{{ checkpoint.property }}</span>
          </div>
          <div class="checkpoint-row">
            <span class="checkpoint-label">{{ $t('pool.valueLabel') }}:</span>
            <span class="checkpoint-value">
              {{ checkpoint.value }}
              <template v-if="checkpoint.value !== '-'">
                <button @click="deleteCheckpoint" class="action-btn-small delete-btn" :disabled="deleting">
                  <span v-if="deleting" class="spinner-small-btn"></span>
                  {{ deleting ? $t('common.deleting') : $t('common.delete') }}
                </button>
                <button @click="rollbackCheckpoint" class="action-btn-small rollback-btn" :disabled="rollingback">
                  <span v-if="rollingback" class="spinner-small-btn"></span>
                  {{ rollingback ? $t('common.rollingback') : $t('common.rollback') }}
                </button>
              </template>
            </span>
          </div>
          <div class="checkpoint-row">
            <span class="checkpoint-label">{{ $t('pool.sourceLabel') }}:</span>
            <span class="checkpoint-value">{{ checkpoint.source }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 回滚失败帮助信息 -->
    <div v-if="showRollbackHelp" class="rollback-help-card">
      <div class="rollback-help-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="warning-icon">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span class="rollback-help-title">{{ $t('pool.rollbackFailed') }}</span>
        <button @click="showRollbackHelp = false" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div v-if="rollbackError" class="rollback-error-detail">
        {{ rollbackError }}
      </div>
      <div class="rollback-help-content">
        <p class="rollback-help-text">Reboot to ZFSBootMenu, Press Ctrl+R</p>
        <code class="rollback-command">zpool export {{ poolName }}</code>
        <code class="rollback-command">zpool import --rewind-to-checkpoint {{ poolName }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storageApi, type Checkpoint } from '@/api/storage'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const poolName = ref('')
const loading = ref(false)
const creating = ref(false)
const deleting = ref(false)
const rollingback = ref(false)
const checkpoint = ref<Checkpoint | null>(null)
const error = ref('')
const rollbackError = ref('')
const showRollbackHelp = ref(false)

const canCreateCheckpoint = computed(() => {
  return !checkpoint.value || checkpoint.value.value === '-'
})

const goBack = () => {
  router.push({ name: 'StoragePool' })
}

const fetchCheckpoints = async () => {
  if (!poolName.value) {
    error.value = t('pool.selectPoolRequired')
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    const response = await storageApi.getCheckpoints(poolName.value)
    if (response.success) {
      checkpoint.value = response.data
    } else {
      error.value = response.error || t('error.unknown')
    }
  } catch (err: any) {
    error.value = err.message || t('error.networkError')
  } finally {
    loading.value = false
  }
}

const createCheckpoint = async () => {
  if (!poolName.value) {
    error.value = t('pool.selectPoolRequired')
    return
  }
  
  creating.value = true
  error.value = ''
  
  try {
    const response = await storageApi.createCheckpoint(poolName.value)
    if (response.success) {
      await fetchCheckpoints()
    } else {
      error.value = response.error || t('error.unknown')
    }
  } catch (err: any) {
    error.value = err.message || t('error.networkError')
  } finally {
    creating.value = false
  }
}

const deleteCheckpoint = async () => {
  if (!poolName.value) {
    error.value = t('pool.selectPoolRequired')
    return
  }
  
  deleting.value = true
  error.value = ''
  
  try {
    const response = await storageApi.deleteCheckpoint(poolName.value)
    if (response.success) {
      await fetchCheckpoints()
    } else {
      error.value = response.error || t('error.unknown')
    }
  } catch (err: any) {
    error.value = err.message || t('error.networkError')
  } finally {
    deleting.value = false
  }
}

const rollbackCheckpoint = async () => {
  if (!poolName.value) {
    error.value = t('pool.selectPoolRequired')
    return
  }
  
  rollingback.value = true
  error.value = ''
  rollbackError.value = ''
  showRollbackHelp.value = false
  
  try {
    const response = await storageApi.rollbackCheckpoint(poolName.value)
    if (response.success) {
      await fetchCheckpoints()
    } else {
      error.value = response.error || t('error.unknown')
      rollbackError.value = response.message || ''
      showRollbackHelp.value = true
    }
  } catch (err: any) {
    error.value = err.message || t('error.networkError')
    showRollbackHelp.value = true
  } finally {
    rollingback.value = false
  }
}

onMounted(() => {
  poolName.value = route.query.pool as string || ''
  fetchCheckpoints()
})
</script>

<style scoped>
.pool-chkpoint-container {
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

.create-btn {
  background-color: #22c55e;
  color: #fff;
  border-color: #22c55e;
}

.create-btn:hover:not(:disabled) {
  background-color: #16a34a;
  border-color: #16a34a;
}

.create-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid #fff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.spinner-small-btn {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
  margin-right: 4px;
}

.action-btn-small {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 0.25rem;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  margin-left: 12px;
}

.action-btn-small:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.delete-btn {
  background-color: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.delete-btn:hover:not(:disabled) {
  background-color: #fee2e2;
  border-color: #ef4444;
}

.rollback-btn {
  background-color: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.rollback-btn:hover:not(:disabled) {
  background-color: #dbeafe;
  border-color: #3b82f6;
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

.chkpoint-list {
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

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border-color, #e5e7eb);
  border-top-color: var(--primary-color, #3b82f6);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary, #6b7280);
}

.checkpoint-detail {
  padding: 1rem;
}

.checkpoint-item {
  padding: 1rem;
}

.checkpoint-row {
  display: flex;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color, #e5e7eb);
}

.checkpoint-row:last-child {
  border-bottom: none;
}

.checkpoint-label {
  width: 120px;
  font-weight: 500;
  color: var(--text-secondary, #6b7280);
}

.checkpoint-value {
  flex: 1;
  font-weight: 600;
  color: var(--text-primary, #1f2937);
}

.rollback-help-card {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 0.5rem;
}

.rollback-help-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.warning-icon {
  color: #f59e0b;
  flex-shrink: 0;
}

.rollback-help-title {
  flex: 1;
  font-weight: 600;
  color: #92400e;
}

.close-btn {
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

.close-btn:hover {
  color: #6b7280;
}

.rollback-error-detail {
  padding: 0.75rem;
  background: #fee2e2;
  border-radius: 0.375rem;
  color: #991b1b;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  word-break: break-word;
}

.rollback-help-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.rollback-help-text {
  margin: 0 0 0.5rem 0;
  color: #78350f;
  font-size: 0.875rem;
}

.rollback-command {
  display: block;
  padding: 0.5rem 0.75rem;
  background: #1f2937;
  color: #e5e7eb;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.8125rem;
  border-radius: 0.375rem;
  overflow-x: auto;
}
</style>
