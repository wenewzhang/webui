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

export interface SetPoolPrimaryCacheResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolQuotaResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolMountpointResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolRecordsizeResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolAtimeResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolRelatimeResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolReadonlyResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolAclmodeResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolAcltypeResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolAclinheritResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolCanmountResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolLogbiasResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolCompressionResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolSyncResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SetPoolChecksumResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface Checkpoint {
  pool: string
  property: string
  value: string
  source: string
}

export interface CheckpointsResponse {
  success: boolean
  data: Checkpoint
  error: string | null
}

export interface CreateCheckpointResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface DeleteCheckpointResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface RollbackCheckpointResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface PoolDevice {
  name: string
  size: string
}

export interface PoolDevicesResponse {
  success: boolean
  data: PoolDevice[]
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
  setPoolPrimaryCache(poolName: string, value: string): Promise<SetPoolPrimaryCacheResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, primarycache: value }).then(res => res.data)
  },
  setPoolQuota(poolName: string, value: string): Promise<SetPoolQuotaResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, quota: value }).then(res => res.data)
  },
  setPoolMountpoint(poolName: string, value: string): Promise<SetPoolMountpointResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, mountpoint: value }).then(res => res.data)
  },
  setPoolRecordsize(poolName: string, value: string): Promise<SetPoolRecordsizeResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, recordsize: value }).then(res => res.data)
  },
  setPoolAtime(poolName: string, value: string): Promise<SetPoolAtimeResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, atime: value }).then(res => res.data)
  },
  setPoolRelatime(poolName: string, value: string): Promise<SetPoolRelatimeResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, relatime: value }).then(res => res.data)
  },
  setPoolReadonly(poolName: string, value: string): Promise<SetPoolReadonlyResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, readonly: value }).then(res => res.data)
  },
  setPoolAclmode(poolName: string, value: string): Promise<SetPoolAclmodeResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, aclmode: value }).then(res => res.data)
  },
  setPoolAcltype(poolName: string, value: string): Promise<SetPoolAcltypeResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, acltype: value }).then(res => res.data)
  },
  setPoolAclinherit(poolName: string, value: string): Promise<SetPoolAclinheritResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, aclinherit: value }).then(res => res.data)
  },
  setPoolCanmount(poolName: string, value: string): Promise<SetPoolCanmountResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, canmount: value }).then(res => res.data)
  },
  setPoolLogbias(poolName: string, value: string): Promise<SetPoolLogbiasResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, logbias: value }).then(res => res.data)
  },
  setPoolCompression(poolName: string, value: string): Promise<SetPoolCompressionResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, compression: value }).then(res => res.data)
  },
  setPoolSync(poolName: string, value: string): Promise<SetPoolSyncResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, sync: value }).then(res => res.data)
  },
  setPoolChecksum(poolName: string, value: string): Promise<SetPoolChecksumResponse> {
    return apiClient.post('/zfs/pool_advanced_setting', { dataset: poolName, checksum: value }).then(res => res.data)
  },
  getCheckpoints(poolName: string): Promise<CheckpointsResponse> {
    return apiClient.get('/chk/checkpoint', { params: { poolname: poolName } }).then(res => res.data)
  },
  createCheckpoint(poolName: string): Promise<CreateCheckpointResponse> {
    return apiClient.post('/chk/checkpoint', { poolname: poolName }).then(res => res.data)
  },
  deleteCheckpoint(poolName: string): Promise<DeleteCheckpointResponse> {
    return apiClient.delete('/chk/checkpoint', { data: { poolname: poolName } }).then(res => res.data)
  },
  rollbackCheckpoint(poolName: string): Promise<RollbackCheckpointResponse> {
    return apiClient.post('/chk/rollback', { poolname: poolName }).then(res => res.data)
  },
  getPoolDevices(poolName: string): Promise<PoolDevicesResponse> {
    return apiClient.get('/zfs/get_pool_devices', { params: { poolname: poolName } }).then(res => res.data)
  },
}
