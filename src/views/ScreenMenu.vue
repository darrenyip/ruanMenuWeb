<template>
  <div class="menu-screen">
    <!-- 顶部标题区域 -->
    <header class="menu-header">
      <h1 class="menu-title">TODAY DISHES</h1>
      <h1 class="menu-title-cn">今日 MENUS 菜品</h1>
    </header>

    <!-- 菜品列表区域 -->
    <div class="menu-content">
      <!-- 荤菜区域 -->
      <section class="menu-section meat-dishes">
        <div class="section-header">
          <div class="section-title">
            <span class="title-cn">荤菜</span>
            <span class="title-en">MEAT DISHES</span>
          </div>
        </div>
        <div class="dishes-list">
          <div v-for="item in menuData.items.meat" :key="item.id" class="dish-item">
            <span class="dish-name">{{ item.name }}</span>
            <span class="dish-price">{{ item.price }}</span>
          </div>
        </div>
      </section>

      <!-- 半荤半素区域 -->
      <section class="menu-section mixed-dishes">
        <div class="section-header">
          <div class="section-title">
            <span class="title-cn">半荤半素</span>
            <span class="title-en">MIXED MEAT AND VEGETABLES</span>
          </div>
        </div>
        <div class="dishes-list">
          <div v-for="item in menuData.items.halfMeat" :key="item.id" class="dish-item">
            <span class="dish-name">{{ item.name }}</span>
            <span class="dish-price">{{ item.price }}</span>
          </div>
        </div>
      </section>

      <!-- 素菜区域 -->
      <section class="menu-section veg-dishes">
        <div class="section-header">
          <div class="section-title">
            <span class="title-cn">素菜</span>
            <span class="title-en">VEGETARIAN DISHES</span>
          </div>
        </div>
        <div class="dishes-list">
          <div v-for="item in menuData.items.vegetable" :key="item.id" class="dish-item">
            <span class="dish-name">{{ item.name }}</span>
            <span class="dish-price">{{ item.price }}</span>
          </div>
        </div>
      </section>
    </div>

    <!-- 底部区域 -->
    <footer class="menu-footer">
      <div class="logo-area">
        <div class="restaurant-logo">轻</div>
        <div class="restaurant-name">食坊</div>
      </div>
      <div class="footer-text">
        <p>多点烟火气</p>
        <p>少点高科技</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { menuApi } from '@/api/menu'

export default {
  name: 'ScreenMenu',
  setup() {
    // 创建默认的空菜单数据结构
    const defaultMenu = {
      menuId: '',
      date: '',
      type: 'lunch',
      items: {
        meat: [],
        halfMeat: [],
        vegetable: [],
        staple: [],
        soup: [],
        drink: [],
      },
    }

    const menuData = ref(defaultMenu)
    const loading = ref(true)
    const error = ref(null)

    // 获取今天的日期格式化为YYYY-MM-DD
    const getTodayDate = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    // 加载菜单数据
    const loadMenuData = async () => {
      loading.value = true
      error.value = null

      try {
        const todayDate = getTodayDate()
        const result = await menuApi.fetchMenu(todayDate, 'lunch')
        menuData.value = result
        console.log('加载菜单成功:', result)
      } catch (err) {
        console.error('加载菜单失败:', err)
        error.value = err.message || '加载菜单失败'
      } finally {
        loading.value = false
      }
    }

    // 组件挂载时加载数据
    onMounted(() => {
      loadMenuData()
    })

    return {
      menuData,
      loading,
      error,
    }
  },
}
</script>

<style scoped>
/* 整体布局和尺寸 */
.menu-screen {
  width: 2160px;
  height: 3840px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  color: #000;
  font-family: 'SimHei', 'Microsoft YaHei', sans-serif;
  overflow: hidden;
}

/* 头部样式 */
.menu-header {
  background-color: #d13428;
  color: white;
  padding: 40px;
  text-align: center;
}

.menu-title,
.menu-title-cn {
  font-size: 120px;
  margin: 0;
  font-weight: bold;
}

/* 内容区样式 */
.menu-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 菜品分类区域样式 */
.menu-section {
  display: flex;
  flex-direction: column;
}

.meat-dishes .section-header {
  background-color: #f8f5ec;
}

.mixed-dishes .section-header {
  background-color: #d13428;
  color: white;
}

.veg-dishes .section-header {
  background-color: #f8f5ec;
}

.section-header {
  display: flex;
  padding: 20px 40px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 60px;
  font-weight: bold;
}

.title-cn {
  margin-right: 20px;
}

.title-en {
  font-size: 40px;
}

/* 菜品列表样式 */
.dishes-list {
  display: flex;
  flex-direction: column;
}

.dish-item {
  display: flex;
  justify-content: space-between;
  padding: 40px 60px;
  font-size: 70px;
  border-bottom: 1px solid #eee;
}

.meat-dishes .dish-item,
.veg-dishes .dish-item {
  background-color: #f8f5ec;
}

.mixed-dishes .dish-item {
  background-color: #d13428;
  color: white;
}

.dish-price {
  font-size: 120px;
  font-weight: bold;
}

/* 底部样式 */
.menu-footer {
  background-color: #d13428;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 40px;
}

.logo-area {
  display: flex;
  flex-direction: column;
  font-size: 80px;
  font-weight: bold;
}

.footer-text {
  font-size: 50px;
  text-align: right;
}
</style>
