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

export interface DockerImage {
  id: string
  repo_tags: string[]
  created: number
  size: number
}

export interface DockerImagesResponse {
  success: boolean
  message?: string
  images: DockerImage[]
}

export interface DockerDeleteImageResponse {
  success: boolean
  message?: string
}

export interface DockerContainer {
  id: string
  name: string
  image: string
  status: string
  created: number
}

export interface DockerContainersResponse {
  success: boolean
  message?: string
  containers: DockerContainer[]
}

export interface DockerContainerActionResponse {
  success: boolean
  message?: string
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
  getImages(): Promise<DockerImagesResponse> {
    return apiClient
      .get('/docker/get_images')
      .then((res) => res.data)
  },
  deleteImage(imageId: string): Promise<DockerDeleteImageResponse> {
    return apiClient
      .delete(`/docker/delete_image/${imageId}`)
      .then((res) => res.data)
  },
  getContainers(): Promise<DockerContainersResponse> {
    return apiClient
      .get('/docker/containers')
      .then((res) => res.data)
  },
  stopContainer(containerId: string): Promise<DockerContainerActionResponse> {
    return apiClient
      .post('/docker/stop', { container_id: containerId })
      .then((res) => res.data)
  },
  startContainer(containerId: string): Promise<DockerContainerActionResponse> {
    return apiClient
      .post('/docker/start', { container_id: containerId })
      .then((res) => res.data)
  },
  restartContainer(containerId: string): Promise<DockerContainerActionResponse> {
    return apiClient
      .delete('/docker/retart', { container_id: containerId })
      .then((res) => res.data)
  },
  removeContainer(containerId: string): Promise<DockerContainerActionResponse> {
    return apiClient
      .post('/docker/remove', { container_id: containerId })
      .then((res) => res.data)
  },
  startPod(podName: string): Promise<DockerContainerActionResponse> {
    return apiClient
      .post(`/podman/pod/start/${podName}`)
      .then((res) => res.data)
  },
  stopPod(podName: string): Promise<DockerContainerActionResponse> {
    return apiClient
      .post(`/podman/pod/stop/${podName}`)
      .then((res) => res.data)
  },
  removePod(podName: string): Promise<DockerContainerActionResponse> {
    return apiClient
      .post(`/podman/pod/remove/${podName}`)
      .then((res) => res.data)
  },
}
