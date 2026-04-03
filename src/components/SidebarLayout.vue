<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- 左侧导航栏 -->
    <aside :class="[
      'bg-white border-r border-gray-200 flex flex-col fixed h-full z-10 transition-all duration-300',
      isCollapsed ? 'w-12' : 'w-64'
    ]">
      <!-- Logo 和 切换按钮 -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <!-- Logo -->
        <div class="flex items-center overflow-hidden">
          <div class="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <span v-show="!isCollapsed" class="ml-3 text-lg font-bold text-gray-900 truncate whitespace-nowrap">
            Zuti Storage
          </span>
        </div>
        <!-- 展开/收缩按钮 -->
        <button
          @click="toggleSidebar"
          class="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          :title="isCollapsed ? $t('common.expand') : $t('common.fold')"
        >
          <svg v-if="isCollapsed" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- 菜单 -->
      <nav class="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        <div v-for="item in menuItems" :key="item.path">
          <!-- 有子菜单的项 -->
          <div v-if="item.children">
            <button
              @click="toggleSubmenu(item.path)"
              :class="[
                'w-full group flex items-center rounded-md transition-colors',
                isCollapsed ? 'justify-start py-3 px-1.5' : 'px-3 py-2.5',
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              ]"
              :title="$t(`nav.${item.name}`)"
            >
              <component :is="item.icon" :class="[
                'h-5 w-5 flex-shrink-0',
                isCollapsed ? '' : 'mr-3',
                isActive(item.path) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
              ]" />
              <span v-show="!isCollapsed" class="flex-1 text-sm font-medium whitespace-nowrap">
                {{ $t(`nav.${item.name}`) }}
              </span>
              <svg v-show="!isCollapsed" :class="[
                'h-4 w-4 transition-transform',
                openSubmenus.includes(item.path) ? 'rotate-180' : ''
              ]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <!-- 子菜单 -->
            <div v-show="!isCollapsed && openSubmenus.includes(item.path)" class="ml-4 mt-1 space-y-1">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                :class="[
                  'group flex items-center rounded-md transition-colors px-3 py-2',
                  isActive(child.path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                ]"
              >
                <component :is="child.icon" :class="[
                  'h-4 w-4 flex-shrink-0 mr-2',
                  isActive(child.path) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
                ]" />
                <span class="text-sm">{{ $t(`nav.${child.name}`) }}</span>
              </router-link>
            </div>
          </div>
          <!-- 普通菜单项 -->
          <router-link
            v-else
            :to="item.path"
            :class="[
              'group flex items-center rounded-md transition-colors',
              isCollapsed ? 'justify-start py-3 px-1.5' : 'px-3 py-2.5',
              isActive(item.path)
                ? 'bg-indigo-50 text-indigo-700'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            ]"
            :title="$t(`nav.${item.name}`)"
          >
            <component :is="item.icon" :class="[
              'h-5 w-5 flex-shrink-0',
              isCollapsed ? '' : 'mr-3',
              isActive(item.path) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500'
            ]" />
            <span v-show="!isCollapsed" class="text-sm font-medium whitespace-nowrap">
              {{ $t(`nav.${item.name}`) }}
            </span>
          </router-link>
        </div>
      </nav>

      <!-- 底部信息 -->
      <div v-show="!isCollapsed" class="px-4 py-4 border-t border-gray-200">
        <p class="text-xs text-gray-500 text-center">
          {{ $t('footer.copyright') }}
        </p>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', isCollapsed ? 'ml-12' : 'ml-64']">
      <!-- 顶部栏 -->
      <header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20">
        <h1 class="text-lg font-semibold text-gray-900">
          {{ pageTitle }}
        </h1>
        <div class="flex items-center space-x-4">
          <LanguageSwitcher />
          <span class="text-sm text-gray-600">{{ userStore.username }}</span>
          <button
            @click="handleLogout"
            class="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg class="mr-1.5 -ml-0.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {{ $t('common.logout') }}
          </button>
        </div>
      </header>

      <!-- 页面内容 -->
      <main class="flex-1 p-6 overflow-auto">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import LanguageSwitcher from './LanguageSwitcher.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 侧边栏展开/收缩状态
const isCollapsed = ref(false)
const openSubmenus = ref<string[]>([])

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleSubmenu = (path: string) => {
  const index = openSubmenus.value.indexOf(path)
  if (index > -1) {
    openSubmenus.value.splice(index, 1)
  } else {
    openSubmenus.value.push(path)
  }
}

const UsersIcon = () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z' })
])
const StorageIcon = () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4' })
])
const StorageAllIcon = () => h('svg', { class: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' })
])
const StorageIdleIcon = () => h('svg', { class: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })
])
const StoragePoolIcon = () => h('svg', { class: 'h-4 w-4', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
])
const SambaIcon = () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z' })
])
const AppsIcon = () => h('svg', { class: 'h-5 w-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' }, [
  h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' })
])

const menuItems = [
  { name: 'users', path: '/users', icon: UsersIcon },
  {
    name: 'storage',
    path: '/storage',
    icon: StorageIcon,
    children: [
      { name: 'storageAll', path: '/storage/all', icon: StorageAllIcon },
      { name: 'storagePool', path: '/storage/pool', icon: StoragePoolIcon },
      { name: 'storageIdle', path: '/storage/idle', icon: StorageIdleIcon },
    ]
  },
  { name: 'samba', path: '/samba', icon: SambaIcon },
  { name: 'apps', path: '/apps', icon: AppsIcon },
]

const isActive = (path: string) => route.path === path || route.path.startsWith(path + '/')

const pageTitle = computed(() => {
  const current = menuItems.find(item => isActive(item.path))
  return current ? route.meta.title || current.name : ''
})

const handleLogout = async () => {
  await userStore.logout()
  router.push('/login')
}
</script>
