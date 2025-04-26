// src/stores/menu.ts
import { defineStore } from 'pinia'
import { menuApi } from '@/api/menu'
import type { MenuType, FormattedMenu, OrganizedMenuItems } from '@/types/menu'

type MenuState = {
  currentMenu: FormattedMenu | null
  loading: boolean
  error: string | null
  lastEditedType: MenuType | null
  lastFetchTime: Record<MenuType, number> // 记录每种菜单类型的最后请求时间
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => ({
    currentMenu: null,
    loading: false,
    error: null,
    lastEditedType: null,
    lastFetchTime: {
      lunch: 0,
      dinner: 0,
      soup: 0,
    },
  }),

  actions: {
    async fetchMenu(date: string, type: MenuType) {
      // 如果距离上次请求同类型菜单的时间太短（防抖）
      const now = Date.now()
      if (now - this.lastFetchTime[type] < 300) {
        // 300ms内不重复请求
        return this.currentMenu
      }

      try {
        this.lastFetchTime[type] = now // 更新请求时间
        this.loading = true
        this.error = null

        // 使用更新后的API获取菜单数据
        const menuData = await menuApi.fetchMenu(date, type)
        this.currentMenu = {
          ...menuData,
          loadTime: Date.now(),
        }
      } catch (error: any) {
        this.error = error.message || '获取菜单失败'

        // 设置为空数据
        const emptyItems: OrganizedMenuItems = {
          meat: [],
          halfMeat: [],
          vegetable: [],
          staple: [],
          soup: [],
          drink: [],
        }

        this.currentMenu = {
          menuId: '',
          date,
          type,
          items: emptyItems,
          loadTime: Date.now(),
        }

        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * 获取最近7天的菜单
     */
    async fetchRecentMenus() {
      try {
        this.loading = true
        this.error = null
        return await menuApi.fetchRecentMenus()
      } catch (error: any) {
        this.error = error.message || '获取最近菜单失败'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
