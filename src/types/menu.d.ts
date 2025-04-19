export type MenuType = 'lunch' | 'dinner' | 'soup'

export interface IMenuItem {
  name: string
  price: number
  category?: '荤菜' | '半荤素' | '素菜'
}
