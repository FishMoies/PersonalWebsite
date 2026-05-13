import { createRouter, createWebHashHistory } from 'vue-router'
import HomePage from '../components/HomePage.vue'
import PortfolioPage from '../components/PortfolioPage.vue'
import Admin from '../components/Admin.vue'
import BlogPage from '../components/BlogPage.vue'

const routes = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/portfolio', name: 'portfolio', component: PortfolioPage },
  { path: '/admin', name: 'admin', component: Admin },
  { path: '/blog', name: 'blog', component: BlogPage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router