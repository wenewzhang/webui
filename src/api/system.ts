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

export interface ServiceStatus {
  name: string
  status: string
  enabled: boolean
}

export interface ServicesStatusResponse {
  success: boolean
  data?: ServiceStatus[]
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
  servicesStatus(): Promise<ServicesStatusResponse> {
    return apiClient.get('/system/services_status').then((res) => res.data)
  },
  serviceStart(name: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_start', { name }).then((res) => res.data)
  },
  serviceRestart(name: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_restart', { name }).then((res) => res.data)
  },
  serviceStop(name: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_stop', { name }).then((res) => res.data)
  },
  serviceSetConfig(name: string, config: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_config', { name, config }).then((res) => res.data)
  },
  serviceSetAutostart(name: string, enable: boolean): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_autostart', { name, enable }).then((res) => res.data)
  },
}
