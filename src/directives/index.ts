import { vTrim } from './trim'
import type { App } from 'vue'

// 注册所有指令
export function registerDirectives(app: App) {
  app.directive('trim', vTrim)
}

export { vTrim }
