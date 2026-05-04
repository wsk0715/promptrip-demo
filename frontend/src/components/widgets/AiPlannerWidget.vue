<script setup lang="ts">
import { useTripStore } from '../../services/tripService';
import { Send, Loader2, Wand2 } from 'lucide-vue-next';

const tripStore = useTripStore();
const emit = defineEmits(['processing-start', 'planning-complete']);

const handleSearch = async () => {
  if (!tripStore.prompt.trim()) return;
  emit('processing-start');
  await tripStore.startPlanning(tripStore.prompt);
  emit('planning-complete');
};
</script>

<template>
  <div class="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
    <div class="flex flex-col gap-4">
      <div class="space-y-1 mb-2">
        <h3 class="text-xl font-black text-slate-900 tracking-tight">어디로 떠날까요?</h3>
        <p class="text-xs font-semibold text-slate-400">당신의 취향을 담은 안티-허브 경로를 생성합니다.</p>
      </div>

      <!-- Enhanced Input Field -->
      <div class="relative group">
        <textarea 
          v-model="tripStore.prompt"
          placeholder="예: 서울시청 주변 힐링하기 좋은 조용한 카페 코스 짜줘"
          class="w-full h-32 bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-5 pr-14 text-sm font-semibold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none resize-none shadow-inner"
          @keyup.enter.prevent="handleSearch"
        ></textarea>
        
        <button 
          @click="handleSearch"
          :disabled="tripStore.isProcessing || !tripStore.prompt.trim()"
          class="absolute bottom-4 right-4 w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:bg-slate-200 disabled:shadow-none transition-all active:scale-90"
        >
          <Send v-if="!tripStore.isProcessing" class="w-5 h-5" />
          <Loader2 v-else class="w-5 h-5 animate-spin" />
        </button>
      </div>

      <!-- Quick Presets -->
      <div class="flex flex-wrap gap-2 pt-2">
        <button 
          v-for="preset in ['☕ 조용한 카페 투어', '🌙 나홀로 야경 산책', '🌳 힐링 숲길']" 
          :key="preset"
          @click="tripStore.prompt = preset"
          class="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-bold text-slate-500 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"
        >
          {{ preset }}
        </button>
      </div>
    </div>

    <!-- AI Agent Logs -->
    <div v-if="tripStore.logs.length > 0 || tripStore.isProcessing" class="bg-slate-900 text-slate-300 p-5 rounded-2xl font-mono text-xs shadow-inner relative overflow-hidden animate-in fade-in zoom-in duration-500">
      <div class="flex items-center gap-2 mb-3 text-slate-500 border-b border-white/10 pb-2">
        <Wand2 class="w-3 h-3 text-indigo-400" />
        <span class="text-[10px] uppercase tracking-widest font-bold">Trip Agent Logs</span>
      </div>
      <div class="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
        <div 
          v-for="(log, i) in tripStore.logs" 
          :key="i" 
          class="flex gap-2 animate-in fade-in slide-in-from-left-2"
        >
          <span class="text-indigo-400 opacity-50">{{ i + 1 }}</span>
          <span>{{ log }}</span>
        </div>
        <div v-if="tripStore.isProcessing" class="flex gap-2 items-center text-indigo-400">
          <span class="text-[10px] animate-pulse">●</span>
          <span class="animate-pulse">AI가 최적의 경로를 분석 중입니다...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
