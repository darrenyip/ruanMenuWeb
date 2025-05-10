export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 使用内容哈希确保文件更新时生成新的文件名
        assetFileNames: 'assets/[name].[hash][extname]',
        // 为JS文件添加内容哈希
        chunkFileNames: 'js/[name].[hash].js',
        // 为入口文件添加内容哈希
        entryFileNames: 'js/[name].[hash].js',
      },
    },
  },
})
