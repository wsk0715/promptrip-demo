<script setup lang="ts">
import { MapPin, Clock, Users, Ticket, Plus } from 'lucide-vue-next'
import type { District } from '../../types/district'

const props = defineProps<{
  district: District
}>()

const emit = defineEmits(['addToCourse'])
</script>

<template>
  <div class="px-6 py-4 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col gap-1.5">
      <div class="flex items-center gap-2">
        <div 
          class="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
          :style="{ backgroundColor: district.color }"
        ></div>
        <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
          {{ district.status }} ZONE
        </span>
      </div>
      <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ district.name }}</h3>
      <p class="text-sm font-medium text-slate-500 leading-relaxed">{{ district.description }}</p>
    </div>

    <!-- Recommendation Reason -->
    <div class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
      <h4 class="text-xs font-bold text-indigo-600 mb-1.5 flex items-center gap-1.5">
        ✨ 추천 이유
      </h4>
      <p class="text-[13px] font-semibold text-indigo-900/80 leading-snug">
        {{ district.reason || '현재 사용자님의 취향과 주변 상황을 고려하여 선정된 구역입니다.' }}
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 gap-3">
      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-white rounded-xl shadow-sm text-slate-400">
          <Clock class="w-4 h-4" />
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase">예상 체류</span>
          <span class="text-xs font-black text-slate-700">{{ district.avgTime || '1시간' }}</span>
        </div>
      </div>
      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
        <div class="p-2 bg-white rounded-xl shadow-sm text-slate-400">
          <Users class="w-4 h-4" />
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase">혼잡도</span>
          <span class="text-xs font-black text-slate-700">{{ district.congestion || '보통' }}</span>
        </div>
      </div>
    </div>

    <!-- Keywords -->
    <div class="flex flex-wrap gap-1.5">
      <span 
        v-for="tag in district.keywords" 
        :key="tag"
        class="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg shadow-sm"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-2 gap-3 mt-2">
      <button class="flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-200 active:scale-95 transition-all">
        <Ticket class="w-4 h-4" />
        혜택 보기
      </button>
      <button 
        @click="emit('addToCourse', district)"
        class="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
      >
        <Plus class="w-4 h-4" />
        코스에 추가
      </button>
    </div>
  </div>
</template>
