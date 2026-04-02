import apiClient from './axios'

export interface DiskChild {
  name: string
  size: string
  type: string
  mountpoint: string | null
  children: DiskChild[] | null
}

export interface Disk {
  name: string
  size: string
  type: string
  mountpoint: string | null
  children: DiskChild[] | null
}

export interface DisksResponse {
  success: boolean
  data: Disk[]
  error: string | null
}

export interface DeleteDiskResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface PartDiskResponse {
  success: boolean
  message?: string
  error: string | null
}

export const storageApi = {
  getDisks(): Promise<DisksResponse> {
    return apiClient.get('/get_disks').then(res => res.data)
  },
  deleteDisk(diskName: string): Promise<DeleteDiskResponse> {
    return apiClient.post('/delete_disk', { disk_name: diskName }).then(res => res.data)
  },
  partDisk(diskName: string, size: string): Promise<PartDiskResponse> {
    return apiClient.post('/part_disk', { disk_name: diskName, size }).then(res => res.data)
  },
}
