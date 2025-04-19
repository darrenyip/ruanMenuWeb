import { defineStore } from 'pinia'

// 明确定义每个菜单类型
type MenuType = 'lunch' | 'dinner' | 'soup'

interface MenuItem {
  id: string
  name: string
  price: number
}

export const useMenuStore = defineStore('menu', {
  state: () => ({
    lunch: [] as MenuItem[],
    dinner: [] as MenuItem[],
    soup: [] as MenuItem[],
    lastUpdated: null as Date | null,
  }),

  actions: {
    // 获取指定类型菜单
    async fetchMenu(type: MenuType) {
      // 这里实现具体API调用
      // 示例：const response = await api.get(`/menu/${type}`)
      // this[type] = response.data
    },

    // 更新指定类型菜单
    async updateMenu(type: MenuType, items: MenuItem[]) {
      // 这里实现具体API调用
      // await api.put(`/menu/${type}`, items)
      // this[type] = items
    },
  },

  getters: {
    getByType: (state) => {
      return (type: MenuType) => state[type]
    },
  },
})
