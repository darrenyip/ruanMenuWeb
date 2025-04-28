<template>
  <div class="overview">
    <h1>今日菜单总览</h1>
    <!-- 数据刷新区域 -->
    <div class="refresh-section">
      <el-button @click="loadMenuData(currentMealType)" size="small" type="primary">
        刷新数据
      </el-button>
      <span class="ml-2" v-if="menuStore.currentMenu?.loadTime">
        数据更新时间: {{ new Date(menuStore.currentMenu.loadTime).toLocaleTimeString() }}
      </span>
    </div>
    <div class="time-switch">
      <el-radio-group v-model="currentMealType">
        <el-radio-button label="lunch">午餐</el-radio-button>
        <el-radio-button label="dinner">晚餐</el-radio-button>
        <el-radio-button label="other">其他</el-radio-button>
      </el-radio-group>
    </div>

    <el-skeleton :loading="menuStore.loading" animated>
      <template #default>
        <section class="meal-section">
          <!-- 午餐/晚餐显示 -->
          <template v-if="currentMealType !== 'other'">
            <div class="category-cards">
              <!-- 荤菜 -->
              <div class="category-card">
                <h3>{{ categoryLabels.meat }}</h3>
                <el-empty
                  v-if="!menuStore.currentMenu?.items?.meat?.length"
                  description="暂无菜品数据"
                  :image-size="80"
                />
                <el-table v-else :data="menuStore.currentMenu?.items?.meat || []">
                  <el-table-column prop="name" label="菜品" />
                  <el-table-column label="价格" width="100">
                    <template #default="{ row }">
                      <!-- 如果有大小份，显示大小份价格 -->
                      <div v-if="row.hasMultipleSizes" class="price-display">
                        <div class="price-item">
                          <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                        </div>
                        <div class="price-item">
                          <span class="price-label">大:</span> ¥{{ row.largePrice }}
                        </div>
                      </div>
                      <!-- 如果只有基础价格 -->
                      <div v-else>¥{{ row.price }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 半荤素 -->
              <div class="category-card">
                <h3>{{ categoryLabels.halfMeat }}</h3>
                <el-empty
                  v-if="!menuStore.currentMenu?.items?.halfMeat?.length"
                  description="暂无菜品数据"
                  :image-size="80"
                />
                <el-table v-else :data="menuStore.currentMenu?.items?.halfMeat || []">
                  <el-table-column prop="name" label="菜品" />
                  <el-table-column label="价格" width="100">
                    <template #default="{ row }">
                      <!-- 如果有大小份，显示大小份价格 -->
                      <div v-if="row.hasMultipleSizes" class="price-display">
                        <div class="price-item">
                          <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                        </div>
                        <div class="price-item">
                          <span class="price-label">大:</span> ¥{{ row.largePrice }}
                        </div>
                      </div>
                      <!-- 如果只有基础价格 -->
                      <div v-else>¥{{ row.price }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <!-- 素菜 -->
              <div class="category-card">
                <h3>{{ categoryLabels.vegetable }}</h3>
                <el-empty
                  v-if="!menuStore.currentMenu?.items?.vegetable?.length"
                  description="暂无菜品数据"
                  :image-size="80"
                />
                <el-table v-else :data="menuStore.currentMenu?.items?.vegetable || []">
                  <el-table-column prop="name" label="菜品" />
                  <el-table-column label="价格" width="100">
                    <template #default="{ row }">
                      <!-- 如果有大小份，显示大小份价格 -->
                      <div v-if="row.hasMultipleSizes" class="price-display">
                        <div class="price-item">
                          <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                        </div>
                        <div class="price-item">
                          <span class="price-label">大:</span> ¥{{ row.largePrice }}
                        </div>
                      </div>
                      <!-- 如果只有基础价格 -->
                      <div v-else>¥{{ row.price }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </template>

          <!-- 炖汤显示 -->
          <template v-else>
            <div class="category-cards">
              <div class="category-card">
                <h3>🥘 炖汤</h3>
                <el-empty
                  v-if="!menuStore.currentMenu?.items?.soup?.length"
                  description="暂无汤品数据"
                  :image-size="80"
                />
                <el-table v-else :data="menuStore.currentMenu?.items?.soup || []">
                  <el-table-column prop="name" label="汤品" />
                  <el-table-column label="价格" width="100">
                    <template #default="{ row }">
                      <!-- 如果有大小份，显示大小份价格 -->
                      <div v-if="row.hasMultipleSizes" class="price-display">
                        <div class="price-item">
                          <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                        </div>
                        <div class="price-item">
                          <span class="price-label">大:</span> ¥{{ row.largePrice }}
                        </div>
                      </div>
                      <!-- 如果只有基础价格 -->
                      <div v-else>¥{{ row.price }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div class="category-card">
                <h3>🍚 主食</h3>
                <el-empty
                  v-if="!menuStore.currentMenu?.items?.staple?.length"
                  description="暂无主食数据"
                  :image-size="80"
                />
                <el-table v-else :data="menuStore.currentMenu?.items?.staple || []">
                  <el-table-column prop="name" label="主食" />
                  <el-table-column label="价格" width="100">
                    <template #default="{ row }">
                      <!-- 如果有大小份，显示大小份价格 -->
                      <div v-if="row.hasMultipleSizes" class="price-display">
                        <div class="price-item">
                          <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                        </div>
                        <div class="price-item">
                          <span class="price-label">大:</span> ¥{{ row.largePrice }}
                        </div>
                      </div>
                      <!-- 如果只有基础价格 -->
                      <div v-else>¥{{ row.price }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>

              <div class="category-card">
                <h3>🥤 饮料</h3>
                <el-empty
                  v-if="!menuStore.currentMenu?.items?.drink?.length"
                  description="暂无饮料数据"
                  :image-size="80"
                />
                <el-table v-else :data="menuStore.currentMenu?.items?.drink || []">
                  <el-table-column prop="name" label="饮料" />
                  <el-table-column label="价格" width="100">
                    <template #default="{ row }">
                      <!-- 如果有大小份，显示大小份价格 -->
                      <div v-if="row.hasMultipleSizes" class="price-display">
                        <div class="price-item">
                          <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                        </div>
                        <div class="price-item">
                          <span class="price-label">大:</span> ¥{{ row.largePrice }}
                        </div>
                      </div>
                      <!-- 如果只有基础价格 -->
                      <div v-else>¥{{ row.price }}</div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </template>

          <!-- 原有的编辑按钮，隐藏 -->
          <!-- <el-button type="primary" @click="goToEdit(currentMealType)" class="edit-btn">
            编辑{{ buttonText }}
          </el-button> -->
        </section>
      </template>
    </el-skeleton>

    <!-- 悬浮编辑按钮 -->
    <el-button
      type="primary"
      @click="goToEdit(currentMealType)"
      class="floating-edit-btn"
      size="large"
      round
    >
      <el-icon class="edit-icon"><Edit /></el-icon>
      编辑{{ buttonText }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'
import type { MenuType } from '@/types/menu'

const router = useRouter()
const menuStore = useMenuStore()

// 状态管理
const currentMealType = ref<MenuType>('lunch')

// 分类定义
const categories = {
  meat: '荤菜',
  halfMeat: '半荤素',
  vegetable: '素菜',
  staple: '主食',
} as const

const categoryLabels = {
  meat: '🥩 荤菜',
  halfMeat: '🥘 半荤素',
  vegetable: '🥬 素菜',
  staple: '🍚 主食',
} as const

// 计算属性
const buttonText = computed(() => {
  return currentMealType.value === 'other'
    ? '炖汤'
    : currentMealType.value === 'lunch'
      ? '午餐'
      : '晚餐'
})

const goToEdit = (type: string) => {
  router.push(`/${type}`)
}

// 加载菜单数据
const loadMenuData = async (type: MenuType) => {
  try {
    // 获取今天的日期，格式为 YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0]

    // 显示加载状态
    menuStore.loading = true

    // 使用store获取菜单数据
    await menuStore.fetchMenu(today, type)
    console.log(`已加载${type}菜单数据:`, menuStore.currentMenu)
  } catch (error) {
    console.error(`加载${type}菜单失败:`, error)

    // 如果是取消请求的错误，不显示错误信息
    if (
      error instanceof Error &&
      (error.message.includes('cancelled') || error.message.includes('autocancelled'))
    ) {
      console.log('请求被取消，可能是由于重复请求导致')
      return
    }

    // 简化错误消息
    let errorMsg = '加载菜单失败'
    if (error instanceof Error) {
      // 对特定错误进行友好处理
      if (error.message.includes('没有找到')) {
        errorMsg = `今日暂无${type === 'lunch' ? '午餐' : type === 'dinner' ? '晚餐' : '其他'}菜单`
      } else {
        errorMsg = error.message
      }
    }
    ElMessage.error(errorMsg)
  } finally {
    // 确保loading状态被重置
    menuStore.loading = false
  }
}

// 监听菜单类型变化
watch(currentMealType, (newType) => {
  // 如果URL中有type参数且与当前选择不同，需要清除它
  const typeParam = router.currentRoute.value.query.type as string | undefined
  if (typeParam && typeParam !== newType) {
    router.replace({
      path: '/overview',
      query: {},
    })
  }

  // 加载新类型的菜单数据（延迟一点点执行，避免快速切换触发多次请求）
  setTimeout(() => {
    loadMenuData(newType)
  }, 10)

  // 更新最后编辑的菜单类型
  menuStore.lastEditedType = newType
})

// 页面加载时初始化数据
onMounted(() => {
  // 检查URL参数中是否有菜单类型
  const typeParam = router.currentRoute.value.query.type as MenuType | undefined
  let initialType = currentMealType.value

  // 如果有URL参数且是有效的菜单类型，使用它
  if (typeParam && ['lunch', 'dinner', 'other'].includes(typeParam)) {
    initialType = typeParam as MenuType
    currentMealType.value = initialType
  }
  // 否则如果有lastEditedType，使用它
  else if (menuStore.lastEditedType) {
    initialType = menuStore.lastEditedType
    currentMealType.value = initialType
  }

  // 用一个短暂的延迟加载数据，避免导航和状态更新过程中的重复请求
  setTimeout(() => {
    loadMenuData(initialType)
  }, 50)
})
</script>

<style scoped>
/* 桌面端优先设计 */
.overview {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  background-color: #fff;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.overview h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.refresh-section {
  margin: 24px 0;
  padding: 12px;
  display: flex;
  align-items: center;
  background-color: #f9fafc;
  border-radius: 6px;
}

.time-switch {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.meal-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.category-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
}

.category-card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  min-width: 300px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.meal-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #303133;
}

.edit-btn {
  margin-top: 30px;
  padding: 12px 24px;
  font-size: 16px;
}

.mt-4 {
  margin-top: 24px;
}

.ml-2 {
  margin-left: 12px;
  font-size: 14px;
  color: #606266;
}

.mb-2 {
  margin-bottom: 12px;
}

/* 悬浮编辑按钮 */
.floating-edit-btn {
  position: fixed;
  bottom: 30px;
  right: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  z-index: 999;
  padding: 12px 24px;
}

.floating-edit-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.edit-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 平板设备 */
@media screen and (max-width: 1024px) {
  .overview {
    max-width: 100%;
    padding: 25px;
  }

  .overview h1 {
    font-size: 26px;
    margin-bottom: 20px;
  }

  .refresh-section {
    margin: 20px 0;
  }

  .category-cards {
    gap: 15px;
  }

  .category-card {
    min-width: 250px;
  }

  .edit-btn {
    margin-top: 25px;
    padding: 10px 20px;
    font-size: 15px;
  }

  /* 平板设备的悬浮按钮 */
  .floating-edit-btn {
    bottom: 25px;
    right: 25px;
    padding: 10px 20px;
  }
}

/* 手机设备 */
@media screen and (max-width: 768px) {
  .overview {
    padding: 20px;
    margin: 10px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    height: calc(100vh - 20px);
  }

  .overview h1 {
    font-size: 22px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }

  .refresh-section {
    margin: 16px 0;
    padding: 10px;
    flex-direction: column;
    align-items: flex-start;
  }

  .ml-2 {
    margin-left: 0;
    margin-top: 8px;
  }

  .time-switch {
    margin-bottom: 20px;
  }

  .category-cards {
    flex-direction: column;
    gap: 15px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .category-card {
    width: 100%;
    min-width: unset;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .meal-section h3 {
    font-size: 16px;
    margin: 0 0 10px 0;
  }

  .edit-btn {
    margin-top: 20px;
    padding: 8px 16px;
    font-size: 14px;
    width: 100%;
  }

  /* 手机设备的悬浮按钮 */
  .floating-edit-btn {
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    font-size: 14px;
  }

  .edit-icon {
    margin-right: 4px;
    font-size: 14px;
  }
}

/* 小屏手机 */
@media screen and (max-width: 480px) {
  .overview {
    padding: 16px;
    box-shadow: none;
    border-radius: 0;
    margin: 0;
    height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .overview h1 {
    font-size: 20px;
    text-align: center;
  }

  .refresh-section {
    margin: 12px 0;
    padding: 8px;
  }

  .category-card {
    padding: 12px;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .time-switch :deep(.el-radio-button) {
    padding: 0;
  }

  .time-switch :deep(.el-radio-button__inner) {
    padding: 8px 12px;
  }

  /* 小屏手机的悬浮按钮 */
  .floating-edit-btn {
    bottom: 16px;
    right: 16px;
    padding: 8px 14px;
  }
}

/* 添加多规格价格显示样式 */
.price-display {
  display: flex;
  flex-direction: column;
}

.price-item {
  margin: 2px 0;
}

.price-label {
  color: #909399;
  font-size: 12px;
  margin-right: 2px;
}
</style>
