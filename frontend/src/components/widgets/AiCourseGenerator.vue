<script setup lang="ts">
import { useTripStore } from '../../services/tripService';
import { Send, Loader2, Wand2 } from 'lucide-vue-next';

const tripStore = useTripStore();
const emit = defineEmits(['processing-start']);

const handleSearch = () => {
  if (!tripStore.prompt.trim()) return;
  emit('processing-start');
  tripStore.startPlanning(tripStore.prompt);
};
</script>

<template>
  <div class="h-full flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
    <div class="flex flex-col gap-4">
      <div class="space-y-1 mb-2">
        <h3 class="text-xl font-black text-slate-900 tracking-tight">어디로 떠날까요?</h3>
        <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Custom Trip Planner</p>
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

      <div v-if="!tripStore.isProcessing" class="flex flex-wrap gap-2">
        <button 
          v-for="preset in ['🛋️ 카페 투어', '🌙 야경 산책', '🌲 힐링 스팟']"
          :key="preset"
          @click="tripStore.prompt = preset; handleSearch()"
          class="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-black text-slate-600 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm"
        >
          {{ preset }}
        </button>
      </div>
    </div>

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
