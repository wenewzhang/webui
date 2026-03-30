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
      redirect: '/disks',
      children: [
        {
          path: 'users',
          name: 'Users',
          component: () => import('@/views/UsersView.vue'),
          meta: { title: 'Users' },
        },
        {
          path: 'disks',
          name: 'Disks',
          component: () => import('@/views/DisksView.vue'),
          meta: { title: 'Disks' },
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
