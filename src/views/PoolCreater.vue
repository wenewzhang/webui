<template>
  <div class="pool-creater-container">
    <div class="header-section">
      <button @click="goBack" class="back-btn">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5"/>
          <path d="M12 19l-7-7 7-7"/>
        </svg>
        {{ $t('common.back') || '返回' }}
      </button>
      <h2 class="page-title">{{ $t('pool.createPool') || '创建存储池' }}</h2>
    </div>

    <div class="form-container">
      <div class="form-group">
        <label for="poolName">{{ $t('pool.poolName') || '存储池名称' }}</label>
        <input
          id="poolName"
          v-model="form.name"
          type="text"
          class="form-input"
          :placeholder="$t('pool.poolNamePlaceholder') || '请输入存储池名称'"
        />
      </div>

      <div class="form-group">
        <label for="mountPoint">{{ $t('pool.mountPoint') || '挂载点' }}</label>
        <input
          id="mountPoint"
          v-model="form.mountPoint"
          type="text"
          class="form-input"
          :placeholder="$t('pool.mountPointPlaceholder') || '例如: /mnt/pool'"
        />
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-label">
          <input v-model="form.bootEnabled" type="checkbox" />
          <span>{{ $t('pool.bootEnabled') || '开机自动挂载' }}</span>
        </label>
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
          {{ $t('common.cancel') || '取消' }}
        </button>
        <button @click="createPool" class="btn-create" :disabled="creating">
          <span v-if="creating" class="spinner-small"></span>
          {{ creating ? ($t('common.creating') || '创建中...') : ($t('common.create') || '创建') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { storageApi } from '@/api/storage'

const { t } = useI18n()
const router = useRouter()

const form = reactive({
  name: '',
  mountPoint: '',
  bootEnabled: true,
})

const error = ref('')
const creating = ref(false)

const goBack = () => {
  router.push('/storage/pool')
}

const createPool = async () => {
  if (!form.name.trim()) {
    error.value = t('pool.poolNameRequired') || '请输入存储池名称'
    return
  }

  creating.value = true
  error.value = ''

  try {
    const response = await storageApi.createPool(
      form.name.trim(),
      form.mountPoint.trim(),
      form.bootEnabled
    )
    if (response.success) {
      router.push('/storage/pool')
    } else {
      error.value = response.error || (t('pool.createFailed') || '创建失败')
    }
  } catch (err: any) {
    error.value = err.message || (t('pool.createFailed') || '创建失败')
  } finally {
    creating.value = false
  }
}
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
