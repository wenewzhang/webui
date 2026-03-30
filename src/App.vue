<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'

const router = useRouter()
const userStore = useUserStore()

onMounted(async () => {
  if (userStore.isLoggedIn) {
    return
  }

  try {
    const response = await userApi.hasAdmin()
    if (response.has_admin) {
      router.push('/login')
    } else {
      router.push('/create-admin')
    }
  } catch {
    router.push('/login')
  }
})
</script>
