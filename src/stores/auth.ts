// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import pb from '@/api/pocketbase'
import type { ClientResponseError } from 'pocketbase'

interface PBUser extends Record<string, any> {
  id: string
  collectionId: string
  collectionName: 'users'
  created: string
  updated: string
  username: string
  email: string
  verified: boolean
  name?: string
  avatar?: string
}

interface AuthState {
  isInitialized: boolean
  user: PBUser | null
  rememberMe: boolean
  isAuthenticated: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  const state = ref<AuthState>({
    isInitialized: false,
    user: null,
    rememberMe: localStorage.getItem('pb_remember') === 'true',
    isAuthenticated: false,
  })

  // 新认证状态同步逻辑
  const syncAuthStore = () => {
    // 完全同步 PocketBase 状态到 Pinia
    state.value.user = pb.authStore.model as PBUser | null
    state.value.isAuthenticated = pb.authStore.isValid // 新增状态字段
    // 持久化处理（新版方式）
    if (state.value.rememberMe && pb.authStore.isValid) {
      const authData = {
        token: pb.authStore.token,
        model: pb.authStore.model,
      }
      localStorage.setItem('pb_auth', JSON.stringify(authData))
    } else if (!pb.authStore.isValid) {
      localStorage.removeItem('pb_auth')
    }
  }

  // 初始化方法（支持服务端直连）
  const initializeAuth = () => {
    // 从localStorage加载认证状态
    const savedAuth = localStorage.getItem('pb_auth')
    if (savedAuth) {
      try {
        const { token, model } = JSON.parse(savedAuth)
        if (token && model) {
          pb.authStore.save(token, model)
        }
      } catch (e) {
        console.error('Failed to load auth state:', e)
        localStorage.removeItem('pb_auth')
      }
    }
    // 自动登录检查（合并到初始化流程）
    if (state.value.rememberMe && pb.authStore.isValid) {
      autoLogin() // 直接调用自动登录
    }

    // 注册实时同步
    pb.authStore.onChange(() => {
      syncAuthStore()
      if (!pb.authStore.isValid) {
        router.replace('/login')
      }
    }, true)

    state.value.isInitialized = true
  }

  // 增强登录方法
  const login = async (credentials: { identity: string; password: string }) => {
    try {
      console.log('Auth store: 开始登录...')
      // 直接使用邮箱/用户名混合登录
      const authData = await pb
        .collection('users')
        .authWithPassword(credentials.identity, credentials.password)

      console.log('Auth store: PocketBase登录成功')

      // 设置记住我选项
      if (state.value.rememberMe) {
        localStorage.setItem('pb_remember', 'true')
      } else {
        localStorage.removeItem('pb_remember')
      }

      // 移除自动跳转逻辑，让调用者处理
      return authData.record
    } catch (err) {
      console.error('Auth store: 登录失败', err)
      const error = err as ClientResponseError
      handleLoginError(error)
      throw error
    }
  }

  // 错误处理模块化
  const handleLoginError = (error: ClientResponseError) => {
    let message = '登录失败'

    if (error.status === 400) {
      if (error.data?.identity?.message) {
        message = error.data.identity.message
      } else if (error.data?.password?.message) {
        message = error.data.password.message
      }
    } else if (error.status === 0) {
      message = '无法连接服务器，请检查网络'
    }

    ElMessage.error(message)
  }

  // Token自动刷新（优化版）
  const startAutoRefresh = () => {
    setInterval(async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh()
        } catch (_) {
          logout()
        }
      }
    }, 3540 * 1000) // 每59分钟刷新（避免token过期）
  }

  // 登出处理（增强清理）
  const logout = () => {
    pb.authStore.clear()
    state.value.user = null
    localStorage.removeItem('pb_auth')
    localStorage.removeItem('pb_remember')
    ElMessage.success('已退出系统')
    router.replace('/login')
  }

  // 自动登录逻辑（支持本地存储）
  const autoLogin = async () => {
    if (!state.value.rememberMe || !pb.authStore.isValid) return false

    try {
      // 静默刷新token
      await pb.collection('users').authRefresh()
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  // 计算属性优化
  const currentUser = computed(() => state.value.user)
  const username = computed(() => state.value.user?.name || state.value.user?.username || '用户')

  // 初始化执行
  initializeAuth()
  startAutoRefresh()

  return {
    state,
    currentUser,
    username,
    login,
    logout,
    autoLogin,
  }
})
