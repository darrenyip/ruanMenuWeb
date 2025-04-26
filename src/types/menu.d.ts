// src/types/menu.d.ts
import { RecordModel } from 'pocketbase'

// 菜单类型
export type MenuType = 'lunch' | 'dinner' | 'other' // 注：'other'在UI中显示为'其他'

// 分类类型
export type CategoryType = 'meat' | 'halfMeat' | 'vegetable' | 'staple' | 'soup' | 'drink'
// 注：午餐/晚餐显示：meat(荤菜), halfMeat(半荤素), vegetable(素菜)
// 注：其他(soup)显示：soup(炖汤), staple(主食), drink(饮料)

// 尺寸类型
export type SizeType = 'regular' | 'small' | 'large'

// 菜品 - 更新以包含价格和分类信息
export interface Dish extends RecordModel {
  name: string
  category: CategoryType
  basePrice: number
  smallPrice?: number
  largePrice?: number
  hasMultipleSizes: boolean
  description?: string
  created: string
  updated: string
}

// 菜单
export interface Menu extends RecordModel {
  date: string
  type: MenuType
  name: string
  created: string
  updated: string
}

// 菜单项 - 简化为只包含必要字段
export interface MenuItem extends RecordModel {
  menu: string // 关联到Menu的ID
  dish: string // 关联到Dish的ID
  created: string
  updated: string
  expand?: {
    dish?: Dish
  }
}

// 组织好的菜单项（按分类）
export interface OrganizedMenuItems {
  meat: MenuItemDisplay[]
  halfMeat: MenuItemDisplay[]
  vegetable: MenuItemDisplay[]
  staple: MenuItemDisplay[]
  soup: MenuItemDisplay[]
  drink: MenuItemDisplay[]
}

// 用于显示的菜单项数据 - 移除size字段
export interface MenuItemDisplay {
  id: string
  dishId?: string // 关联菜品ID，用于编辑操作
  name: string
  price: number
  // 可选保留尺寸信息，用于显示，但从dish中获取
  hasMultipleSizes?: boolean
  smallPrice?: number // 小份价格
  largePrice?: number // 大份价格
}

// API返回的格式化菜单数据
export interface FormattedMenu {
  menuId: string
  date: string
  type: MenuType
  items: OrganizedMenuItems
  loadTime?: number
}
