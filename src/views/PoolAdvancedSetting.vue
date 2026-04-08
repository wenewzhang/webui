<template>
  <div class="pool-advanced-setting-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('pool.advancedSetting') || '高级设置' }}</h2>
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

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') || '加载中...' }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchAdvancedSettings" class="retry-btn">{{ $t('common.retry') || '重试' }}</button>
    </div>

    <!-- 高级设置数据 -->
    <div v-else-if="advancedData" class="settings-content">
      <div class="pool-name-header">
        <span class="label">{{ $t('pool.name') || '存储池' }}:</span>
        <span class="value">{{ poolName }}</span>
      </div>
      
      <div class="settings-grid">
        <div v-for="(value, key) in advancedData" :key="key" class="setting-card">
          <div class="setting-label">{{ key }}</div>
          <div class="setting-value">{{ value }}</div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </div>
      <p class="empty-text">{{ $t('pool.noAdvancedData') || '暂无高级设置数据' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storageApi } from '@/api/storage'

const route = useRoute()
const router = useRouter()

const poolName = ref('')
const advancedData = ref<Record<string, string> | null>(null)
const loading = ref(false)
const error = ref('')

// 获取高级设置数据
const fetchAdvancedSettings = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await storageApi.getPoolAdvancedSetting(poolName.value)
    if (response.success) {
      advancedData.value = response.data
    } else {
      error.value = response.error || 'Failed to fetch advanced settings'
    }
  } catch (err: any) {
    error.value = err.message || 'Network error'
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/storage/pool')
}

onMounted(() => {
  const name = route.query.pool as string
  if (name) {
    poolName.value = name
    fetchAdvancedSettings()
  } else {
    error.value = 'No pool name provided'
  }
})
</script>

<style scoped>
.pool-advanced-setting-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-color, #1f2937);
  margin: 0;
}

.button-group {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.back-btn:hover {
  background-color: #e5e7eb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #dc2626;
}

.error-message {
  font-size: 1rem;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 8px 16px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background-color: #b91c1c;
}

.pool-name-header {
  background-color: #f3f4f6;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pool-name-header .label {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
}

.pool-name-header .value {
  font-weight: 500;
  color: #1f2937;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.setting-card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.setting-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 8px;
  letter-spacing: 0.05em;
}

.setting-value {
  font-size: 0.875rem;
  color: #1f2937;
  word-break: break-word;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6b7280;
}

.empty-icon {
  margin-bottom: 16px;
  color: #9ca3af;
}

.empty-text {
  font-size: 1rem;
}
</style>
