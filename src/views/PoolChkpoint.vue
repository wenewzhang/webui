<template>
  <div class="pool-chkpoint-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('pool.checkpoint') || '检查点' }}</h2>
      <div class="button-group">
        <button @click="goBack" class="action-btn back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ $t('common.back') || '返回' }}
        </button>
      </div>
    </div>

    <div class="pool-info-card">
      <h3>{{ poolName }}</h3>
      <p>{{ $t('pool.checkpointDescription') || '管理存储池的检查点和快照' }}</p>
    </div>

    <!-- 检查点列表 -->
    <div class="chkpoint-list">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>{{ $t('common.loading') }}</p>
      </div>
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchCheckpoints" class="retry-btn">{{ $t('common.retry') || '重试' }}</button>
      </div>
      <div v-else-if="!checkpoint" class="empty-state">
        <p>{{ $t('pool.noCheckpoints') || '暂无检查点' }}</p>
      </div>
      <div v-else class="checkpoint-detail">
        <div class="checkpoint-item">
          <div class="checkpoint-row">
            <span class="checkpoint-label">Pool:</span>
            <span class="checkpoint-value">{{ checkpoint.pool }}</span>
          </div>
          <div class="checkpoint-row">
            <span class="checkpoint-label">Property:</span>
            <span class="checkpoint-value">{{ checkpoint.property }}</span>
          </div>
          <div class="checkpoint-row">
            <span class="checkpoint-label">Value:</span>
            <span class="checkpoint-value">{{ checkpoint.value }}</span>
          </div>
          <div class="checkpoint-row">
            <span class="checkpoint-label">Source:</span>
            <span class="checkpoint-value">{{ checkpoint.source }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storageApi, type Checkpoint } from '@/api/storage'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const poolName = ref('')
const loading = ref(false)
const checkpoint = ref<Checkpoint | null>(null)
const error = ref('')

const goBack = () => {
  router.push({ name: 'StoragePool' })
}

const fetchCheckpoints = async () => {
  if (!poolName.value) {
    error.value = t('pool.selectPoolRequired') || '请选择存储池'
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
</style>
