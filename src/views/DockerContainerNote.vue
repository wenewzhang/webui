<template>
  <div class="bg-white shadow rounded-lg p-6">
    <!-- Toast -->
    <Toast
      :show="toast.show"
      :message="toast.message"
      :type="toast.type"
      @update:show="toast.show = $event"
    />

    <!-- Confirm Modal for delete -->
    <ConfirmModal
      :show="showConfirmModal"
      :title="t('dockerContainers.deleteNoteConfirmTitle') || 'Confirm Delete'"
      :message="t('dockerContainers.deleteNoteConfirm', { id: pendingDeleteId }) || `Are you sure you want to delete note ${pendingDeleteId}?`"
      :confirm-text="t('common.confirm')"
      :cancel-text="t('common.cancel')"
      @confirm="onConfirmDelete"
      @cancel="onCancelDelete"
    />

    <!-- View Note Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showViewModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeViewModal"></div>
          <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
              <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 class="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  {{ t('dockerContainers.viewNote') || 'View Note' }} - {{ viewingNoteId }}
                </h3>
                <div v-if="viewNoteLoading" class="flex justify-center py-8">
                  <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <div v-else class="bg-gray-900 p-4 overflow-x-auto max-h-[500px] overflow-y-auto rounded-md">
                  <pre class="text-xs text-gray-100 font-mono leading-relaxed whitespace-pre-wrap break-all">{{ formattedViewNote }}</pre>
                </div>
              </div>
              <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  @click="closeViewModal"
                  class="inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:w-auto"
                >
                  {{ t('common.close') || 'Close' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1.5">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          {{ $t('common.back') }}
        </button>
        <h2 class="text-2xl font-bold text-gray-900">{{ $t('dockerContainers.notesTitle') }}</h2>
      </div>
      <button
        @click="fetchNotes"
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

    <!-- Notes List -->
    <div v-if="loading && !notes.length" class="flex justify-center py-12">
      <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <div v-else-if="!notes.length" class="text-center py-8 text-gray-500">
      {{ $t('dockerContainers.noNotes') }}
    </div>

    <div v-else class="overflow-hidden rounded-md border border-gray-200">
      <ul class="divide-y divide-gray-200">
        <li
          v-for="note in notes"
          :key="note"
          class="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
        >
          <span class="text-sm font-medium text-gray-900">{{ note }}</span>
          <div class="flex items-center gap-2">
            <button
              @click="handleView(note)"
              class="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ $t('common.view') || 'View' }}
            </button>
            <button
              @click="handleImport(note)"
              class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {{ $t('common.import') || 'Import' }}
            </button>
            <button
              @click="handleDelete(note)"
              class="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {{ $t('common.delete') || 'Delete' }}
            </button>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { dockerApi } from '@/api/docker'
import Toast from '@/components/Toast.vue'
import ConfirmModal from '@/components/ConfirmModal.vue'
import { permissionDeniedMessage } from '@/utils/permissionUtils'

const { t } = useI18n()
const router = useRouter()

const notes = ref<string[]>([])
const loading = ref(false)

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

const showConfirmModal = ref(false)
const pendingDeleteId = ref('')

const showViewModal = ref(false)
const viewingNoteId = ref('')
const viewNoteContent = ref<any>(null)
const viewNoteLoading = ref(false)

const formattedViewNote = computed(() => {
  return viewNoteContent.value ? JSON.stringify(viewNoteContent.value, null, 2) : ''
})

const fetchNotes = async () => {
  loading.value = true
  try {
    const res = await dockerApi.getNotes()
    if (res.success && res.notes) {
      notes.value = res.notes
    } else {
      showToast(res.message || t('dockerContainers.fetchNotesFailed'))
      notes.value = []
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('dockerContainers.fetchNotesFailed'))
    notes.value = []
  } finally {
    loading.value = false
  }
}

const handleView = async (noteId: string) => {
  viewingNoteId.value = noteId
  showViewModal.value = true
  viewNoteLoading.value = true
  viewNoteContent.value = null
  try {
    const res = await dockerApi.getNote(noteId)
    if (res.success) {
      viewNoteContent.value = res
    } else {
      showToast(res.message || t('dockerContainers.fetchNoteFailed'))
      closeViewModal()
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('dockerContainers.fetchNoteFailed'))
    closeViewModal()
  } finally {
    viewNoteLoading.value = false
  }
}

const closeViewModal = () => {
  showViewModal.value = false
  viewingNoteId.value = ''
  viewNoteContent.value = null
}

const handleImport = async (noteId: string) => {
  try {
    const res = await dockerApi.getNote(noteId)
    if (res.success) {
      localStorage.setItem('importContainerNote', JSON.stringify(res))
      router.push('/apps/docker-containers/create')
    } else {
      showToast(res.message || t('dockerContainers.fetchNoteFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('dockerContainers.fetchNoteFailed'))
  }
}

const handleDelete = (noteId: string) => {
  pendingDeleteId.value = noteId
  showConfirmModal.value = true
}

const onConfirmDelete = async () => {
  showConfirmModal.value = false
  const noteId = pendingDeleteId.value
  if (!noteId) return

  try {
    const res = await dockerApi.deleteNote(noteId)
    if (res.success) {
      showToast(res.message || t('dockerContainers.deleteNoteSuccess'), 'success')
      notes.value = notes.value.filter(n => n !== noteId)
    } else {
      showToast(res.message || t('dockerContainers.deleteNoteFailed'))
    }
  } catch (err: any) {
    const msg = permissionDeniedMessage(t, err.response?.data)
    showToast(msg || err.message || t('dockerContainers.deleteNoteFailed'))
  } finally {
    pendingDeleteId.value = ''
  }
}

const onCancelDelete = () => {
  showConfirmModal.value = false
  pendingDeleteId.value = ''
}

onMounted(() => {
  fetchNotes()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
