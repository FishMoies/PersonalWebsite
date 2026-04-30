<template>
  <canvas ref="canvasRef" class="particle-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)

let ctx = null
let animationId = null
let particles = []
let mouse = { x: null, y: null, radius: 120 }

const CONFIG = {
  particleCount: 80,
  connectionDistance: 150,
  particleColor: '60, 206, 226',   // #60CEE2 青色
  lineColor: '60, 206, 226',
  maxSpeed: 0.6,
  minSpeed: 0.15,
  radius: 2
}

class Particle {
  constructor(w, h) {
    this.reset(w, h)
  }

  reset(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * CONFIG.maxSpeed * 2
    this.vy = (Math.random() - 0.5) * CONFIG.maxSpeed * 2
    this.radius = Math.random() * CONFIG.radius + 0.5
  }

  update(w, h) {
    // 鼠标交互 - 排斥效果
    if (mouse.x !== null) {
      const dx = this.x - mouse.x
      const dy = this.y - mouse.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < mouse.radius && dist > 0) {
        const force = (mouse.radius - dist) / mouse.radius
        const dirX = dx / dist
        const dirY = dy / dist
        this.vx += dirX * force * 0.5
        this.vy += dirY * force * 0.5
      }
    }

    // 限速
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    if (speed > CONFIG.maxSpeed) {
      this.vx = (this.vx / speed) * CONFIG.maxSpeed
      this.vy = (this.vy / speed) * CONFIG.maxSpeed
    }

    this.x += this.vx
    this.y += this.vy

    // 边界反弹
    if (this.x < 0 || this.x > w) this.vx *= -1
    if (this.y < 0 || this.y > h) this.vy *= -1

    // 钳位
    this.x = Math.max(0, Math.min(w, this.x))
    this.y = Math.max(0, Math.min(h, this.y))
  }

  draw() {
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${CONFIG.particleColor}, 0.8)`
    ctx.fill()
  }
}

function drawLines(particles) {
  if (!ctx) return
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x
      const dy = particles[i].y - particles[j].y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < CONFIG.connectionDistance) {
        const opacity = (1 - dist / CONFIG.connectionDistance) * 0.5
        ctx.beginPath()
        ctx.moveTo(particles[i].x, particles[i].y)
        ctx.lineTo(particles[j].x, particles[j].y)
        ctx.strokeStyle = `rgba(${CONFIG.lineColor}, ${opacity})`
        ctx.lineWidth = 0.8
        ctx.stroke()
      }
    }
  }
}

let w, h

function resize() {
  if (!canvasRef.value) return
  w = canvasRef.value.width = window.innerWidth
  h = canvasRef.value.height = window.innerHeight
}

function animate() {
  if (!ctx || !canvasRef.value) return

  ctx.clearRect(0, 0, w, h)

  particles.forEach(p => p.update(w, h))
  particles.forEach(p => p.draw())
  drawLines(particles)

  animationId = requestAnimationFrame(animate)
}

function onMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

function onMouseLeave() {
  mouse.x = null
  mouse.y = null
}

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')

  resize()
  window.addEventListener('resize', resize)

  // 初始化粒子
  particles = Array.from({ length: CONFIG.particleCount }, () => new Particle(w, h))

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseleave', onMouseLeave)

  animate()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseleave', onMouseLeave)
})
</script>

<style scoped>
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;   /* 允许鼠标穿透到终端 */
  z-index: 0;
}
</style>
