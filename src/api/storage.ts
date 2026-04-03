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

export interface ClearLabelResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface Pool {
  name: string
  size: string
  alloc: string
  free: string
  ckpoint: string
  expandsz: string
  frag: string
  cap: string
  dedup: string
  health: string
  altroot: string
}

export interface PoolsResponse {
  success: boolean
  data: Pool[]
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
  clearLabel(partitionName: string): Promise<ClearLabelResponse> {
    return apiClient.post('/label_clear', { partition_name: partitionName }).then(res => res.data)
  },
  getOnlinePools(): Promise<PoolsResponse> {
    return apiClient.get('/zfs/online_pools').then(res => res.data)
  },
}
