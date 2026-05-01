// 应用程序入口文件
// 引入 Vue 核心库和样式
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// 引入 GSAP 动画库及其 ScrollTrigger 插件
import { ScrollTrigger } from "gsap/ScrollTrigger"
import gsap from "gsap"

// 注册 GSAP 插件
gsap.registerPlugin(ScrollTrigger)

// 创建 Vue 应用实例并挂载到 #app 元素
createApp(App).use(router).mount('#app')