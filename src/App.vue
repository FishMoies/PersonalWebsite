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
    <router-view />
  </div>
</template>

<style scoped>
.app-content {
  opacity: 0;
  transition: opacity 0.8s ease;
}

.app-content.app-visible {
  opacity: 1;
}
</style>
