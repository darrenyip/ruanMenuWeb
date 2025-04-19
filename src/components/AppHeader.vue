<!-- src/components/AppHeader.vue -->
<template>
  <header class="app-header">
    <responsive-container>
      <div class="header-content">
        <h1 class="logo">{{ shopName }}</h1>

        <!-- 桌面导航 -->
        <nav class="desktop-nav">
          <router-link to="/overview">总览</router-link>
          <router-link to="/lunch">午餐</router-link>
          <router-link to="/dinner">晚餐</router-link>
        </nav>

        <!-- 移动导航切换按钮 -->
        <el-button class="mobile-menu-toggle" @click="showMobileMenu = true">
          <el-icon><Menu /></el-icon>
        </el-button>
      </div>
    </responsive-container>

    <!-- 移动菜单 -->
    <el-drawer v-model="showMobileMenu" direction="ltr" size="80%">
      <nav class="mobile-nav">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          @click="showMobileMenu = false"
        >
          {{ item.title }}
        </router-link>
      </nav>
    </el-drawer>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { Menu } from '@element-plus/icons-vue'

const showMobileMenu = ref(false)
const navItems = [
  { path: '/overview', title: '总览' },
  { path: '/lunch', title: '午餐' },
  { path: '/dinner', title: '晚餐' },
]
</script>

<style lang="scss">
.app-header {
  background: $primary-color;
  color: $text-color-light;
  padding: 1rem 0;

  .header-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .desktop-nav {
    display: none;
    gap: 2rem;

    a {
      color: inherit;
      text-decoration: none;
      font-weight: 500;

      &:hover {
        opacity: 0.8;
      }
    }

    @media (min-width: map-get($breakpoints, tablet)) {
      display: flex;
    }
  }

  .mobile-menu-toggle {
    display: block;
    @media (min-width: map-get($breakpoints, tablet)) {
      display: none;
    }
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;

    a {
      padding: 1rem;
      color: $text-color-dark;
      text-decoration: none;
      border-radius: 4px;

      &:hover {
        background: #f5f7fa;
      }
    }
  }
}
</style>
