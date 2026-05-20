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

export interface UpdateStatusResponse {
  success: boolean
  status: string
  task_id?: string
  error?: null | string
}

export interface UpdateCheckResponse {
  success: boolean
  update_available: boolean
  current_version: string
  latest_version: string
  error: null | string
}

export interface UpdateDownloadStartResponse {
  success: boolean
  task_id?: string
  message?: string
  error?: string
}

export interface UpdateDownloadProgressResponse {
  success: boolean
  task?: {
    task_id: string
    status: string
    progress: number
    downloaded_bytes: number
    total_bytes: number
    filename: string
    file_path: string
    message: string
    created_at: number
    updated_at: number
  }
  status?: string
  progress?: number
  message?: string
  detail?: string
  error?: string
}

export interface UpdateDownloadStopResponse {
  success: boolean
  message?: string
  error?: string
}

export interface UpgradeProgressResponse {
  success: boolean
  data?: {
    progress: number
    state: string
  }
  message?: string
  error?: string
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
  updateStatus(): Promise<UpdateStatusResponse> {
    return apiClient.get('/system/update_status').then((res) => res.data)
  },
  updateCheck(): Promise<UpdateCheckResponse> {
    return apiClient.get('/system/update_check').then((res) => res.data)
  },
  updateDownloadStart(): Promise<UpdateDownloadStartResponse> {
    return apiClient.post('/system/update_download/start').then((res) => res.data)
  },
  updateDownloadProgress(taskId: string): Promise<UpdateDownloadProgressResponse> {
    return apiClient.get(`/system/update_download/task/${taskId}`).then((res) => res.data)
  },
  updateDownloadStop(taskId: string): Promise<UpdateDownloadStopResponse> {
    return apiClient.post('/system/update_download/stop', { task_id: taskId }).then((res) => res.data)
  },
  updateDownloadUpgrade(filePath: string): Promise<SystemActionResponse> {
    return apiClient.post('/system/update_download/upgrade', { file_path: filePath }).then((res) => res.data)
  },
  upgradeProgress(): Promise<UpgradeProgressResponse> {
    return apiClient.get('/system/upgrade/progress').then((res) => res.data)
  },
}
