import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置文件
// 参考：https://vite.dev/config/
export default defineConfig({
  // 使用 Vue 插件
  plugins: [vue()],
  // 部署基础路径（用于 GitHub Pages）
  base: '/PersonalWebsite/',
})
