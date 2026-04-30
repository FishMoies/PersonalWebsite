/**
 * 打字动画 composable
 * 管理终端的打字机效果（打字 / 删除 / 等待）
 */
import { ref } from "vue"
import gsap from "gsap"
import { soloTime } from "../data/terminalData.js"

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

export function useTypewriter() {
  /** 当前显示的打字 token 数组 */
  const displayTokens = ref([])

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
          const charCount = Math.floor((1 - progress) * totalChars)
          displayTokens.value = buildDisplayTokens(lineTokens, charCount)
        },
        onComplete: resolve
      })
    })
  }

  /**
   * 等待指定秒数
   * @param {number} seconds - 等待的秒数
   * @returns {Promise}
   */
  function wait(seconds) {
    return new Promise((resolve) => {
      gsap.delayedCall(seconds, resolve)
    })
  }

  return { displayTokens, typeText, deleteText, wait }
}