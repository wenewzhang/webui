import apiClient from './axios'
import type { LoginRequest, LoginResponse } from '@/types/user'

export const userApi = {
  // 登录
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/login', data).then((res) => res.data)
  },

  // 登出
  logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/logout').then((res) => res.data)
  },
}
