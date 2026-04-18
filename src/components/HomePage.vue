/* 主页 */

<script setup>
    import { ref, onMounted } from "vue"
    import gsap from "gsap" //gsap库

    //startPage的mainTitle部分
    // fullpage 状态
    const currentSection = ref(0)
    const isAnimating = ref(false)
    const sections = ref([])

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
    { text: "long", type: "keyword" },
    { text: " ", type: "plain" },
    { text: "long", type: "keyword" },
    { text: " ", type: "plain" },
    { text: "passion", type: "variable" },
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
]//完整标题

    const displayTokens = ref([]) // 用于存储当前显示的 token 数组
    let currentIndex = 0  // 表示当前第几句
    const soloTime = 0.1 //打每个字的动画所需的时间

    // 辅助函数：根据字符数构建显示 token 数组
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

    //把打字模拟方法给封装 方便多次动画调用（支持 token 高亮）
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

    //暂停等待方法
    function wait(seconds) {
        return new Promise((resolve) => {
            gsap.delayedCall(seconds, resolve)
        })
    }

    //对应打字模拟方法 也把删除模拟方法封装起来（支持 token 高亮）
    function deleteText(lineTokens) {
        const totalChars = lineTokens.reduce((sum, token) => sum + token.text.length, 0)
        return new Promise((resolve) => {
            gsap.to({}, {
                duration: totalChars * 0.05,
                ease: "none",
                onUpdate: function () {
                    const progress = this.progress()
                    const charCount = Math.floor((1 - progress) * totalChars) // (1-progress) 倒着减少
                    displayTokens.value = buildDisplayTokens(lineTokens, charCount)
                },
                onComplete: resolve
            })
        })
    }


    // 滚轮控制
    function onWheel(e) {
        if (isAnimating.value) return

        if (e.deltaY > 0) {
            goNext()
        } else {
            goPrev()
        }
    }

    function goNext() {
        if (currentSection.value >= sections.value.length - 1) return
        switchTo(currentSection.value + 1)
    }

    function goPrev() {
        if (currentSection.value <= 0) return
        switchTo(currentSection.value - 1)
    }

    function switchTo(index) {
        isAnimating.value = true

        const prev = currentSection.value
        const next = index

        const prevEl = sections.value[prev]
        const nextEl = sections.value[next]

        gsap.to(prevEl, {
            y: -100,
            opacity: 0,
            duration: 0.8,
            ease: "power2.inOut"
        })

        gsap.fromTo(nextEl,
            { y: 100, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power2.inOut",
                onComplete: () => {
                    currentSection.value = next
                    isAnimating.value = false
                }
            }
        )
    }

    //接下来写生命周期
    onMounted(async () => {
        // 收集 section 元素
        const sectionElements = document.querySelectorAll('section')
        sections.value = Array.from(sectionElements)

        // 设置初始位置：当前 section 在屏幕中央，其他 section 在下方隐藏
        sections.value.forEach((el, idx) => {
            if (idx === currentSection.value) {
                gsap.set(el, { y: 0, opacity: 1 })
            } else {
                gsap.set(el, { y: 100, opacity: 0 })
            }
        })

        // 原有的打字动画循环
        while (true) {
            const text = texts[currentIndex]

            await typeText(text)   // 打字
            await wait(3)        // 停顿
            await deleteText(text) // 删除
            await wait(0.2)        // 小停顿

            currentIndex = (currentIndex + 1) % texts.length //这一句打完切换下一句
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
                    <span class="cursor">|</span>
                    <!-- 使用 displayTokens 渲染带高亮的 token，cursor 类控制光标闪动，“|”就是模拟出来的光标 -->
                </div>
                <p class="subTitle">//念起成形 Turning ideas into reality.</p>
            </div>
        </section>
        <section ref="section1" class="introPage">
            
            <div class="secondMainTitle">
                <<span style="color:#60CEE2">OmaeKumiko529</span> <span style="color:#BA77FE">/</span>>
                <p style="margin-top: 1%;">[
                    <span class="string" style="font-family: Maplemono; font-size: 1vw;">

                        <span style="background-color: #da56a8;color: aquamarine; border-radius: 8px; padding: 2px 8px;">UI/UX</span> <span style="background-color: #245c74; border-radius: 8px; padding: 2px 8px;">&lt;/&gt;</span> <span style="background-color:white; color: black; border-radius: 8px; padding: 2px 8px;">𝄞</span>
                        
                    </span>
                ]</p>
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

    .startPage {
        height: 100vh;
        background-color: #121314;
        position: absolute;
        width: 100%;
        top: 0;
        left: 0;
    }

    .introPage {
        height: 100vh;
        background-color: #121314;
        position: absolute;
        width: 100%;
        top: 0;
        left: 0;
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

        top: 10%;
        left: 10%;
    }

    .secondMainTitle {
        font-size: 1.5vw;
        font-family: MapleMono Bold;
        color: rgb(255, 255, 255);

        position: relative;
        margin: 0;
        line-height: 1.5;
        text-align: center;
        top: 5%;
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


    .cursor {
        display: inline-block;
        margin-left: 4px;
        animation: blink 1s infinite; /* 引入动画 */
    }
    @keyframes blink { /* 动画状态描述 */
        0%, 50%, 100% { opacity: 1; }
        25%, 75% { opacity: 0; }
    }
</style>