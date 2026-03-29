import { createI18n } from 'vue-i18n'
import zh from './locales/zh'
import en from './locales/en'

// 支持的语言列表
export const supportedLocales = [
  { code: 'zh', name: '简体中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
]

// 默认语言
export const defaultLocale = 'zh'

// 从 localStorage 获取保存的语言设置
const getSavedLocale = (): string => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('app-language')
    if (saved && supportedLocales.some(l => l.code === saved)) {
      return saved
    }
  }
  // 尝试检测浏览器语言
  const browserLang = navigator.language.toLowerCase()
  if (browserLang.startsWith('zh')) {
    return 'zh'
  }
  return defaultLocale
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getSavedLocale(),
  fallbackLocale: defaultLocale,
  messages: {
    zh,
    en,
  },
  // 全局注入 $t 函数
  globalInjection: true,
})

// 切换语言函数
export const setLocale = (locale: string) => {
  if (supportedLocales.some(l => l.code === locale)) {
    i18n.global.locale.value = locale as 'zh' | 'en'
    localStorage.setItem('app-language', locale)
    // 更新 html lang 属性
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en-US'
  }
}

// 获取当前语言
export const getCurrentLocale = () => i18n.global.locale.value

export default i18n
