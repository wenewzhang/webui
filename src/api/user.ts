import apiClient from './axios'
import type { LoginRequest, LoginResponse, ListUsersResponse, ChangeAdminPasswordRequest, ChangeAdminPasswordResponse, ChangeSambaPasswordRequest, ChangeSambaPasswordResponse } from '@/types/user'

export const userApi = {
  // 登录
  login(data: LoginRequest): Promise<LoginResponse> {
    return apiClient.post('/login', data).then((res) => res.data)
  },

  // 登出
  logout(): Promise<{ success: boolean; message: string }> {
    return apiClient.post('/logout').then((res) => res.data)
  },

  // 检查是否有管理员
  hasAdmin(): Promise<{ has_admin: boolean }> {
    return apiClient.get('/has_admin').then((res) => res.data)
  },

  // 创建管理员
  createAdmin(data: { name: string; type_: string; password: string }): Promise<{ success: boolean; message: string; system_user_created?: boolean }> {
    return apiClient.post('/admin_user', data).then((res) => res.data)
  },

  // 获取用户列表
  listUsers(): Promise<ListUsersResponse> {
    return apiClient.get('/list_users').then((res) => res.data)
  },

  // 修改管理员密码
  changeAdminPassword(data: ChangeAdminPasswordRequest): Promise<ChangeAdminPasswordResponse> {
    return apiClient.post('/change_admin_passwd', data).then((res) => res.data)
  },

  // 修改Samba用户密码
  changeSambaPassword(data: ChangeSambaPasswordRequest): Promise<ChangeSambaPasswordResponse> {
    return apiClient.post('/smb/change_passwd', data).then((res) => res.data)
  },
}
