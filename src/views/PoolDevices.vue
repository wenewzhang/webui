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
        <div v-for="device in devices" :key="device.name" class="device-item">
          <div class="device-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          </div>
          <div class="device-info">
            <div class="device-name">{{ device.name }}</div>
            <div class="device-size">{{ device.size }}</div>
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
import { storageApi, type PoolDevice } from '@/api/storage'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const poolName = ref('')
const loading = ref(false)
const devices = ref<PoolDevice[]>([])
const error = ref('')

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

onMounted(() => {
  poolName.value = route.query.pool as string || ''
  fetchDevices()
})
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
}

.device-item:last-child {
  margin-bottom: 0;
}

.device-item:hover {
  border-color: #a855f7;
  background: #faf5ff;
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
</style>
