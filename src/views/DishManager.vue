<template>
  <div class="dish-manager">
    <h1>菜品管理</h1>

    <div class="tools-section">
      <el-button type="primary" @click="addNewDish">
        <el-icon><Plus /></el-icon> 添加菜品
      </el-button>

      <el-input
        v-model="searchQuery"
        placeholder="搜索菜品"
        prefix-icon="Search"
        clearable
        class="search-input"
      />

      <el-select v-model="categoryFilter" placeholder="分类筛选" clearable>
        <el-option label="全部分类" value="" />
        <el-option label="荤菜" value="meat" />
        <el-option label="半荤素" value="halfMeat" />
        <el-option label="素菜" value="vegetable" />
        <el-option label="炖汤" value="soup" />
        <el-option label="主食" value="staple" />
        <el-option label="饮料" value="drink" />
      </el-select>
    </div>

    <el-table :data="filteredDishes" style="width: 100%" v-loading="loading" border>
      <el-table-column prop="name" label="菜品名称" min-width="150" />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          <el-tag :type="getCategoryTag(row.category)">
            {{ getCategoryLabel(row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="200">
        <template #default="{ row }">
          <div v-if="row.hasMultipleSizes" class="price-display">
            <div class="price-item"><span class="price-label">小:</span> ¥{{ row.smallPrice }}</div>
            <div class="price-item"><span class="price-label">大:</span> ¥{{ row.largePrice }}</div>
          </div>
          <div v-else>¥{{ row.basePrice }}</div>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="editDish(row)"> 编辑 </el-button>
          <el-button size="small" type="danger" @click="confirmDelete(row)"> 删除 </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next"
        :total="totalDishes"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 编辑菜品对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑菜品' : '添加菜品'" width="500px">
      <el-form :model="dishForm" label-width="120px" :rules="rules" ref="dishFormRef">
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
import { Plus, Search } from '@element-plus/icons-vue'
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

// 监听搜索和分类筛选变化，重置页码
watch([searchQuery, categoryFilter], () => {
  currentPage.value = 1
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
    conditions.push(`category='${categoryFilter.value}'`)
  }

  if (searchQuery.value) {
    conditions.push(`name~'${searchQuery.value}'`)
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
  }
  return map[category]
}

// 加载菜品数据
const loadDishes = async () => {
  loading.value = true
  try {
    const filter = buildFilter.value
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
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .tools-section {
    flex-direction: column;
    gap: 12px;
  }

  .search-input {
    width: 100%;
  }

  .pagination-container {
    justify-content: center;
  }
}
</style>
