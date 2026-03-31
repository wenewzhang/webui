<template>
  <div class="bg-white shadow rounded-lg p-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ $t('nav.users') }}</h2>
      <div class="flex items-center space-x-3">
        <button
          @click="openAddUserModal"
          class="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('users.addUser') || 'Add User' }}
        </button>
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
              {{ currentUser?.type_ === 'samba' ? $t('users.changeSambaPasswordTitle') : $t('users.changePasswordTitle') }}
            </h3>
            <div class="mt-4 space-y-4">
              <!-- Old Password (admin only) -->
              <div v-if="currentUser?.type_ === 'admin'">
                <label for="old-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.oldPassword') }}
                </label>
                <input
                  id="old-password"
                  v-model="passwordForm.oldPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.oldPassword')"
                />
              </div>
              <!-- New Password -->
              <div>
                <label for="new-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.newPassword') }}
                </label>
                <input
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.newPassword')"
                />
              </div>
              <!-- Confirm New Password -->
              <div>
                <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.confirmPassword') }}
                </label>
                <input
                  id="confirm-password"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.confirmPassword')"
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

  <!-- Add User Modal -->
  <div v-if="showAddUserModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="add-user-modal-title" role="dialog" aria-modal="true">
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" @click="closeAddUserModal"></div>

      <!-- Modal panel -->
      <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
      <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="sm:flex sm:items-start">
          <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
            <svg class="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="add-user-modal-title">
              {{ $t('users.addUserTitle') || 'Add User' }}
            </h3>
            <div class="mt-4 space-y-4">
              <!-- User Type -->
              <div>
                <label for="add-user-type" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.userType') || 'User Type' }}
                </label>
                <select
                  id="add-user-type"
                  v-model="addUserForm.userType"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">{{ $t('users.pleaseSelectUserType') || 'Please select user type' }}</option>
                  <option value="share">share</option>
                  <option value="read">read</option>
                  <option value="samba">samba</option>
                </select>
              </div>
              <!-- Username -->
              <div>
                <label for="add-username" class="block text-sm font-medium text-gray-700">
                  {{ $t('common.username') }}
                </label>
                <input
                  id="add-username"
                  v-model="addUserForm.username"
                  type="text"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.enterUsername') || 'Please enter username'"
                />
              </div>
              <!-- Password -->
              <div>
                <label for="add-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('common.password') }}
                </label>
                <input
                  id="add-password"
                  v-model="addUserForm.password"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('common.password')"
                />
              </div>
              <!-- Confirm Password -->
              <div>
                <label for="add-confirm-password" class="block text-sm font-medium text-gray-700">
                  {{ $t('users.confirmPassword') }}
                </label>
                <input
                  id="add-confirm-password"
                  v-model="addUserForm.confirmPassword"
                  type="password"
                  class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  :placeholder="$t('users.confirmPassword')"
                />
              </div>
              <!-- Error Message -->
              <div v-if="addUserError" class="text-sm text-red-600">
                {{ addUserError }}
              </div>
              <!-- Success Message -->
              <div v-if="addUserSuccess" class="text-sm text-green-600">
                {{ addUserSuccess }}
              </div>
            </div>
          </div>
        </div>
        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="submitAddUser"
            :disabled="addingUser"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            <svg v-if="addingUser" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ $t('common.confirm') || 'Confirm' }}
          </button>
          <button
            type="button"
            @click="closeAddUserModal"
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
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import type { UserInfo } from '@/types/user'

const { t } = useI18n()
const userStore = useUserStore()

// Modal state
const showAdminPasswordModal = ref(false)
const changingPassword = ref(false)
const passwordError = ref('')
const passwordSuccess = ref('')
const currentUser = ref<UserInfo | null>(null)

// Password form
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Add user modal state
const showAddUserModal = ref(false)
const addingUser = ref(false)
const addUserError = ref('')
const addUserSuccess = ref('')

// Add user form
const addUserForm = reactive({
  userType: '',
  username: '',
  password: '',
  confirmPassword: '',
})

const handleRefresh = () => {
  userStore.listUsers()
}

const openAddUserModal = () => {
  showAddUserModal.value = true
  addUserForm.userType = ''
  addUserForm.username = ''
  addUserForm.password = ''
  addUserForm.confirmPassword = ''
  addUserError.value = ''
  addUserSuccess.value = ''
}

const closeAddUserModal = () => {
  showAddUserModal.value = false
  addUserError.value = ''
  addUserSuccess.value = ''
}

const submitAddUser = async () => {
  if (!addUserForm.userType) {
    addUserError.value = t('users.pleaseSelectUserType')
    return
  }
  if (!addUserForm.username.trim()) {
    addUserError.value = t('users.enterUsername')
    return
  }
  if (!addUserForm.password) {
    addUserError.value = t('users.enterNewPassword')
    return
  }
  if (!addUserForm.confirmPassword) {
    addUserError.value = t('users.confirmNewPassword')
    return
  }
  if (addUserForm.password !== addUserForm.confirmPassword) {
    addUserError.value = t('users.passwordsNotMatch')
    return
  }

  addingUser.value = true
  addUserError.value = ''
  addUserSuccess.value = ''

  try {
    let response
    if (addUserForm.userType === 'samba') {
      response = await userApi.addSambaUser({
        username: addUserForm.username.trim(),
        password: addUserForm.password,
      })
    } else {
      response = await userApi.addUser({
        username: addUserForm.username.trim(),
        password: addUserForm.password,
        user_type: addUserForm.userType,
      })
    }

    if (response.success) {
      if (response.message && response.message.includes('successfully')) {
        addUserSuccess.value = t('users.addUserSuccessWithUsername', { username: addUserForm.username.trim() })
      } else {
        addUserSuccess.value = response.message || t('users.addUserSuccess')
      }
      setTimeout(() => {
        closeAddUserModal()
        userStore.listUsers()
      }, 3500)
    } else {
      addUserError.value = response.message === 'Password too short' ? t('users.sambaPasswordTooShort') : (response.message || t('users.addUserFailed'))
    }
  } catch (err: any) {
    const msg = err.response?.data?.message
    if (msg === 'Password too short') {
      addUserError.value = t('users.sambaPasswordTooShort')
    } else {
      addUserError.value = msg || t('users.addUserFailed')
    }
  } finally {
    addingUser.value = false
  }
}

const handleChangePassword = (user: UserInfo) => {
  currentUser.value = user
  // Show password change modal
  showAdminPasswordModal.value = true
  // Reset form
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordError.value = ''
  passwordSuccess.value = ''
}

const closeModal = () => {
  showAdminPasswordModal.value = false
  passwordError.value = ''
  passwordSuccess.value = ''
  currentUser.value = null
}

const submitChangePassword = async () => {
  // Validation
  if (currentUser.value?.type_ === 'admin' && !passwordForm.oldPassword) {
    passwordError.value = t('users.enterOldPassword')
    return
  }
  if (!passwordForm.newPassword) {
    passwordError.value = t('users.enterNewPassword')
    return
  }
  if (!passwordForm.confirmPassword) {
    passwordError.value = t('users.confirmNewPassword')
    return
  }
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    passwordError.value = t('users.passwordsNotMatch')
    return
  }

  changingPassword.value = true
  passwordError.value = ''
  passwordSuccess.value = ''

  try {
    let response
    if (currentUser.value?.type_ === 'admin') {
      response = await userApi.changeAdminPassword({
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
      })
    } else if (currentUser.value?.type_ === 'samba') {
      response = await userApi.changeSambaPassword({
        username: currentUser.value.name,
        new_password: passwordForm.newPassword,
      })
    } else {
      passwordError.value = t('users.changeFailed')
      changingPassword.value = false
      return
    }

    if (response.success) {
      if (currentUser.value?.type_ === 'samba' && response.message?.includes("changed successfully")) {
        passwordSuccess.value = t('users.sambaChangeSuccess', { username: currentUser.value.name })
      } else {
        passwordSuccess.value = response.message || t('users.changeSuccess')
      }
      // Clear form after success
      setTimeout(() => {
        closeModal()
      }, 3500)
    } else {
      passwordError.value = response.message || t('users.changeFailed')
    }
  } catch (err: any) {
    const msg = err.response?.data?.message
    if (currentUser.value?.type_ === 'admin' && msg === 'Invalid old password') {
      passwordError.value = t('users.invalidOldPassword')
    } else if (currentUser.value?.type_ === 'samba' && msg === 'Password too short') {
      passwordError.value = t('users.sambaPasswordTooShort')
    } else {
      passwordError.value = msg || t('users.changeFailed')
    }
  } finally {
    changingPassword.value = false
  }
}

onMounted(() => {
  userStore.listUsers()
})
</script>
