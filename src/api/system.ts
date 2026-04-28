import apiClient from './axios'

export interface SystemActionResponse {
  success: boolean
  message?: string
}

export interface RecommendedApp {
  name: string
  url: string
  icon_url: string
  stars: string
  description: string
  cn_description: string
}

export interface RecommendedAppsResponse {
  success: boolean
  data?: RecommendedApp[]
  message?: string
}

export const systemApi = {
  reboot(): Promise<SystemActionResponse> {
    return apiClient.post('/system/reboot').then((res) => res.data)
  },
  reboot_force(): Promise<SystemActionResponse> {
    return apiClient.post('/system/reboot_force').then((res) => res.data)
  },
  shutdown(): Promise<SystemActionResponse> {
    return apiClient.post('/system/shutdown').then((res) => res.data)
  },
  recommendedApps(): Promise<RecommendedAppsResponse> {
    return apiClient.get('/system/recommended_apps').then((res) => res.data)
  },
}
