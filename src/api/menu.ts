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
 * 根据菜单类型获取对应的名称
 */
const getMenuNameByType = (type: MenuType): string => {
  switch (type) {
    case 'lunch':
      return '午餐'
    case 'dinner':
      return '晚餐'
    case 'other':
      return '其他'
    default:
      return '其他'
  }
}

/**
 * 菜单API
 */
export const menuApi = {
  /**
   * 创建新菜单
   * @param date 日期，格式为YYYY-MM-DD
   * @param type 菜单类型：lunch(午餐), dinner(晚餐), other(其他-包含炖汤/主食/饮料)
   * @returns 创建的菜单数据
   */
  createMenu: async (date: string, type: MenuType) => {
    try {
      // 根据类型设置对应的名称
      const name = getMenuNameByType(type)

      // 格式化日期 - 确保符合 ISO 格式
      const dateObj = new Date(date)
      const isoDate = dateObj.toISOString()

      // 创建菜单记录 - 按照PocketBase示例格式
      const data = {
        name: name,
        type: type,
        date: isoDate,
      }

      console.log('创建菜单数据:', data)
      const createdMenu = await pb.collection('menus').create(data)
      return createdMenu
    } catch (error) {
      console.error('创建菜单失败:', error)
      throw error
    }
  },

  /**
   * 获取或创建菜单
   * @param date 日期，格式为YYYY-MM-DD
   * @param type 菜单类型：lunch(午餐), dinner(晚餐), other(其他-包含炖汤/主食/饮料)
   * @returns 获取到的或创建的菜单数据
   */
  getOrCreateMenu: async (date: string, type: MenuType) => {
    try {
      // 将日期转换为开始和结束时间以便匹配
      const dateObj = new Date(date)
      dateObj.setHours(0, 0, 0, 0)
      const startDate = dateObj.toISOString()

      dateObj.setHours(23, 59, 59, 999)
      const endDate = dateObj.toISOString()

      console.log(`查询菜单条件: date >= '${startDate}' && date <= '${endDate}' && type='${type}'`)

      // 查找当天指定类型的菜单
      const menuList = await pb.collection('menus').getList(1, 1, {
        filter: `date >= '${startDate}' && date <= '${endDate}' && type='${type}'`,
      })

      console.log(`查询结果: 找到 ${menuList.items.length} 个菜单`)

      // 如果找到菜单则返回，否则创建新菜单
      if (menuList.items.length > 0) {
        return menuList.items[0]
      } else {
        return await menuApi.createMenu(date, type)
      }
    } catch (error) {
      console.error(`获取或创建菜单失败:`, error)
      throw error
    }
  },

  /**
   * 创建菜单项
   * @param date 日期，格式为YYYY-MM-DD
   * @param type 菜单类型：lunch(午餐), dinner(晚餐), other(其他-包含炖汤/主食/饮料)
   * @param dishId 菜品ID
   * @param sortOrder 可选的排序顺序，默认为0
   * @returns 创建的菜单项数据
   */
  createMenuItem: async (date: string, type: MenuType, dishId: string, sortOrder: number = 0) => {
    try {
      // 获取或创建菜单
      const menu = await menuApi.getOrCreateMenu(date, type)

      // 创建菜单项 - 按照PocketBase示例格式
      const data = {
        menu: menu.id,
        dish: dishId,
        sortOrder: sortOrder,
      }

      const createdMenuItem = await pb.collection('menu_items').create(data)
      return createdMenuItem
    } catch (error) {
      console.error('创建菜单项失败:', error)
      throw error
    }
  },

  /**
   * 获取指定日期和类型的菜单
   * @param date 日期，格式为YYYY-MM-DD
   * @param type 菜单类型：lunch(午餐), dinner(晚餐), other(其他-包含炖汤/主食/饮料)
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
      let menuItems: MenuItem[] = []

      try {
        // 首先尝试使用sortOrder字段排序
        menuItems = (await pb.collection('menu_items').getFullList({
          filter: `menu='${menu.id}'`,
          expand: 'dish',
          sort: 'sortOrder', // 尝试按sortOrder升序排序
        })) as MenuItem[]
      } catch (sortError) {
        console.error('使用sortOrder排序失败，回退到默认排序:', sortError)
        // 如果排序失败，使用默认排序（通常是按ID或创建时间）
        menuItems = (await pb.collection('menu_items').getFullList({
          filter: `menu='${menu.id}'`,
          expand: 'dish',
        })) as MenuItem[]
      }

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

  /**
   * 修复菜单项排序
   * 用于历史数据修复，为所有没有sortOrder的菜单项添加sortOrder
   * @param menuId 菜单ID
   */
  fixMenuItemsOrder: async (menuId: string): Promise<void> => {
    try {
      // 获取指定菜单的所有菜单项
      const menuItems = await pb.collection('menu_items').getFullList({
        filter: `menu='${menuId}'`,
        expand: 'dish',
      })

      // 检查sortOrder字段是否存在于schema中
      let schemaHasSortOrder = true
      try {
        // 检查菜单项集合schema中是否有sortOrder字段
        const schema = await pb.collection('menu_items').getFullList({ limit: 1 })
        if (schema.length > 0) {
          const sampleItem = schema[0]
          // 如果返回的对象中没有sortOrder字段，可能未添加该字段
          if (!('sortOrder' in sampleItem)) {
            console.warn('警告: menu_items集合中可能未添加sortOrder字段，请在管理界面添加此字段')
            schemaHasSortOrder = false
            return // 如果字段不存在，不执行后续操作
          }
        }
      } catch (schemaError) {
        console.error('检查schema失败:', schemaError)
        // 继续尝试更新，即使schema检查失败
      }

      // 如果schema中没有sortOrder字段，则返回
      if (!schemaHasSortOrder) {
        return
      }

      // 按类别组织菜单项
      const categorizedItems: Record<string, any[]> = {}

      menuItems.forEach((item) => {
        if (item.expand?.dish) {
          const category = item.expand.dish.category
          if (!categorizedItems[category]) {
            categorizedItems[category] = []
          }
          categorizedItems[category].push(item)
        }
      })

      // 为每个类别的菜单项设置sortOrder
      let globalOrderCounter = 1
      let updateCount = 0
      let errorCount = 0

      for (const category in categorizedItems) {
        for (const item of categorizedItems[category]) {
          // 如果该项目没有排序顺序，则更新它
          if (item.sortOrder === undefined || item.sortOrder === null) {
            try {
              await pb.collection('menu_items').update(item.id, {
                sortOrder: globalOrderCounter,
              })
              updateCount++
            } catch (updateError) {
              console.error(`更新菜单项排序失败: ${item.id}`, updateError)
              errorCount++
            }
          }
          globalOrderCounter++
        }
      }

      console.log(`已修复菜单 ${menuId} 的菜单项排序 (更新: ${updateCount}, 错误: ${errorCount})`)
    } catch (error) {
      console.error('修复菜单项排序失败:', error)
      // 不抛出异常，避免阻止应用程序正常运行
      console.warn('继续运行，但排序功能可能不可用')
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
    combo: [],
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
        category: category,
        hasMultipleSizes: dish.hasMultipleSizes,
        smallPrice: dish.smallPrice,
        largePrice: dish.largePrice,
        sortOrder: item.sortOrder, // 传递排序信息到前端
      }

      // 确保类别存在，然后添加项目
      if (result[category]) {
        result[category].push(displayItem)
      }
    }
  })

  // 对每个分类内的菜品按sortOrder排序
  for (const category in result) {
    result[category as CategoryType].sort((a, b) => {
      // 如果a或b没有sortOrder，给它们一个默认很大的值，让它们排在后面
      const aOrder = a.sortOrder !== undefined ? a.sortOrder : 1000
      const bOrder = b.sortOrder !== undefined ? b.sortOrder : 1000
      return aOrder - bOrder
    })
  }

  return result
}
