import apiClient from './axios'

export interface Dataset {
  name: string
  used: string
  available: string
  referenced: string
  mountpoint: string | null
}

export interface DatasetsResponse {
  success: boolean
  data: Dataset[]
  error: string | null
}

export const datasetApi = {
  getDatasets(): Promise<DatasetsResponse> {
    return apiClient.get('/zfs/datasets').then(res => res.data)
  },
}
