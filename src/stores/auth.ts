// stores/auth.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

interface UserInfo {
  id: string
  username: string
  displayName: string
  role?: string
}

interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  rememberMe: boolean
  isLoading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()

  // State
  const state = ref<AuthState>({
    token: localStorage.getItem('token') || null,
    userInfo: JSON.parse(localStorage.getItem('userInfo') || 'null'),
    rememberMe: localStorage.getItem('rememberMe') === 'true',
    isLoading: false,
    error: null,
  })

  // 添加 rememberMe 的 computed 属性
  const rememberMe = computed({
    get: () => state.value.rememberMe,
    set: (value) => {
      state.value.rememberMe = value
      localStorage.setItem('rememberMe', value.toString())
    },
  })

  // Getters
  const isAuthenticated = computed(() => !!state.value.token)
  const username = computed(() => state.value.userInfo?.displayName || '')

  // Actions
  const setAuthData = (token: string, userInfo: UserInfo) => {
    state.value.token = token
    state.value.userInfo = userInfo

    if (state.value.rememberMe) {
      localStorage.setItem('token', token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      localStorage.setItem('rememberMe', state.value.rememberMe.toString())
    }
  }

  const clearAuthData = () => {
    state.value.token = null
    state.value.userInfo = null
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('rememberMe')
  }

  const login = async (
    credentials: { username: string; password: string },
    remember: boolean,
    redirect?: RouteLocationRaw,
  ) => {
    try {
      state.value.isLoading = true
      state.value.error = null

      // 模拟API调用（需要声明返回结果）
      const mockLogin = () =>
        new Promise<{ token: string; user: UserInfo }>((resolve) =>
          setTimeout(
            () =>
              resolve({
                token: 'mock_jwt_token',
                user: {
                  id: 'user_001',
                  username: credentials.username,
                  displayName: credentials.username.toUpperCase(),
                  role: 'admin',
                },
              }),
            1500,
          ),
        )

      // 添加这行声明
      const res = await mockLogin()

      setAuthData(res.token, res.user) // 现在可以访问res
      ElMessage.success('登录成功')

      if (redirect) {
        router.push(redirect)
      } else {
        router.push('/overview')
      }
    } catch (error) {
      state.value.error = '登录失败，请检查账号密码'
      ElMessage.error(state.value.error)
      throw error
    } finally {
      state.value.isLoading = false
    }
  }

  const logout = () => {
    clearAuthData()
    ElMessage.success('已退出登录')
    router.replace('/login')
  }

  const autoLogin = async () => {
    if (!state.value.token) return false

    try {
      state.value.isLoading = true

      // 模拟token验证
      const mockVerify = () =>
        new Promise<boolean>((resolve) => setTimeout(() => resolve(true), 500))

      const isValid = await mockVerify()
      if (!isValid) {
        clearAuthData()
        return false
      }
      return true
    } catch (error) {
      clearAuthData()
      return false
    } finally {
      state.value.isLoading = false
    }
  }

  return {
    state,
    isAuthenticated,
    username,
    rememberMe,
    login,
    logout,
    autoLogin,
    setAuthData,
    clearAuthData,
  }
})
