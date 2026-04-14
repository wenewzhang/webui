import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/create-admin',
      name: 'CreateAdmin',
      component: () => import('@/views/CreateAdminView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/components/SidebarLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/storage',
      children: [
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/UsersView.vue'),
          meta: { title: 'Users' },
        },
        {
          path: 'storage',
          redirect: '/storage/all',
          children: [
            {
              path: 'all',
              name: 'StorageAll',
              component: () => import('@/views/AllStorage.vue'),
              meta: { title: 'Storage - All' },
            },
            {
              path: 'pool',
              name: 'StoragePool',
              component: () => import('@/views/PoolStorage.vue'),
              meta: { title: 'Storage - Pool' },
            },
            {
              path: 'pool/create',
              name: 'PoolCreate',
              component: () => import('@/views/PoolCreater.vue'),
              meta: { title: 'Create Pool' },
            },
            {
              path: 'pool/:name',
              name: 'PoolView',
              component: () => import('@/views/PoolView.vue'),
              meta: { title: 'Pool Details' },
            },
            {
              path: 'pool/advanced',
              name: 'PoolAdvancedSetting',
              component: () => import('@/views/PoolAdvancedSetting.vue'),
              meta: { title: 'Pool Advanced Settings' },
            },
            {
              path: 'pool/chkpoint',
              name: 'PoolChkpoint',
              component: () => import('@/views/PoolChkpoint.vue'),
              meta: { title: 'Pool Checkpoint' },
            },
            {
              path: 'pool/devices',
              name: 'PoolDevices',
              component: () => import('@/views/PoolDevices.vue'),
              meta: { title: 'Pool Devices' },
            },
            {
              path: 'datasets',
              name: 'StorageDataset',
              component: () => import('@/views/DatasetView.vue'),
              meta: { title: 'Storage - Datasets' },
            },
            {
              path: 'dataset/advanced',
              name: 'DatasetAdvancedSetting',
              component: () => import('@/views/DatasetAdvancedSetting.vue'),
              meta: { title: 'Dataset Advanced Settings' },
            },
          ],
        },
        {
          path: 'samba',
          name: 'Samba',
          component: () => import('@/views/SambaView.vue'),
          meta: { title: 'Samba' },
        },
        {
          path: 'apps',
          name: 'Apps',
          component: () => import('@/views/AppsView.vue'),
          meta: { title: 'Apps' },
        },
        {
          path: 'system/restart',
          name: 'SystemRestart',
          component: () => import('@/views/SystemView.vue'),
          meta: { title: 'System Restart' },
        },
        {
          path: 'system/shutdown',
          name: 'SystemShutdown',
          component: () => import('@/views/SystemView.vue'),
          meta: { title: 'System Shutdown' },
        },
      ],
    },
  ],
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if (to.meta.public && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
