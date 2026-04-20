/* 主页 */

<script setup>
import { ref, onMounted } from "vue"
import gsap from "gsap" // gsap 动画库
import Badge from './Badge.vue' //Badge库

// ==================== 响应式状态 ====================
/**
 * 当前激活的页面区域索引（0 表示第一个 section）
 */
const currentSection = ref(0)

/**
 * 动画是否正在执行中，用于防止重复触发
 */
const isAnimating = ref(false)

/**
 * 滚轮事件锁定，防止短时间内连续滚动
 */
const wheelLock = ref(false)

/**
 * 存储所有页面区域（section）的 DOM 元素数组
 */
const sections = ref([])

/**
 * 光标元素引用
 */
const cursorElement = ref(null)

/**
 * 打字动画显示的完整标题文本，每个标题由多个 token 组成
 * token 包含 text（文字）和 type（高亮类型）
 */
const texts = [
  [
    { text: "printf", type: "function" },
    { text: "(", type: "plain" },
    { text: "\"", type: "string" },
    { text: "你好，世界！", type: "string" },
    { text: "\"", type: "string" },
    { text: ")", type: "plain" },
    { text: ";", type: "plain" }
  ],
  [
    { text: "long", type: "keyword" },
    { text: " ", type: "plain" },
    { text: "long", type: "keyword" },
    { text: " ", type: "plain" },
    { text: "grit", type: "variable" },
    { text: " = ", type: "plain" },
    { text: "∞", type: "infinity" },
    { text: ";", type: "plain" }
  ],
  [
    { text: "await", type: "keyword" },
    { text: " ", type: "plain" },
    { text: "dream", type: "function" },
    { text: "()", type: "plain" },
    { text: ".", type: "plain" },
    { text: "then", type: "method" },
    { text: "(", type: "plain" },
    { text: "Reality", type: "variable" },
    { text: ")", type: "plain" },
    { text: ";", type: "plain" }
  ]
]

/**
 * 当前显示的打字 token 数组，用于渲染带高亮的标题
 */
const displayTokens = ref([])

/**
 * 当前正在显示第几句（0‑based）
 */
let currentIndex = 0

/**
 * 每个字符的打字动画持续时间（秒）
 */
const soloTime = 0.1

// ==================== 辅助函数 ====================

/**
 * 根据字符数构建显示 token 数组
 * @param {Array} lineTokens - 原始 token 数组
 * @param {number} charCount - 需要显示的字符数
 * @returns {Array} 构建好的显示 token 数组
 */
function buildDisplayTokens(lineTokens, charCount) {
  const result = []
  let remaining = charCount
  for (const token of lineTokens) {
    if (remaining <= 0) {
      result.push({ text: "", type: token.type })
    } else if (remaining >= token.text.length) {
      result.push({ text: token.text, type: token.type })
      remaining -= token.text.length
    } else {
      result.push({ text: token.text.slice(0, remaining), type: token.type })
      remaining = 0
    }
  }
  return result
}

/**
 * 打字动画（支持 token 高亮）
 * @param {Array} lineTokens - 要打出的 token 数组
 * @returns {Promise} 动画完成时 resolve 的 Promise
 */
function typeText(lineTokens) {
  const totalChars = lineTokens.reduce((sum, token) => sum + token.text.length, 0)
  return new Promise((resolve) => {
    gsap.to({}, {
      duration: totalChars * soloTime,
      ease: "none",
      onUpdate: function () {
        const progress = this.progress()
        const charCount = Math.floor(progress * totalChars)
        displayTokens.value = buildDisplayTokens(lineTokens, charCount)
      },
      onComplete: resolve
    })
  })
}

/**
 * 删除文字动画（支持 token 高亮）
 * @param {Array} lineTokens - 要删除的 token 数组
 * @returns {Promise} 动画完成时 resolve 的 Promise
 */
function deleteText(lineTokens) {
  const totalChars = lineTokens.reduce((sum, token) => sum + token.text.length, 0)
  return new Promise((resolve) => {
    gsap.to({}, {
      duration: totalChars * 0.05,
      ease: "none",
      onUpdate: function () {
        const progress = this.progress()
        const charCount = Math.floor((1 - progress) * totalChars) // 倒着减少
        displayTokens.value = buildDisplayTokens(lineTokens, charCount)
      },
      onComplete: resolve
    })
  })
}

/**
 * 等待指定秒数
 * @param {number} seconds - 等待的秒数
 * @returns {Promise} 延迟后 resolve 的 Promise
 */
function wait(seconds) {
  return new Promise((resolve) => {
    gsap.delayedCall(seconds, resolve)
  })
}

// ==================== 页面滚动控制 ====================

/**
 * 滚轮事件处理函数
 * @param {WheelEvent} e - 滚轮事件对象
 */
function onWheel(e) {
  if (wheelLock.value || isAnimating.value) return

  wheelLock.value = true
  setTimeout(() => wheelLock.value = false, 900)

  if (e.deltaY > 0) {
    goNext()
  } else {
    goPrev()
  }
}

/**
 * 切换到下一个页面区域
 */
function goNext() {
  if (currentSection.value >= sections.value.length - 1) return
  switchTo(currentSection.value + 1)
}

/**
 * 切换到上一个页面区域
 */
function goPrev() {
  if (currentSection.value <= 0) return
  switchTo(currentSection.value - 1)
}

/**
 * 执行页面切换动画
 * @param {number} index - 目标页面区域的索引
 */
function switchTo(index) {
  if (isAnimating.value) return
  isAnimating.value = true

  const currentEl = sections.value[currentSection.value]
  const nextEl = sections.value[index]

  const tl = gsap.timeline({
    onComplete: () => {
      currentSection.value = index
      isAnimating.value = false
    }
  })

  // 当前页退出
  tl.to(currentEl, {
    y: -80,
    autoAlpha: 0,
    duration: 0.6,
    ease: "power2.inOut"
  })

  // 下一页进入（与上一动画重叠）
  tl.fromTo(nextEl,
    {
      y: 80,
      autoAlpha: 0
    },
    {
      y: 0,
      autoAlpha: 1,
      duration: 0.6,
      ease: "power2.inOut"
    },
    "<" // 重叠
  )
}

// ==================== 生命周期 ====================

/**
 * 组件挂载后执行
 * 1. 收集所有 section 元素
 * 2. 设置初始显示状态
 * 3. 启动无限打字动画循环
 */
onMounted(async () => {
  // 收集 section 元素
  const sectionElements = document.querySelectorAll('section')
  sections.value = Array.from(sectionElements)

  // 设置初始位置：当前 section 可见，其他隐藏
  sections.value.forEach((el, idx) => {
    gsap.set(el, {
      autoAlpha: idx === currentSection.value ? 1 : 0,
      y: idx === currentSection.value ? 0 : 80
    })
  })

  // 光标闪烁动画
  if (cursorElement.value) {
    gsap.to(cursorElement.value, {
      duration: 0.5,
      opacity: 0,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut"
    })
  }

  // 无限打字动画循环
  while (true) {
    const text = texts[currentIndex]

    await typeText(text)   // 打字
    await wait(3)          // 停顿
    await deleteText(text) // 删除
    await wait(0.2)        // 小停顿

    currentIndex = (currentIndex + 1) % texts.length // 切换到下一句
  }
})
</script>

<template>
  <div class="viewport" @wheel="onWheel">
    <section ref="section0" class="startPage">
      <!-- 起始模板 -->
      <div class="titleBlock">
        <div class="mainTitle">
          <span class="displayText">
            <span v-for="(token, i) in displayTokens" :key="i" :class="token.type">
              {{ token.text }}
            </span>
          </span>
          <span ref="cursorElement" class="cursor">|</span>
          <!-- 使用 displayTokens 渲染带高亮的 token，cursor 类控制光标闪动，“|”就是模拟出来的光标 -->
        </div>
        <p class="subTitle">//念起成形 Turning ideas into reality.</p>
      </div>
    </section>
    <section ref="section1" class="introPage">
      
      <div class="secondMainTitle">
        <<span style="color:#60CEE2">OmaeKumiko529</span> <span style="color:#BA77FE">/</span>>
        <p style="margin-top: 0.5%;">
          <span class="string" style="font-family: Maplemono; font-size: 1vw;">
            /* 我是谁 */
          </span>
        </p>
      </div>

      <div class="introduction">
        <div class="item">
          <p class="introTitle"><span><</span><span>!--</span><span style="color: white;">前端开发</span><span>--</span><span>></span></p>
          <p style="color:#60CEE2; margin-top: 8%;">拥有开发前端技术的经验,熟练掌握HTML, CSS, JS和Vue框架开发</p>
        </div>
        <div class="item">
          <p class="introTitle"><span class="string">#</span><span style="color: white;">交互设计</span></p>
          <p style="color:#60CEE2; margin-top: 8%;">能熟练使用Figma等UI/UX工具,有参与过交互设计与团队协作的经验</p>
        </div>
        <div class="item">
          <p class="introTitle">//<span style="color: white;">软件开发</span></p>
          <p style="color:#60CEE2; margin-top: 8%;">了解C, Java, 掌握C#, C等面向对象语言。有使用Unity开发的经验。</p>
        </div>
      </div>

      <p class="secondMainTitle">$ <span style="color: #d2f543;">project</span> <span style="color: white;">--list</span></p>

      <div class="introduction">
        <div class="item2">
          <p class="introTitle">├── 
            <span style="color: white;">
              Simple
              <Badge
                text="TapTap"
                href="https://www.taptap.cn/app/267034/all-info?platform=android"
                radius="none"
                style="vertical-align: middle; color: white; background-color: #00d9c5;"
              />
            </span>
          </p>
            <div style="margin-top: 5%;">
            <p>无轨下落式节奏类音乐游戏</p>
            <p>Unity, C#, JavaScript</p>
            <p>负责游戏设计与游戏开发</p>
            
          </div>
        </div>
        <div class="item2">
          <p class="introTitle">├── 
            <span style="color: white;">
              多个已上线Vue实例
              <Badge
                text="GitHub"
                href="https://github.com/FishMoies"
                radius="none"
                style="vertical-align: middle; color: white; background-color: #632c91;"
              />
            </span>
          </p>
          <div style="margin-top: 5%;">
            <p>使用Vue框架开发的多种类型的网站</p>
            <p>HTML, CSS, JS, Supabase</p>
            <p>交互设计、视觉传达与后端开发</p>
          </div>
        </div>
        <div class="item2">
          <p class="introTitle">└── 
            <span style="color: white;">
              Simple
              
            </span>
          </p>
          <p>一款由Goose Egg Studio开发的无轨下落式节奏类游戏</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style>
.viewport {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.introTitle {
  font-size: 1vw;
}

.introduction {
  display: flex;           /* 让三个 div 并排 */
  justify-content: space-between;  /* 或者 space-around / center 看你想要的间距 */
  gap: -0.5px;               /* 三个 div 之间的间距，超级好用 */
  /* 如果想要占满一行，可以加 */
  width: 100%;
  margin-top: 2%;

  max-width: 1200px;        /* ← 这里加这一行，控制最大宽度 */
  margin: 2% auto;          /* ← 上下 2%，左右自动居中，自动留空！ */
  padding: 0 20px;
  font-family: MapleMono;
}
.item {
  flex: 1;                 /* 让三个 div 平均分配宽度 */
  /* 或者你想让它们宽度不一样，就写具体的 width */
  /* background: #f0f0f0; */
  padding: 20px;
  text-align: center;
  border: 1px solid #ccc;
}
.item2 {
  flex: 1;                 /* 让三个 div 平均分配宽度 */
  /* 或者你想让它们宽度不一样，就写具体的 width */
  /* background: #f0f0f0; */
  padding: 20px;
  text-align: left;
  border: 1px solid #ccc;
}

section {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100vh;
}

.startPage {
  background-color: #121314;
}

.introPage {
  background-color: #121314;
}

.titleBlock {
  position: absolute;
  top: 35%;
  left: 8%;

  display: flex;
  flex-direction: column;
  gap: 12px; /* 控制主副标题间距 */
}

.mainTitle {
  font-size: 4vw;
  color: white;

  margin: 0;
  line-height: 1.5;
}

.secondMainTitle {
  font-size: 1.5vw;
  font-family: MapleMono Bold;
  color: rgb(255, 255, 255);

  margin: 5% auto 0;
  line-height: 1.5;
  text-align: center;
}

.subTitle {
  font-size: 2vw;
  font-family: MapleMono;
  margin: 0;

  opacity: 0.8;
  text-indent: 5px;
}

.displayText {
  font-family: MapleMono;
}

/* 以下是模拟IDE着色色号 */
.keyword {
  color: #569CD6;
}
.variable {
  color: #9CDCFE;
}
.number {
  color: #B5CEA8;
}
.plain {
  color: #D4D4D4;
}
.string {
  color: #CE9178;
}
.function {
  color: #DCDCAA;
}

.infinity {
  color: #ffffff;
  font-weight: 600;
  text-shadow:
    0 0 10px rgba(120, 200, 255, 0.6),
    0 0 25px rgba(120, 200, 255, 0.4);
  transform: scale(1.2);
  position: relative;

  display: inline-block;
  animation: float 3s ease-in-out infinite;
}
@keyframes float {
  0% {
    transform: translateY(0px) scale(1);
  }
  50% {
    transform: translateY(-6px) scale(1.05);
  }
  100% {
    transform: translateY(0px) scale(1);
  }
}

.infinity::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 80px;
  height: 80px;
  background: radial-gradient(circle,
    rgba(120,200,255,0.4),
    transparent 70%);
  transform: translate(-50%, -50%);
  z-index: -1;
}

</style>
