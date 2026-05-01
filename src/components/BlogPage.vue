<!-- 博客展示页 - 公开可见 -->
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const posts = ref([])
const STORAGE_KEY = 'kumiko_blog_posts'

function loadPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    posts.value = raw ? JSON.parse(raw) : []
  } catch {
    posts.value = []
  }
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

function goHome() {
  router.push('/')
}

onMounted(loadPosts)
</script>

<template>
  <div class="blog-page">
    <header class="blog-header">
      <button class="back-btn" @click="goHome">← 返回首页</button>
      <h1 class="blog-title">
        <span class="function">$ </span>
        <span style="color: #60cee2;">cat</span>
        <span class="plain"> /var/log/kumiko/blog</span>
      </h1>
      <div class="header-spacer"></div>
    </header>

    <div class="blog-content">
      <div v-for="post in posts" :key="post.id" class="post-card">
        <div class="post-header">
          <span class="post-avatar">🐟</span>
          <span class="post-author">OmaeKumiko529</span>
          <span class="post-time">{{ formatTime(post.timestamp) }}</span>
        </div>
        <div class="post-content">{{ post.content }}</div>
      </div>
    </div>
  </div>
</template>

<style>
.blog-page {
  min-height: 100vh;
  background-color: #121314;
  color: #d4d4d4;
  font-family: MapleMono, ui-monospace, Consolas, monospace;
  padding-bottom: 60px;
}

.blog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #1a1a1e;
  border-bottom: 1px solid #333;
  position: sticky;
  top: 0;
  z-index: 10;
}

.blog-title {
  font-size: 1.3vw;
  margin: 0;
  font-weight: normal;
}

.back-btn {
  background: transparent;
  border: 1px solid #444;
  color: #888;
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-family: MapleMono, ui-monospace, monospace;
  font-size: 0.85vw;
  transition: all 0.2s ease;
}

.back-btn:hover {
  border-color: #60cee2;
  color: #60cee2;
}

.header-spacer {
  width: 80px;
}

.blog-content {
  max-width: 700px;
  margin: 30px auto 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.post-card {
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 18px 22px;
  transition: border-color 0.2s ease;
}

.post-card:hover {
  border-color: rgba(96, 206, 226, 0.25);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.post-avatar {
  font-size: 1.2vw;
}

.post-author {
  color: #60cee2;
  font-weight: bold;
  font-size: 0.9vw;
}

.post-time {
  color: #666;
  font-size: 0.75vw;
  margin-left: auto;
}

.post-content {
  font-size: 0.95vw;
  line-height: 1.8;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-word;
}

.function { color: #DCDCAA; }
.plain    { color: #D4D4D4; }
</style>