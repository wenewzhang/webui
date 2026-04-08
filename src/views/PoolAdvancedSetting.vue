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
        <div v-for="(value, key) in advancedData" :key="key" class="setting-card" :class="{ 'editable': ['primarycache', 'quota', 'mountpoint', 'recordsize', 'atime', 'relatime', 'readonly'].includes(key) }">
          <div class="setting-label">{{ key }}</div>
          <!-- primarycache 可编辑下拉框 -->
          <div v-if="key === 'primarycache'" class="setting-edit">
            <select 
              v-model="primaryCacheValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="all">all</option>
              <option value="metadata">metadata</option>
              <option value="none">none</option>
            </select>
            <button 
              @click="savePrimaryCache" 
              class="save-btn"
              :disabled="saving || primaryCacheValue === originalPrimaryCache"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? ($t('common.saving') || '保存中...') : ($t('common.save') || '保存') }}
            </button>
          </div>
          <!-- quota 可编辑输入 -->
          <div v-else-if="key === 'quota'" class="setting-edit">
            <div class="quota-input-group">
              <input 
                v-model="quotaValue" 
                type="text"
                class="setting-input"
                :disabled="saving"
                placeholder="如: 10G, 1T, none"
              />
              <select 
                v-model="quotaUnit" 
                class="setting-select unit-select"
                :disabled="saving || quotaValue === 'none' || quotaValue === ''"
              >
                <option value="G">G</option>
                <option value="T">T</option>
              </select>
            </div>
            <button 
              @click="saveQuota" 
              class="save-btn"
              :disabled="saving || quotaInput === originalQuota"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? ($t('common.saving') || '保存中...') : ($t('common.save') || '保存') }}
            </button>
          </div>
          <!-- mountpoint 可编辑输入 -->
          <div v-else-if="key === 'mountpoint'" class="setting-edit">
            <input 
              v-model="mountpointValue" 
              type="text"
              class="setting-input"
              :disabled="saving"
              placeholder="如: /mnt/mypool"
            />
            <button 
              @click="saveMountpoint" 
              class="save-btn"
              :disabled="saving || mountpointValue === originalMountpoint"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? ($t('common.saving') || '保存中...') : ($t('common.save') || '保存') }}
            </button>
          </div>
          <!-- recordsize 可编辑下拉框 -->
          <div v-else-if="key === 'recordsize'" class="setting-edit">
            <select 
              v-model="recordsizeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="1M">1M</option>
              <option value="128K">128K</option>
              <option value="64K">64K</option>
              <option value="16K">16K</option>
            </select>
            <button 
              @click="saveRecordsize" 
              class="save-btn"
              :disabled="saving || recordsizeValue === originalRecordsize"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? ($t('common.saving') || '保存中...') : ($t('common.save') || '保存') }}
            </button>
          </div>
          <!-- atime 可编辑下拉框 -->
          <div v-else-if="key === 'atime'" class="setting-edit">
            <select 
              v-model="atimeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
            <button 
              @click="saveAtime" 
              class="save-btn"
              :disabled="saving || atimeValue === originalAtime"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? ($t('common.saving') || '保存中...') : ($t('common.save') || '保存') }}
            </button>
          </div>
          <!-- relatime 可编辑下拉框 -->
          <div v-else-if="key === 'relatime'" class="setting-edit">
            <select 
              v-model="relatimeValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
            <button 
              @click="saveRelatime" 
              class="save-btn"
              :disabled="saving || relatimeValue === originalRelatime"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? ($t('common.saving') || '保存中...') : ($t('common.save') || '保存') }}
            </button>
          </div>
          <!-- readonly 可编辑下拉框 -->
          <div v-else-if="key === 'readonly'" class="setting-edit">
            <select 
              v-model="readonlyValue" 
              class="setting-select"
              :disabled="saving"
            >
              <option value="on">on</option>
              <option value="off">off</option>
            </select>
            <button 
              @click="saveReadonly" 
              class="save-btn"
              :disabled="saving || readonlyValue === originalReadonly"
            >
              <span v-if="saving" class="spinner-small"></span>
              <svg v-else xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ saving ? ($t('common.saving') || '保存中...') : ($t('common.save') || '保存') }}
            </button>
          </div>
          <!-- 其他字段只读 -->
          <div v-else class="setting-value">{{ value }}</div>
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

    <!-- 保存成功提示 -->
    <div v-if="saveSuccess" class="success-toast">
      <div class="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
      </div>
      <div class="success-content">
        <p class="success-title">{{ $t('common.saveSuccess') || '保存成功' }}</p>
      </div>
      <button class="success-close" @click="saveSuccess = false">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- 保存错误提示 -->
    <div v-if="saveError" class="error-toast">
      <div class="error-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="error-content">
        <p class="error-title">{{ $t('common.saveFailed') || '保存失败' }}</p>
        <p class="error-detail">{{ saveError }}</p>
      </div>
      <button class="error-close" @click="saveError = ''">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storageApi } from '@/api/storage'

const route = useRoute()
const router = useRouter()

const poolName = ref('')
const advancedData = ref<Record<string, string> | null>(null)
const loading = ref(false)
const error = ref('')

// primarycache 编辑相关
const primaryCacheValue = ref('all')
const originalPrimaryCache = ref('all')

// quota 编辑相关
const quotaValue = ref('')
const quotaUnit = ref('G')
const originalQuota = ref('')

// mountpoint 编辑相关
const mountpointValue = ref('')
const originalMountpoint = ref('')

// recordsize 编辑相关
const recordsizeValue = ref('128K')
const originalRecordsize = ref('128K')

// atime 编辑相关
const atimeValue = ref('on')
const originalAtime = ref('on')

// relatime 编辑相关
const relatimeValue = ref('off')
const originalRelatime = ref('off')

// readonly 编辑相关
const readonlyValue = ref('off')
const originalReadonly = ref('off')

const saving = ref(false)
const saveSuccess = ref(false)
const saveError = ref('')

// quota 完整输入值（数值+单位）
const quotaInput = computed(() => {
  if (quotaValue.value === 'none' || quotaValue.value === '') {
    return quotaValue.value
  }
  return quotaValue.value + quotaUnit.value
})

// 获取高级设置数据
const fetchAdvancedSettings = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await storageApi.getPoolAdvancedSetting(poolName.value)
    if (response.success) {
      advancedData.value = response.data
      // 初始化 primarycache 值
      if (response.data.primarycache) {
        primaryCacheValue.value = response.data.primarycache
        originalPrimaryCache.value = response.data.primarycache
      }
      // 初始化 quota 值
      if (response.data.quota) {
        const quota = response.data.quota
        originalQuota.value = quota
        if (quota === 'none') {
          quotaValue.value = 'none'
        } else {
          // 解析数值和单位（如 "10G" -> 数值 "10"，单位 "G"）
          const match = quota.match(/^(\d+)([GT])$/)
          if (match) {
            quotaValue.value = match[1]
            quotaUnit.value = match[2]
          } else {
            quotaValue.value = quota
          }
        }
      }
      // 初始化 mountpoint 值
      if (response.data.mountpoint) {
        mountpointValue.value = response.data.mountpoint
        originalMountpoint.value = response.data.mountpoint
      }
      // 初始化 recordsize 值
      if (response.data.recordsize) {
        recordsizeValue.value = response.data.recordsize
        originalRecordsize.value = response.data.recordsize
      }
      // 初始化 atime 值
      if (response.data.atime) {
        atimeValue.value = response.data.atime
        originalAtime.value = response.data.atime
      }
      // 初始化 relatime 值
      if (response.data.relatime) {
        relatimeValue.value = response.data.relatime
        originalRelatime.value = response.data.relatime
      }
      // 初始化 readonly 值
      if (response.data.readonly) {
        readonlyValue.value = response.data.readonly
        originalReadonly.value = response.data.readonly
      }
    } else {
      error.value = response.error || 'Failed to fetch advanced settings'
    }
  } catch (err: any) {
    error.value = err.message || 'Network error'
  } finally {
    loading.value = false
  }
}

// 保存 primarycache 设置
const savePrimaryCache = async () => {
  if (!poolName.value || !primaryCacheValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolPrimaryCache(poolName.value, primaryCacheValue.value)
    if (response.success) {
      originalPrimaryCache.value = primaryCacheValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save primarycache'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 验证 quota 输入
const validateQuota = (value: string): boolean => {
  if (value === 'none' || value === '') {
    return true
  }
  const num = parseInt(value)
  return !isNaN(num) && num >= 1 && num <= 999
}

// 保存 quota 设置
const saveQuota = async () => {
  if (!poolName.value) return
  
  // 验证输入
  if (!validateQuota(quotaValue.value)) {
    saveError.value = 'Quota must be 1-999G, 1-999T, or none'
    return
  }
  
  const finalQuota = quotaInput.value
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolQuota(poolName.value, finalQuota)
    if (response.success) {
      originalQuota.value = finalQuota
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save quota'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 验证 mountpoint 输入
const validateMountpoint = (value: string): boolean => {
  if (!value || value.trim() === '') {
    return false
  }
  // 必须以 / 开头
  return value.startsWith('/')
}

// 保存 mountpoint 设置
const saveMountpoint = async () => {
  if (!poolName.value) return
  
  // 验证输入
  const trimmedValue = mountpointValue.value.trim()
  if (!validateMountpoint(trimmedValue)) {
    saveError.value = 'Mountpoint must be a valid absolute path starting with /'
    return
  }
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolMountpoint(poolName.value, trimmedValue)
    if (response.success) {
      originalMountpoint.value = trimmedValue
      mountpointValue.value = trimmedValue
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save mountpoint'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 recordsize 设置
const saveRecordsize = async () => {
  if (!poolName.value || !recordsizeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolRecordsize(poolName.value, recordsizeValue.value)
    if (response.success) {
      originalRecordsize.value = recordsizeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save recordsize'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 atime 设置
const saveAtime = async () => {
  if (!poolName.value || !atimeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolAtime(poolName.value, atimeValue.value)
    if (response.success) {
      originalAtime.value = atimeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save atime'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 relatime 设置
const saveRelatime = async () => {
  if (!poolName.value || !relatimeValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolRelatime(poolName.value, relatimeValue.value)
    if (response.success) {
      originalRelatime.value = relatimeValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save relatime'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
  }
}

// 保存 readonly 设置
const saveReadonly = async () => {
  if (!poolName.value || !readonlyValue.value) return
  
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  
  try {
    const response = await storageApi.setPoolReadonly(poolName.value, readonlyValue.value)
    if (response.success) {
      originalReadonly.value = readonlyValue.value
      saveSuccess.value = true
      // 3秒后自动关闭成功提示
      setTimeout(() => {
        saveSuccess.value = false
      }, 3000)
    } else {
      saveError.value = response.error || 'Failed to save readonly'
    }
  } catch (err: any) {
    saveError.value = err.message || 'Network error'
  } finally {
    saving.value = false
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

.spinner-small {
  width: 14px;
  height: 14px;
  border: 2px solid #ffffff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
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

.setting-card.editable {
  border-color: #3b82f6;
  background-color: #eff6ff;
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

.setting-edit {
  display: flex;
  gap: 8px;
  align-items: center;
}

.setting-select {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.setting-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-select:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

/* quota 输入组 */
.quota-input-group {
  display: flex;
  gap: 8px;
  flex: 1;
  align-items: center;
}

.setting-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition: all 0.2s;
}

.setting-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.setting-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.unit-select {
  width: 60px;
  flex: none;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.save-btn:hover:not(:disabled) {
  background-color: #2563eb;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

/* 成功提示 */
.success-toast {
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

.success-toast .success-icon {
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
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #166534;
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

/* 错误提示 */
.error-toast {
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

.error-toast .error-icon {
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
</style>
