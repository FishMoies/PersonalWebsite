import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { ScrollTrigger } from "gsap/ScrollTrigger"
import gsap from "gsap"

gsap.registerPlugin(ScrollTrigger)

createApp(App).mount('#app')
