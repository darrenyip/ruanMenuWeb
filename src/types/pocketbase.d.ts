// src/types/pocketbase.d.ts
import PocketBase from 'pocketbase'

declare module 'pocketbase' {
  interface RecordModel {
    username: string
    email: string
    verified: boolean
    name?: string
    avatar?: string
  }

  interface BaseAuthStore {
    user: RecordModel | null
    admin: RecordModel | null
  }
}
