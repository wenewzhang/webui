<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- 背景遮罩 -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          @click="onCancel"
        ></div>

        <!-- 内容容器 -->
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <!-- Modal 内容 -->
          <div
            class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
          >
            <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <!-- 图标 -->
                <div
                  class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"
                >
                  <svg
                    class="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z"
                    />
                  </svg>
                </div>
                <!-- 文本内容 -->
                <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                  <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
                    SSH {{ $t('common.settings') }}
                  </h3>
                  <div class="mt-4 space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ $t('sshSettings.permitRootLogin') }}
                      </label>
                      <select
                        v-model="form.permit_root_login"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                      >
                        <option value="yes">{{ $t('common.yes') }}</option>
                        <option value="no">{{ $t('common.no') }}</option>
                        <option value="prohibit-password">{{ $t('sshSettings.prohibitPassword') }}</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        {{ $t('sshSettings.passwordAuthentication') }}
                      </label>
                      <select
                        v-model="form.password_authentication"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                      >
                        <option value="yes">{{ $t('common.yes') }}</option>
                        <option value="no">{{ $t('common.no') }}</option>
                      </select>
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
                class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                :disabled="saving"
              >
                <svg
                  v-if="saving"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {{ $t('common.save') }}
              </button>
              <button
                type="button"
                @click="onCancel"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              >
                {{ $t('common.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { systemApi, type SshSetting } from '@/api/system'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  show: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const saving = ref(false)

const form = ref<SshSetting>({
  permit_root_login: 'yes',
  password_authentication: 'yes'
})

const fetchSetting = async () => {
  try {
    const res = await systemApi.getSshSetting()
    if (res.success && res.data) {
      form.value = {
        permit_root_login: res.data.permit_root_login || 'yes',
        password_authentication: res.data.password_authentication || 'yes'
      }
    }
  } catch (err: any) {
    console.error('Failed to fetch SSH setting:', err)
  }
}

watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      fetchSetting()
    }
  }
)

const onConfirm = async () => {
  saving.value = true
  try {
    const res = await systemApi.setSshSetting(form.value)
    if (res.success) {
      emit('confirm')
    }
  } catch (err: any) {
    console.error('Failed to save SSH setting:', err)
  } finally {
    saving.value = false
  }
}

const onCancel = () => {
  emit('cancel')
}
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
