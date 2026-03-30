import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/user'
import type { LoginRequest, User, UserInfo } from '@/types/user'
import i18n from '@/i18n'

// 获取 i18n t 函数
const t = i18n.global.t

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const users = ref<UserInfo[]>([])
    const usersLoading = ref(false)
    const usersError = ref<string | null>(null)

    // Getters
    const isLoggedIn = computed(() => !!user.value?.token)
    const username = computed(() => user.value?.username || '')
    const token = computed(() => user.value?.token || '')

    // Actions
    async function login(loginData: LoginRequest) {
      loading.value = true
      error.value = null

      try {
        const response = await userApi.login(loginData)

        if (response.success && response.token) {
          user.value = {
            username: loginData.username,
            token: response.token,
          }
          return { success: true, message: response.message }
        } else {
          error.value = response.message
          return { success: false, message: response.message }
        }
      } catch (err: any) {
        // 根据错误类型返回不同的错误信息
        let message: string
        if (!err.response) {
          // 网络错误
          message = t('error.networkError')
        } else if (err.response.status === 401) {
          message = err.response.data?.message || t('error.unauthorized')
        } else if (err.response.status === 403) {
          message = t('error.forbidden')
        } else if (err.response.status === 404) {
          message = t('error.notFound')
        } else if (err.response.status >= 500) {
          message = t('error.serverError')
        } else {
          message = err.response.data?.message || t('error.unknown')
        }
        error.value = message
        return { success: false, message }
      } finally {
        loading.value = false
      }
    }

    async function logout() {
      try {
        await userApi.logout()
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        user.value = null
        error.value = null
      }
    }

    async function listUsers() {
      usersLoading.value = true
      usersError.value = null

      try {
        const response = await userApi.listUsers()
        if (response.success) {
          users.value = response.users
        } else {
          usersError.value = response.message
        }
      } catch (err: any) {
        let message: string
        if (!err.response) {
          message = t('error.networkError')
        } else {
          message = err.response.data?.message || t('error.unknown')
        }
        usersError.value = message
      } finally {
        usersLoading.value = false
      }
    }

    function clearError() {
      error.value = null
    }

    return {
      user,
      loading,
      error,
      users,
      usersLoading,
      usersError,
      isLoggedIn,
      username,
      token,
      login,
      logout,
      listUsers,
      clearError,
    }
  },
  {
    persist: true,
  }
)
