import apiClient from './axios'

export interface Dataset {
  name: string
  used: string
  avail: string
  refer: string
  mountpoint: string | null
}

export interface DatasetsResponse {
  success: boolean
  data: Dataset[]
  error: string | null
}

export interface DestroyDatasetResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface CloneDatasetResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface PromoteDatasetResponse {
  success: boolean
  message?: string
  error: string | null
}

export interface BootfsResponse {
  success: boolean
  data: string
  error: string | null
}

export interface CreateDatasetResponse {
  success: boolean
  message?: string
  error: string | null
}

export const datasetApi = {
  getDatasets(): Promise<DatasetsResponse> {
    return apiClient.get('/zfs/datasets').then(res => res.data)
  },
  deleteDataset(datasetName: string): Promise<DestroyDatasetResponse> {
    return apiClient.post('/zfs/destroy', { dataset: datasetName }).then(res => res.data)
  },
  cloneDataset(newName: string, dataset: string): Promise<CloneDatasetResponse> {
    return apiClient.post('/zfs/clone', { new_name: newName, dataset }).then(res => res.data)
  },
  promoteDataset(datasetName: string): Promise<PromoteDatasetResponse> {
    return apiClient.post('/zfs/prompt', { dataset: datasetName }).then(res => res.data)
  },
  getBootfs(): Promise<BootfsResponse> {
    return apiClient.get('/zfs/bootfs').then(res => res.data)
  },
  createDataset(oldDataset: string, newName: string): Promise<CreateDatasetResponse> {
    return apiClient.post('/zfs/create_dataset', { old_dataset: oldDataset, new_name: newName }).then(res => res.data)
  },
  setBootfs(dataset: string, pool: string): Promise<BootfsResponse> {
    return apiClient.post('/zfs/set_bootfs', { dataset, pool }).then(res => res.data)
  },
}
