<!-- 加载页面组件 - 字体等资源加载完成前显示 -->
<script setup>
import { ref, onMounted } from 'vue'
import tipsData from '../data/loadingTips.json'

const emit = defineEmits(['loadingComplete'])
const isFadingOut = ref(false)

// 随机选取一条 Tip
const randomTip = ref(tipsData[Math.floor(Math.random() * tipsData.length)])

onMounted(async () => {
  // 显式加载自定义 MapleMono 字体
  const fontLoaders = [
    document.fonts.load('normal 1em "MapleMono"'),
    document.fonts.load('normal bold 1em "MapleMono Bold"'),
  ]

  // 等待所有自定义字体加载完成
  await Promise.allSettled(fontLoaders)

  // 确保所有字体（含系统字体）就绪
  await document.fonts.ready

  // 等待 window.onload 确保图片等资源也加载完毕
  if (document.readyState !== 'complete') {
    await new Promise((resolve) => {
      window.addEventListener('load', resolve, { once: true })
    })
  }

  // 再给一小段缓冲时间确保渲染稳定
  await new Promise(resolve => setTimeout(resolve, 200))

  // 触发渐隐动画
  isFadingOut.value = true

  // 等待渐隐动画完成后通知父组件
  setTimeout(() => {
    emit('loadingComplete')
  }, 800)
})
</script>

<template>
  <div class="loading-screen" :class="{ 'fade-out': isFadingOut }">
    <div class="loading-content">
      <div class="spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring spinner-ring--inner"></div>
      </div>
      <p class="loading-text">Loading...</p>
      <div class="tip-card">
        <h3 class="tip-title">{{ randomTip.title }}</h3>
        <p class="tip-desc">{{ randomTip.description }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  transition: opacity 0.8s ease, visibility 0.8s ease;
}

.loading-screen.fade-out {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* 双层旋转环加载动画 */
.spinner {
  position: relative;
  width: 48px;
  height: 48px;
}

.spinner-ring {
  position: absolute;
  inset: 0;
  border: 3px solid transparent;
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring--inner {
  inset: 6px;
  border-top-color: transparent;
  border-right-color: var(--accent);
  animation-duration: 1.6s;
  animation-direction: reverse;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin: 0;
  font-family: var(--mono);
  font-size: 14px;
  letter-spacing: 0.2em;
  color: var(--text);
  opacity: 0.7;
  animation: pulse-text 1.8s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

/* Tip 提示模块 */
.tip-card {
  max-width: 380px;
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  text-align: center;
  animation: tip-fade-in 0.6s ease 0.3s both;
}

@keyframes tip-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.tip-title {
  margin: 0 0 6px;
  font-family: var(--heading);
  font-size: 15px;
  font-weight: 500;
  color: var(--accent);
  letter-spacing: 0.02em;
}

.tip-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text);
  opacity: 0.75;
}
</style>
