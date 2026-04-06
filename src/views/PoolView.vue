<template>
  <div class="pool-view-container">
    <div class="header">
      <button @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
        {{ $t('common.back') || '返回' }}
      </button>
      <h1 class="title">{{ $t('pool.detail') || '存储池详情' }}</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') || '加载中...' }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p class="error-text">{{ error }}</p>
      <button @click="fetchPoolData" class="retry-btn">{{ $t('common.retry') || '重试' }}</button>
    </div>

    <!-- 3D 圆柱形立方体展示 -->
    <div v-else-if="poolData" class="cube-container">
      <div class="scene">
        <div class="cylinder-cube" :style="cubeStyle">
          <!-- 前面 -->
          <div class="face face-front">
            <div class="face-content">
              <div class="pool-name">{{ poolData.name }}</div>
              <div class="health-badge" :class="getHealthClass(poolData.health)">
                {{ poolData.health }}
              </div>
            </div>
          </div>
          <!-- 后面 -->
          <div class="face face-back">
            <div class="face-content">
              <div class="label">DEDUP</div>
              <div class="value">{{ poolData.dedup }}</div>
            </div>
          </div>
          <!-- 右面 -->
          <div class="face face-right">
            <div class="face-content">
              <div class="stat-item">
                <span class="stat-label">容量</span>
                <span class="stat-value">{{ poolData.cap }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">碎片</span>
                <span class="stat-value">{{ poolData.frag }}</span>
              </div>
            </div>
          </div>
          <!-- 左面 -->
          <div class="face face-left">
            <div class="face-content">
              <div class="stat-item">
                <span class="stat-label">检查点</span>
                <span class="stat-value">{{ poolData.ckpoint }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">扩展</span>
                <span class="stat-value">{{ poolData.expandsz }}</span>
              </div>
            </div>
          </div>
          <!-- 上面 -->
          <div class="face face-top">
            <div class="face-content">
              <div class="size-display">{{ poolData.size }}</div>
              <div class="size-label">总容量</div>
            </div>
          </div>
          <!-- 下面 -->
          <div class="face face-bottom">
            <div class="face-content storage-bar-container">
              <div class="storage-bar">
                <div class="storage-used" :style="{ width: poolData.cap }"></div>
              </div>
              <div class="storage-labels">
                <span>已用: {{ poolData.alloc }}</span>
                <span>空闲: {{ poolData.free }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <button @click="rotateLeft" class="control-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <button @click="toggleAutoRotate" class="control-btn auto-rotate-btn" :class="{ active: autoRotate }">
          <svg v-if="autoRotate" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
        </button>
        <button @click="rotateRight" class="control-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      </div>

      <!-- 数据详情表格 -->
      <div class="details-panel">
        <h3>{{ $t('pool.info') || '存储池信息' }}</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">{{ $t('pool.name') || '名称' }}</span>
            <span class="info-value">{{ poolData.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.size') || '总大小' }}</span>
            <span class="info-value">{{ poolData.size }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.alloc') || '已分配' }}</span>
            <span class="info-value">{{ poolData.alloc }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.free') || '可用' }}</span>
            <span class="info-value">{{ poolData.free }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.cap') || '容量使用率' }}</span>
            <span class="info-value">{{ poolData.cap }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.frag') || '碎片率' }}</span>
            <span class="info-value">{{ poolData.frag }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.health') || '健康状态' }}</span>
            <span class="info-value" :class="getHealthClass(poolData.health)">{{ poolData.health }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.dedup') || '去重率' }}</span>
            <span class="info-value">{{ poolData.dedup }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.ckpoint') || '检查点' }}</span>
            <span class="info-value">{{ poolData.ckpoint }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.altroot') || '备用根' }}</span>
            <span class="info-value">{{ poolData.altroot }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.canmount') || '可挂载' }}</span>
            <span class="info-value">{{ poolData.canmount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.mountpoint') || '挂载点' }}</span>
            <span class="info-value">{{ poolData.mountpoint }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { storageApi, type Pool } from '@/api/storage'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const error = ref('')
const poolData = ref<Pool | null>(null)

// 3D 旋转相关
const rotateX = ref(-15)
const rotateY = ref(30)
const autoRotate = ref(false)
let autoRotateInterval: number | null = null

const cubeStyle = computed(() => ({
  transform: `rotateX(${rotateX.value}deg) rotateY(${rotateY.value}deg)`,
}))

// 获取健康状态样式
const getHealthClass = (health: string) => {
  const healthLower = health.toLowerCase()
  if (healthLower === 'online') return 'health-online'
  if (healthLower === 'degraded') return 'health-degraded'
  if (healthLower === 'offline') return 'health-offline'
  if (healthLower === 'faulted') return 'health-faulted'
  return 'health-unknown'
}

// 获取存储池数据
const fetchPoolData = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await storageApi.getOnlinePools()
    if (response.success && response.data && response.data.length > 0) {
      const poolName = route.params.name as string
      const matchedPool = response.data.find((pool: Pool) => pool.name === poolName)
      if (matchedPool) {
        poolData.value = matchedPool
      } else {
        error.value = `Pool "${poolName}" not found`
      }
    } else {
      error.value = 'No pool data available'
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch pool data'
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 旋转控制
const rotateLeft = () => {
  rotateY.value -= 90
}

const rotateRight = () => {
  rotateY.value += 90
}

const toggleAutoRotate = () => {
  autoRotate.value = !autoRotate.value
  if (autoRotate.value) {
    autoRotateInterval = window.setInterval(() => {
      rotateY.value += 1
    }, 50)
  } else {
    if (autoRotateInterval) {
      clearInterval(autoRotateInterval)
      autoRotateInterval = null
    }
  }
}

// 鼠标拖动旋转
let isDragging = false
let lastMouseX = 0
let lastMouseY = 0

const handleMouseDown = (e: MouseEvent) => {
  isDragging = true
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}

const handleMouseMove = (e: MouseEvent) => {
  if (!isDragging) return
  const deltaX = e.clientX - lastMouseX
  const deltaY = e.clientY - lastMouseY
  rotateY.value += deltaX * 0.5
  rotateX.value -= deltaY * 0.5
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}

const handleMouseUp = () => {
  isDragging = false
}

onMounted(() => {
  fetchPoolData()
  document.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  if (autoRotateInterval) {
    clearInterval(autoRotateInterval)
  }
  document.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<style scoped>
.pool-view-container {
  padding: 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.title {
  color: #fff;
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #fff;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-text {
  color: #ff6b6b;
  margin-bottom: 16px;
}

.retry-btn {
  padding: 10px 24px;
  background: #00d4ff;
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: #00b8e6;
}

/* 3D 立方体样式 */
.cube-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.scene {
  width: 300px;
  height: 300px;
  perspective: 1000px;
  margin: 40px 0;
}

.cylinder-cube {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.3s ease;
}

.face {
  position: absolute;
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.15) 0%, rgba(0, 102, 204, 0.15) 100%);
  border: 2px solid rgba(0, 212, 255, 0.5);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  box-shadow: 
    0 0 30px rgba(0, 212, 255, 0.3),
    inset 0 0 30px rgba(0, 212, 255, 0.1);
}

.face-content {
  text-align: center;
  color: #fff;
  padding: 20px;
}

.face-front {
  transform: translateZ(150px);
  background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 102, 204, 0.2) 100%);
}

.face-back {
  transform: rotateY(180deg) translateZ(150px);
}

.face-right {
  transform: rotateY(90deg) translateZ(150px);
}

.face-left {
  transform: rotateY(-90deg) translateZ(150px);
}

.face-top {
  transform: rotateX(90deg) translateZ(150px);
  background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 212, 255, 0.2) 100%);
}

.face-bottom {
  transform: rotateX(-90deg) translateZ(150px);
  background: linear-gradient(135deg, rgba(255, 100, 100, 0.2) 0%, rgba(255, 150, 50, 0.2) 100%);
}

/* 面的内容样式 */
.pool-name {
  font-size: 32px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow: 0 0 20px rgba(0, 212, 255, 0.5);
  margin-bottom: 16px;
}

.health-badge {
  display: inline-block;
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 600;
}

.health-online {
  background: rgba(0, 255, 136, 0.3);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.5);
}

.health-degraded {
  background: rgba(255, 193, 7, 0.3);
  color: #ffc107;
  border: 1px solid rgba(255, 193, 7, 0.5);
}

.health-offline,
.health-faulted {
  background: rgba(255, 107, 107, 0.3);
  color: #ff6b6b;
  border: 1px solid rgba(255, 107, 107, 0.5);
}

.health-unknown {
  background: rgba(128, 128, 128, 0.3);
  color: #aaa;
  border: 1px solid rgba(128, 128, 128, 0.5);
}

.size-display {
  font-size: 48px;
  font-weight: 700;
  color: #00ff88;
  text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
}

.size-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #00d4ff;
}

.label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.value {
  font-size: 36px;
  font-weight: 700;
  color: #ffd700;
}

/* 存储条 */
.storage-bar-container {
  width: 100%;
}

.storage-bar {
  width: 100%;
  height: 30px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 12px;
}

.storage-used {
  height: 100%;
  background: linear-gradient(90deg, #ff6464 0%, #ff9632 100%);
  transition: width 0.5s ease;
}

.storage-labels {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

/* 控制按钮 */
.controls {
  display: flex;
  gap: 16px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
  color: #00d4ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.control-btn:hover {
  background: rgba(0, 212, 255, 0.2);
  border-color: rgba(0, 212, 255, 0.6);
  transform: scale(1.1);
}

.auto-rotate-btn.active {
  background: rgba(0, 212, 255, 0.3);
  border-color: #00d4ff;
}

/* 详情面板 */
.details-panel {
  width: 100%;
  max-width: 800px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  margin-top: 16px;
}

.details-panel h3 {
  color: #fff;
  font-size: 20px;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

.info-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 16px;
  color: #fff;
  font-weight: 500;
}

/* 响应式 */
@media (max-width: 768px) {
  .scene {
    width: 250px;
    height: 250px;
  }

  .face {
    width: 250px;
    height: 250px;
  }

  .face-front { transform: translateZ(125px); }
  .face-back { transform: rotateY(180deg) translateZ(125px); }
  .face-right { transform: rotateY(90deg) translateZ(125px); }
  .face-left { transform: rotateY(-90deg) translateZ(125px); }
  .face-top { transform: rotateX(90deg) translateZ(125px); }
  .face-bottom { transform: rotateX(-90deg) translateZ(125px); }

  .pool-name {
    font-size: 24px;
  }

  .size-display {
    font-size: 36px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
