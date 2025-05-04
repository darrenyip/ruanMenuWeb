import pb, { pbHelper } from '@/api/pocketbase'
import type { Dish } from '@/types/menu'

// 菜品API服务
export const dishApi = {
  /**
   * 获取菜品列表
   * @param page 页码
   * @param pageSize 每页数量
   * @param filter 筛选条件
   * @returns 菜品列表及总数
   */
  async getDishes(page = 1, pageSize = 50, filter = '') {
    try {
      const resultList = await pb.collection('dishes').getList(page, pageSize, {
        filter,
        sort: 'name',
      })

      return {
        items: resultList.items as unknown as Dish[],
        totalItems: resultList.totalItems,
        totalPages: resultList.totalPages,
      }
    } catch (error) {
      console.error('获取菜品列表失败:', error)
      throw error
    }
  },

  /**
   * 获取所有菜品
   * @param sort 排序
   * @param filter 筛选条件
   * @returns 所有菜品列表
   */
  async getAllDishes(sort = 'name', filter = '') {
    try {
      const records = await pb.collection('dishes').getFullList({
        sort,
        filter,
      })

      return records as unknown as Dish[]
    } catch (error) {
      console.error('获取所有菜品失败:', error)
      throw error
    }
  },

  /**
   * 根据ID获取菜品
   * @param id 菜品ID
   * @returns 菜品数据
   */
  async getDish(id: string) {
    try {
      const record = await pb.collection('dishes').getOne(id)
      return record as unknown as Dish
    } catch (error) {
      console.error(`获取菜品(ID: ${id})失败:`, error)
      throw error
    }
  },

  /**
   * 创建菜品
   * @param data 菜品数据
   * @returns 创建的菜品
   */
  async createDish(data: Partial<Dish>) {
    try {
      // 处理多规格价格 - 确保不是多规格时的smallPrice和largePrice为undefined
      const dishData = { ...data }
      if (!dishData.hasMultipleSizes) {
        dishData.smallPrice = undefined
        dishData.largePrice = undefined
      }

      const record = await pb.collection('dishes').create(dishData)
      return record as unknown as Dish
    } catch (error) {
      console.error('创建菜品失败:', error)
      throw error
    }
  },

  /**
   * 更新菜品
   * @param id 菜品ID
   * @param data 菜品数据
   * @returns 更新后的菜品
   */
  async updateDish(id: string, data: Partial<Dish>) {
    try {
      // 处理多规格价格 - 确保不是多规格时的smallPrice和largePrice为undefined
      const dishData = { ...data }
      if (!dishData.hasMultipleSizes) {
        dishData.smallPrice = undefined
        dishData.largePrice = undefined
      }

      const record = await pb.collection('dishes').update(id, dishData)
      return record as unknown as Dish
    } catch (error) {
      console.error(`更新菜品(ID: ${id})失败:`, error)
      throw error
    }
  },

  /**
   * 删除菜品
   * @param id 菜品ID
   */
  async deleteDish(id: string) {
    try {
      await pb.collection('dishes').delete(id)
      return true
    } catch (error) {
      console.error(`删除菜品(ID: ${id})失败:`, error)
      throw error
    }
  },

  /**
   * 搜索菜品
   * @param query 搜索关键词
   * @param limit 限制结果数量
   * @returns 匹配的菜品列表
   */
  async searchDishes(query: string, limit = 10) {
    try {
      const filter = query ? `name ~ "${query}"` : ''
      const records = await pb.collection('dishes').getList(1, limit, {
        filter,
        sort: 'name',
      })

      return records.items as unknown as Dish[]
    } catch (error) {
      console.error('搜索菜品失败:', error)
      throw error
    }
  },
}
