<!-- src/components/AppHeader.vue -->
<template>
  <header class="app-header">
    <responsive-container>
      <div class="header-content">
        <!-- 左侧Logo -->
        <router-link to="/" class="logo">
          <span class="logo-text">菜单</span>
        </router-link>

        <!-- 中间日期 -->
        <div class="date-display">
          {{ formattedDate }}
        </div>

        <!-- 右侧退出 -->
        <el-button class="logout-btn" type="text" @click="handleLogout">
          <el-icon :size="24"><CloseBold /></el-icon>
        </el-button>
      </div>
    </responsive-container>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { CloseBold } from '@element-plus/icons-vue'

const router = useRouter()

// 格式化日期显示
const formattedDate = computed(() => {
  const date = new Date()
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const weekDays = ['日', '一', '二', '三', '四', '五', '六']
  const weekDay = weekDays[date.getDay()]
  return `${year}年${month}月${day}日 周${weekDay}`
})

// 退出登录
const handleLogout = () => {
  // 这里添加你的退出逻辑
  console.log('执行退出登录')
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.app-header {
  background: $primary-color;
  color: $text-color-light;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 48px;
  }

  .logo {
    text-decoration: none;
    flex: 0 0 80px;

    &-text {
      font-size: 18px;
      font-weight: 600;
      color: inherit;
    }
  }

  .date-display {
    flex: 1;
    text-align: center;
    font-size: 14px;
    opacity: 0.9;
  }

  .logout-btn {
    flex: 0 0 40px;
    color: inherit;
    padding: 0;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
