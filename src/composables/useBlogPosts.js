/**
 * 博客帖子管理 composable
 * 提供 localStorage 帖子存取、格式化等共享逻辑
 */
import { ref } from 'vue'

const STORAGE_KEY = 'kumiko_blog_posts'

export function useBlogPosts() {
  const posts = ref([])

  function loadPosts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      posts.value = raw ? JSON.parse(raw) : []
    } catch {
      posts.value = []
    }
  }

  function savePosts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
  }

  function formatTime(ts) {
    const d = new Date(ts)
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return { posts, loadPosts, savePosts, formatTime }
}