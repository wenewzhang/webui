import apiClient from './axios'

export interface DockerSearchResult {
  name: string
  stars: string
  official: string
  description: string
}

export interface DockerSearchResponse {
  success: boolean
  message?: string
  results: DockerSearchResult[]
}

export const dockerApi = {
  search(imageName: string): Promise<DockerSearchResponse> {
    return apiClient
      .post('/docker/search', { image_name: imageName })
      .then((res) => res.data)
  },
}
