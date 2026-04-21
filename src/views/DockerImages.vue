<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('route.dockerImages') }}</h2>
      <button
        @click="fetchImages"
        :disabled="loading"
        class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>

    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <div v-if="message" class="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
      {{ message }}
    </div>

    <div v-if="images.length > 0" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerSearch.name') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              ID
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('common.action') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in images" :key="item.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm text-gray-900">
              <div class="space-y-1">
                <span
                  v-for="tag in item.repo_tags"
                  :key="tag"
                  class="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs mr-1"
                >
                  {{ tag }}
                </span>
                <span v-if="!item.repo_tags || item.repo_tags.length === 0" class="text-gray-400">
                  &lt;none&gt;
                </span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
              {{ item.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button
                @click="handleDelete(item.id)"
                :disabled="deletingMap[item.id]"
                class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  v-if="deletingMap[item.id]"
                  class="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {{ $t('common.delete') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="!loading" class="text-center py-8 text-gray-500">
      {{ $t('dockerSearch.noResults') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { dockerApi } from '@/api/docker'

const { t } = useI18n()

interface DockerImage {
  id: string
  repo_tags: string[]
}

const images = ref<DockerImage[]>([])
const loading = ref(false)
const error = ref('')
const message = ref('')
const deletingMap = ref<Record<string, boolean>>({})

const fetchImages = async () => {
  loading.value = true
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.getImages()
    if (res.success) {
      images.value = res.images || []
    } else {
      error.value = res.message || t('dockerSearch.searchFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerSearch.searchFailed')
  } finally {
    loading.value = false
  }
}

const handleDelete = async (imageId: string) => {
  if (!confirm(t('dockerImages.deleteConfirm', { id: imageId }))) {
    return
  }

  deletingMap.value[imageId] = true
  error.value = ''
  message.value = ''

  try {
    const res = await dockerApi.deleteImage(imageId)
    if (res.success) {
      message.value = t('dockerImages.deleteSuccess', { id: imageId })
      images.value = images.value.filter((img) => img.id !== imageId)
    } else {
      error.value = res.message || t('dockerImages.deleteFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerImages.deleteFailed')
  } finally {
    deletingMap.value[imageId] = false
  }
}

onMounted(() => {
  fetchImages()
})
</script>
