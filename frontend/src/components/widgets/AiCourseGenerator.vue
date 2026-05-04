<script setup lang="ts">
import { useTripStore } from '../../services/tripService';
import { Send, Loader2, Wand2, Trees, Building2, Coffee, PartyPopper, Landmark, Sparkles, SlidersHorizontal } from 'lucide-vue-next';

const tripStore = useTripStore();
const emit = defineEmits(['processing-start']);

const handleSearch = () => {
  if (!tripStore.prompt.trim()) return;
  emit('processing-start');
  tripStore.startPlanning(tripStore.prompt);
};

const preferenceConfigs = [
  { 
    key: 'natureCity' as const, 
    left: { label: '자연', icon: Trees }, 
    right: { label: '도시', icon: Building2 } 
  },
  { 
    key: 'healingParty' as const, 
    left: { label: '힐링', icon: Coffee }, 
    right: { label: '파티', icon: PartyPopper } 
  },
  { 
    key: 'traditionTrend' as const, 
    left: { label: '전통', icon: Landmark }, 
    right: { label: '트렌드', icon: Sparkles } 
  }
];

const setPreference = (key: 'natureCity' | 'healingParty' | 'traditionTrend', value: number) => {
  tripStore.preferences[key] = value;
};
</script>

<template>
  <div class="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar bg-white">
    <!-- 1. Header & AI Input -->
    <div class="space-y-4">
      <div class="space-y-1">
        <h3 class="text-xl font-black text-slate-900 tracking-tight">어디로 떠날까요?</h3>
        <p class="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 w-fit px-2 py-0.5 rounded-md">AI Custom Planner</p>
      </div>

      <div class="relative group">
        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Wand2 class="w-5 h-5 text-indigo-500 group-focus-within:animate-pulse" />
        </div>
        <input 
          v-model="tripStore.prompt"
          @keyup.enter="handleSearch"
          placeholder="예: 종로의 조용한 카페 코스"
          class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-5 pl-12 pr-4 text-sm font-bold shadow-sm transition-all outline-none"
          :disabled="tripStore.isProcessing"
        />
        <button 
          @click="handleSearch"
          :disabled="tripStore.isProcessing || !tripStore.prompt.trim()"
          class="absolute right-3 top-3 p-2.5 bg-slate-900 text-white rounded-xl active:scale-95 transition-all disabled:opacity-50"
        >
          <Send v-if="!tripStore.isProcessing" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" />
        </button>
      </div>
    </div>

    <!-- 2. Presets (Quick Selection) -->
    <div v-if="!tripStore.isProcessing" class="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
        <Sparkles class="w-3 h-3" /> 빠른 선택
      </h4>
      <div class="flex flex-wrap gap-2">
        <button 
          v-for="preset in ['🛋️ 카페 투어', '🌙 야경 산책', '🌲 힐링 스팟']"
          :key="preset"
          @click="tripStore.prompt = preset; handleSearch()"
          class="px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl text-[11px] font-black text-slate-600 hover:text-indigo-600 transition-all active:scale-95"
        >
          {{ preset }}
        </button>
      </div>
    </div>

    <!-- 3. Preference Filters (Segmented Control) -->
    <div v-if="!tripStore.isProcessing && tripStore.preferences" class="bg-slate-50/80 rounded-3xl p-5 space-y-6 border border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <div class="flex items-center justify-between">
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <SlidersHorizontal class="w-3 h-3" /> 상세 취향 필터
        </h4>
        <span class="text-[9px] font-bold text-indigo-400">가중치 자동 반영</span>
      </div>

      <div class="space-y-4">
        <div v-for="config in preferenceConfigs" :key="config.key" class="space-y-2">
          <div class="flex justify-between items-center mb-1">
            <span class="text-[10px] font-black text-slate-600 uppercase tracking-tight">{{ config.left.label }}</span>
            <span class="text-[10px] font-black text-slate-600 uppercase tracking-tight">{{ config.right.label }}</span>
          </div>
          
          <!-- Segmented Toggle -->
          <div class="grid grid-cols-3 bg-slate-200/50 p-1 rounded-xl gap-1">
            <button 
              @click="setPreference(config.key, 0)"
              class="flex flex-col items-center justify-center py-2 rounded-lg transition-all"
              :class="tripStore.preferences[config.key] === 0 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
            >
              <component :is="config.left.icon" class="w-3.5 h-3.5 mb-0.5" />
              <span class="text-[8px] font-black uppercase">선호</span>
            </button>
            <button 
              @click="setPreference(config.key, 0.5)"
              class="flex flex-col items-center justify-center py-2 rounded-lg transition-all"
              :class="tripStore.preferences[config.key] === 0.5 ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'"
            >
              <span class="text-[10px] font-black">-</span>
            </button>
            <button 
              @click="setPreference(config.key, 1)"
              class="flex flex-col items-center justify-center py-2 rounded-lg transition-all"
              :class="tripStore.preferences[config.key] === 1 ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'"
            >
              <component :is="config.right.icon" class="w-3.5 h-3.5 mb-0.5" />
              <span class="text-[8px] font-black uppercase">선호</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Logs (During processing) -->
    <div v-if="tripStore.isProcessing" class="animate-in fade-in zoom-in-95 duration-500">
      <div class="bg-slate-900 text-slate-300 p-5 rounded-3xl font-mono text-[11px] shadow-2xl relative overflow-hidden border border-white/5">
        <div class="flex items-center gap-2 mb-4 text-slate-500 border-b border-white/10 pb-3">
          <div class="flex gap-1">
            <div class="w-2 h-2 rounded-full bg-rose-500/50"></div>
            <div class="w-2 h-2 rounded-full bg-amber-500/50"></div>
            <div class="w-2 h-2 rounded-full bg-emerald-500/50"></div>
          </div>
          <span class="text-[9px] uppercase tracking-widest font-black ml-2 text-slate-400">Agent Logs</span>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
          <div v-for="(log, idx) in tripStore.logs" :key="idx" class="flex gap-3 animate-in fade-in slide-in-from-left-3">
            <span class="text-indigo-500/50 font-bold w-4">{{ idx + 1 }}</span>
            <span class="font-medium tracking-tight">{{ log }}</span>
          </div>
          <div class="flex gap-3 items-center text-indigo-400 animate-pulse mt-2">
            <span class="text-indigo-500/50 font-bold w-4">></span>
            <span class="font-bold">계산 중...</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
