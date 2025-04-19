<template>
  <el-config-provider>
    <div class="app-container">
      <!-- 登录后显示顶部导航 -->
      <el-header v-if="isAuthenticated" class="main-header">
        <div class="header-content">
          <h1 class="logo-text">{{ shopName }}</h1>
          <div class="user-info">
            <el-icon><user /></el-icon>
            <span class="username">{{ username }}</span>
            <el-button type="text" @click="handleLogout" class="logout-btn"> 退出登录 </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主内容区域 -->
      <el-main class="main-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>

      <!-- 全局加载提示 -->
      <el-dialog
        v-model="loading"
        title="加载中"
        width="30%"
        :show-close="false"
        :close-on-click-modal="false"
      >
        <el-progress :percentage="100" status="success" :indeterminate="true" />
      </el-dialog>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider, ElMessage } from 'element-plus'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 状态管理
const loading = ref(false)
const shopName = ref('我的餐厅管理系统')
const username = computed(() => authStore.username || '管理员')

// 计算属性
const isAuthenticated = computed(() => authStore.isAuthenticated)

// 生命周期钩子
onMounted(async () => {
  try {
    loading.value = true
    await authStore.autoLogin()
    if (!authStore.isAuthenticated) {
      router.replace('/login')
    }
  } catch (error) {
    ElMessage.error('自动登录失败')
  } finally {
    loading.value = false
  }
})

// 退出登录
const handleLogout = () => {
  authStore.logout()
  router.replace('/login')
  ElMessage.success('已退出登录')
}
</script>

<style lang="scss">
@import '@/styles/variables.scss';

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;

  .main-header {
    height: 60px;
    background: $primary-color;
    color: white;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;

      .logo-text {
        font-size: 24px;
        margin: 0;
      }

      .user-info {
        display: flex;
        align-items: center;
        gap: 15px;

        .el-icon {
          font-size: 20px;
        }

        .username {
          font-weight: 500;
        }

        .logout-btn {
          color: white;
          margin-left: 20px;

          &:hover {
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
  }

  .main-content {
    flex: 1;
    padding: 20px;
    overflow: auto;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media screen and (max-width: 768px) {
  .app-container {
    .main-header {
      padding: 0 10px;

      .logo-text {
        font-size: 18px;
      }

      .user-info {
        gap: 8px;

        .el-icon {
          font-size: 16px;
        }

        .username {
          display: none;
        }
      }
    }

    .main-content {
      padding: 10px;
    }
  }
}
</style>
