<template>
  <div class="editor-container">
    <el-page-header @back="$router.push('/')" title="返回总览" />
    <h2>{{ pageTitle }}</h2>

    <!-- 创建新菜品按钮 -->
    <div class="dish-search-section">
      <h3>菜品管理</h3>
      <el-button type="primary" @click="openNewDishForm">创建新菜品</el-button>
    </div>

    <!-- 当前菜单内容 -->
    <div class="category-cards">
      <div class="category-card" v-for="(label, key) in filteredCategories" :key="key">
        <h3>{{ label }}</h3>
        <el-empty
          v-if="!menuItems[key as CategoryType]?.length"
          description="暂无菜品，请添加"
          :image-size="80"
        />
        <el-table v-else :data="menuItems[key as CategoryType]">
          <el-table-column label="菜品">
            <template #default="{ row }">
              <div>{{ row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column label="价格" width="120">
            <template #default="{ row }">
              <!-- 如果有大小份，显示大小份价格 -->
              <div v-if="row.hasMultipleSizes" class="price-cell">
                <div class="price-item" @click="openPriceEditor(row, key as CategoryType, 'small')">
                  <span class="price-label">小:</span> ¥{{ row.smallPrice }}
                </div>
                <div class="price-item" @click="openPriceEditor(row, key as CategoryType, 'large')">
                  <span class="price-label">大:</span> ¥{{ row.largePrice }}
                </div>
              </div>
              <!-- 如果只有基础价格 -->
              <div v-else class="price-cell">
                <div class="price-item" @click="openPriceEditor(row, key as CategoryType, 'base')">
                  ¥{{ row.price }}
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column width="80">
            <template #default="{ $index }">
              <el-button
                type="danger"
                @click="removeItem(key as CategoryType, $index)"
                size="small"
              >
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 添加到当前分类的搜索框 -->
        <div class="category-add-section">
          <el-autocomplete
            v-model="categorySearchQueries[key as CategoryType]"
            :fetch-suggestions="
              (query, cb) => searchDishesForCategory(query, cb, key as CategoryType)
            "
            placeholder="搜索菜品名称"
            @select="(item) => handleDishSelect(item, key as CategoryType)"
            class="category-dish-search"
            value-key="name"
          >
            <template #default="{ item }">
              <div class="dish-suggestion">
                <div>{{ item.name }}</div>
                <div class="dish-price">
                  ¥{{ item.basePrice }}
                  <span v-if="item.hasMultipleSizes">(多规格)</span>
                </div>
              </div>
            </template>
          </el-autocomplete>
          <el-button type="success" size="small" @click="addSelectedDish(key as CategoryType)"
            >添加</el-button
          >
        </div>
      </div>
    </div>

    <div class="action-buttons">
      <el-button type="primary" @click="saveChanges" :loading="saving" class="action-button"
        >保存修改</el-button
      >
      <el-button @click="$router.push('/')" class="action-button">取消</el-button>
    </div>

    <!-- 创建新菜品的表单对话框 -->
    <el-dialog
      v-model="newDishFormVisible"
      title="创建新菜品"
      :width="isMobile ? '90%' : '500px'"
      :close-on-click-modal="false"
      class="new-dish-dialog"
    >
      <el-form :model="newDishForm" label-width="100px" class="new-dish-form">
        <el-form-item label="菜品名称">
          <el-autocomplete
            v-model="newDishForm.name"
            :fetch-suggestions="searchDishes"
            placeholder="输入菜品名称"
            style="width: 100%"
            @select="handleSelectExistingDish"
          >
            <template #default="{ item }">
              <div class="dish-suggestion">
                <span>{{ item.name }}</span>
                <span class="dish-price">¥{{ item.basePrice }}</span>
              </div>
            </template>
          </el-autocomplete>
        </el-form-item>

        <el-form-item label="分类" required>
          <el-select v-model="newDishForm.category" placeholder="选择分类" style="width: 100%">
            <el-option
              v-for="(label, value) in categoryOptions"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="价格" required>
          <el-input-number
            v-model="newDishForm.basePrice"
            :min="0"
            :precision="1"
            :step="0.5"
            placeholder="基础价格"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="多规格">
          <el-switch v-model="newDishForm.hasMultipleSizes" />
        </el-form-item>

        <el-form-item label="小份价格" v-if="newDishForm.hasMultipleSizes">
          <el-input-number
            v-model="newDishForm.smallPrice"
            :min="0"
            :precision="1"
            :step="0.5"
            placeholder="小份价格"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="大份价格" v-if="newDishForm.hasMultipleSizes">
          <el-input-number
            v-model="newDishForm.largePrice"
            :min="0"
            :precision="1"
            :step="0.5"
            placeholder="大份价格"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="newDishForm.description"
            type="textarea"
            :rows="2"
            placeholder="菜品描述(可选)"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="newDishFormVisible = false">取消</el-button>
          <el-button type="primary" @click="createNewDish" :loading="creatingDish">创建</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 价格编辑对话框 -->
    <el-dialog v-model="priceEditorVisible" title="修改价格" width="300px">
      <el-form :model="priceEditorForm">
        <el-form-item
          :label="
            priceEditorForm.type === 'small'
              ? '小份价格'
              : priceEditorForm.type === 'large'
                ? '大份价格'
                : '价格'
          "
        >
          <el-input-number
            v-model="priceEditorForm.price"
            :min="0"
            :precision="1"
            :step="0.5"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="priceEditorVisible = false">取消</el-button>
        <el-button type="primary" @click="savePrice" :loading="savingPrice">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuStore } from '@/stores/menu'
import { ElMessage, ElMessageBox } from 'element-plus'
import pb from '@/api/pocketbase'
import type {
  CategoryType,
  MenuType,
  Dish,
  MenuItemDisplay,
  OrganizedMenuItems,
} from '@/types/menu'

const router = useRouter()

// 接收的属性
const props = defineProps<{
  mealType: MenuType // 'lunch' | 'dinner' | 'other'
  menuTitle: string
}>()

// Store
const menuStore = useMenuStore()

// 状态变量
const menuDate = ref(new Date().toISOString().split('T')[0])
const menuItems = ref<OrganizedMenuItems>({
  meat: [],
  halfMeat: [],
  vegetable: [],
  staple: [],
  soup: [],
  drink: [],
})
const allDishes = ref<Dish[]>([])
const categorySearchQueries = reactive<Record<CategoryType, string>>({
  meat: '',
  halfMeat: '',
  vegetable: '',
  staple: '',
  soup: '',
  drink: '',
})
const saving = ref(false)
const menuId = ref('')

// 新菜品表单
const newDishFormVisible = ref(false)
const creatingDish = ref(false)
const newDishForm = ref({
  name: '',
  category: 'meat' as CategoryType,
  basePrice: 0,
  smallPrice: 0,
  largePrice: 0,
  hasMultipleSizes: false,
  description: '',
})

// 价格编辑表单
const priceEditorVisible = ref(false)
const savingPrice = ref(false)
const priceEditorForm = ref({
  id: '',
  dishId: '',
  type: '', // 'base', 'small', 'large'
  price: 0,
  category: '' as CategoryType,
  index: 0, // 在menuItems数组中的索引
  hasMultipleSizes: false,
})

// 分类标签
const categoryLabels = {
  meat: '🥩 荤菜',
  halfMeat: '🥘 半荤素',
  vegetable: '🥬 素菜',
  staple: '🍚 主食',
  soup: '🥘 炖汤',
  drink: '🥤 饮料',
}

// 用于下拉选择的分类选项
const categoryOptions = {
  meat: '荤菜',
  halfMeat: '半荤素',
  vegetable: '素菜',
  staple: '主食',
  soup: '炖汤',
  drink: '饮料',
}

// 根据菜单类型显示相关分类
const visibleCategories = computed(() => {
  if (props.mealType === 'other') {
    return ['soup', 'staple', 'drink'] as CategoryType[]
  }
  return ['meat', 'halfMeat', 'vegetable'] as CategoryType[]
})

// 过滤后的分类对象，仅包含可见分类
const filteredCategories = computed(() => {
  const result: Record<CategoryType, string> = {} as Record<CategoryType, string>
  for (const category of visibleCategories.value) {
    result[category] = categoryLabels[category]
  }
  return result
})

// 计算标题
const pageTitle = computed(() => {
  if (props.mealType === 'other') {
    return '其他菜单编辑'
  } else if (props.mealType === 'lunch') {
    return '午餐菜单编辑'
  } else {
    return '晚餐菜单编辑'
  }
})

// 加载菜单数据
const loadMenuData = async () => {
  try {
    // 如果store中已有当前类型的菜单数据，直接使用
    if (menuStore.currentMenu?.type === props.mealType) {
      menuItems.value = menuStore.currentMenu.items
      menuId.value = menuStore.currentMenu.menuId
      return
    }

    // 尝试加载今天的菜单
    await menuStore.fetchMenu(menuDate.value, props.mealType)
    menuItems.value = menuStore.currentMenu?.items || {
      meat: [],
      halfMeat: [],
      vegetable: [],
      staple: [],
      soup: [],
      drink: [],
    }
    menuId.value = menuStore.currentMenu?.menuId || ''
  } catch (error) {
    console.error('加载菜单失败:', error)
    // 创建空菜单结构
    menuItems.value = {
      meat: [],
      halfMeat: [],
      vegetable: [],
      staple: [],
      soup: [],
      drink: [],
    }
    menuId.value = ''
  }
}

// 加载所有菜品
const loadDishes = async () => {
  try {
    allDishes.value = (await pb.collection('dishes').getFullList()) as unknown as Dish[]
  } catch (error) {
    console.error('加载菜品失败:', error)
    ElMessage.error('无法加载菜品列表')
  }
}

// 以下类型定义用于解决autocomplete组件的类型问题
interface DishSuggestion {
  name: string
  id: string
  basePrice: number
  hasMultipleSizes: boolean
  category: CategoryType
  [key: string]: any
}

// 搜索菜品
const searchDishes = (query: string, callback: (suggestions: DishSuggestion[]) => void) => {
  if (query.length < 1) {
    callback([])
    return
  }

  // 先从本地缓存搜索
  let results = allDishes.value.filter((dish) =>
    dish.name.toLowerCase().includes(query.toLowerCase()),
  )

  // 如果本地没有足够结果，尝试从服务器获取
  if (results.length < 5) {
    try {
      pb.collection('dishes')
        .getList(1, 10, {
          filter: `name ~ "${query}"`,
          sort: 'name',
        })
        .then((serverResults) => {
          // 确保服务器结果是有效的
          if (serverResults && serverResults.items) {
            const serverDishes = serverResults.items as unknown as Dish[]
            // 将新获取的菜品添加到本地缓存
            serverDishes.forEach((dish) => {
              if (!allDishes.value.some((d) => d.id === dish.id)) {
                allDishes.value.push(dish)
              }
            })
            results = [...results, ...serverDishes]
            // 去重
            const uniqueMap = new Map()
            results.forEach((dish) => uniqueMap.set(dish.id, dish))
            results = Array.from(uniqueMap.values())
          }
          callback(results.slice(0, 10))
        })
        .catch((error) => {
          console.error('搜索菜品失败:', error)
          callback(results.slice(0, 10))
        })
    } catch (error) {
      console.error('搜索菜品失败:', error)
      callback(results.slice(0, 10))
    }
  } else {
    callback(results.slice(0, 10))
  }
}

// 特定分类的搜索筛选
const searchDishesForCategory = (
  query: string,
  callback: (suggestions: DishSuggestion[]) => void,
  category: CategoryType,
) => {
  // 首先获取所有匹配的菜品
  searchDishes(query, (results) => {
    // 将结果过滤为当前分类的菜品，但也返回没有分类的菜品
    const filteredResults = results.filter((dish) => dish.category === category || !dish.category)
    callback(filteredResults)
  })
}

// 选择菜品添加到指定分类
const handleDishSelect = (item: Record<string, any>, category: CategoryType) => {
  if (!item) return

  // 添加到对应分类
  const newItem: MenuItemDisplay = {
    id: `temp_${Date.now()}`, // 临时ID，保存时会被替换
    dishId: item.id, // 保存dish ID，用于后续编辑
    name: item.name,
    price: item.basePrice,
    category: category, // 添加category属性
    hasMultipleSizes: item.hasMultipleSizes || false,
    smallPrice: item.smallPrice || 0,
    largePrice: item.largePrice || 0,
  }

  menuItems.value[category].push(newItem)
  categorySearchQueries[category] = ''

  ElMessage.success(`已添加到${categoryLabels[category]}: ${item.name}`)
}

// 添加手动输入的菜品
const addSelectedDish = (category: CategoryType) => {
  if (!categorySearchQueries[category]) {
    ElMessage.warning('请先搜索或输入菜品名称')
    return
  }

  // 查找是否有匹配的菜品
  const matchedDish = allDishes.value.find(
    (d) => d.name.toLowerCase() === categorySearchQueries[category].toLowerCase(),
  )

  if (matchedDish) {
    // 如果找到匹配的菜品，直接添加
    handleDishSelect(matchedDish, category)
  } else {
    // 如果没有匹配的菜品，询问是否创建新菜品
    ElMessageBox.confirm(`没有找到"${categorySearchQueries[category]}"，是否创建新菜品？`, '提示', {
      confirmButtonText: '创建',
      cancelButtonText: '取消',
      type: 'info',
    })
      .then(() => {
        // 预填充表单并打开创建菜品对话框
        newDishForm.value = {
          name: categorySearchQueries[category],
          category: category,
          basePrice: 0,
          smallPrice: 0,
          largePrice: 0,
          hasMultipleSizes: false,
          description: '',
        }
        newDishFormVisible.value = true
      })
      .catch(() => {
        // 用户取消创建
        console.log('用户取消创建新菜品')
      })
  }
}

// 移除菜单项
const removeItem = (category: CategoryType, index: number) => {
  menuItems.value[category].splice(index, 1)
}

// 打开新建菜品表单
const openNewDishForm = () => {
  newDishForm.value = {
    name: '',
    category: props.mealType === 'other' ? 'soup' : 'meat',
    basePrice: 0,
    smallPrice: 0,
    largePrice: 0,
    hasMultipleSizes: false,
    description: '',
  }
  newDishFormVisible.value = true
}

// 创建新菜品
const createNewDish = async () => {
  if (!newDishForm.value.name || !newDishForm.value.basePrice) {
    ElMessage.warning('请填写菜品名称和价格')
    return
  }

  creatingDish.value = true

  try {
    // 创建新菜品
    const newDish = (await pb.collection('dishes').create({
      name: newDishForm.value.name,
      category: newDishForm.value.category,
      basePrice: newDishForm.value.basePrice,
      smallPrice: newDishForm.value.hasMultipleSizes ? newDishForm.value.smallPrice : null,
      largePrice: newDishForm.value.hasMultipleSizes ? newDishForm.value.largePrice : null,
      hasMultipleSizes: newDishForm.value.hasMultipleSizes,
      description: newDishForm.value.description || null,
    })) as unknown as Dish

    // 添加到本地缓存
    allDishes.value.push(newDish)

    // 成功创建后关闭对话框，但不自动添加到当前菜单
    newDishFormVisible.value = false
    ElMessage.success('菜品创建成功，您可以通过搜索将其添加到菜单')

    // 清空搜索框以便用户可以搜索新创建的菜品
    if (newDishForm.value.category) {
      categorySearchQueries[newDishForm.value.category] = newDish.name
    }
  } catch (error) {
    console.error('创建菜品失败:', error)
    ElMessage.error('创建菜品失败，请重试')
  } finally {
    creatingDish.value = false
  }
}

// 选择现有菜品预填充表单
const handleSelectExistingDish = (dish: Record<string, any>) => {
  if (!dish) return

  // 预填充表单
  newDishForm.value = {
    name: dish.name,
    category: dish.category as CategoryType,
    basePrice: dish.basePrice,
    smallPrice: dish.smallPrice || 0,
    largePrice: dish.largePrice || 0,
    hasMultipleSizes: dish.hasMultipleSizes,
    description: dish.description || '',
  }

  // 提示用户
  ElMessage.warning('已存在同名菜品，已预填充现有信息，您可以修改后创建')
}

// 保存菜单
const saveChanges = async () => {
  // 先检查是否有菜品
  const totalItems = Object.values(menuItems.value).reduce(
    (count, items) => count + items.length,
    0,
  )

  if (totalItems === 0) {
    ElMessage.warning('请至少添加一个菜品')
    return
  }

  saving.value = true

  try {
    // 1. 确保有菜单记录
    let menuRecord

    if (menuId.value) {
      try {
        // 更新现有菜单
        menuRecord = await pb.collection('menus').getOne(menuId.value)
      } catch (error) {
        console.error('获取现有菜单失败，将创建新菜单:', error)
        // 如果获取失败，创建新菜单
        menuRecord = await pb.collection('menus').create({
          date: menuDate.value,
          type: props.mealType,
          name: props.mealType === 'lunch' ? '午餐' : props.mealType === 'dinner' ? '晚餐' : '其他',
        })
        menuId.value = menuRecord.id
      }
    } else {
      // 创建新菜单
      menuRecord = await pb.collection('menus').create({
        date: menuDate.value,
        type: props.mealType,
        name: props.mealType === 'lunch' ? '午餐' : props.mealType === 'dinner' ? '晚餐' : '其他',
      })
      menuId.value = menuRecord.id
    }

    // 2. 获取现有菜单项，以便删除不再使用的
    const existingMenuItems = await pb.collection('menu_items').getFullList({
      filter: `menu="${menuId.value}"`,
    })

    // 3. 收集所有分类的菜单项
    const allCategoryItems: MenuItemDisplay[] = []
    Object.keys(menuItems.value).forEach((category) => {
      menuItems.value[category as CategoryType].forEach((item) => {
        allCategoryItems.push(item)
      })
    })

    // 4. 删除不再使用的菜单项
    const idsToKeep = allCategoryItems
      .filter((item) => !item.id.startsWith('temp_'))
      .map((item) => item.id)

    const itemsToDelete = existingMenuItems.filter((item) => !idsToKeep.includes(item.id))

    // 依次删除不再使用的菜单项，避免并行删除可能引起的问题
    for (const item of itemsToDelete) {
      try {
        await pb.collection('menu_items').delete(item.id)
      } catch (error) {
        console.error(`删除菜单项失败: ${item.id}`, error)
        // 继续处理其他项，不中断流程
      }
    }

    // 5. 创建或更新菜单项
    const newItems: { menu: string; dish: string }[] = []
    const errors: string[] = []

    // 提前准备好要添加的菜品，避免重复添加
    const dishesToAdd = new Set<string>()

    for (const category of Object.keys(menuItems.value) as CategoryType[]) {
      for (const item of menuItems.value[category]) {
        // 如果是临时ID，需要创建新记录
        if (item.id.startsWith('temp_')) {
          const dishId = item.dishId || allDishes.value.find((d) => d.name === item.name)?.id

          if (dishId && !dishesToAdd.has(dishId)) {
            dishesToAdd.add(dishId)
            newItems.push({
              menu: menuId.value,
              dish: dishId,
            })
          } else if (!dishId) {
            errors.push(`找不到菜品: ${item.name}`)
          }
        }
      }
    }

    // 逐个创建菜单项，避免并行处理可能引起的冲突
    for (const newItem of newItems) {
      try {
        await pb.collection('menu_items').create(newItem)
      } catch (error) {
        console.error('创建菜单项失败:', error)
        errors.push(`创建"${newItem.dish}"菜单项失败`)
        // 继续处理其他项，不中断流程
      }
    }

    // 根据错误情况显示不同消息
    if (errors.length > 0) {
      console.error('保存菜单时出现部分错误:', errors)
      ElMessage({
        message: '菜单部分保存成功，但有些项目未能添加',
        type: 'warning',
        duration: 5000,
      })
    } else {
      ElMessage.success('菜单保存成功')
    }

    // 刷新菜单数据
    await menuStore.fetchMenu(menuDate.value, props.mealType)

    // 记录当前编辑的菜单类型
    menuStore.lastEditedType = props.mealType

    // 返回概览页面时带上当前菜单类型参数
    router.push({
      path: '/overview',
      query: { type: props.mealType },
    })
  } catch (error) {
    console.error('保存菜单失败:', error)
    ElMessage.error('保存菜单失败，请重试')
  } finally {
    saving.value = false
  }
}

// 打开价格编辑对话框
const openPriceEditor = (item: MenuItemDisplay, category: CategoryType, type: string) => {
  // 查找项目在数组中的索引
  const index = menuItems.value[category].findIndex((i) => i.id === item.id)

  // 设置编辑表单
  priceEditorForm.value = {
    id: item.id,
    dishId: item.dishId || '', // 如果没有dishId，使用空字符串
    type: type,
    price:
      type === 'base' ? item.price : type === 'small' ? item.smallPrice || 0 : item.largePrice || 0,
    category: category,
    index: index,
    hasMultipleSizes: Boolean(item.hasMultipleSizes), // 确保是布尔值
  }

  priceEditorVisible.value = true
}

// 保存价格
const savePrice = async () => {
  if (priceEditorForm.value.price < 0) {
    ElMessage.warning('价格不能为负数')
    return
  }

  savingPrice.value = true

  try {
    const { id, type, price, category, index, dishId, hasMultipleSizes } = priceEditorForm.value

    // 更新本地状态
    if (index >= 0) {
      const item = menuItems.value[category][index]

      // 更新相应的价格
      if (type === 'base') {
        item.price = price
      } else if (type === 'small') {
        item.smallPrice = price
      } else if (type === 'large') {
        item.largePrice = price
      }
    }

    // 如果不是临时ID，更新数据库中的菜品数据
    if (dishId && !id.startsWith('temp_')) {
      try {
        const updateData: Record<string, any> = {}

        if (type === 'base') {
          updateData.basePrice = price
        } else if (type === 'small') {
          updateData.smallPrice = price
          // 确保启用多规格
          if (hasMultipleSizes) {
            updateData.hasMultipleSizes = true
          }
        } else if (type === 'large') {
          updateData.largePrice = price
          // 确保启用多规格
          if (hasMultipleSizes) {
            updateData.hasMultipleSizes = true
          }
        }

        // 更新菜品价格
        await pb.collection('dishes').update(dishId, updateData)

        // 刷新菜品数据
        await loadDishes()
      } catch (error) {
        console.error('更新菜品价格失败:', error)
        throw error
      }
    }

    priceEditorVisible.value = false
    ElMessage.success('价格修改成功')
  } catch (error) {
    console.error('保存价格失败:', error)
    ElMessage.error('保存价格失败，请重试')
  } finally {
    savingPrice.value = false
  }
}

// 添加移动端检测
const isMobile = ref(window.innerWidth <= 768)

// 监听窗口大小变化
window.addEventListener('resize', () => {
  isMobile.value = window.innerWidth <= 768
})

// 页面加载时初始化数据
onMounted(async () => {
  await loadDishes()
  await loadMenuData()
})
</script>

<style scoped>
/* 桌面端优先设计 */
.editor-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.dish-search-section {
  margin-bottom: 36px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.dish-search-section h3 {
  white-space: nowrap;
  margin: 0;
  min-width: 80px;
}

.dish-search {
  flex: 1;
}

.dish-suggestion {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.dish-price {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.category-cards {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: space-between;
  margin-bottom: 30px;
  overflow-y: auto;
}

.category-card {
  flex: 1;
  min-width: 280px;
  background-color: #f9fafc;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.category-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.category-card h3 {
  margin-top: 0;
  margin-bottom: 12px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.category-add-section {
  margin-top: 10px;
  display: flex;
  gap: 8px;
  align-items: center;
}

.category-dish-search {
  flex: 1;
}

/* 底部按钮区域 */
.action-buttons {
  margin-top: 40px;
  text-align: right;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
}

.action-button {
  min-width: 100px;
}

/* 平板设备 */
@media screen and (max-width: 1024px) {
  .editor-container {
    max-width: 100%;
    padding: 25px;
  }

  .dish-search-section {
    margin-bottom: 30px;
    padding: 16px;
    gap: 12px;
  }

  .category-cards {
    gap: 15px;
  }

  .category-card {
    min-width: 250px;
    padding: 16px;
  }

  .category-add-section {
    margin-top: 8px;
    gap: 6px;
  }

  .action-buttons {
    margin-top: 35px;
    gap: 12px;
  }
}

/* 手机设备 */
@media screen and (max-width: 768px) {
  .editor-container {
    padding: 20px;
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .dish-search-section {
    margin-bottom: 24px;
    padding: 15px;
    flex-direction: column;
    align-items: stretch;
  }

  .category-cards {
    flex-direction: column;
    gap: 15px;
    margin-bottom: 20px;
    padding-bottom: 0;
  }

  .category-card {
    width: 100%;
    min-width: unset;
    padding: 15px;
  }

  .category-card h3 {
    padding-bottom: 12px;
    font-size: 16px;
  }

  .category-add-section {
    flex-direction: column;
    margin-top: 8px;
    gap: 8px;
  }

  .action-buttons {
    margin-top: 30px;
    flex-direction: column;
    gap: 10px;
  }

  .action-button {
    width: 100%;
    min-width: unset;
  }

  .action-buttons :deep(.el-button + .el-button) {
    margin-left: 0 !important;
  }
}

/* 小屏手机 */
@media screen and (max-width: 480px) {
  .editor-container {
    padding: 15px;
    padding-top: calc(env(safe-area-inset-top) + 10px);
    padding-bottom: calc(env(safe-area-inset-bottom) + 10px);
  }

  .dish-search-section {
    margin-bottom: 20px;
    padding: 12px;
  }

  .category-cards {
    margin-bottom: 15px;
    gap: 12px;
  }

  .category-card {
    padding: 12px;
    border-radius: 6px;
  }

  .action-buttons {
    margin-top: 20px;
  }
}

.price-cell {
  cursor: pointer;
  transition: all 0.2s;
}

.price-cell:hover {
  background-color: #f0f9eb;
  border-radius: 4px;
  box-shadow: 0 0 0 2px rgba(103, 194, 58, 0.2);
}

.price-item {
  padding: 2px 4px;
  margin: 2px 0;
}

.price-label {
  color: #909399;
  margin-right: 4px;
}

/* 新菜品弹窗样式 */
.new-dish-dialog :deep(.el-dialog) {
  margin: 0 auto;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.new-dish-dialog :deep(.el-dialog__body) {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.new-dish-form {
  max-width: 100%;
}

.new-dish-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.new-dish-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid #ebeef5;
}

/* 移动端适配 */
@media screen and (max-width: 768px) {
  .new-dish-dialog :deep(.el-dialog) {
    margin: 5vh auto;
    width: 90% !important;
  }

  .new-dish-dialog :deep(.el-dialog__body) {
    padding: 15px;
  }

  .new-dish-form :deep(.el-form-item) {
    margin-bottom: 15px;
  }

  .new-dish-form :deep(.el-form-item__label) {
    float: none;
    display: block;
    text-align: left;
    padding: 0 0 8px;
    line-height: 1.5;
  }

  .new-dish-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .dialog-footer {
    padding: 10px 15px;
  }
}

/* 小屏手机适配 */
@media screen and (max-width: 480px) {
  .new-dish-dialog :deep(.el-dialog) {
    margin: 0;
    width: 100% !important;
    height: 100vh;
    border-radius: 0;
  }

  .new-dish-dialog :deep(.el-dialog__body) {
    padding: 12px;
  }

  .new-dish-form :deep(.el-form-item) {
    margin-bottom: 12px;
  }

  .dialog-footer {
    padding: 8px 12px;
  }
}
</style>
