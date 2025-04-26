<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">系统登录</div>
      </template>

      <!-- 添加 ref 到 el-form -->
      <el-form ref="loginForm" :model="form" label-width="80px">
        <el-form-item label="账号" prop="identity">
          <el-input v-model="form.identity" placeholder="邮箱或用户名" @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" @keyup.enter="handleLogin" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
        </el-form-item>
        <el-button type="primary" :loading="isLoading" @click="handleLogin" class="login-button">
          登录
        </el-button>

        <!-- <el-button type="primary" @click="handleLogin" class="login-button"> 登录 </el-button> -->
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, type FormInstance } from 'element-plus'
import type { ClientResponseError } from 'pocketbase'
import { useRouter } from 'vue-router'
import { authHelper } from '@/api/pocketbase'

const authStore = useAuthStore()
const router = useRouter()
const loginForm = ref<FormInstance>()
const rememberMe = ref(false)
const isLoading = ref(false)

const form = reactive({
  identity: '', // 可以是邮箱或用户名
  password: '',
})

onMounted(async () => {
  // 检查是否已经认证
  const isAuthenticated = await authHelper.ensureAuth()
  if (isAuthenticated) {
    console.log('已经认证，正在跳转...')
    router.push('/overview')
    return
  }

  const savedCredentials = localStorage.getItem('saved_credentials')
  if (savedCredentials) {
    const { identity, password } = JSON.parse(savedCredentials)
    form.identity = identity
    form.password = password
    rememberMe.value = true
  }
})

const handleLogin = async () => {
  if (!form.identity || !form.identity.trim()) {
    ElMessage.warning('请输入账号')
    return
  }

  if (!form.password || !form.password.trim()) {
    ElMessage.warning('请输入密码')
    return
  }

  isLoading.value = true

  try {
    // 处理记住密码逻辑
    if (rememberMe.value) {
      localStorage.setItem(
        'saved_credentials',
        JSON.stringify({
          identity: form.identity,
          password: form.password,
        }),
      )
    } else {
      localStorage.removeItem('saved_credentials')
    }

    console.log('开始登录...', form.identity)
    // 调用登录逻辑
    const user = await authStore.login(form)
    console.log('登录成功，用户:', user)

    // 确保认证状态已同步
    await authHelper.ensureAuth()

    // 登录成功提示
    ElMessage.success('登录成功')

    // 带延迟的跳转处理
    setTimeout(async () => {
      try {
        // 尝试使用router跳转
        await router.push('/overview')
        console.log('跳转完成')
      } catch (navError) {
        console.error('导航错误:', navError)
        // 如果导航失败，尝试强制跳转
        window.location.href = '/overview'
      }
    }, 200) // 增加延迟确保认证状态完全同步
  } catch (error) {
    console.error('登录失败:', error)
    const pbError = error as ClientResponseError
    let message = '登录失败'

    if (pbError.status === 400) {
      if (pbError.data?.identity?.message) {
        message = pbError.data.identity.message
      } else if (pbError.data?.password?.message) {
        message = pbError.data.password.message
      } else {
        message = '账号或密码错误'
      }
    } else if (pbError.status === 0) {
      message = '无法连接服务器，请检查网络'
    }

    ElMessage.error(message)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 桌面端优先设计 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #ebf1f8, #f5f7fa);
  padding: 20px;
}

.login-card {
  width: 450px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  padding: 8px 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  padding: 4px 11px;
  height: 44px;
  transition: box-shadow 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  border-radius: 4px;
}

/* 平板设备 */
@media screen and (max-width: 1024px) {
  .login-card {
    width: 420px;
  }

  .login-header {
    font-size: 22px;
  }

  :deep(.el-input__wrapper) {
    height: 42px;
  }

  .login-button {
    height: 42px;
  }
}

/* 手机设备 */
@media screen and (max-width: 768px) {
  .login-container {
    padding: 15px;
  }

  .login-card {
    width: 90%;
    max-width: 380px;
  }

  .login-header {
    font-size: 20px;
  }

  :deep(.el-form-item__label) {
    font-size: 14px;
  }

  :deep(.el-input__wrapper) {
    height: 40px;
  }

  .login-button {
    height: 40px;
    font-size: 15px;
  }
}

/* 小屏手机 */
@media screen and (max-width: 480px) {
  .login-container {
    padding: 10px;
  }

  .login-card {
    width: 100%;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .login-header {
    font-size: 18px;
  }

  :deep(.el-form-item__label) {
    font-size: 13px;
  }

  :deep(.el-input__wrapper) {
    height: 38px;
    padding: 3px 10px;
  }

  .login-button {
    height: 38px;
    font-size: 14px;
  }
}
</style>
