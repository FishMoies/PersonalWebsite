/**
 * 终端数据配置
 * 包含命令列表、名言、横幅生成、工具函数等
 */

// ==================== 打字动画标题数据 ====================

/**
 * 打字动画显示的完整标题文本，每个标题由多个 token 组成
 * token 包含 text（文字）和 type（高亮类型）
 */
export const texts = [
  [
    { text: "printf", type: "function" },
    { text: "(", type: "plain" },
    { text: "\"", type: "string" },
    { text: "Hello, World!", type: "string" },
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

// ==================== 命令系统 ====================

/**
 * 可用命令列表（用于 Tab 补全和帮助）
 */
export const COMMANDS = [
  { cmd: 'kumiko -help', short: 'help', desc: 'display help info' },
  { cmd: 'kumiko -version', short: 'version', desc: 'show version' },
  { cmd: 'kumiko -contact', short: 'contact', desc: 'show contact info' },
  { cmd: 'kumiko -about', short: 'about', desc: 'about me' },
  { cmd: 'kumiko -skills', short: 'skills', desc: 'list skills' },
  { cmd: 'kumiko -social', short: 'social', desc: 'social links' },
  { cmd: 'kumiko -projects', short: 'projects', desc: 'list projects' },
  { cmd: 'kumiko -banner', short: 'banner', desc: 'show startup banner' },
  { cmd: 'kumiko -neofetch', short: 'neofetch', desc: 'system info (neofetch)' },
  { cmd: 'kumiko -quote', short: 'quote', desc: 'random programming quote' },
  { cmd: 'kumiko -repo', short: 'repo', desc: 'repo info' },
  { cmd: 'kumiko -clear', short: 'clear', desc: 'clear terminal' },
  { cmd: 'kumiko -date', short: 'date', desc: 'show current date/time' },
  { cmd: 'kumiko -matrix', short: 'matrix', desc: 'matrix rain (experimental)' },
  { cmd: 'kumiko -admin', short: 'admin', desc: 'login admin panel' },
  { cmd: 'kumiko -blog', short: 'blog', desc: 'open blog page' },
]

/** 所有短命令列表 */
export const SHORT_CMDS = COMMANDS.map(c => c.short)

/** 所有长命令列表 */
export const LONG_CMDS = COMMANDS.map(c => c.cmd)

// ==================== 随机编程名言 ====================

export const QUOTES = [
  '"Talk is cheap. Show me the code." -- Linus Torvalds',
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." -- Martin Fowler',
  '"First make it work, then make it fast." -- Refactoring principle',
  '"Debugging is twice as hard as writing the code in the first place." -- Brian Kernighan',
  '"Code is written for humans to read, and only incidentally for machines to execute." -- Harold Abelson',
  '"Simplicity is the ultimate sophistication." -- Leonardo da Vinci',
  '"Don\'t repeat yourself." -- DRY Principle',
  '"Any problem in computer science can be solved by adding another layer of indirection." -- David Wheeler',
  '"Premature optimization is the root of all evil." -- Donald Knuth',
  '"Programs must be written for people to read, and only incidentally for machines to execute." -- Harold Abelson',
]

// ==================== 启动横幅 ====================

/** 内容区域统一宽度（边框内部可见宽度） */
export const INNER_WIDTH = 49

/**
 * 计算字符串视觉宽度（中文/全角/emoji = 2 列，ASCII = 1 列）
 */
export function visualLength(str) {
  let len = 0
  for (const ch of str) {
    const code = ch.codePointAt(0)
    if (
      (code >= 0x4E00 && code <= 0x9FFF) ||  // CJK 统一表意文字
      (code >= 0x3000 && code <= 0x303F) ||  // CJK 符号
      (code >= 0xFF00 && code <= 0xFFEF) ||  // 全角形式
      (code >= 0x1100 && code <= 0x11FF) ||  // 谚文 Jamo
      (code >= 0x2E80 && code <= 0x2EFF) ||  // CJK 部首
      (code >= 0x3040 && code <= 0x309F) ||  // 平假名
      (code >= 0x30A0 && code <= 0x30FF) ||  // 片假名
      (code >= 0xAC00 && code <= 0xD7AF) ||  // 谚文音节
      (code >= 0x1F000 && code <= 0x1FFFF)    // Emoji
    ) {
      len += 2
    } else {
      len += 1
    }
  }
  return len
}

/**
 * 居中文本并填充到指定宽度（支持中文/全角/emoji 宽度感知）
 */
export function centerText(text, width) {
  const textLen = visualLength(text)
  const space = width - textLen
  if (space <= 0) return text
  const left = Math.floor(space / 2)
  const right = space - left
  return ' '.repeat(left) + text + ' '.repeat(right)
}

/**
 * 生成横幅各行
 */
export function generateBanner() {
  const logo = [
    '  _  ___   _ __  __ ___ _  _____  ____ ____   ___  ',
    ' | |/ / | | |  \\/  |_ _| |/ / _ \\| ___|___ \\ / _ \\ ',
    ' | \' /| | | | |\\/| || || \' / | | |___ \\ __) | (_) |',
    ' | . \\| |_| | |  | || || . \\ |_| |___) / __/ \\__, |',
    ' |_|\\_\\\\___/|_|  |_|___|_|\\_\\___/|____/_____|  /_/ ',
  ]

  const topBorder    = '  +' + '-'.repeat(INNER_WIDTH) + '+'
  const titleLine    = '   ' + centerText(' KUMIKO CMD v1.8.9 - Interactive Terminal ', INNER_WIDTH) + ' '
  const cmdLine      = '   ' + centerText(' Type <kumiko -help> for all commands ', INNER_WIDTH) + ' '
  const helpLine     = '  ' + centerText('>kumiko -help for help', INNER_WIDTH) + '  '
  const emptyLine    = ''

  return [...logo, emptyLine, topBorder, titleLine, cmdLine, helpLine]
}

/** 预生成启动横幅 */
export const STARTUP_BANNER = generateBanner()

/**
 * 计算 Levenshtein 编辑距离（用于拼写建议）
 */
export function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1
    }
  }
  return dp[m][n]
}

/** 每个字符的打字动画持续时间（秒） */
export const soloTime = 0.1