<template>
  <div class="bg-white shadow rounded-lg p-6">
    <!-- Toast -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @update:show="toast.show = $event"
    />

    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('dockerContainers.createContainer') }}</h2>
      <button
        @click="goBack"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ $t('common.back') }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <svg class="animate-spin h-5 w-5 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-gray-600 mt-2 block">{{ $t('common.loading') }}</span>
    </div>

    <div v-else class="space-y-6">
      <!-- Image -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('dockerContainers.image') }} *
        </label>
        <select
          v-model="selectedImage"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">{{ $t('dockerContainers.selectImage') }}</option>
          <option v-for="img in images" :key="img" :value="img">{{ img }}</option>
        </select>
      </div>

      <!-- Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('dockerContainers.name') }} *
        </label>
        <input
          v-model="containerName"
          type="text"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          :placeholder="$t('dockerContainers.namePlaceholder')"
        />
      </div>

      <!-- Environment Variables -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('dockerContainers.envVars') }}
          </label>
          <button
            @click="addEnvVar"
            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
          >
            + {{ $t('common.add') }}
          </button>
        </div>
        <div v-if="envVars.length === 0" class="text-sm text-gray-500">
          {{ $t('dockerContainers.noEnvVars') }}
        </div>
        <div v-for="(item, index) in envVars" :key="index" class="flex gap-2 mb-2">
          <input
            v-model="item.key"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="$t('dockerContainers.envKey')"
          />
          <input
            v-model="item.value"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="$t('dockerContainers.envValue')"
          />
          <button
            @click="removeEnvVar(index)"
            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>

      <!-- Port Mappings -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('dockerContainers.ports') }}
          </label>
          <button
            @click="addPort"
            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
          >
            + {{ $t('common.add') }}
          </button>
        </div>
        <div v-if="ports.length === 0" class="text-sm text-gray-500">
          {{ $t('dockerContainers.noPorts') }}
        </div>
        <div v-for="(item, index) in ports" :key="index" class="flex gap-2 mb-2">
          <input
            v-model="item.host_port"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="$t('dockerContainers.hostPort')"
          />
          <input
            v-model="item.container_port"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="$t('dockerContainers.containerPort')"
          />
          <button
            @click="removePort(index)"
            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>

      <!-- Volume Mappings -->
      <div>
        <div class="flex items-center justify-between mb-2">
          <label class="block text-sm font-medium text-gray-700">
            {{ $t('dockerContainers.volumes') }}
          </label>
          <button
            @click="addVolume"
            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none"
          >
            + {{ $t('common.add') }}
          </button>
        </div>
        <div v-if="volumes.length === 0" class="text-sm text-gray-500">
          {{ $t('dockerContainers.noVolumes') }}
        </div>
        <div v-for="(item, index) in volumes" :key="index" class="flex gap-2 mb-2 items-center">
          <select
            v-model="item.mountpoint"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">{{ $t('dockerContainers.selectDatasetMountpoint') }}</option>
            <option v-for="ds in datasets" :key="ds.mountpoint" :value="ds.mountpoint">{{ ds.mountpoint }}</option>
          </select>
          <input
            v-model="item.dir_name"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="$t('dockerContainers.dirName')"
          />
          <input
            v-model="item.container_path"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            :placeholder="$t('dockerContainers.containerPath')"
          />
          <label class="flex items-center space-x-1 text-sm text-gray-700 whitespace-nowrap">
            <input
              v-model="item.read_only"
              type="checkbox"
              class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <span>{{ $t('dockerContainers.readOnly') }}</span>
          </label>
          <button
            @click="removeVolume(index)"
            class="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none"
          >
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>

      <!-- Restart Policy -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ $t('dockerContainers.restartPolicy') }}
        </label>
        <select
          v-model="restartPolicy"
          class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="no">no</option>
          <option value="always">always</option>
          <option value="unless-stopped">unless-stopped</option>
          <option value="on-failure">on-failure</option>
        </select>
      </div>

      <!-- Auto Start -->
      <div class="flex items-center">
        <input
          v-model="autoStart"
          type="checkbox"
          class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label class="ml-2 block text-sm font-medium text-gray-700">
          {{ $t('dockerContainers.autoStart') }}
        </label>
      </div>

      <!-- Buttons -->
      <div class="flex justify-end space-x-3 pt-4">
        <button
          @click="goBack"
          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="handleCreate"
          :disabled="saving || !selectedImage || !containerName"
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="saving" class="animate-spin h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {{ saving ? $t('common.creating') : $t('common.create') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { dockerApi, type DockerCreateContainerRequest } from '@/api/docker'
import { sambaApi } from '@/api/samba'
import Toast from '@/components/Toast.vue'
import { permissionDeniedMessage } from '@/utils/permissionUtils'

const { t } = useI18n()
const router = useRouter()

const loading = ref(false)
const saving = ref(false)
const images = ref<string[]>([])
const datasets = ref<{ name: string; mountpoint: string }[]>([])

const selectedImage = ref('')
const containerName = ref('')
const envVars = ref<{ key: string; value: string }[]>([])
const ports = ref<{ host_port: string; container_port: string }[]>([])
const volumes = ref<{ mountpoint: string; dir_name: string; container_path: string; read_only: boolean }[]>([])
const restartPolicy = ref('always')
const autoStart = ref(true)

const toast = reactive({
  show: false,
  message: '',
  type: 'success' as 'success' | 'error'
})

const showToast = (message: string, type: 'success' | 'error' = 'error') => {
  toast.message = message || t('error.unknown')
  toast.type = type
  toast.show = true
}

const fetchImages = async () => {
  loading.value = true
  try {
    const res = await dockerApi.getImages()
    if (res.success) {
      const tags: string[] = []
      res.images.forEach((img) => {
        if (img.repo_tags && img.repo_tags.length > 0) {
          tags.push(...img.repo_tags)
        }
      })
      images.value = tags
    } else {
      showToast(res.message || t('dockerContainers.loadImagesFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('error.unknown'))
  } finally {
    loading.value = false
  }
}

const fetchDatasets = async () => {
  try {
    const res = await sambaApi.listSambaDatasets()
    if (res.success) {
      datasets.value = res.data || []
    }
  } catch (err: any) {
    // silent fail
  }
}

const addEnvVar = () => {
  envVars.value.push({ key: '', value: '' })
}

const removeEnvVar = (index: number) => {
  envVars.value.splice(index, 1)
}

const addPort = () => {
  ports.value.push({ host_port: '', container_port: '' })
}

const removePort = (index: number) => {
  ports.value.splice(index, 1)
}

const addVolume = () => {
  volumes.value.push({ mountpoint: '', dir_name: '', container_path: '', read_only: false })
}

const removeVolume = (index: number) => {
  volumes.value.splice(index, 1)
}

const handleCreate = async () => {
  if (!selectedImage.value || !containerName.value) return
  saving.value = true
  try {
    const env: Record<string, string> = {}
    envVars.value.forEach((item) => {
      if (item.key) env[item.key] = item.value
    })

    const validPorts = ports.value.filter((p) => p.host_port && p.container_port)
    const validVolumes = volumes.value
      .filter((v) => (v.mountpoint || v.dir_name) && v.container_path)
      .map((v) => ({
        host_path: v.mountpoint ? v.mountpoint + '/' + v.dir_name : v.dir_name,
        container_path: v.container_path,
        read_only: v.read_only
      }))

    const req: DockerCreateContainerRequest = {
      image: selectedImage.value,
      name: containerName.value,
      env: Object.keys(env).length > 0 ? env : undefined,
      ports: validPorts.length > 0 ? validPorts : undefined,
      volumes: validVolumes.length > 0 ? validVolumes : undefined,
      restart_policy: restartPolicy.value,
      auto_start: autoStart.value,
    }

    const res = await dockerApi.createContainer(req)
    if (res.success) {
      router.push('/apps/docker-containers')
    } else {
      showToast(res.message || t('dockerContainers.createFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || t('error.unknown'))
  } finally {
    saving.value = false
  }
}

const goBack = () => {
  router.push('/apps/docker-containers')
}

onMounted(() => {
  fetchImages()
  fetchDatasets()
})
</script>
