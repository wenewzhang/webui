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
  active: string
  enabled: string
}

export interface ServicesStatusResponse {
  success: boolean
  data?: ServiceStatus[]
  message?: string
}

export interface SshSetting {
  permit_root_login: string
  password_authentication: string
}

export interface SshSettingResponse {
  success: boolean
  data?: SshSetting
  error?: null | string
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
  serviceStart(service_name: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_start', { service_name }).then((res) => res.data)
  },
  serviceRestart(service_name: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_restart', { service_name }).then((res) => res.data)
  },
  serviceStop(service_name: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_stop', { service_name }).then((res) => res.data)
  },
  serviceSetConfig(service_name: string, config: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_config', { service_name, config }).then((res) => res.data)
  },
  serviceSetAutostart(service_name: string, enable: boolean): Promise<SystemActionResponse> {
    return apiClient.post('/system/service_autostart', { service_name, enable }).then((res) => res.data)
  },
  getSshSetting(): Promise<SshSettingResponse> {
    return apiClient.get('/system/ssh_setting').then((res) => res.data)
  },
  setSshSetting(setting: SshSetting): Promise<SystemActionResponse> {
    return apiClient.post('/system/ssh_setting', setting).then((res) => res.data)
  },
}
