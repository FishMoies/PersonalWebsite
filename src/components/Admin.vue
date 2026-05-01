<!-- 管理员发帖系统 - 推特风格 -->
<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ==================== 帖子数据 ====================
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

function savePosts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(posts.value))
}

// ==================== 发帖表单 ====================
const newPostContent = ref('')
const MAX_CHARS = 280
const charCount = computed(() => newPostContent.value.length)
const isOverLimit = computed(() => charCount.value > MAX_CHARS)

function submitPost() {
  const content = newPostContent.value.trim()
  if (!content || isOverLimit.value) return

  const post = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    content,
    timestamp: Date.now(),
  }
  posts.value.unshift(post)
  savePosts()
  newPostContent.value = ''
}

function deletePost(id) {
  posts.value = posts.value.filter(p => p.id !== id)
  savePosts()
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
  <div class="admin-page">
    <!-- 顶部导航栏 -->
    <header class="admin-header">
      <button class="back-btn" @click="goHome">← 返回首页</button>
      <h1 class="admin-title">
        <span class="keyword">KUMIKO</span>
        <span class="plain"> ADMIN </span>
        <span class="string">// 发帖面板</span>
      </h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 发帖区域 -->
    <div class="composer">
      <div class="composer-header">
        <span class="composer-label">
          <span class="function">$ </span>
          <span style="color: #d2f543;">post</span>
          <span class="plain"> --new</span>
        </span>
      </div>
      <textarea
        v-model="newPostContent"
        class="composer-textarea"
        placeholder="写点什么... (支持 Markdown 格式)"
        rows="4"
      ></textarea>
      <div class="composer-footer">
        <span
          class="char-counter"
          :class="{ over: isOverLimit }"
        >
          {{ charCount }} / {{ MAX_CHARS }}
        </span>
        <button
          class="submit-btn"
          :disabled="!newPostContent.trim() || isOverLimit"
          @click="submitPost"
        >
          发布
        </button>
      </div>
    </div>

    <!-- 帖子列表 -->
    <div class="post-list">
      <div
        v-for="post in posts"
        :key="post.id"
        class="post-card"
      >
        <div class="post-header">
          <span class="post-avatar">🐟</span>
          <span class="post-author">OmaeKumiko529</span>
          <span class="post-time">{{ formatTime(post.timestamp) }}</span>
        </div>
        <div class="post-content">{{ post.content }}</div>
        <div class="post-actions">
          <button class="delete-btn" @click="deletePost(post.id)">
            🗑 删除
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style>
.admin-page {
  min-height: 100vh;
  background-color: #121314;
  color: #d4d4d4;
  font-family: MapleMono, ui-monospace, Consolas, monospace;
  padding-bottom: 40px;
}

/* 顶部栏 */
.admin-header {
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

.admin-title {
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

/* 发帖编辑器 */
.composer {
  max-width: 700px;
  margin: 30px auto 0;
  background: #1e1e1e;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px 24px;
}

.composer-header {
  margin-bottom: 12px;
  font-size: 0.95vw;
}

.composer-textarea {
  width: 100%;
  background: #121314;
  border: 1px solid #333;
  border-radius: 6px;
  color: #d4d4d4;
  font-family: MapleMono, ui-monospace, Consolas, monospace;
  font-size: 0.95vw;
  padding: 14px 16px;
  resize: vertical;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
  min-height: 100px;
  line-height: 1.8;
}

.composer-textarea:focus {
  border-color: rgba(96, 206, 226, 0.5);
}

.composer-textarea::placeholder {
  color: #555;
}

.composer-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.char-counter {
  font-size: 0.8vw;
  color: #888;
}

.char-counter.over {
  color: #f44747;
  font-weight: bold;
}

.submit-btn {
  background: #60cee2;
  color: #121314;
  border: none;
  padding: 8px 28px;
  border-radius: 20px;
  font-size: 0.9vw;
  font-family: MapleMono, ui-monospace, monospace;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #8ae6ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(96, 206, 226, 0.25);
}

.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* 帖子列表 */
.post-list {
  max-width: 700px;
  margin: 24px auto 0;
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

.post-actions {
  margin-top: 12px;
  display: flex;
  gap: 16px;
  border-top: 1px solid #2a2a2a;
  padding-top: 10px;
}

.delete-btn {
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  font-family: MapleMono, ui-monospace, monospace;
  font-size: 0.8vw;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  color: #f44747;
  background: rgba(244, 71, 71, 0.1);
}

/* 空状态 */
.empty-state {
  text-align: center;
  margin-top: 40px;
}

.ascii-empty {
  color: #555;
  font-family: MapleMono, ui-monospace, monospace;
  font-size: 0.85vw;
  line-height: 1.6;
  display: inline-block;
  text-align: left;
}

/* 颜色 tokens（复用 HomePage 主题） */
.keyword  { color: #569CD6; }
.variable { color: #9CDCFE; }
.number   { color: #B5CEA8; }
.plain    { color: #D4D4D4; }
.string   { color: #CE9178; }
.function { color: #DCDCAA; }
</style>