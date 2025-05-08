<template>
  <div class="editor-container">
    <el-page-header @back="$router.push('/')" title="返回总览" />
    <div class="editor-header">
      <h2>{{ pageTitle }}</h2>
      <div class="current-date">
        <span>当前编辑日期：</span>
        <el-date-picker
          v-model="menuDate"
          type="date"
          placeholder="选择日期"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          :size="isMobile ? 'small' : 'default'"
          @change="handleDateChange"
        />
      </div>
    </div>

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
        <div v-else class="draggable-table-container">
          <draggable
            v-model="menuItems[key as CategoryType]"
            item-key="id"
            handle=".drag-handle"
            animation="300"
            class="draggable-list"
            :disabled="isMobile && isScrolling"
            @start="dragStart"
            @end="dragEnd"
          >
            <template #item="{ element, index }">
              <div class="draggable-item">
                <div class="drag-handle">
                  <svg class="drag-icon" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5H21V7H3V5Z"
                    />
                  </svg>
                </div>
                <div class="dish-name">{{ element.name }}</div>
                <div class="dish-price">
                  <!-- 如果有大小份，显示大小份价格 -->
                  <div v-if="element.hasMultipleSizes" class="price-cell">
                    <div
                      class="price-item"
                      @click="openPriceEditor(element, key as CategoryType, 'small')"
                    >
                      <span class="price-label">小:</span> ¥{{ element.smallPrice }}
                    </div>
                    <div
                      class="price-item"
                      @click="openPriceEditor(element, key as CategoryType, 'large')"
                    >
                      <span class="price-label">大:</span> ¥{{ element.largePrice }}
                    </div>
                  </div>
                  <!-- 如果只有基础价格 -->
                  <div v-else class="price-cell">
                    <div
                      class="price-item"
                      @click="openPriceEditor(element, key as CategoryType, 'base')"
                    >
                      ¥{{ element.price }}
                    </div>
                  </div>
                </div>
                <div class="dish-actions">
                  <el-button
                    type="danger"
                    @click="removeItem(key as CategoryType, index)"
                    size="small"
                  >
                    移除
                  </el-button>
                </div>
              </div>
            </template>
          </draggable>
        </div>

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
import { menuApi } from '@/api/menu'
import type {
  CategoryType,
  MenuType,
  Dish,
  MenuItemDisplay,
  OrganizedMenuItems,
} from '@/types/menu'
// @ts-ignore
import draggable from 'vuedraggable'

const router = useRouter()

// 接收的属性
const props = defineProps<{
  mealType: MenuType // 'lunch' | 'dinner' | 'other'
  menuTitle: string
}>()

// Store
const menuStore = useMenuStore()

// 状态变量
const menuDate = ref(menuStore.selectedDate) // 使用store中选择的日期

// 获取当前本地日期的辅助函数
const getCurrentDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

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

// 移动端检测
const isMobile = computed(() => {
  return window.innerWidth <= 768
})

// 拖拽相关状态
const isScrolling = ref(false)
let scrollTimer: number | null = null

// 拖拽开始事件处理
const dragStart = () => {
  document.body.style.cursor = 'grabbing'
  // 防止移动端拖拽时触发页面滚动
  if (isMobile.value) {
    document.body.style.overflow = 'hidden'
  }
}

// 拖拽结束事件处理
const dragEnd = () => {
  document.body.style.cursor = 'auto'

  // 移动端拖拽结束时，允许短暂滚动延迟，防止误触
  if (isMobile.value) {
    isScrolling.value = true
    document.body.style.overflow = 'auto'

    if (scrollTimer !== null) {
      window.clearTimeout(scrollTimer)
    }

    scrollTimer = window.setTimeout(() => {
      isScrolling.value = false
    }, 300)
  }
}

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

// 处理日期变化
const handleDateChange = (date: string) => {
  if (date) {
    // 更新store中的选择日期
    menuStore.updateSelectedDate(date)
    // 重新加载当前编辑日期的菜单数据
    loadMenuData()
  }
}

// 加载菜单数据
const loadMenuData = async () => {
  try {
    // 使用当前选择的日期
    const currentDate = menuDate.value

    // 清空之前的菜单数据，确保没有旧数据显示
    menuItems.value = {
      meat: [],
      halfMeat: [],
      vegetable: [],
      staple: [],
      soup: [],
      drink: [],
    }
    menuId.value = ''

    // 尝试加载指定日期的菜单
    await menuStore.fetchMenu(currentDate, props.mealType)

    // 只有在成功获取到菜单数据时才更新
    if (menuStore.currentMenu?.menuId) {
      menuItems.value = menuStore.currentMenu.items || {
        meat: [],
        halfMeat: [],
        vegetable: [],
        staple: [],
        soup: [],
        drink: [],
      }
      menuId.value = menuStore.currentMenu.menuId || ''

      // 如果加载成功且有菜单ID，检查并修复排序
      if (menuId.value) {
        // 检查是否存在排序信息
        let hasOrder = false
        for (const category in menuItems.value) {
          if (
            menuItems.value[category as CategoryType].some((item) => item.sortOrder !== undefined)
          ) {
            hasOrder = true
            break
          }
        }

        // 如果没有排序信息，则尝试修复
        if (!hasOrder) {
          try {
            await menuApi.fixMenuItemsOrder(menuId.value)
            // 修复后重新加载菜单
            await menuStore.fetchMenu(currentDate, props.mealType)
            if (menuStore.currentMenu?.items) {
              menuItems.value = menuStore.currentMenu.items
            }
          } catch (fixError) {
            console.error('修复排序失败:', fixError)
          }
        }
      }
    }
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

    // 显示错误消息
    ElMessage.error(`加载${props.mealType}菜单失败: ${menuDate.value}没有菜单数据`)
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

    // 3. 收集所有分类的菜单项，并为每个项目添加排序信息
    const allCategoryItems: MenuItemDisplay[] = []
    let sortOrderCounter = 0 // 全局排序计数器

    // 按分类遍历所有菜品，保持每个分类内的顺序
    for (const category of Object.keys(menuItems.value) as CategoryType[]) {
      const items = menuItems.value[category]

      // 为每个项目添加排序号和分类信息
      items.forEach((item, index) => {
        // 记录项目在整个菜单中的全局排序（先按分类再按拖拽顺序）
        sortOrderCounter++
        allCategoryItems.push({
          ...item,
          sortOrder: sortOrderCounter,
          category, // 确保记录分类信息
        })
      })
    }

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
    const newItems: { menu: string; dish: string; sortOrder: number }[] = []
    const updateItems: { id: string; sortOrder: number }[] = []
    const errors: string[] = []

    // 准备要添加和更新的菜品
    for (const item of allCategoryItems) {
      // 如果是临时ID，需要创建新记录
      if (item.id.startsWith('temp_')) {
        const dishId = item.dishId || allDishes.value.find((d) => d.name === item.name)?.id

        if (dishId) {
          newItems.push({
            menu: menuId.value,
            dish: dishId,
            sortOrder: item.sortOrder || 0, // 使用计算的排序值
          })
        } else {
          errors.push(`找不到菜品: ${item.name}`)
        }
      } else {
        // 如果是现有ID，需要更新排序信息
        updateItems.push({
          id: item.id,
          sortOrder: item.sortOrder || 0, // 使用计算的排序值
        })
      }
    }

    // 逐个创建菜单项
    for (const newItem of newItems) {
      try {
        // 尝试安全地添加排序信息
        let itemToCreate: Record<string, any> = {
          menu: newItem.menu,
          dish: newItem.dish,
        }

        // 检查sortOrder字段是否支持
        let checkSortOrder = true
        if (newItems.length === 1) {
          try {
            // 获取集合结构信息（这只是一个启发式检查）
            const schemaCheck = await pb.collection('menu_items').getFullList({
              limit: 1,
            })
            if (schemaCheck.length > 0) {
              const sampleItem = schemaCheck[0]
              if ('sortOrder' in sampleItem) {
                // 添加排序字段
                itemToCreate = {
                  ...itemToCreate,
                  sortOrder: newItem.sortOrder,
                }
              } else {
                console.warn('警告：menu_items集合可能没有sortOrder字段，创建时不包含排序')
                checkSortOrder = false
              }
            }
          } catch (error) {
            console.error('检查集合结构失败:', error)
            // 保险起见，尝试添加排序字段
            itemToCreate = {
              ...itemToCreate,
              sortOrder: newItem.sortOrder,
            }
          }
        } else {
          // 如果有多个项目，为了效率考虑直接添加排序字段
          itemToCreate = {
            ...itemToCreate,
            sortOrder: newItem.sortOrder,
          }
        }

        // 创建菜单项
        await pb.collection('menu_items').create(itemToCreate)
      } catch (error) {
        console.error('创建菜单项失败:', error)
        errors.push(`创建"${newItem.dish}"菜单项失败`)
      }
    }

    // 逐个更新现有菜单项的排序
    for (const updateItem of updateItems) {
      try {
        // 检查是否支持sortOrder
        let hasField = true

        // 先尝试安全地获取一个项目，看看是否有sortOrder字段
        if (updateItems.length === 1) {
          try {
            const existingItem = await pb.collection('menu_items').getOne(updateItem.id)
            if (!('sortOrder' in existingItem)) {
              console.warn('警告：menu_items集合可能没有sortOrder字段，跳过排序更新')
              hasField = false
            }
          } catch (error) {
            // 如果获取失败，尝试继续执行
            console.error('检查sortOrder字段时出错:', error)
          }
        }

        // 只有在确认有字段时才进行更新
        if (hasField) {
          await pb.collection('menu_items').update(updateItem.id, {
            sortOrder: updateItem.sortOrder,
          })
        }
      } catch (error) {
        console.error(`更新菜单项排序失败: ${updateItem.id}`, error)
        errors.push(`更新菜单项排序失败`)
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

    // 记录当前编辑的菜单类型和日期
    menuStore.lastEditedType = props.mealType
    menuStore.updateSelectedDate(menuDate.value)

    // 返回概览页面时带上当前菜单类型和日期参数
    router.push({
      path: '/overview',
      query: {
        type: props.mealType,
        date: menuDate.value,
      },
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

// 页面加载时初始化数据
onMounted(async () => {
  // 检查URL参数中是否有日期参数
  const dateParam = router.currentRoute.value.query.date as string | undefined

  // 如果URL中有日期参数，使用它；否则使用当前日期
  if (dateParam) {
    menuDate.value = dateParam
    menuStore.updateSelectedDate(dateParam)
  } else {
    // 确保使用当前日期
    const today = getCurrentDate()
    menuDate.value = today
    menuStore.updateSelectedDate(today)
  }

  await loadDishes()
  await loadMenuData()
})
</script>

<style scoped>
/* 编辑器容器 */
.editor-container {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 编辑器顶部标题区域 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
  flex-wrap: wrap;
}

.editor-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

/* 日期选择器布局 */
.current-date {
  display: flex;
  align-items: center;
  gap: 10px;
}

.current-date span {
  color: #606266;
  font-weight: 500;
}

/* 菜品管理区域 */
.dish-search-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.dish-search-section h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

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

/* 拖拽相关样式 */
.draggable-table-container {
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
  border: 1px solid #ebeef5;
}

.draggable-list {
  width: 100%;
}

.draggable-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #fff;
  border-bottom: 1px solid #ebeef5;
  transition: background-color 0.3s;
}

.draggable-item:hover {
  background-color: #f5f7fa;
}

.draggable-item:last-child {
  border-bottom: none;
}

.drag-handle {
  cursor: grab;
  color: #909399;
  display: flex;
  align-items: center;
}

.drag-handle:active {
  cursor: grabbing;
}

.drag-icon {
  width: 20px;
  height: 20px;
}

.dish-name {
  flex: 1;
  padding: 0 10px;
  font-weight: 500;
}

.dish-price {
  width: 120px;
  padding: 0 10px;
}

.dish-actions {
  width: 80px;
  text-align: center;
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
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* 默认显示两列 */
  gap: 20px;
  margin-bottom: 30px;
  overflow-y: auto;
}

.category-card {
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

/* 大型显示器 - 可选增加更多列 */
@media screen and (min-width: 1440px) {
  .category-cards {
    grid-template-columns: repeat(3, 1fr); /* 大屏幕显示三列 */
  }
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
    grid-template-columns: repeat(2, 1fr); /* 平板保持两列 */
    gap: 15px;
  }

  .category-card {
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

  .draggable-item {
    padding: 8px;
  }
}

/* 小平板设备 */
@media screen and (max-width: 768px) {
  .editor-container {
    padding: 20px;
    margin: 0;
    border-radius: 0;
    min-height: 100vh;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .current-date {
    width: 100%;
  }

  .dish-search-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .dish-search-section h3 {
    margin-bottom: 10px;
  }

  .category-cards {
    grid-template-columns: 1fr; /* 小平板显示单列 */
    gap: 15px;
    margin-bottom: 20px;
  }

  .category-card {
    width: 100%;
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

  .draggable-item {
    padding: 10px 6px;
  }

  .dish-name {
    padding: 0 5px;
  }

  .dish-price {
    width: 90px;
    padding: 0 5px;
  }

  .dish-actions {
    width: 70px;
  }

  .drag-handle {
    padding: 0 5px;
  }
}

/* 手机设备 */
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

  .draggable-item {
    padding: 8px 4px;
    font-size: 14px;
  }

  .dish-name {
    padding: 0 3px;
  }

  .drag-icon {
    width: 16px;
    height: 16px;
  }

  .dish-price {
    width: 80px;
    padding: 0 3px;
  }

  .dish-actions {
    width: 60px;
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
