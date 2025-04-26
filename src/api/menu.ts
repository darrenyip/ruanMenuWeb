// src/api/menu.ts
import pb from '@/api/pocketbase'
import type {
  MenuType,
  MenuItem,
  FormattedMenu,
  MenuItemDisplay,
  OrganizedMenuItems,
  CategoryType,
} from '@/types/menu'

/**
 * 获取今日条件的辅助函数
 */
const getTodayCondition = () => {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // PocketBase 要求使用单引号包裹日期值
  return `date >= '${todayStart.toISOString()}' && date <= '${todayEnd.toISOString()}'`
}

/**
 * 菜单API
 */
export const menuApi = {
  /**
   * 获取指定日期和类型的菜单
   * @param date 日期，格式为YYYY-MM-DD
   * @param type 菜单类型：lunch, dinner, soup
   * @returns 格式化的菜单数据
   */
  fetchMenu: async (date: string, type: MenuType): Promise<FormattedMenu> => {
    try {
      // 将日期转换为开始和结束时间以便匹配
      const startDate = new Date(date)
      startDate.setHours(0, 0, 0, 0)

      const endDate = new Date(date)
      endDate.setHours(23, 59, 59, 999)

      // 1. 查找菜单记录 - 使用日期范围查询
      const menuList = await pb.collection('menus').getList(1, 1, {
        filter: `date >= '${startDate.toISOString()}' && date <= '${endDate.toISOString()}' && type='${type}'`,
      })

      if (menuList.items.length === 0) {
        throw new Error(`没有找到${date}的${type}菜单`)
      }

      const menu = menuList.items[0]
      console.log('找到菜单:', menu)

      // 2. 查找该菜单下的所有菜单项，并包含菜品信息
      const menuItems = (await pb.collection('menu_items').getFullList({
        filter: `menu='${menu.id}'`,
        expand: 'dish',
      })) as MenuItem[]

      // 3. 按类别组织数据
      const organizedItems = organizeMenuItemsByCategory(menuItems)

      // 4. 返回格式化的菜单数据
      return {
        menuId: menu.id,
        date: date, // 使用原始请求的日期，而不是数据库中的完整时间戳
        type: menu.type,
        items: organizedItems,
      }
    } catch (error) {
      console.error(`获取${type}菜单失败:`, error)
      throw error
    }
  },

  /**
   * 获取最近7天的菜单
   * @returns 菜单列表
   */
  fetchRecentMenus: async (): Promise<any[]> => {
    try {
      // 获取7天前的日期
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const dateStr = sevenDaysAgo.toISOString().split('T')[0]

      // 获取最近7天的菜单
      return pb.collection('menus').getFullList({
        filter: `date >= '${dateStr}'`,
        sort: '-date,type',
      })
    } catch (error) {
      console.error('获取最近菜单失败:', error)
      throw error
    }
  },
}

/**
 * 辅助函数: 按分类组织菜单项
 * @param menuItems 菜单项数组
 * @returns 按分类组织的菜单项
 */
function organizeMenuItemsByCategory(menuItems: MenuItem[]): OrganizedMenuItems {
  const result: OrganizedMenuItems = {
    meat: [],
    halfMeat: [],
    vegetable: [],
    staple: [],
    soup: [],
    drink: [],
  }

  menuItems.forEach((item) => {
    if (item.expand && item.expand.dish) {
      const dish = item.expand.dish
      const category = dish.category as CategoryType

      const displayItem: MenuItemDisplay = {
        id: item.id,
        dishId: dish.id,
        name: dish.name,
        price: dish.basePrice,
        hasMultipleSizes: dish.hasMultipleSizes,
        smallPrice: dish.smallPrice,
        largePrice: dish.largePrice,
      }

      // 确保类别存在，然后添加项目
      if (result[category]) {
        result[category].push(displayItem)
      }
    }
  })

  return result
}
