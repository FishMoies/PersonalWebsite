<!-- 应用根组件 -->
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import LoadingScreen from './components/LoadingScreen.vue'

const router = useRouter()
const isLoading = ref(true)

function onLoadingComplete() {
  isLoading.value = false
}
</script>

<template>
  <LoadingScreen v-if="isLoading" @loading-complete="onLoadingComplete" />
  <div class="app-content" :class="{ 'app-visible': !isLoading }">
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
.app-content {
  opacity: 0;
  background: #121314;
  transition: opacity 0.8s ease;
}

.app-content.app-visible {
  opacity: 1;
}

/* 页面切换动画 — 柔和交叉淡入淡出 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.35s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
