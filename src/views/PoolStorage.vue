<template>
  <div class="pool-storage-container">
    <div class="header-section">
      <h2 class="page-title">{{ $t('nav.storagePool') }}</h2>
      <button @click="fetchPools" class="refresh-btn" :disabled="loading">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="{ 'spinning': loading }">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 16h5v5"/>
        </svg>
        {{ $t('common.refresh') || '刷新' }}
      </button>
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storageApi, type Pool } from '@/api/storage'

const router = useRouter()
const pools = ref<Pool[]>([])
const loading = ref(false)
const error = ref('')

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

.refresh-btn {
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

.refresh-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.refresh-btn:disabled {
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
