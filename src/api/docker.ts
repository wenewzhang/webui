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

export interface DockerPullStartResponse {
  success: boolean
  message?: string
  task_id?: string
}

export interface DockerPullTaskResponse {
  success: boolean
  message?: string
  status?: string
  progress?: string
  [key: string]: any
}

export const dockerApi = {
  search(imageName: string): Promise<DockerSearchResponse> {
    return apiClient
      .post('/docker/search', { image_name: imageName })
      .then((res) => res.data)
  },
  pullImageStart(imageName: string): Promise<DockerPullStartResponse> {
    return apiClient
      .post('/docker/pull_image/start', { image_name: imageName })
      .then((res) => res.data)
  },
  getPullImageTask(taskId: string): Promise<DockerPullTaskResponse> {
    return apiClient
      .get(`/docker/pull_image/task/${taskId}`)
      .then((res) => res.data)
  },
}
