import apiClient from './axios'

export interface SystemActionResponse {
  success: boolean
  message?: string
}

export const systemApi = {
  reboot(): Promise<SystemActionResponse> {
    return apiClient.post('/system/reboot').then((res) => res.data)
  },
  shutdown(): Promise<SystemActionResponse> {
    return apiClient.post('/system/shutdown').then((res) => res.data)
  },
}
