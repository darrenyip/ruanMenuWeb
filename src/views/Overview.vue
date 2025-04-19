<template>
  <div class="overview">
    <h1>今日菜单总览</h1>

    <section v-for="type in menuTypes" :key="type.value">
      <h2>{{ type.label }}</h2>
      <el-table :data="store.getByType(type.value)">
        <el-table-column prop="name" label="菜品" />
        <el-table-column prop="price" label="价格" />
      </el-table>
      <el-button @click="goToEdit(type.value)" type="primary" class="edit-btn">
        编辑{{ type.label }}
      </el-button>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useMenuStore } from '@/stores/menu'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const store = useMenuStore()

const menuTypes = [
  { value: 'lunch', label: '午餐' },
  { value: 'dinner', label: '晚餐' },
  { value: 'soup', label: '汤类' },
]

// 页面加载时初始化数据
store.fetchMenu('lunch')
store.fetchMenu('dinner')
store.fetchMenu('soup')

const goToEdit = (type: string) => {
  router.push(`/${type}`)
}
</script>

<style scoped>
.overview {
  padding: 20px;
}

section {
  margin-bottom: 40px;
}

.edit-btn {
  margin-top: 15px;
}
</style>
