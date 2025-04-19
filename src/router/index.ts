import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const routes = [
  {
    path: '/login',
    component: () => import('@/views/Login.vue'),
  },
  {
    path: '/',
    component: () => import('@/views/Main.vue'),
    meta: { requiresAuth: true },
    children: [
      // 保持原有配置
      { path: 'lunch', component: () => import('@/views/LunchEditor.vue') },
      { path: 'dinner', component: () => import('@/views/DinnerEditor.vue') },
      { path: 'soup', component: () => import('@/views/SoupEditor.vue') },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router
