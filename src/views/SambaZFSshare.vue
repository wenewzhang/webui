<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <!-- 背景遮罩 -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="onClose"
        ></div>

        <!-- 内容容器 -->
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <!-- Modal 内容 -->
          <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <!-- 图标 -->
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zM8.25 9.75h.008v.008H8.25V9.75zm0 4.5h.008v.008H8.25v-.008z" />
                  </svg>
                </div>
                <!-- 文本内容 -->
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                    {{ $t('samba.zfsShareInfoTitle', { dataset }) }}
                  </h3>
                  <div class="mt-4">
                    <!-- 加载状态 -->
                    <div v-if="loading" class="flex items-center justify-center py-8">
                      <svg class="animate-spin h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="text-gray-600">{{ $t('common.loading') }}</span>
                    </div>

                    <!-- 错误状态 -->
                    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4">
                      <p class="text-sm text-red-700">{{ error }}</p>
                    </div>

                    <!-- 数据展示 -->
                    <div v-else-if="shareInfo" class="border border-gray-200 rounded-md overflow-hidden">
                      <table class="min-w-full divide-y divide-gray-200">
                        <tbody class="bg-white divide-y divide-gray-200">
                          <tr v-for="(value, key) in flattenedInfo" :key="key" class="hover:bg-gray-50">
                            <td class="px-4 py-2 text-sm font-medium text-gray-900 w-1/3 bg-gray-50">
                              {{ $t(`samba.${key}`) }}
                            </td>
                            <td class="px-4 py-2 text-sm text-gray-700 break-all">
                              <template v-if="key === 'owner'">
                                <select
                                  v-if="users.length"
                                  v-model="shareInfo[key]"
                                  class="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                  <option v-for="user in users" :key="user.username" :value="user.username">
                                    {{ user.username }}
                                  </option>
                                </select>
                                <span v-else-if="usersLoading" class="text-gray-400">{{ $t('common.loading') }}</span>
                                <span v-else>{{ formatValue(value) }}</span>
                              </template>
                              <template v-else-if="key === 'permission' || key === 'guest_permission'">
                                <select
                                  v-model="shareInfo[key]"
                                  class="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                >
                                  <option value="write">{{ $t('samba.permissionWrite') }}</option>
                                  <option value="readonly">{{ $t('samba.permissionReadonly') }}</option>
                                </select>
                              </template>
                              <template v-else>
                                {{ formatValue(value) }}
                              </template>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- 无数据 -->
                    <div v-else class="text-center py-8 text-gray-500">
                      {{ $t('samba.noZfsShareInfo') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- 按钮区域 -->
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="button"
                @click="onConfirm"
                :disabled="saving"
                class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg v-if="saving" class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ saving ? $t('common.saving') : $t('samba.confirmEdit') }}
              </button>
              <button
                type="button"
                @click="onClose"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {{ $t('common.close') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { sambaApi } from '@/api/samba'

const { t } = useI18n()

interface Props {
  show: boolean
  dataset: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', success: boolean, message?: string): void
}>()

const loading = ref(false)
const error = ref('')
const shareInfo = ref<Record<string, any> | null>(null)
const users = ref<{ username: string }[]>([])
const usersLoading = ref(false)
const saving = ref(false)

const flattenedInfo = computed(() => {
  if (!shareInfo.value) return {}
  const result: Record<string, string> = {}
  const flatten = (obj: any, prefix = '') => {
    if (obj === null || obj === undefined) {
      result[prefix] = '-'
      return
    }
    if (typeof obj !== 'object') {
      result[prefix] = String(obj)
      return
    }
    if (Array.isArray(obj)) {
      result[prefix] = obj.join(', ')
      return
    }
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key
      flatten(value, newKey)
    })
  }
  flatten(shareInfo.value)
  return result
})

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return String(value)
}

const fetchShareInfo = async () => {
  if (!props.dataset) return
  loading.value = true
  error.value = ''
  shareInfo.value = null
  try {
    const res = await sambaApi.getZfsShareInfo(props.dataset)
    if (res.success) {
      shareInfo.value = res.data || null
    } else {
      error.value = res.error || t('samba.loadZfsShareInfoFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('error.unknown')
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  usersLoading.value = true
  try {
    const res = await sambaApi.listUsers()
    if (res.success) {
      users.value = res.users || []
    }
  } catch (err: any) {
    // 静默失败，降级为纯文本展示
  } finally {
    usersLoading.value = false
  }
}

const onClose = () => {
  emit('close')
}

const onConfirm = async () => {
  if (!shareInfo.value || !props.dataset) return
  saving.value = true
  error.value = ''
  try {
    const res = await sambaApi.updateZfsShare(
      props.dataset,
      shareInfo.value.owner || '',
      shareInfo.value.permission || '',
      shareInfo.value.guest_permission || ''
    )
    if (res.success) {
      emit('saved', true, t('samba.updateZfsShareSuccess'))
    } else {
      const errMsg = res.error || t('samba.updateZfsShareFailed')
      emit('saved', false, errMsg)
    }
  } catch (err: any) {
    const errMsg = err.message || t('error.unknown')
    emit('saved', false, errMsg)
  } finally {
    saving.value = false
  }
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    fetchShareInfo()
    fetchUsers()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
