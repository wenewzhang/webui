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

export const sambaApi = {
  listDirShares(): Promise<ListDirSharesResponse> {
    return apiClient.get('/smb/list_dir_shares').then(res => res.data)
  },
  listZfsShares(): Promise<ListZfsSharesResponse> {
    return apiClient.get('/smb/list_zfs_shares').then(res => res.data)
  },
}
