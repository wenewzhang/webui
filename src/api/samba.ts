import apiClient from './axios'

export interface DirShare {
  name: string
  type: string
}

export interface ZfsShare {
  dataset: string
  owner: string
  permission: string
  guest_permission: string
  quota: string
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

export interface SambaUser {
  username: string
}

export interface ListSambaUsersResponse {
  success: boolean
  users: SambaUser[]
  message?: string
  error: string | null
}

export interface UpdateZfsShareResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface SambaDatasetsResponse {
  success: boolean
  data: { name: string; mountpoint: string }[]
  error: string | null
}

export interface PublicShareInfoResponse {
  success: boolean
  share_name: string
  path: string
  browseable: string
  read_only: string
  guest_ok: string
  message: string
  error: string | null
}

export interface UpdatePublicShareResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface PrivateShareInfoResponse {
  success: boolean
  share_name: string
  path: string
  browseable: string
  read_only: string
  valid_users?: string[]
  write_list?: string[]
  message: string
  error: string | null
}

export interface UpdatePrivateShareResponse {
  success: boolean
  message?: string
  error: string | null
}

export const sambaApi = {
  listDirShares(): Promise<ListDirSharesResponse> {
    return apiClient.get('/smb/list_dir_shares').then(res => res.data)
  },
  closeDirShare(share_name: string): Promise<{ success: boolean; error: string | null }> {
    return apiClient.post('/smb/remove_dir_share', { share_name }).then(res => res.data)
  },
  listZfsShares(): Promise<ListZfsSharesResponse> {
    return apiClient.get('/smb/list_zfs_shares').then(res => res.data)
  },
  getZfsShareInfo(dataset: string): Promise<ZfsShareInfoResponse> {
    return apiClient.get(`/zfs/zfs_share_info?dataset=${encodeURIComponent(dataset)}`).then(res => res.data)
  },
  closeZfsShare(dataset: string): Promise<CloseZfsShareResponse> {
    return apiClient.post('/zfs/close_zfs_share', { dataset }).then(res => res.data)
  },
  listUsers(): Promise<ListSambaUsersResponse> {
    return apiClient.post('/smb/list_users').then(res => res.data)
  },
  updateZfsShare(dataset: string, owner: string, permission: string, guest_permission: string): Promise<UpdateZfsShareResponse> {
    return apiClient.post('/smb/update_zfs_share', { dataset, owner, permission, guest_permission }).then(res => res.data)
  },
  listSambaDatasets(): Promise<SambaDatasetsResponse> {
    return apiClient.get('/zfs/samba_datasets').then(res => res.data)
  },
  createZfsShare(shareName: string, datasetName: string, quota: string, sambaUser: string): Promise<UpdateZfsShareResponse> {
    return apiClient.post('/smb/create_zfs_share', { share_name: shareName, dataset_name: datasetName, quota, samba_user: sambaUser }).then(res => res.data)
  },
  createPublicShare(directory: string, browseable: string, readOnly: string, guestOk: string): Promise<UpdateZfsShareResponse> {
    return apiClient.post('/smb/create_public_share', { directory, browseable, read_only: readOnly, guest_ok: guestOk }).then(res => res.data)
  },
  createPrivateShare(directory: string, browseable: string, readOnly: string, validUsers: string[], writeList: string[]): Promise<UpdateZfsShareResponse> {
    return apiClient.post('/smb/create_private_share', { directory, browseable, read_only: readOnly, valid_users: validUsers, write_list: writeList }).then(res => res.data)
  },
  getPublicShareInfo(share_name: string): Promise<PublicShareInfoResponse> {
    return apiClient.post('/smb/public_share_info', { share_name }).then(res => res.data)
  },
  getPrivateShareInfo(share_name: string): Promise<PrivateShareInfoResponse> {
    return apiClient.post('/smb/private_share_info', { share_name }).then(res => res.data)
  },
  updatePublicShare(share_name: string, browseable: string, read_only: string, guest_ok: string): Promise<UpdatePublicShareResponse> {
    return apiClient.post('/smb/update_public_share', { share_name, browseable, read_only, guest_ok }).then(res => res.data)
  },
  updatePrivateShare(share_name: string, browseable: string, read_only: string, valid_users: string[], write_list: string[]): Promise<UpdatePrivateShareResponse> {
    return apiClient.post('/smb/update_private_share', { share_name, browseable, read_only, valid_users, write_list }).then(res => res.data)
  },
}
