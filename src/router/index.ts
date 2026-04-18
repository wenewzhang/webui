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
          meta: { title: 'route.users' },
        },
        {
          path: 'storage',
          redirect: '/storage/all',
          children: [
            {
              path: 'all',
              name: 'StorageAll',
              component: () => import('@/views/AllStorage.vue'),
              meta: { title: 'route.storageAll' },
            },
            {
              path: 'pool',
              name: 'StoragePool',
              component: () => import('@/views/PoolStorage.vue'),
              meta: { title: 'route.storagePool' },
            },
            {
              path: 'pool/create',
              name: 'PoolCreate',
              component: () => import('@/views/PoolCreater.vue'),
              meta: { title: 'route.createPool' },
            },
            {
              path: 'pool/:name',
              name: 'PoolView',
              component: () => import('@/views/PoolView.vue'),
              meta: { title: 'route.poolDetails' },
            },
            {
              path: 'pool/advanced',
              name: 'PoolAdvancedSetting',
              component: () => import('@/views/PoolAdvancedSetting.vue'),
              meta: { title: 'route.poolAdvancedSettings' },
            },
            {
              path: 'pool/chkpoint',
              name: 'PoolChkpoint',
              component: () => import('@/views/PoolChkpoint.vue'),
              meta: { title: 'route.poolCheckpoint' },
            },
            {
              path: 'pool/devices',
              name: 'PoolDevices',
              component: () => import('@/views/PoolDevices.vue'),
              meta: { title: 'route.poolDevices' },
            },
            {
              path: 'datasets',
              name: 'StorageDataset',
              component: () => import('@/views/DatasetView.vue'),
              meta: { title: 'route.storageDatasets' },
            },
            {
              path: 'dataset/advanced',
              name: 'DatasetAdvancedSetting',
              component: () => import('@/views/DatasetAdvancedSetting.vue'),
              meta: { title: 'route.datasetAdvancedSettings' },
            },
          ],
        },
        {
          path: 'samba',
          name: 'Samba',
          component: () => import('@/views/SambaView.vue'),
          meta: { title: 'route.samba' },
        },
        {
          path: 'samba/dir/create',
          name: 'SambaDirCreate',
          component: () => import('@/views/SambaDirShareView.vue'),
          meta: { title: 'route.createDirSambaShare' },
        },
        {
          path: 'samba/zfs/create',
          name: 'SambaZfsCreate',
          component: () => import('@/views/SambaZFSCreater.vue'),
          meta: { title: 'route.createZfsSambaShare' },
        },
        {
          path: 'apps',
          name: 'Apps',
          component: () => import('@/views/AppsView.vue'),
          meta: { title: 'route.apps' },
        },
        {
          path: 'system/restart',
          name: 'SystemRestart',
          component: () => import('@/views/SystemView.vue'),
          meta: { title: 'route.systemRestart' },
        },
        {
          path: 'system/shutdown',
          name: 'SystemShutdown',
          component: () => import('@/views/SystemView.vue'),
          meta: { title: 'route.systemShutdown' },
        },
        {
          path: 'system/reboot_force',
          name: 'SystemRebootForce',
          component: () => import('@/views/SystemView.vue'),
          meta: { title: 'route.systemForceRestart' },
        },
        {
          path: 'terminal',
          name: 'Terminal',
          component: () => import('@/views/TerminalView.vue'),
          meta: { title: 'route.terminal' },
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
