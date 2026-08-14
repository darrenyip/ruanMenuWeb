import type { DirectiveBinding } from 'vue'

// trim指令：用于自动去除输入框前后的空格
export const vTrim = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    // 获取输入元素
    // 对于element-plus的输入框，实际的input元素是嵌套在内部的
    const inputEl = el.tagName === 'INPUT' ? el : el.querySelector('input')

    if (!inputEl) return

    // 保存原始值，以便在处理前后对比
    let rawValue = ''

    // 监听输入事件
    inputEl.addEventListener('input', function () {
      rawValue = (this as HTMLInputElement).value
    })

    // 监听失去焦点事件，在输入框失去焦点时去除前后空格
    inputEl.addEventListener('blur', function () {
      const input = this as HTMLInputElement
      if (input.value !== rawValue.trim()) {
        input.value = rawValue.trim()
        // 触发input事件，确保v-model能更新
        input.dispatchEvent(new Event('input', { bubbles: true }))
        // 触发change事件
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    })
  },
}

// 指令集合
export default {
  vTrim,
}
