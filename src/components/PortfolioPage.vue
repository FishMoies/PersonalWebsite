<!-- 作品集页面 -->
<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="portfolio-page">
    <header class="portfolio-header">
      <button class="back-btn" @click="goHome">← 返回首页</button>
      <h1 class="portfolio-title">
        <span class="keyword">PORTFOLIO</span>
      </h1>
      <div class="header-spacer"></div>
    </header>

    <div class="portfolio-content">
      <p class="placeholder">作品集内容即将上线...</p>
    </div>
  </div>
</template>

<style>
.portfolio-page {
  min-height: 100vh;
  background-color: #121314;
  color: #d4d4d4;
  font-family: MapleMono, ui-monospace, Consolas, monospace;
}

.portfolio-header {
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

.portfolio-title {
  font-size: 1.3vw;
  margin: 0;
  font-weight: normal;
  color: #d4d4d4;
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

.portfolio-content {
  max-width: 700px;
  margin: 60px auto 0;
  text-align: center;
}

.placeholder {
  color: #666;
  font-size: 1.1vw;
}

.keyword { color: #569CD6; }
</style>