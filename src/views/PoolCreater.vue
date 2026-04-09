<template>
  <div class="pool-creater-container">
    <div class="header-section">
      <button @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
        {{ $t('common.back') }}
      </button>
      <h2 class="page-title">{{ $t('pool.createPool') }}</h2>
    </div>

    <div class="form-container">
      <div class="form-group">
        <label for="poolName">{{ $t('pool.poolName') }}</label>
        <input
          id="poolName"
          v-model="form.name"
          type="text"
          class="form-input"
          :placeholder="$t('pool.poolNamePlaceholder')"
        />
      </div>

      <div class="form-group">
        <label for="poolType">{{ $t('pool.poolType') }}</label>
        <select id="poolType" v-model="form.type" class="form-input form-select">
          <option value="">{{ $t('pool.selectType') }}</option>
          <option value="single">Single</option>
          <option value="strip">Strip</option>
          <option value="mirror">Mirror</option>
          <option value="raidz1">RAIDZ1</option>
          <option value="raidz2">RAIDZ2</option>
          <option value="raidz3">RAIDZ3</option>
        </select>
      </div>

      <!-- 磁盘选择区域 -->
      <div class="form-group">
        <div class="disk-section-header">
          <label>{{ $t('pool.disks') }}</label>
          <button 
            v-if="form.disks.length < 15" 
            @click="addDisk" 
            class="btn-add-disk"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            {{ $t('pool.addDisk') }}
          </button>
        </div>
        
        <div v-for="(disk, index) in form.disks" :key="index" class="disk-select-row">
          <select v-model="form.disks[index]" class="form-input form-select disk-select">
            <option value="">{{ $t('pool.selectDisk') }}</option>
            <option 
              v-for="item in getAvailableItems(index)" 
              :key="item.name" 
              :value="item.name"
            >
              {{ item.label }}
            </option>
          </select>
          <button 
            v-if="form.disks.length > 1" 
            @click="removeDisk(index)" 
            class="btn-remove-disk"
            type="button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        
        <div v-if="form.disks.length === 0" class="disk-hint">
          {{ $t('pool.clickAddDisk') }}
        </div>
      </div>

      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ error }}</span>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <button @click="goBack" class="btn-cancel">
          {{ $t('common.cancel') }}
        </button>
        <button @click="createPool" class="btn-create" :disabled="creating">
          <span v-if="creating" class="spinner-small"></span>
          {{ creating ? $t('common.creating') : $t('common.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storageApi, type FreeDisk, type FreePart } from '@/api/storage'

const { t } = useI18n()
const router = useRouter()

const form = reactive({
  name: '',
  type: '',
  disks: [''] as string[],
})

// 可用磁盘和分区列表
const availableDisks = ref<FreeDisk[]>([])
const availableParts = ref<FreePart[]>([])
const error = ref('')
const creating = ref(false)

// 合并的选项列表（磁盘和分区）
const allAvailableItems = computed(() => {
  const disks = availableDisks.value.map(disk => ({
    name: disk.name,
    size: disk.size,
    type: 'disk' as const,
    label: `${disk.name} (${disk.size}) [${t('pool.disk')}]`
  }))
  const parts = availableParts.value.map(part => ({
    name: part.name,
    size: part.size,
    type: 'part' as const,
    label: `${part.name} (${part.size}) [${t('pool.partition')}]`
  }))
  return [...disks, ...parts]
})

// 获取可用磁盘和分区列表
const fetchAvailableItems = async () => {
  try {
    const [disksResponse, partsResponse] = await Promise.all([
      storageApi.getFreeDisks(),
      storageApi.getFreeParts()
    ])
    if (disksResponse.success) {
      availableDisks.value = disksResponse.data
    }
    if (partsResponse.success) {
      availableParts.value = partsResponse.data
    }
  } catch (err: any) {
    console.error('Failed to fetch available items:', err)
  }
}

// 获取当前索引可用的选项（排除已选择的）
const getAvailableItems = (currentIndex: number) => {
  const selectedItems = form.disks.filter((_, index) => index !== currentIndex)
  return allAvailableItems.value.filter(item => !selectedItems.includes(item.name))
}

// 添加磁盘
const addDisk = () => {
  if (form.disks.length < 15) {
    form.disks.push('')
  }
}

// 移除磁盘
const removeDisk = (index: number) => {
  form.disks.splice(index, 1)
}

const goBack = () => {
  router.push('/storage/pool')
}

const createPool = async () => {
  // 验证
  if (!form.name.trim()) {
    error.value = t('pool.poolNameRequired')
    return
  }

  if (!form.type) {
    error.value = t('pool.poolTypeRequired')
    return
  }

  // 过滤空磁盘
  const validDisks = form.disks.filter(disk => disk.trim() !== '')
  if (validDisks.length === 0) {
    error.value = t('pool.diskRequired')
    return
  }

  creating.value = true
  error.value = ''

  try {
    const response = await storageApi.createPool(
      form.name.trim(),
      form.type,
      validDisks
    )
    if (response.success) {
      router.push('/storage/pool')
    } else {
      const errMsg = response.error || ''
      const unavailableMatch = errMsg.match(/cannot create '([^']+)': one or more devices is currently unavailable/)
      const tooSmallMatch = errMsg.match(/cannot create '([^']+)': one or more devices is less than the minimum size/)
      if (unavailableMatch) {
        error.value = t('pool.devicesUnavailable')
      } else if (tooSmallMatch) {
        error.value = t('pool.devicesTooSmall')
      } else error.value = response.error || (t('pool.createFailed'))
    }
  } catch (err: any) {
    // Handle axios error response (e.g., 400 Bad Request)
    if (err.response?.data) {
      const responseData = err.response.data
      const errMsg = responseData.error || responseData.message || ''
      // Check for "Only X devices provided, but Y required" pattern and i18n it
      const devicesMatch = errMsg.match(/Only (\d+) devices? provided, but (\d+) required/)
      if (devicesMatch) {
        error.value = t('pool.devicesRequired', { 
          provided: devicesMatch[1], 
          required: devicesMatch[2] 
        })
      } else {
        error.value = errMsg || t('pool.createFailed')
      }
    } else {
      error.value = err.message || t('pool.createFailed')
    }
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  fetchAvailableItems()
  // 默认添加一个磁盘选择
  if (form.disks.length === 0) {
    form.disks.push('')
  }
})
</script>

<style scoped>
.pool-creater-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-btn:hover {
  background-color: #e2e8f0;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.form-container {
  background-color: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 24px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-select {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

/* 磁盘选择区域样式 */
.disk-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.disk-section-header label {
  margin-bottom: 0;
}

.btn-add-disk {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 6px;
  color: #059669;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-add-disk:hover {
  background-color: #d1fae5;
  border-color: #6ee7b7;
}

.disk-select-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

.disk-select {
  flex: 1;
}

.btn-remove-disk {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-remove-disk:hover {
  background-color: #fee2e2;
  border-color: #fca5a5;
}

.disk-hint {
  padding: 16px;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
}

.checkbox-group {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 400 !important;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
  margin-bottom: 24px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 10px 20px;
  background-color: #f1f5f9;
  border: none;
  border-radius: 8px;
  color: #475569;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #e2e8f0;
}

.btn-create {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: #6366f1;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-create:hover:not(:disabled) {
  background-color: #4f46e5;
}

.btn-create:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
