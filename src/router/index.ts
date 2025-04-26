// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import pb from '@/api/pocketbase'
const routes = [
  {
    path: '/',
    redirect: (to: any) => ({
      path: '/overview',
      query: to.query,
    }),
    meta: { requiresAuth: true },
  },
  {
    path: '/overview',
    name: 'Overview',
    component: () => import('@/views/Overview.vue'),
    meta: {
      requiresAuth: true,
      transition: 'fade',
    },
  },
  {
    path: '/lunch',
    name: 'LunchEditor',
    component: () => import('@/views/LunchEditor.vue'),
    meta: {
      requiresAuth: true,
      transition: 'slide-left',
    },
  },
  {
    path: '/dinner',
    name: 'DinnerEditor',
    component: () => import('@/views/DinnerEditor.vue'),
    meta: {
      requiresAuth: true,
      transition: 'slide-left',
    },
  },
  {
    path: '/soup',
    name: 'SoupEditor',
    component: () => import('@/views/SoupEditor.vue'),
    meta: {
      requiresAuth: true,
      transition: 'slide-left',
    },
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: {
      guestOnly: true,
      transition: 'slide-up',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

// router.ts
router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // 等待认证初始化完成
  if (!authStore.state.isInitialized) {
    await new Promise((resolve) => {
      const check = () => {
        if (authStore.state.isInitialized) resolve(true)
        else setTimeout(check, 50)
      }
      check()
    })
  }

  // 处理需要认证的页面
  if (to.meta.requiresAuth) {
    return pb.authStore.isValid
      ? true
      : {
          path: '/login',
          query: { redirect: to.fullPath },
          replace: true,
        }
  }

  // 处理已登录访问登录页
  if (to.meta.guestOnly && pb.authStore.isValid) {
    return {
      path: to.query.redirect?.toString() || '/overview',
      replace: true,
    }
  }

  return true
})

export default router
