<template>
  <div class="main-container">
    <el-page-header v-if="showBack" @back="goBack" title="返回总览页" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const showBack = computed(() => route.path !== '/overview')

const goBack = () => {
  router.push('/overview')
}
</script>

<style>
.main-container {
  padding: 20px;
}
</style>
