import axios from 'axios'
import { useUserStore } from '@/stores/user'
import i18n from '@/i18n'

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://localhost:8443',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  // 允许自签名证书（开发环境）
  withCredentials: false,
})

// 请求拦截器 - 添加 token
apiClient.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器 - 处理错误
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    // 500 错误返回服务器错误信息，让业务代码处理
    if (error.response?.status === 500 && error.response?.data) {
      return Promise.resolve(error.response)
    }
    // i18n 化错误消息
    if (error.response?.status) {
      error.message = i18n.global.t('error.requestFailed', { status: error.response.status })
    }
    return Promise.reject(error)
  }
)

export default apiClient
