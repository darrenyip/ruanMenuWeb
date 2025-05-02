<template>
  <el-config-provider>
    <div class="app-container">
      <!-- 登录后显示顶部导航 -->
      <!-- 桌面端优化的 header 部分 -->
      <el-header v-if="isAuthenticated" class="main-header">
        <div class="header-content">
          <!-- 左侧 Logo -->
          <router-link to="/overview" class="logo">
            <span class="logo-text">软食坊</span>
          </router-link>

          <!-- 中间日期 -->
          <div class="date-display">
            <!-- 在大屏幕显示完整日期 -->
            <span class="full-date">{{ formattedDate }}</span>
            <!-- 在小屏幕显示简短日期 -->
            <span class="short-date">{{ shortFormattedDate }}</span>
          </div>

          <!-- 右侧退出 -->
          <div class="user-controls">
            <span class="welcome-text">欢迎，{{ username }}</span>
            <el-button class="logout-btn" type="text" @click="handleLogout">
              退出 <el-icon><CloseBold /></el-icon>
            </el-button>
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
        title="应用加载中"
        width="300px"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        align-center
      >
        <div style="text-align: center">
          <el-progress :percentage="100" status="success" :indeterminate="true" />
          <div style="margin-top: 15px; color: #606266">初始化应用...</div>
        </div>
      </el-dialog>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ElConfigProvider, ElMessage } from 'element-plus'
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CloseBold } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

// 状态管理
const loading = ref(false)
const shopName = ref('菜单')
const username = computed(() => authStore.username || '管理员')

// 计算属性
const isAuthenticated = computed(() => authStore.state.isAuthenticated)
// 日期格式化 - 完整格式
const formattedDate = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日 周${weekDay}`
})

// 移动端简短日期格式
const shortFormattedDate = computed(() => {
  const date = new Date()
  const month = (date.getMonth() + 1).toString()
  const day = date.getDate().toString()
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[date.getDay()]
  return `${month}月${day}日 周${weekDay}`
})

// 新增点击跳转方法
const goToOverview = () => {
  router.push('/overview')
}

// 生命周期钩子
onMounted(async () => {
  try {
    loading.value = true

    // 先检查记住我状态
    const rememberMe = localStorage.getItem('pb_remember') === 'true'

    if (rememberMe) {
      const success = await authStore.autoLogin()
      if (!success) {
        router.replace('/login')
      }
    } else {
      if (!authStore.state.isAuthenticated) {
        router.replace('/login')
      }
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
/* 桌面端优先设计 */
.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  overflow: hidden;

  .main-header {
    height: 70px !important;
    background: linear-gradient(135deg, #409eff, #3183ce) !important;
    padding: 0 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 100%;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;

      .logo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-decoration: none;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.05);
        }

        &-text {
          font-size: 24px;
          color: white;
          font-weight: 600;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
        }
      }

      .date-display {
        color: white;
        font-size: 16px;
        padding: 6px 12px;
        border-radius: 4px;
        text-align: center;

        .full-date {
          display: inline-block;
        }

        .short-date {
          display: none;
        }
      }

      .user-controls {
        display: flex;
        align-items: center;
        gap: 16px;

        .welcome-text {
          color: white;
          font-size: 15px;
        }

        .logout-btn {
          color: white !important;
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 4px;
          padding: 8px 16px;
          font-size: 14px;
          transition: background-color 0.3s ease;

          &:hover {
            background-color: rgba(255, 255, 255, 0.25);
          }

          .el-icon {
            margin-left: 6px;
            vertical-align: middle;
          }
        }
      }
    }
  }

  .main-content {
    flex: 1;
    padding: 24px;
    overflow-y: auto;
    overflow-x: hidden;
    max-width: 1400px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
    position: relative;
    -webkit-overflow-scrolling: touch;
    margin-top: 70px;
    height: calc(100vh - 70px);
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

/* 平板设备 */
@media screen and (max-width: 1024px) {
  .app-container {
    .main-header {
      height: 65px !important;
      padding: 0 16px;

      .header-content {
        .logo-text {
          font-size: 22px;
        }

        .date-display {
          font-size: 15px;
          padding: 5px 10px;
        }

        .user-controls {
          gap: 12px;

          .logout-btn {
            padding: 6px 12px;
          }
        }
      }
    }

    .main-content {
      padding: 20px;
      margin-top: 65px;
      height: calc(100vh - 65px);
    }
  }
}

/* 手机设备 */
@media screen and (max-width: 768px) {
  .app-container {
    .main-header {
      height: 60px !important;
      padding: 0 12px;

      .header-content {
        .logo-text {
          font-size: 20px;
        }

        .date-display {
          font-size: 13px;
          padding: 4px 8px;
          text-align: center;
          flex: 1;
          margin: 0 8px;

          .full-date {
            display: none;
          }

          .short-date {
            display: inline-block;
          }
        }

        .user-controls {
          gap: 8px;

          .welcome-text {
            display: none;
          }

          .logout-btn {
            padding: 4px 10px;
            font-size: 13px;
          }
        }
      }
    }

    .main-content {
      padding: 16px;
      margin-top: 60px;
      height: calc(100vh - 60px);
    }
  }
}

/* 小屏手机 */
@media screen and (max-width: 480px) {
  .app-container {
    .main-header {
      padding: 0 10px;

      .header-content {
        .logo-text {
          font-size: 18px;
        }

        .date-display {
          font-size: 11px;
          padding: 3px 6px;
          white-space: nowrap;
          overflow: visible;
          max-width: none;
          line-height: 1.2;

          .short-date {
            font-weight: 500;
          }
        }

        .user-controls {
          .logout-btn {
            padding: 3px 8px;
            font-size: 12px;

            .el-icon {
              margin-left: 0;
            }
          }
        }
      }
    }

    .main-content {
      padding: 12px;
      margin-top: 60px;
      height: calc(100vh - 60px);
    }
  }
}
</style>
