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
              <div class="stat-item">
                <span class="stat-label">{{ $t('pool.dedup') }}</span>
                <span class="stat-value">{{ poolData.dedup }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('pool.canmount') }}</span>
                <span class="stat-value">{{ poolData.canmount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('pool.mountpoint') }}</span>
                <span class="stat-value" style="font-size: 14px;">{{ poolData.mountpoint }}</span>
              </div>
            </div>
          </div>
          <!-- 右面 -->
          <div class="face face-right">
            <div class="face-content">
              <div class="stat-item">
                <span class="stat-label">{{ $t('pool.cap') }}</span>
                <span class="stat-value">{{ poolData.cap }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('pool.frag') }}</span>
                <span class="stat-value">{{ poolData.frag }}</span>
              </div>
            </div>
          </div>
          <!-- 左面 -->
          <div class="face face-left">
            <div class="face-content">
              <div class="stat-item">
                <span class="stat-label">{{ $t('pool.ckpoint') }}</span>
                <span class="stat-value">{{ poolData.ckpoint }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('pool.expandsz') }}</span>
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
            <span class="info-label">{{ $t('pool.canmount') || 'Mount at Boot' }}</span>
            <span class="info-value">{{ poolData.canmount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">{{ $t('pool.mountpoint') || 'Mount Point' }}</span>
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
import '@/css/PoolView.css'

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
/* Styles moved to src/css/PoolView.css */
</style>
