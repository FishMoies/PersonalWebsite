<template>
  <a
    v-if="href && !disabled"
    :href="href"
    class="badge"
    :class="[variant, { 'icon-only': iconOnly }]"
    @click="handleClick"
    :target="external ? '_blank' : '_self'"
    :rel="external ? 'noopener noreferrer' : null"
    :aria-disabled="disabled"
  >
    <img v-if="icon" :src="icon" alt="" />
    <span v-if="text && !iconOnly" class="badge-text">{{ text }}</span>
  </a>
  <button
    v-else
    class="badge"
    :class="[variant, { 'icon-only': iconOnly }]"
    :disabled="disabled"
    type="button"
    @click="handleClick"
  >
    <img v-if="icon" :src="icon" alt="" />
    <span v-if="text && !iconOnly" class="badge-text">{{ text }}</span>
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  /** 标签文本，可选 */
  text: String,
  /** 图标 URL 或路径 */
  icon: String,
  /** 链接地址，若无则渲染为按钮 */
  href: String,
  /** 视觉变体：primary / accent / outline */
  variant: {
    type: String,
    default: 'primary',
    validator(value) {
      return ['primary', 'accent', 'outline'].includes(value)
    }
  },
  /** 是否禁用 */
  disabled: Boolean,
  /** 是否在新窗口打开（仅链接有效） */
  external: Boolean,
  /** 是否仅显示图标（隐藏文字） */
  iconOnly: Boolean
})

const emit = defineEmits(['click'])

const handleClick = (event) => {
  if (props.disabled) {
    event.preventDefault()
    event.stopPropagation()
    return
  }
  emit('click', event)
  // 如果提供了 href，交由浏览器处理导航
  // 按钮场景下仅触发事件
}
</script>

<style scoped>
.badge {
  --badge-color-primary: #60cee2;
  --badge-color-accent: #d2f543;
  --badge-color-bg: #121314;

  display: inline-flex;
  align-items: center;
  gap: 6px;

  padding: 4px 10px;
  border-radius: 6px;

  font-size: 12px;
  font-weight: 500;
  line-height: 1;

  text-decoration: none;
  cursor: pointer;
  border: none;
  outline: none;
  transition: all 0.2s ease;

  /* 保证 hover 展开动画有足够的宽度空间 */
  position: relative;
  overflow: hidden;
  transform: translateY(0);
}

.badge img {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.badge-text {
  max-width: 0;
  opacity: 0;
  overflow: hidden;
  white-space: nowrap;
  transition: all 0.25s ease;
}

.badge:hover .badge-text {
  max-width: 200px;
  opacity: 1;
}

.badge:hover {
  transform: translateY(-1px);
}

.badge:active {
  transform: translateY(0);
}

.badge.icon-only {
  padding-left: 6px;
  padding-right: 6px;
  gap: 0;
}

/* 主色版本 */
.badge.primary {
  background: var(--badge-color-primary);
  color: var(--badge-color-bg);
}

/* 强调版本（荧光） */
.badge.accent {
  background: var(--badge-color-accent);
  color: var(--badge-color-bg);
}

/* 轮廓版本（更高级） */
.badge.outline {
  border: 1px solid var(--badge-color-primary);
  color: var(--badge-color-primary);
  background: transparent;
}

/* 可选的聚焦状态 */
.badge:focus-visible {
  box-shadow: 0 0 0 2px rgba(96, 206, 226, 0.3);
}

/* 禁用状态（如有需要可启用） */
.badge:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>