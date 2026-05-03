<script setup lang="ts">
import { MapPin, Sparkles, Clock, ChevronRight } from 'lucide-vue-next'
import type { TripResponse } from '../../types/trip'

const props = defineProps<{
  recentCourses: TripResponse[]
}>()

const emit = defineEmits(['selectCourse'])
</script>

<template>
  <div class="px-4 py-1 flex flex-col gap-5">
    <!-- Recent AI Courses List -->
    <div class="flex flex-col gap-3">
      <div 
        v-for="(course, index) in recentCourses" 
        :key="index"
        @click="emit('selectCourse', course)"
        class="bg-slate-50 border border-slate-100 p-4 rounded-[2rem] flex items-center gap-4 hover:border-indigo-200 transition-all active:scale-[0.98] cursor-pointer group shadow-sm"
      >
        <!-- AI Icon with Glow Effect -->
        <div class="relative shrink-0">
          <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
            <Sparkles class="w-6 h-6 text-indigo-500 animate-pulse" />
          </div>
          <!-- Tiny floating sparkles -->
          <div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full blur-[2px] opacity-60 animate-ping"></div>
        </div>

        <div class="flex-1 overflow-hidden">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md">AI 추천</span>
            <h5 class="font-black text-slate-900 text-sm truncate">{{ course.title }}</h5>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1 text-slate-400">
              <Clock class="w-3 h-3" />
              <span class="text-[10px] font-bold">{{ course.totalDuration }}</span>
            </div>
            <span class="text-slate-300 text-[10px]">•</span>
            <span class="text-[10px] font-bold text-slate-500 truncate">{{ course.summary }}</span>
          </div>
        </div>

        <ChevronRight class="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
      </div>

      <!-- Empty State -->
      <div v-if="recentCourses.length === 0" class="py-12 text-center bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
        <p class="text-slate-400 text-xs font-medium">최근 추천받은 코스가 없습니다.</p>
        <p class="text-[10px] text-slate-300 mt-1 uppercase font-black">Ask AI to plan your trip first</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom animations for sparkles */
@keyframes sparkle {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}
</style>
