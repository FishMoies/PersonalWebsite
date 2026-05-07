/**
 * 终端命令行系统 composable
 * 管理终端的命令解析、执行、历史记录、Tab 补全等
 */
import { ref, nextTick } from "vue"
import {
  COMMANDS, SHORT_CMDS, LONG_CMDS, QUOTES,
  STARTUP_BANNER, levenshtein
} from "../data/terminalData.js"

/**
 * 获取鼠标归一化偏移（用于视差）
 * @param {MouseEvent} e
 * @returns {{ x: number, y: number }} 范围 [-0.5, 0.5]
 */
export function getMouseOffset(e) {
  return {
    x: (e.clientX / window.innerWidth - 0.5),
    y: (e.clientY / window.innerHeight - 0.5)
  }
}

/**
 * 计算字符串的 SHA-256 哈希（十六进制）
 * @param {string} message
 * @returns {Promise<string>}
 */
async function sha256(message) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/** 管理员密码的 SHA-256 哈希（明文为 'kumiko'） */
const ADMIN_PASSWORD_HASH = '08eb66fc477c997e7dc61a430884286e8789bd751c2698591833c58bf6dea548'

/**
 * 是否为浏览器扩展等不可信环境（仅用于提示，不阻止访问）
 * 如果 Web Crypto API 不可用，回退为简单比较
 */
async function verifyPassword(input) {
  try {
    const hash = await sha256(input)
    return hash === ADMIN_PASSWORD_HASH
  } catch {
    // 降级：直接用简单比较（安全性降低，但保证可用性）
    return input === 'kumiko'
  }
}

export function useTerminal(options = {}) {
  const { onNavigate } = options

  /** 终端焦点状态 */
  const isTerminalActive = ref(false)

  /** 终端历史记录行 */
  const lines = ref([])

  /** 当前输入 */
  const currentInput = ref("")

  /** 命令历史记录（用于 ↑ ↓ 导航） */
  const history = ref([])

  /** 当前浏览的历史记录索引（-1 表示在最新输入位置） */
  let historyIndex = -1

  /** 终端 body DOM 引用 */
  const terminalBodyRef = ref(null)

  /** 临时存储 matrix 动画 interval ID */
  let matrixInterval = null

  /** 密码输入模式 */
  const passwordMode = ref(false)
  let passwordCallback = null

  // ==================== 辅助方法 ====================

  /** 滚动到底部 */
  function scrollToBottom() {
    nextTick(() => {
      if (terminalBodyRef.value) {
        terminalBodyRef.value.scrollTop = terminalBodyRef.value.scrollHeight
      }
    })
  }

  /**
   * 打字机动画输出 — 一行一行带延迟显示
   */
  async function typewriteOutput(html, delay = 15) {
    const linesArray = html.split("\n")
    for (const line of linesArray) {
      lines.value.push({ type: "output", text: line })
      await new Promise(r => setTimeout(r, delay))
      scrollToBottom()
    }
  }

  /** 焦点进入 */
  function focusTerminal() {
    isTerminalActive.value = true
    terminalBodyRef.value?.focus()
  }

  /** 焦点离开 */
  function blurTerminal() {
    isTerminalActive.value = false
  }

  // ==================== 拼写建议 ====================

  function getSuggestions(input) {
    const candidates = [...SHORT_CMDS, ...LONG_CMDS]
    const distances = candidates.map(cmd => ({
      cmd,
      dist: levenshtein(input.toLowerCase(), cmd.toLowerCase())
    }))
    distances.sort((a, b) => a.dist - b.dist)
    return distances.filter(d => d.dist > 0 && d.dist <= 3).slice(0, 3)
  }

  // ==================== Tab 补全 ====================

  async function handleTab(e) {
    e.preventDefault()
    const input = currentInput.value.trim().toLowerCase()
    if (!input) return

    const allCmds = [...SHORT_CMDS, ...LONG_CMDS]
    const matches = allCmds.filter(cmd => cmd.toLowerCase().startsWith(input))

    if (matches.length === 1) {
      currentInput.value = matches[0]
    } else if (matches.length > 1) {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> possible matches:`)
      for (const m of matches) {
        const cmdObj = COMMANDS.find(c => c.cmd === m || c.short === m)
        const desc = cmdObj ? cmdObj.desc : ""
        await typewriteOutput(`  <span class="method">${m}</span> -- ${desc}`)
      }
    }
  }

  // ==================== Matrix 数字雨 ====================

  function startMatrixRain() {
    if (matrixInterval) return
    const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789"
    const cols = 40
    const drops = Array.from({ length: cols }, () => Math.floor(Math.random() * 20))

    let count = 0
    matrixInterval = setInterval(() => {
      count++
      let line = ""
      for (let i = 0; i < cols; i++) {
        if (drops[i] > 0) {
          line += chars[Math.floor(Math.random() * chars.length)]
          drops[i]--
        } else {
          line += " "
        }
        if (Math.random() > 0.95) drops[i] = Math.floor(Math.random() * 15) + 3
      }
      if (lines.value.length < 200) {
        lines.value.push({ type: "output", text: `<span class="matrix-rain">${line}</span>` })
      } else {
        const idx = 40 + (count % 120)
        if (idx < lines.value.length) {
          lines.value[idx] = { type: "output", text: `<span class="matrix-rain">${line}</span>` }
        }
      }
      scrollToBottom()
    }, 100)
  }

  function stopMatrixRain() {
    if (matrixInterval) {
      clearInterval(matrixInterval)
      matrixInterval = null
    }
  }

  // ==================== 命令分发 ====================

  async function executeCommand(trimmed, rawCmd) {
    // 空命令
    if (trimmed === "" || trimmed === " ") return

    // help
    if (trimmed === "kumiko -help" || trimmed === "help") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> available commands (${COMMANDS.length} total):`)
      for (const c of COMMANDS) {
        await typewriteOutput(`  <span class="method">${c.cmd}</span> or <span class="method">${c.short}</span> -- ${c.desc}`, 5)
      }
    }
    // version
    else if (trimmed === "kumiko -version" || trimmed === "version") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Version <span class="string">1.8.9</span>`)
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Build <span class="string">2025-04-30</span>`)
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Engine <span class="string">Vue 3 + GSAP</span>`)
    }
    // contact
    else if (trimmed === "kumiko -contact" || trimmed === "contact") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> contact info:`)
      await typewriteOutput(`  <span class="string">Email </span>:  <a href="mailto:xisiyao0529@gmail.com" class="link">xisiyao0529@gmail.com</a>`)
      await typewriteOutput(`  <span class="string">GitHub</span>:  <a href="https://github.com/FishMoies" target="_blank" class="link">github.com/FishMoies</a>`)
      await typewriteOutput(`  <span class="string">TapTap</span>:  <a href="https://www.taptap.cn/app/267034" target="_blank" class="link">taptap.cn/app/267034</a>`)
    }
    // about
    else if (trimmed === "kumiko -about" || trimmed === "about") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> about:`)
      await typewriteOutput(`  <span class="method">Name </span>:     OmaeKumiko529 / FishMoies`)
      await typewriteOutput(`  <span class="method">Role </span>:     Frontend Dev . Interaction Design . Software Dev`)
      await typewriteOutput(`  <span class="method">Motto</span>:     "Turning ideas into reality."`)
      await typewriteOutput(`  <span class="method">State</span>:     [ACTIVE]`)
    }
    // skills
    else if (trimmed === "kumiko -skills" || trimmed === "skills") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> skills:`)
      await typewriteOutput(`  <span class="function">Frontend</span>  HTML . CSS . JavaScript . Vue 3 . GSAP`)
      await typewriteOutput(`  <span class="function">Design </span>  Figma . UI/UX . Prototyping`)
      await typewriteOutput(`  <span class="function">Backend</span>   Supabase . Node.js . REST API`)
      await typewriteOutput(`  <span class="function">Game   </span>  Unity . C# . Game Design`)
      await typewriteOutput(`  <span class="function">Hardware</span>  Mentor PADS . Protel/AD . PCB Design`)
    }
    // social
    else if (trimmed === "kumiko -social" || trimmed === "social") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> social links:`)
      await typewriteOutput(`  <span class="string">GitHub</span>    -> <a href="https://github.com/FishMoies" target="_blank" class="link">github.com/FishMoies</a>`)
      await typewriteOutput(`  <span class="string">Email</span>     -> <a href="mailto:xisiyao0529@gmail.com" class="link">xisiyao0529@gmail.com</a>`)
      await typewriteOutput(`  <span class="string">TapTap</span>    -> <a href="https://www.taptap.cn/app/267034" target="_blank" class="link">taptap.cn/app/267034</a>`)
    }
    // projects
    else if (trimmed === "kumiko -projects" || trimmed === "projects") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> projects:`)
      await typewriteOutput(`  <span class="method">Simple          </span> -- rhythm game (Unity, C#)`)
      await typewriteOutput(`  <span class="method">PersonalWebsite </span> -- this site (Vue 3, GSAP)`)
      await typewriteOutput(`  <span class="method">Vue Examples    </span> -- multi-type sites (Vue, Supabase)`)
      await typewriteOutput(`  <span class="method">PCB Audio Design</span> -- guitar pedals (Mentor PADS)`)
    }
    // banner
    else if (trimmed === "kumiko -banner" || trimmed === "banner") {
      for (const line of STARTUP_BANNER) {
        await typewriteOutput(`<span class="ascii-art">${line}</span>`, 10)
      }
    }
    // neofetch
    else if (trimmed === "kumiko -neofetch" || trimmed === "neofetch") {
      const dateStr = new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
      await typewriteOutput(`<span class="keyword">        ██╗  ██╗</span>`)
      await typewriteOutput(`<span class="keyword">        ██║ ██╔╝</span>  <span class="method">OmaeKumiko529</span>@<span class="string">personal-website</span>`)
      await typewriteOutput(`<span class="keyword">        █████╔╝</span>   ---------------------`)
      await typewriteOutput(`<span class="keyword">        ██╔═██╗</span>   <span class="function">OS</span>:        Kumiko OS v1.8.9`)
      await typewriteOutput(`<span class="keyword">        ██║  ██╗</span>  <span class="function">Shell</span>:     KUMIKO CMD zsh 5.9`)
      await typewriteOutput(`<span class="keyword">        ╚═╝  ╚═╝</span>  <span class="function">Uptime</span>:    INF days`)
      await typewriteOutput(`                    <span class="function">Locale</span>:    en_US.UTF-8`)
      await typewriteOutput(`                    <span class="function">Date</span>:      ${dateStr}`)
    }
    // quote
    else if (trimmed === "kumiko -quote" || trimmed === "quote") {
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)]
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> quote:`)
      await typewriteOutput(`  <span class="string">${q}</span>`)
    }
    // repo
    else if (trimmed === "kumiko -repo" || trimmed === "repo") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> repo info:`)
      await typewriteOutput(`  <span class="method">Name   </span>:  PersonalWebsite`)
      await typewriteOutput(`  <span class="method">Stack  </span>:  Vue 3 + Vite + GSAP`)
      await typewriteOutput(`  <span class="method">Pages  </span>:  <a href="https://fishmoies.github.io/PersonalWebsite/" target="_blank" class="link">GitHub Pages</a>`)
      await typewriteOutput(`  <span class="method">License</span>:  MIT License`)
    }
    // date
    else if (trimmed === "kumiko -date" || trimmed === "date") {
      const now = new Date()
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> date/time:`)
      await typewriteOutput(`  <span class="string">${now.toLocaleString("en-US")}</span>`)
      await typewriteOutput(`  <span class="function">TZ</span>: ${tz}`)
    }
    // matrix
    else if (trimmed === "kumiko -matrix" || trimmed === "matrix") {
      if (matrixInterval) {
        stopMatrixRain()
        await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Matrix stopped.`)
      } else {
        await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> starting Matrix rain...`)
        await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> type <span class="method">kumiko -matrix</span> again to stop.`)
        startMatrixRain()
      }
    }
    // clear
    else if (trimmed === "kumiko -clear" || trimmed === "clear") {
      stopMatrixRain()
      lines.value = []
    }
    // admin - 管理员登录（密码验证）
    else if (trimmed === "kumiko -admin" || trimmed === "admin") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Admin authentication required.`)
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Please enter password:`)
      await startPasswordPrompt(async (password) => {
        const isValid = await verifyPassword(password)
        if (isValid) {
          await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> <span class="string">Authentication successful.</span>`)
          await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Redirecting to admin panel...`)
          if (onNavigate) {
            setTimeout(() => onNavigate('/admin'), 600)
          }
        } else {
          await typewriteOutput(`<span class="errorText">Authentication failed.</span> Access denied.`)
        }
      })
    }
    // blog - 公开博客页面
    else if (trimmed === "kumiko -blog" || trimmed === "blog") {
      await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> Opening blog page...`)
      if (onNavigate) {
        setTimeout(() => onNavigate('/blog'), 400)
      }
    }
    // whoami
    else if (trimmed === "whoami") {
      await typewriteOutput(`<span class="string">OmaeKumiko529</span>`)
    }
    // echo
    else if (trimmed === "echo" || trimmed.startsWith("echo ")) {
      const msg = trimmed.slice(5).trim()
      await typewriteOutput(`<span class="string">${msg || "..."}</span>`)
    }
    // ls
    else if (trimmed === "ls" || trimmed === "kumiko -ls") {
      await typewriteOutput(`<span class="variable">about/     contact/   projects/  skills/    social/</span>`)
      await typewriteOutput(`<span class="variable">banner/    date/      matrix/    neofetch/  repo/</span>`)
      await typewriteOutput(`<span class="variable">quote/     help/      version/   clear/     admin/</span>`)
      await typewriteOutput(`<span class="variable">blog/</span>`)
    }
    // pwd
    else if (trimmed === "pwd") {
      await typewriteOutput(`<span class="string">/home/kumiko/website</span>`)
    }
    // uname
    else if (trimmed === "uname" || trimmed === "uname -a") {
      await typewriteOutput(`<span class="string">KumikoOS personal-website 1.8.9 x86_64 GNU/Linux</span>`)
    }
    // 未知命令 → 拼写建议
    else {
      const suggestions = getSuggestions(trimmed)
      if (suggestions.length > 0) {
        await typewriteOutput(`<span class="errorText">command not found</span>: ${rawCmd}`)
        await typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> did you mean:`)
        for (const s of suggestions) {
          await typewriteOutput(`  <span class="method">${s.cmd}</span>`)
        }
      } else {
        await typewriteOutput(`<span class="errorText">command not found</span>: ${rawCmd}`)
      }
    }
  }

  // ==================== 密码输入 ====================

  async function startPasswordPrompt(callback) {
    passwordMode.value = true
    passwordCallback = callback
  }

  async function handlePasswordSubmit(input) {
    passwordMode.value = false
    const cb = passwordCallback
    passwordCallback = null
    if (cb) {
      // 在终端中回显为星号
      lines.value.push({ type: "output", text: `<span class="plain">  ***</span>` })
      scrollToBottom()
      await cb(input)
    }
  }

  // ==================== 键盘处理 ====================

  function handleKey(e) {
    if (e.key === "Tab") {
      if (!passwordMode.value) handleTab(e)
      return
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      if (passwordMode.value) return
      if (history.value.length === 0) return
      historyIndex = Math.max(0, historyIndex === -1 ? history.value.length - 1 : historyIndex - 1)
      currentInput.value = history.value[historyIndex] || ""
      return
    }
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (passwordMode.value) return
      if (history.value.length === 0) return
      if (historyIndex === -1) return
      historyIndex = Math.min(history.value.length, historyIndex + 1)
      currentInput.value = historyIndex < history.value.length ? history.value[historyIndex] : ""
      return
    }
    if (e.key === "Enter") {
      if (passwordMode.value) {
        const pwd = currentInput.value
        currentInput.value = ""
        handlePasswordSubmit(pwd)
      } else {
        runCommand(currentInput.value)
        currentInput.value = ""
      }
      return
    }
    if (e.key === "Backspace") {
      currentInput.value = currentInput.value.slice(0, -1)
      return
    }
    // Ctrl+C: 取消密码模式或终止矩阵代码雨
    if (e.ctrlKey && (e.key === "c" || e.key === "C")) {
      if (passwordMode.value) {
        passwordMode.value = false
        passwordCallback = null
        currentInput.value = ""
        typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> <span class="string">^C</span> -- Password prompt cancelled.`)
        return
      }
      if (matrixInterval) {
        stopMatrixRain()
        typewriteOutput(`<span class="keyword">[KUMIKO CMD]</span> <span class="string">^C</span> -- Matrix terminated.`)
      }
      return
    }

    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      currentInput.value += e.key
    }
  }

  /** 终端滚轮：智能判断边界 */
  function handleTerminalWheel(e) {
    const el = terminalBodyRef.value
    if (!el) return

    const atTop = el.scrollTop === 0
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight

    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      return // 到达边界，允许冒泡 → 触发页面滚动
    }
    e.stopPropagation() // 未达边界，仅终端内部滚动
  }

  // ==================== 命令执行 ====================

  async function runCommand(cmd) {
    if (passwordMode.value) return

    lines.value.push({ type: "input", text: cmd })

    if (cmd.trim() !== "") {
      history.value.push(cmd)
      historyIndex = -1
    }

    await executeCommand(cmd.trim().toLowerCase(), cmd)
    scrollToBottom()
  }

  // ==================== 启动横幅 ====================

  async function showStartupBanner() {
    const bannerLines = STARTUP_BANNER
    for (let i = 0; i < 5; i++) {
      await typewriteOutput(`<span class="ascii-art">${bannerLines[i]}</span>`, 8)
    }
    await typewriteOutput("", 5)
    for (let i = 6; i < bannerLines.length; i++) {
      await typewriteOutput(`<span class="keyword">  ${bannerLines[i]}</span>`, 10)
    }
  }

  return {
    isTerminalActive,
    lines,
    currentInput,
    history,
    terminalBodyRef,
    matrixInterval,
    passwordMode,
    focusTerminal,
    blurTerminal,
    handleKey,
    handleTerminalWheel,
    handleTab,
    runCommand,
    showStartupBanner,
    typewriteOutput,
    stopMatrixRain,
    scrollToBottom
  }
}