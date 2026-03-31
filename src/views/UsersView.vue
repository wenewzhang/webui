<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('nav.users') }}</h2>
      <button
        @click="handleRefresh"
        :disabled="userStore.usersLoading"
        class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {{ $t('common.refresh') }}
      </button>
    </div>

    <div v-if="userStore.usersLoading" class="text-center py-8">
      <div class="inline-flex items-center px-4 py-2">
        <svg class="animate-spin h-5 w-5 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="text-gray-600">{{ $t('common.loading') }}</span>
      </div>
    </div>

    <div v-else-if="userStore.usersError" class="text-center py-8">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
        <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-red-600">{{ userStore.usersError }}</p>
    </div>

    <div v-else-if="userStore.users.length === 0" class="text-center py-8">
      <div class="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
        <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </div>
      <p class="text-gray-500">{{ $t('users.noUsers') || 'No users found' }}</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.name') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.type') || 'Type' }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('users.password') || 'Password' }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ $t('common.action') || 'Action' }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(user, index) in userStore.users" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <span class="text-indigo-600 font-medium text-sm">{{ user.name.charAt(0).toUpperCase() }}</span>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="[
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                user.type_ === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ user.type_ }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                @click="handleChangePassword(user)"
                class="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {{ $t('users.changePassword') || 'Change Password' }}
              </button>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button
                class="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {{ $t('users.deleteAccount') || 'Delete Account' }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Admin Password Change Modal -->
  <div v-if="showAdminPasswordModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeModal"></div>

      <!-- Modal panel -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
              {{ $t('users.changeAdminPassword') || 'Change Admin Password' }}
            </h3>
            <div class="mt-4 space-y-4">
              <!-- Old Password -->
              <div>
                <label for="old-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.oldPassword') || 'Old Password' }}
                </label>
                <input
                  id="old-password"
                  v-model="passwordForm.oldPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.oldPassword') || 'Old Password'"
                />
              </div>
              <!-- New Password -->
              <div>
                <label for="new-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.newPassword') || 'New Password' }}
                </label>
                <input
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.newPassword') || 'New Password'"
                />
              </div>
              <!-- Confirm New Password -->
              <div>
                <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.confirmNewPassword') || 'Confirm New Password' }}
                </label>
                <input
                  id="confirm-password"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.confirmNewPassword') || 'Confirm New Password'"
                />
              </div>
              <!-- Error Message -->
              <div v-if="passwordError" class="text-sm text-red-600">
                {{ passwordError }}
              </div>
              <!-- Success Message -->
              <div v-if="passwordSuccess" class="text-sm text-green-600">
                {{ passwordSuccess }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="submitChangePassword"
            :disabled="changingPassword"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            <svg v-if="changingPassword" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ $t('common.confirm') || 'Confirm' }}
          </button>
          <button
            type="button"
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            {{ $t('common.cancel') || 'Cancel' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import type { UserInfo } from '@/types/user'

const userStore = useUserStore()

// Modal state
const showAdminPasswordModal = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')

// Password form
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const handleRefresh = () => {
  userStore.listUsers()
}

const handleChangePassword = (user: UserInfo) => {
  if (user.type_ === 'admin') {
    // Show admin password change modal
    showAdminPasswordModal.value = true
    // Reset form
    passwordForm.oldPassword = ''
    passwordForm.newPassword = ''
    passwordForm.confirmPassword = ''
    passwordError.value = ''
    passwordSuccess.value = ''
  } else {
    // Handle regular user password change (not implemented yet)
    alert('Regular user password change not implemented yet')
  }
}

const closeModal = () => {
  showAdminPasswordModal.value = false
  passwordError.value = ''
  passwordSuccess.value = ''
}

const submitChangePassword = async () => {
  // Validation
  if (!passwordForm.oldPassword) {
    passwordError.value = 'Please enter old password'
    return
  }
  if (!passwordForm.newPassword) {
    passwordError.value = 'Please enter new password'
    return
  }
  if (!passwordForm.confirmPassword) {
    passwordError.value = 'Please confirm new password'
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = 'New passwords do not match'
    return
  }

  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    const response = await userApi.changeAdminPassword({
      old_password: passwordForm.oldPassword,
      new_password: passwordForm.newPassword,
    })

    if (response.success) {
      passwordSuccess.value = response.message || 'Password changed successfully'
      // Clear form after success
      setTimeout(() => {
        closeModal()
      }, 1500)
    } else {
      passwordError.value = response.message || 'Failed to change password'
    }
  } catch (err: any) {
    passwordError.value = err.response?.data?.message || 'Failed to change password'
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  userStore.listUsers()
})
</script>
