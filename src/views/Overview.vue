<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>菜单总览</h1>
      <div class="action-buttons">
        <router-link to="/dishes" class="management-link">
          <el-button type="primary">
            <el-icon><Food /></el-icon> 菜品管理
          </el-button>
        </router-link>
      </div>
    </div>

    <div class="menu-section">
      <!-- 午餐卡片 -->
      <el-card class="menu-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h2>午餐菜单</h2>
            <el-button type="primary" size="small" @click="goToEdit('lunch')">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
          </div>
        </template>
        <div class="card-content" v-loading="loadingLunch">
          <el-empty v-if="!hasLunchItems" description="暂无午餐菜单数据" />
          <div v-else class="category-tables">
            <!-- 荤菜表格 -->
            <div class="category-table" v-if="lunchMenu?.items?.meat?.length">
              <div class="category-header meat">
                <el-icon><Chicken /></el-icon> 荤菜
              </div>
              <el-table :data="lunchMenu.items.meat" size="small" :show-header="false">
                <el-table-column prop="name" label="菜品" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 半荤素表格 -->
            <div class="category-table" v-if="lunchMenu?.items?.halfMeat?.length">
              <div class="category-header halfMeat">
                <el-icon><Food /></el-icon> 半荤素
              </div>
              <el-table :data="lunchMenu.items.halfMeat" size="small" :show-header="false">
                <el-table-column prop="name" label="菜品" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 素菜表格 -->
            <div class="category-table" v-if="lunchMenu?.items?.vegetable?.length">
              <div class="category-header vegetable">
                <el-icon><Dish /></el-icon> 素菜
              </div>
              <el-table :data="lunchMenu.items.vegetable" size="small" :show-header="false">
                <el-table-column prop="name" label="菜品" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 套餐表格 -->
            <div class="category-table" v-if="lunchMenu?.items?.combo?.length">
              <div class="category-header combo">
                <el-icon><Goods /></el-icon> 套餐
              </div>
              <el-table :data="lunchMenu.items.combo" size="small" :show-header="false">
                <el-table-column prop="name" label="套餐" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 晚餐卡片 -->
      <el-card class="menu-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h2>晚餐菜单</h2>
            <el-button type="primary" size="small" @click="goToEdit('dinner')">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
          </div>
        </template>
        <div class="card-content" v-loading="loadingDinner">
          <el-empty v-if="!hasDinnerItems" description="暂无晚餐菜单数据" />
          <div v-else class="category-tables">
            <!-- 荤菜表格 -->
            <div class="category-table" v-if="dinnerMenu?.items?.meat?.length">
              <div class="category-header meat">
                <el-icon><Chicken /></el-icon> 荤菜
              </div>
              <el-table :data="dinnerMenu.items.meat" size="small" :show-header="false">
                <el-table-column prop="name" label="菜品" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 半荤素表格 -->
            <div class="category-table" v-if="dinnerMenu?.items?.halfMeat?.length">
              <div class="category-header halfMeat">
                <el-icon><Food /></el-icon> 半荤素
              </div>
              <el-table :data="dinnerMenu.items.halfMeat" size="small" :show-header="false">
                <el-table-column prop="name" label="菜品" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 素菜表格 -->
            <div class="category-table" v-if="dinnerMenu?.items?.vegetable?.length">
              <div class="category-header vegetable">
                <el-icon><Dish /></el-icon> 素菜
              </div>
              <el-table :data="dinnerMenu.items.vegetable" size="small" :show-header="false">
                <el-table-column prop="name" label="菜品" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 套餐表格 -->
            <div class="category-table" v-if="dinnerMenu?.items?.combo?.length">
              <div class="category-header combo">
                <el-icon><Goods /></el-icon> 套餐
              </div>
              <el-table :data="dinnerMenu.items.combo" size="small" :show-header="false">
                <el-table-column prop="name" label="套餐" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 其他卡片 -->
      <el-card class="menu-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h2>其他菜单</h2>
            <el-button type="primary" size="small" @click="goToEdit('other')">
              <el-icon><Edit /></el-icon> 编辑
            </el-button>
          </div>
        </template>
        <div class="card-content" v-loading="loadingOther">
          <el-empty v-if="!hasOtherItems" description="暂无其他菜单数据" />
          <div v-else class="category-tables">
            <!-- 炖汤表格 -->
            <div class="category-table" v-if="otherMenu?.items?.soup?.length">
              <div class="category-header soup">
                <el-icon><Bowl /></el-icon> 炖汤
              </div>
              <el-table :data="otherMenu.items.soup" size="small" :show-header="false">
                <el-table-column prop="name" label="汤品" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 主食表格 -->
            <div class="category-table" v-if="otherMenu?.items?.staple?.length">
              <div class="category-header staple">
                <el-icon><Bowl /></el-icon> 主食
              </div>
              <el-table :data="otherMenu.items.staple" size="small" :show-header="false">
                <el-table-column prop="name" label="主食" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 饮料表格 -->
            <div class="category-table" v-if="otherMenu?.items?.drink?.length">
              <div class="category-header drink">
                <el-icon><Goblet /></el-icon> 饮料
              </div>
              <el-table :data="otherMenu.items.drink" size="small" :show-header="false">
                <el-table-column prop="name" label="饮料" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 套餐表格 -->
            <div class="category-table" v-if="otherMenu?.items?.combo?.length">
              <div class="category-header combo">
                <el-icon><Goods /></el-icon> 套餐
              </div>
              <el-table :data="otherMenu.items.combo" size="small" :show-header="false">
                <el-table-column prop="name" label="套餐" />
                <el-table-column label="价格" width="80" align="right">
                  <template #default="{ row }">
                    <div v-if="row.hasMultipleSizes" class="price-display">
                      <div class="price-item">
                        <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                      </div>
                      <div class="price-item">
                        <span class="price-label">大:</span> ¥{{ row.largePrice }}
                      </div>
                    </div>
                    <div v-else>¥{{ row.price }}</div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { ElMessage } from 'element-plus'
import { Edit, Food, Chicken, Dish, Bowl, Goblet, Goods } from '@element-plus/icons-vue'
import type { MenuType, FormattedMenu } from '@/types/menu'

const router = useRouter()
const menuStore = useMenuStore()

// 状态管理
const lunchMenu = ref<FormattedMenu | null>(null)
const dinnerMenu = ref<FormattedMenu | null>(null)
const otherMenu = ref<FormattedMenu | null>(null)
const lastLoadTime = ref<number>(0)

// 加载状态
const loadingLunch = ref(false)
const loadingDinner = ref(false)
const loadingOther = ref(false)

// 检查是否有菜单项
const hasLunchItems = computed(() => {
  const items = lunchMenu.value?.items
  return (
    !!items &&
    ((items.meat && items.meat.length > 0) ||
      (items.halfMeat && items.halfMeat.length > 0) ||
      (items.vegetable && items.vegetable.length > 0) ||
      (items.combo && items.combo.length > 0))
  )
})

const hasDinnerItems = computed(() => {
  const items = dinnerMenu.value?.items
  return (
    !!items &&
    ((items.meat && items.meat.length > 0) ||
      (items.halfMeat && items.halfMeat.length > 0) ||
      (items.vegetable && items.vegetable.length > 0) ||
      (items.combo && items.combo.length > 0))
  )
})

const hasOtherItems = computed(() => {
  const items = otherMenu.value?.items
  return (
    !!items &&
    ((items.soup && items.soup.length > 0) ||
      (items.staple && items.staple.length > 0) ||
      (items.drink && items.drink.length > 0) ||
      (items.combo && items.combo.length > 0))
  )
})

// 跳转到编辑页面
const goToEdit = (type: MenuType) => {
  router.push(`/${type}`)
  // 更新最后编辑的菜单类型
  menuStore.lastEditedType = type
}

// 加载所有菜单数据
const loadAllMenus = async () => {
  // 获取今天的日期，格式为 YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]

  // 依次加载三种菜单
  await loadMenuData('lunch', today)
  await loadMenuData('dinner', today)
  await loadMenuData('other', today)

  // 更新最后加载时间
  lastLoadTime.value = Date.now()
}

// 加载单个菜单数据
const loadMenuData = async (type: MenuType, date: string) => {
  try {
    // 设置对应的加载状态
    if (type === 'lunch') loadingLunch.value = true
    else if (type === 'dinner') loadingDinner.value = true
    else loadingOther.value = true

    // 使用store获取菜单数据
    await menuStore.fetchMenu(date, type)

    // 将数据保存到对应的响应式引用中
    if (!menuStore.currentMenu) {
      console.log(`未找到${type}菜单数据`)
      return
    }

    const menuData = { ...menuStore.currentMenu }

    if (type === 'lunch') lunchMenu.value = menuData
    else if (type === 'dinner') dinnerMenu.value = menuData
    else otherMenu.value = menuData

    console.log(`已加载${type}菜单数据:`, menuData)
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
    // 重置对应的加载状态
    if (type === 'lunch') loadingLunch.value = false
    else if (type === 'dinner') loadingDinner.value = false
    else loadingOther.value = false
  }
}

// 页面加载时初始化数据
onMounted(() => {
  // 检查URL参数中是否有菜单类型
  const typeParam = router.currentRoute.value.query.type as MenuType | undefined

  // 如果有lastEditedType，使用它
  if (menuStore.lastEditedType) {
    // 会在loadAllMenus中加载所有类型
  }
  // 如果URL中有type参数，先设置当前类型
  else if (typeParam && ['lunch', 'dinner', 'other'].includes(typeParam)) {
    menuStore.lastEditedType = typeParam as MenuType
  }

  // 用一个短暂的延迟加载数据，避免导航和状态更新过程中的重复请求
  setTimeout(() => {
    loadAllMenus()
  }, 50)
})
</script>

<style scoped>
/* 桌面端优先设计 */
.dashboard {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.dashboard h1 {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.management-link {
  text-decoration: none;
}

.menu-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.menu-card {
  transition: all 0.3s;
}

.menu-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 18px;
  margin: 0;
  color: #303133;
}

.card-content {
  min-height: 200px;
  padding: 0;
}

.category-tables {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.category-table {
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  margin-bottom: 4px;
}

.category-header {
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}

.category-header .el-icon {
  font-size: 16px;
}

.category-header.meat {
  background-color: #f56c6c;
}

.category-header.halfMeat {
  background-color: #e6a23c;
}

.category-header.vegetable {
  background-color: #67c23a;
}

.category-header.soup {
  background-color: #909399;
}

.category-header.staple {
  background-color: #409eff;
}

.category-header.drink {
  background-color: #9254de;
}

.category-header.combo {
  background-color: #ff85c0;
}

/* 价格显示样式 */
.price-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.price-item {
  margin: 2px 0;
  white-space: nowrap;
}

.price-label {
  color: #909399;
  font-size: 12px;
  margin-right: 2px;
}

/* 平板设备 */
@media screen and (max-width: 1024px) {
  .dashboard {
    padding: 20px;
  }
}

/* 手机设备 */
@media screen and (max-width: 768px) {
  .dashboard {
    padding: 16px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .dashboard h1 {
    font-size: 22px;
  }

  .action-buttons {
    width: 100%;
  }

  .management-link .el-button {
    width: 100%;
  }

  .menu-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

/* 小屏手机 */
@media screen and (max-width: 480px) {
  .menu-section {
    grid-template-columns: 1fr;
  }
}
</style>
