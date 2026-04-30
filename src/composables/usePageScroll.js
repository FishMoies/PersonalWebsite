/**
 * 页面滚动导航 composable
 * 管理多页面区域的滚轮切换动画
 */
import { ref } from "vue"
import gsap from "gsap"

export function usePageScroll() {
  /** 当前激活的页面区域索引 */
  const currentSection = ref(0)

  /** 动画是否正在执行中 */
  const isAnimating = ref(false)

  /** 滚轮事件锁定 */
  const wheelLock = ref(false)

  /** 存储所有 section DOM 元素 */
  const sections = ref([])

  /**
   * 执行页面切换动画
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

    tl.to(currentEl, {
      y: -80,
      autoAlpha: 0,
      duration: 0.6,
      ease: "power2.inOut"
    })

    tl.fromTo(nextEl,
      { y: 80, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, ease: "power2.inOut" },
      "<"
    )
  }

  function goNext() {
    if (currentSection.value >= sections.value.length - 1) return
    switchTo(currentSection.value + 1)
  }

  function goPrev() {
    if (currentSection.value <= 0) return
    switchTo(currentSection.value - 1)
  }

  /**
   * 滚轮事件处理
   * @param {WheelEvent} e
   * @param {boolean} isTerminalActive - 终端是否激活（从外部传入）
   */
  function onWheel(e, isTerminalActive) {
    if (isTerminalActive) return
    if (wheelLock.value || isAnimating.value) return

    wheelLock.value = true
    setTimeout(() => (wheelLock.value = false), 900)

    if (e.deltaY > 0) {
      goNext()
    } else {
      goPrev()
    }
  }

  /**
   * 初始化 section 元素并设置初始位置
   */
  function initSections() {
    const sectionElements = document.querySelectorAll("section")
    sections.value = Array.from(sectionElements)

    sections.value.forEach((el, idx) => {
      gsap.set(el, {
        autoAlpha: idx === currentSection.value ? 1 : 0,
        y: idx === currentSection.value ? 0 : 80
      })
    })
  }

  return { currentSection, isAnimating, wheelLock, sections, switchTo, goNext, goPrev, onWheel, initSections }
}