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
  canmount: string
  mountpoint: string
}

export interface PoolsResponse {
  success: boolean
  data: Pool[]
  error: string | null
}

export interface ExportPoolResponse {
  success: boolean
  message?: string
  error: string | null
}

export type OfflinePool = string

export interface OfflinePoolsResponse {
  success: boolean
  data: OfflinePool[]
  error: string | null
}

export interface ImportPoolRequest {
  poolname: string
  mount_point: string
  boot_enabled: boolean
}

export interface ImportPoolResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface CreatePoolResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface FreeDisk {
  name: string
  size: string
  type: string
}

export interface FreeDisksResponse {
  success: boolean
  data: FreeDisk[]
  error: string | null
}

export interface FreePart {
  name: string
  size: string
  type: string
}

export interface FreePartsResponse {
  success: boolean
  data: FreePart[]
  error: string | null
}

export interface PoolAdvancedSettingResponse {
  success: boolean
  data: Record<string, string>
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
  exportPool(poolName: string): Promise<ExportPoolResponse> {
    return apiClient.post('/zfs/export_pool', { poolname: poolName }).then(res => res.data)
  },
  getOfflinePools(): Promise<OfflinePoolsResponse> {
    return apiClient.get('/zfs/offline_pools').then(res => res.data)
  },
  importPool(poolName: string, mountPoint: string, bootEnabled: boolean): Promise<ImportPoolResponse> {
    return apiClient.post('/zfs/import_pool', {
      poolname: poolName,
      mount_point: mountPoint,
      boot_enabled: bootEnabled
    }).then(res => res.data)
  },
  createPool(poolName: string, poolType: string, devices: string[]): Promise<CreatePoolResponse> {
    return apiClient.post('/create_pool', {
      pool_name: poolName,
      pool_type: poolType,
      devices: devices
    }).then(res => res.data)
  },
  getFreeDisks(): Promise<FreeDisksResponse> {
    return apiClient.get('/get_free_disks').then(res => res.data)
  },
  getFreeParts(): Promise<FreePartsResponse> {
    return apiClient.get('/get_free_parts').then(res => res.data)
  },
  getPoolAdvancedSetting(poolName: string): Promise<PoolAdvancedSettingResponse> {
    return apiClient.get('/zfs/pool_advanced_setting', { params: { dataset: poolName } }).then(res => res.data)
  },
}
