// src/api/pocketbase.ts
import PocketBase from 'pocketbase'
import type { RecordModel } from 'pocketbase'

// 扩展类型声明
declare module 'pocketbase' {
  interface BaseAuthStore {
    user: RecordModel | null
    admin: RecordModel | null
    export(): { [key: string]: any }
  }
}

const pb = new PocketBase(
  import.meta.env.MODE === 'production'
    ? import.meta.env.VITE_PB_PRODUCTION
    : import.meta.env.VITE_PB_URL,
)

// 用户类型定义
export interface PBUser extends RecordModel {
  username: string
  email: string
  verified: boolean
  name?: string
  avatar?: string
}

// 认证状态处理
pb.authStore.onChange((token, model) => {
  console.log('PocketBase认证状态变化:', token ? '已认证' : '未认证')
  if (model) {
    localStorage.setItem(
      'pb_auth',
      JSON.stringify({
        token: pb.authStore.token,
        user: model as PBUser,
      }),
    )
  } else {
    localStorage.removeItem('pb_auth')
  }
}, true)

// 初始化加载认证状态
if (localStorage.getItem('pb_auth')) {
  try {
    const savedAuth = JSON.parse(localStorage.getItem('pb_auth') || '{}')
    if (savedAuth.token) {
      pb.authStore.save(savedAuth.token, savedAuth.user)
      console.log('已从本地存储恢复认证状态')
    }
  } catch (error) {
    console.error('加载认证状态失败:', error)
    localStorage.removeItem('pb_auth')
  }
}

// 增加连接检查方法
export const pbHelper = {
  async checkConnection(): Promise<boolean> {
    try {
      const health = await pb.health.check()
      return health.code === 200
    } catch (error) {
      console.error('PocketBase连接检查失败:', error)
      return false
    }
  },

  // 简化的错误处理
  handleApiError(error: any, defaultMsg = '操作失败'): string {
    if (!error) return defaultMsg

    // 网络连接错误
    if (error.status === 0) {
      return '无法连接到服务器，请检查网络'
    }

    // 认证错误
    if (error.status === 401) {
      return '未授权，请重新登录'
    }

    // API错误（带有message）
    if (error.data?.message) {
      return error.data.message
    }

    // 表单验证错误
    if (error.data && typeof error.data === 'object') {
      for (const field in error.data) {
        if (error.data[field]?.message) {
          return `${field}: ${error.data[field].message}`
        }
      }
    }

    return error.message || defaultMsg
  },
}

// 实用方法
export const authHelper = {
  get currentUser(): PBUser | null {
    return (pb.authStore.model as PBUser) || null
  },

  async refreshSession(): Promise<PBUser> {
    try {
      const result = await pb.collection('users').authRefresh<PBUser>()
      return result.record
    } catch (error) {
      console.error('刷新会话失败:', error)
      pb.authStore.clear() // 清除无效的认证
      throw error
    }
  },

  // 新增：确保认证状态同步
  ensureAuth(): Promise<boolean> {
    return new Promise((resolve) => {
      // 如果已经认证，直接返回
      if (pb.authStore.isValid) {
        console.log('认证状态已有效')
        resolve(true)
        return
      }

      // 从localStorage加载
      try {
        const savedAuth = localStorage.getItem('pb_auth')
        if (savedAuth) {
          const { token, user } = JSON.parse(savedAuth)
          if (token) {
            pb.authStore.save(token, user)
            console.log('已从存储恢复认证状态')
            // 等待下一个事件循环，确保状态已同步
            setTimeout(() => resolve(pb.authStore.isValid), 0)
            return
          }
        }
      } catch (error) {
        console.error('确保认证状态同步时出错:', error)
      }

      resolve(false)
    })
  },
}

export default pb
