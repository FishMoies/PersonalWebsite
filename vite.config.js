import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// Vite 配置文件
// 参考：https://vite.dev/config/
export default defineConfig({
  // 使用 Vue 插件
  plugins: [vue()],
  // 部署基础路径（用于宝塔自动部署/如果需要更新github page，请改成/PersonalWebsite/，然后上传）
  base: '/',
})
