import apiClient from './axios'

export interface DirShare {
  name: string
  type: string
}

export interface ZfsShare {
  dataset: string
}

export interface ListDirSharesResponse {
  success: boolean
  shares: DirShare[]
  message: string
  error: string | null
}

export interface ListZfsSharesResponse {
  success: boolean
  shares: ZfsShare[]
  message: string
  error: string | null
}

export interface ZfsShareInfoResponse {
  success: boolean
  data: Record<string, any>
  error: string | null
}

export interface CloseZfsShareResponse {
  success: boolean
  message?: string
  error: string | null
}

export const sambaApi = {
  listDirShares(): Promise<ListDirSharesResponse> {
    return apiClient.get('/smb/list_dir_shares').then(res => res.data)
  },
  listZfsShares(): Promise<ListZfsSharesResponse> {
    return apiClient.get('/smb/list_zfs_shares').then(res => res.data)
  },
  getZfsShareInfo(dataset: string): Promise<ZfsShareInfoResponse> {
    return apiClient.get(`/zfs/zfs_share_info?dataset=${encodeURIComponent(dataset)}`).then(res => res.data)
  },
  closeZfsShare(dataset: string): Promise<CloseZfsShareResponse> {
    return apiClient.post('/smb/close_zfs_share', { dataset }).then(res => res.data)
  },
}
