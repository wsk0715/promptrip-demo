<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  show: boolean
  persistent?: boolean
  minHeight: number // in rem
  midHeight: number // in rem
  maxHeight?: number // in rem
  title?: string 
  icon?: any // New prop for cute icons
}>()

const emit = defineEmits(['close'])

const widgetRef = ref<HTMLElement | null>(null)
const currentHeight = ref(props.midHeight)
const isDragging = ref(false)
const startY = ref(0)
const startHeight = ref(0)

// Root font size for px to rem conversion
const getRootFontSize = () => parseFloat(getComputedStyle(document.documentElement).fontSize)

/**
 * Gets the actual available height in the parent container in rem
 */
const getParentHeightRem = () => {
  if (widgetRef.value?.parentElement) {
    return widgetRef.value.parentElement.clientHeight / getRootFontSize()
  }
  // Fallback to window height minus header/footer estimate if parent not available
  return (window.innerHeight - 150) / getRootFontSize() 
}

/**
 * Smart Snap Points
 * Caps the heights to ensure they always fit within the parent container
 */
const getSnaps = () => {
  const parentHeightRem = getParentHeightRem()
  
  return {
    MIN: Math.min(props.minHeight, parentHeightRem * 0.5),
    MID: Math.min(props.midHeight, parentHeightRem * 0.8),
    MAX: props.maxHeight ? Math.min(props.maxHeight, parentHeightRem) : parentHeightRem
  }
}

const onTouchStart = (e: TouchEvent | MouseEvent) => {
  if (!props.show) return
  isDragging.value = true
  startY.value = 'touches' in e ? e.touches[0].clientY : e.clientY
  startHeight.value = currentHeight.value
  document.body.style.userSelect = 'none'
}

const onTouchMove = (e: TouchEvent | MouseEvent) => {
  if (!isDragging.value) return
  if ('touches' in e && e.cancelable) e.preventDefault()

  const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
  const deltaYPixels = startY.value - clientY
  const deltaYRem = deltaYPixels / getRootFontSize()
  
  const newHeight = startHeight.value + deltaYRem
  const snaps = getSnaps()
  
  // Strict bounds: never exceed parent height
  const lowerBound = props.persistent ? snaps.MIN : 0
  currentHeight.value = Math.min(Math.max(newHeight, lowerBound), snaps.MAX)
}

const onTouchEnd = () => {
  if (!isDragging.value) return
  isDragging.value = false
  document.body.style.userSelect = ''

  const snaps = getSnaps()
  
  // Precise snapping logic in rem
  if (currentHeight.value > (snaps.MID + snaps.MAX) / 2) {
    currentHeight.value = snaps.MAX
  } else if (currentHeight.value > (snaps.MIN + snaps.MID) / 2) {
    currentHeight.value = snaps.MID
  } else {
    // Swipe-to-close removed: Always snap to MIN when dragged low
    currentHeight.value = snaps.MIN
  }
}

/**
 * Programmatic height control
 */
const snapTo = (level: 'MIN' | 'MID' | 'MAX') => {
  const snaps = getSnaps()
  currentHeight.value = snaps[level]
}

const getCurrentLevel = () => {
  const snaps = getSnaps()
  const error = 0.1 
  if (Math.abs(currentHeight.value - snaps.MAX) < error) return 'MAX'
  if (Math.abs(currentHeight.value - snaps.MID) < error) return 'MID'
  return 'MIN'
}

defineExpose({
  snapTo,
  getCurrentLevel
})

// Automatic snap removed to allow parent controller full control

onMounted(() => {
  window.addEventListener('mousemove', onTouchMove)
  window.addEventListener('mouseup', onTouchEnd)
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onTouchMove)
  window.removeEventListener('mouseup', onTouchEnd)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<template>
  <Transition name="slide-up">
    <div 
      v-show="show" 
      ref="widgetRef"
      class="absolute inset-x-0 bottom-0 z-[50] bg-white rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] border-t border-slate-200 flex flex-col overflow-hidden text-slate-900 will-change-[height]"
      style="transition: height 0.5s cubic-bezier(0.16, 1, 0.3, 1);"
      :class="{ 'transition-none': isDragging }"
      :style="{ height: `${currentHeight}rem` }"
    >
      <!-- Draggable Handle Area -->
      <div 
        @mousedown="onTouchStart" 
        @touchstart="onTouchStart"
        class="relative shrink-0 pt-5 pb-1 cursor-grab active:cursor-grabbing group"
      >
        <div 
          class="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-1 group-hover:bg-slate-300 transition-colors"
          :class="{ 'bg-indigo-300': isDragging }"
        ></div>
      </div>

      <!-- Unified Header Area (Title & Icon) -->
      <div v-if="title" class="px-5 py-2.5 shrink-0 flex items-center justify-between border-b border-slate-50">
        <div class="flex items-center gap-2.5">
          <component :is="icon" v-if="icon" class="w-5 h-5 text-indigo-600" />
          <h4 class="text-lg font-black text-slate-900 tracking-tight">{{ title }}</h4>
        </div>
        <slot name="header-action"></slot>
      </div>

      <!-- Content Slot (Zero padding for full-bleed flexibility) -->
      <div class="flex-1 overflow-y-auto custom-scrollbar">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
.transition-none { transition: none !important; }
</style>
