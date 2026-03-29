import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/user'
import type { LoginRequest, User } from '@/types/user'

export const useUserStore = defineStore(
  'user',
  () => {
    // State
    const user = ref<User | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)

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
        const message = err.response?.data?.message || '登录失败，请稍后重试'
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

    function clearError() {
      error.value = null
    }

    return {
      user,
      loading,
      error,
      isLoggedIn,
      username,
      token,
      login,
      logout,
      clearError,
    }
  },
  {
    persist: true,
  }
)
