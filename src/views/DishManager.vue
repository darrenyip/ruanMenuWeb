<template>
  <div class="dish-manager">
    <h1>菜品管理</h1>

    <div class="tools-section">
      <el-button type="primary" @click="addNewDish">
        <el-icon><Plus /></el-icon> 添加菜品
      </el-button>

      <el-input v-model="searchQuery" placeholder="搜索菜品" clearable class="search-input">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select v-model="categoryFilter" placeholder="分类筛选" clearable class="category-select">
        <el-option label="全部分类" value="" />
        <el-option label="荤菜" value="meat" />
        <el-option label="半荤素" value="halfMeat" />
        <el-option label="素菜" value="vegetable" />
        <el-option label="炖汤" value="soup" />
        <el-option label="主食" value="staple" />
        <el-option label="饮料" value="drink" />
        <el-option label="套餐" value="combo" />
      </el-select>
    </div>

    <div class="table-container">
      <el-table :data="filteredDishes" style="width: 100%" v-loading="loading" border>
        <el-table-column prop="name" label="菜品名称" min-width="150" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            <div v-if="row.hasMultipleSizes" class="price-display">
              <div class="price-item">
                <span class="price-label">小:</span> ¥{{ row.smallPrice }}
              </div>
              <div class="price-item">
                <span class="price-label">大:</span> ¥{{ row.largePrice }}
              </div>
            </div>
            <div v-else>¥{{ row.basePrice }}</div>
          </template>
        </el-table-column>
        <el-table-column label="分类" width="90">
          <template #default="{ row }">
            <el-tag :type="getCategoryTag(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" :width="isMobile ? '80' : '150'" fixed="right">
          <template #default="{ row }">
            <div class="operation-buttons">
              <div class="btn-wrapper">
                <el-button
                  v-if="isMobile"
                  size="small"
                  type="primary"
                  @click="editDish(row)"
                  class="mobile-btn"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button v-else size="small" type="primary" @click="editDish(row)"
                  >编辑</el-button
                >
              </div>

              <div class="btn-wrapper">
                <el-button
                  v-if="isMobile"
                  size="small"
                  type="danger"
                  @click="confirmDelete(row)"
                  class="mobile-btn"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
                <el-button v-else size="small" type="danger" @click="confirmDelete(row)"
                  >删除</el-button
                >
              </div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :layout="isMobile ? 'prev, pager, next' : 'total, sizes, prev, pager, next'"
        :small="isMobile"
        :pager-count="isMobile ? 5 : 7"
        :total="totalDishes"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑菜品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditMode ? '编辑菜品' : '添加菜品'"
      width="90%"
      :fullscreen="isMobile"
      class="dish-dialog"
    >
      <el-form
        :model="dishForm"
        :label-width="isMobile ? '80px' : '120px'"
        :rules="rules"
        ref="dishFormRef"
      >
        <el-form-item label="菜品名称" prop="name">
          <el-input v-model="dishForm.name" placeholder="请输入菜品名称" />
        </el-form-item>

        <el-form-item label="分类" prop="category">
          <el-select v-model="dishForm.category" placeholder="请选择分类">
            <el-option label="荤菜" value="meat" />
            <el-option label="半荤素" value="halfMeat" />
            <el-option label="素菜" value="vegetable" />
            <el-option label="炖汤" value="soup" />
            <el-option label="主食" value="staple" />
            <el-option label="饮料" value="drink" />
            <el-option label="套餐" value="combo" />
          </el-select>
        </el-form-item>

        <el-form-item label="多规格价格">
          <el-switch v-model="dishForm.hasMultipleSizes" />
        </el-form-item>

        <template v-if="dishForm.hasMultipleSizes">
          <el-form-item label="小份价格" prop="smallPrice">
            <el-input-number v-model="dishForm.smallPrice" :min="0" :precision="2" :step="0.5" />
          </el-form-item>

          <el-form-item label="大份价格" prop="largePrice">
            <el-input-number v-model="dishForm.largePrice" :min="0" :precision="2" :step="0.5" />
          </el-form-item>
        </template>

        <template v-else>
          <el-form-item label="价格" prop="basePrice">
            <el-input-number v-model="dishForm.basePrice" :min="0" :precision="2" :step="0.5" />
          </el-form-item>
        </template>

        <el-form-item label="描述">
          <el-input v-model="dishForm.description" type="textarea" placeholder="可选描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveDish">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { Plus, Search, Edit, Delete } from '@element-plus/icons-vue'
import type { Dish, CategoryType } from '@/types/menu'
import { dishApi } from '@/api/dish'

// 加载状态
const loading = ref(false)

// 菜品数据
const dishes = ref<Dish[]>([])
const totalDishes = ref(0)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchQuery = ref('')
const categoryFilter = ref('')

// 判断是否为移动设备
const isMobile = ref(window.innerWidth < 768)

// 监听窗口大小变化
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth < 768
})

// 监听搜索和分类筛选变化，重置页码并重新加载数据
watch([searchQuery, categoryFilter], () => {
  currentPage.value = 1
  loadDishes()
})

// 编辑对话框
const dialogVisible = ref(false)
const isEditMode = ref(false)
const dishFormRef = ref<FormInstance>()

// 菜品表单
const dishForm = reactive({
  id: '',
  name: '',
  category: 'meat' as CategoryType,
  basePrice: 0,
  smallPrice: 0,
  largePrice: 0,
  hasMultipleSizes: false,
  description: '',
})

// 表单验证规则
const rules = {
  name: [{ required: true, message: '请输入菜品名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  basePrice: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  smallPrice: [{ required: true, message: '请输入小份价格', trigger: 'blur' }],
  largePrice: [{ required: true, message: '请输入大份价格', trigger: 'blur' }],
}

// 构建筛选条件
const buildFilter = computed(() => {
  const conditions = []

  if (categoryFilter.value) {
    conditions.push(`category="${categoryFilter.value}"`)
  }

  if (searchQuery.value) {
    conditions.push(`name~"${searchQuery.value}"`)
  }

  return conditions.join(' && ')
})

// 筛选后的菜品列表
const filteredDishes = computed(() => {
  return dishes.value
})

// 获取分类标签样式
const getCategoryTag = (category: CategoryType) => {
  const map: Record<CategoryType, 'success' | 'warning' | 'info' | 'primary' | 'danger'> = {
    meat: 'danger',
    halfMeat: 'warning',
    vegetable: 'success',
    soup: 'info',
    staple: 'primary',
    drink: 'info',
    combo: 'primary',
  }
  return map[category]
}

// 获取分类标签文本
const getCategoryLabel = (category: CategoryType) => {
  const map: Record<CategoryType, string> = {
    meat: '荤菜',
    halfMeat: '半荤素',
    vegetable: '素菜',
    soup: '炖汤',
    staple: '主食',
    drink: '饮料',
    combo: '套餐',
  }
  return map[category]
}

// 加载菜品数据
const loadDishes = async () => {
  loading.value = true
  try {
    const filter = buildFilter.value
    console.log('筛选条件:', filter) // 调试用
    const result = await dishApi.getDishes(currentPage.value, pageSize.value, filter)

    dishes.value = result.items
    totalDishes.value = result.totalItems
  } catch (error) {
    console.error('加载菜品失败', error)
    ElMessage.error('加载菜品失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  loadDishes()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  loadDishes()
}

// 添加新菜品
const addNewDish = () => {
  isEditMode.value = false
  // 重置表单
  Object.assign(dishForm, {
    id: '',
    name: '',
    category: 'meat',
    basePrice: 0,
    smallPrice: 0,
    largePrice: 0,
    hasMultipleSizes: false,
    description: '',
  })
  dialogVisible.value = true
}

// 编辑菜品
const editDish = (dish: Dish) => {
  isEditMode.value = true
  // 填充表单
  Object.assign(dishForm, {
    id: dish.id,
    name: dish.name,
    category: dish.category,
    basePrice: dish.basePrice,
    smallPrice: dish.smallPrice || 0,
    largePrice: dish.largePrice || 0,
    hasMultipleSizes: dish.hasMultipleSizes,
    description: dish.description || '',
  })
  dialogVisible.value = true
}

// 确认删除
const confirmDelete = (dish: Dish) => {
  ElMessageBox.confirm(`确定要删除菜品"${dish.name}"吗？`, '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      deleteDish(dish)
    })
    .catch(() => {
      // 用户取消删除
    })
}

// 删除菜品
const deleteDish = async (dish: Dish) => {
  try {
    loading.value = true
    await dishApi.deleteDish(dish.id)

    ElMessage.success(`菜品"${dish.name}"已删除`)
    loadDishes() // 重新加载数据
  } catch (error) {
    console.error('删除菜品失败', error)
    ElMessage.error('删除菜品失败')
  } finally {
    loading.value = false
  }
}

// 保存菜品
const saveDish = async () => {
  if (!dishFormRef.value) return

  await dishFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        loading.value = true

        const saveData = {
          name: dishForm.name,
          category: dishForm.category,
          basePrice: dishForm.basePrice,
          smallPrice: dishForm.hasMultipleSizes ? dishForm.smallPrice : undefined,
          largePrice: dishForm.hasMultipleSizes ? dishForm.largePrice : undefined,
          hasMultipleSizes: dishForm.hasMultipleSizes,
          description: dishForm.description || undefined,
        }

        if (isEditMode.value) {
          // 更新现有菜品
          await dishApi.updateDish(dishForm.id, saveData)
          ElMessage.success('菜品更新成功')
        } else {
          // 添加新菜品
          await dishApi.createDish(saveData)
          ElMessage.success('菜品添加成功')
        }

        dialogVisible.value = false
        loadDishes() // 重新加载数据
      } catch (error) {
        console.error('保存菜品失败', error)
        ElMessage.error('保存菜品失败')
      } finally {
        loading.value = false
      }
    }
  })
}

onMounted(() => {
  loadDishes()
})
</script>

<style scoped>
.dish-manager {
  padding: 20px;
}

.dish-manager h1 {
  margin-bottom: 24px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 16px;
}

.tools-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.search-input {
  width: 300px;
}

.category-select {
  width: 160px;
}

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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  overflow-x: auto;
}

.table-container {
  width: 100%;
  overflow-x: auto;
}

.operation-buttons {
  display: flex;
  gap: 8px;
}

.btn-wrapper {
  flex: 0 0 auto;
}

.mobile-btn {
  border-radius: 4px;
  min-width: 32px;
  height: 32px;
  padding: 5px;
}

/* 移除第二个按钮的左边距 */
.operation-buttons .mobile-btn + .mobile-btn {
  margin-left: 0 !important;
}

@media screen and (max-width: 768px) {
  .tools-section {
    flex-direction: column;
    gap: 12px;
  }

  .search-input,
  .category-select {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;
    padding-bottom: 10px;
  }

  :deep(.el-pagination) {
    white-space: nowrap;
    width: 100%;
    display: flex;
    justify-content: center;
    flex-wrap: nowrap;
  }

  /* 对话框在移动端的样式调整 */
  :deep(.dish-dialog .el-dialog__body) {
    padding: 15px;
  }

  :deep(.dish-dialog .el-form-item) {
    margin-bottom: 15px;
  }

  :deep(.dish-dialog .el-form-item__label) {
    width: 80px !important;
    padding-right: 5px;
  }

  :deep(.dish-dialog .el-form) {
    max-width: 100%;
  }

  :deep(.dish-dialog .dialog-footer) {
    display: flex;
    justify-content: space-between;
    width: 100%;
  }

  :deep(.dish-dialog .dialog-footer .el-button) {
    flex: 1;
    margin-left: 10px;
  }

  :deep(.dish-dialog .dialog-footer .el-button:first-child) {
    margin-left: 0;
  }

  /* 表格在移动端的样式调整 */
  .table-container {
    margin: 0 -10px;
    width: calc(100% + 20px);
  }

  :deep(.el-table__header),
  :deep(.el-table__body) {
    min-width: 100%;
  }

  /* 表格样式优化 */
  :deep(.el-table .cell) {
    padding-left: 5px;
    padding-right: 5px;
  }

  :deep(.el-table-column--selection .cell) {
    padding-left: 10px;
    padding-right: 10px;
  }

  .operation-buttons {
    display: flex;
    flex-direction: row;
    gap: 4px;
  }

  .operation-buttons .el-button {
    min-width: 32px;
    padding: 5px;
  }

  /* 调整价格显示 */
  .price-display {
    font-size: 12px;
  }

  /* 在移动设备上特别强调移除左边距 */
  .operation-buttons .el-button + .el-button {
    margin-left: 0 !important;
  }
}
</style>
