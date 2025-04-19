<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">系统登录</div>
      </template>

      <!-- 添加 ref 到 el-form -->
      <el-form ref="loginForm" :model="form" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="rememberMe">记住密码</el-checkbox>
        </el-form-item>

        <el-button type="primary" @click="handleLogin" class="login-button"> 登录 </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, type FormInstance } from 'element-plus'

const authStore = useAuthStore()
const loginForm = ref<FormInstance>() // 添加表单引用
const rememberMe = ref(false)
const isLoading = ref(false) // 添加加载状态

const form = reactive({
  username: '',
  password: '',
})

const handleLogin = async () => {
  try {
    // 添加表单验证
    if (!loginForm.value) return
    await loginForm.value.validate()

    isLoading.value = true

    await authStore.login(
      {
        username: form.username,
        password: form.password,
      },
      rememberMe.value,
      '/',
    )
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* 保持原有样式不变 */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.login-card {
  width: 400px;
}

.login-header {
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.login-button {
  width: 100%;
}
</style>
