<template>
  <div class="relative">
    <!-- 语言切换按钮 -->
    <button
      type="button"
      @click="toggleDropdown"
      class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      <span class="text-lg">{{ currentFlag }}</span>
      <span class="hidden sm:inline">{{ currentLocaleName }}</span>
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- 下拉菜单 -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
      >
        <div class="py-1" role="menu">
          <button
            v-for="locale in supportedLocales"
            :key="locale.code"
            @click="selectLocale(locale.code)"
            class="w-full flex items-center gap-3 px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150"
            :class="{ 'bg-indigo-50 text-indigo-700': currentLocale === locale.code, 'text-gray-700': currentLocale !== locale.code }"
            role="menuitem"
          >
            <span class="text-lg">{{ locale.flag }}</span>
            <span>{{ locale.name }}</span>
            <svg
              v-if="currentLocale === locale.code"
              class="w-4 h-4 ml-auto text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>
      </div>
    </Transition>

    <!-- 点击外部关闭 -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="isOpen = false"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { supportedLocales, setLocale, getCurrentLocale } from '@/i18n'
const isOpen = ref(false)

const currentLocale = computed(() => getCurrentLocale())

const currentLocaleName = computed(() => {
  const locale = supportedLocales.find(l => l.code === currentLocale.value)
  return locale?.name || ''
})

const currentFlag = computed(() => {
  const locale = supportedLocales.find(l => l.code === currentLocale.value)
  return locale?.flag || ''
})

const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const selectLocale = (code: string) => {
  setLocale(code)
  isOpen.value = false
}
</script>
