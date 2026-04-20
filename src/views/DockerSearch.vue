<template>
  <div class="bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-4">{{ $t('route.dockerSearch') }}</h2>

    <!-- 搜索栏 -->
    <div class="flex items-center gap-3 mb-6">
      <input
        v-model="searchQuery"
        type="text"
        class="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        :placeholder="$t('dockerSearch.placeholder')"
        @keyup.enter="handleSearch"
      />
      <button
        @click="handleSearch"
        :disabled="loading"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg
          v-if="loading"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ $t('common.search') }}
      </button>
    </div>

    <!-- 提示信息 -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
      {{ error }}
    </div>

    <div v-if="message" class="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
      {{ message }}
    </div>

    <!-- 搜索结果表格 -->
    <div v-if="results.length > 0" class="overflow-x-auto">
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
              {{ $t('dockerSearch.stars') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerSearch.official') }}
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ $t('dockerSearch.description') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="item in results" :key="item.name" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ item.stars }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <span
                v-if="item.official"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
              >
                {{ item.official }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-500">
              {{ item.description }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="searched && !loading" class="text-center py-8 text-gray-500">
      {{ $t('dockerSearch.noResults') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { dockerApi } from '@/api/docker'

const { t } = useI18n()

const searchQuery = ref('')
const loading = ref(false)
const results = ref<any[]>([])
const message = ref('')
const error = ref('')
const searched = ref(false)

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) return

  loading.value = true
  error.value = ''
  message.value = ''
  results.value = []
  searched.value = true

  try {
    const res = await dockerApi.search(query)
    if (res.success) {
      results.value = res.results || []
      message.value = res.message || ''
    } else {
      error.value = res.message || t('dockerSearch.searchFailed')
    }
  } catch (err: any) {
    error.value = err.message || t('dockerSearch.searchFailed')
  } finally {
    loading.value = false
  }
}
</script>
