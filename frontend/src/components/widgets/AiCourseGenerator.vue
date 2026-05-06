<script setup lang="ts">
import { useTripStore } from '../../services/tripService';
import { Send, Loader2, Wand2, Trees, Building2, Coffee, PartyPopper, Landmark, Sparkles, SlidersHorizontal, Info } from 'lucide-vue-next';

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
      </div>

      <div class="relative group">
        <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Wand2 class="w-5 h-5 text-indigo-500 group-focus-within:animate-pulse" />
        </div>
        <input 
          v-model="tripStore.prompt"
          @keyup.enter="handleSearch"
          placeholder="예: 해운대 달맞이길 카페 코스"
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

    <!-- 3. Preference Filters (Seamless Integration) -->
    <div v-if="!tripStore.isProcessing && tripStore.preferences" class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <div class="flex items-center justify-between">
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2">
          <SlidersHorizontal class="w-3 h-3 text-indigo-500" /> 상세 취향 설정
        </h4>
      </div>

      <div class="space-y-12 px-1">
        <div v-for="config in preferenceConfigs" :key="config.key" class="relative">
          <!-- Labeling -->
          <div class="flex justify-between items-center absolute -top-6 left-0 right-0 px-1">
            <div class="flex items-center gap-1.5 transition-all duration-300" :class="tripStore.preferences[config.key] === 0 ? 'text-indigo-600' : 'text-slate-400'">
              <component :is="config.left.icon" class="w-3 h-3" />
              <span class="text-[10px] font-black uppercase tracking-tight">{{ config.left.label }}</span>
            </div>
            <div class="flex items-center gap-1.5 transition-all duration-300" :class="tripStore.preferences[config.key] === 1 ? 'text-indigo-600' : 'text-slate-400'">
              <span class="text-[10px] font-black uppercase tracking-tight">{{ config.right.label }}</span>
              <component :is="config.right.icon" class="w-3 h-3" />
            </div>
          </div>
          
          <!-- Track Toggle -->
          <div class="relative h-10 bg-slate-100 rounded-2xl p-1 flex items-center group border border-slate-200/50">
            <div 
              class="absolute h-8 bg-white rounded-xl shadow-sm border border-slate-200/50 transition-all duration-500 ease-out z-10"
              :style="{ 
                width: 'calc(33.33% - 4px)',
                left: tripStore.preferences[config.key] === 0 ? '4px' : (tripStore.preferences[config.key] === 0.5 ? 'calc(33.33% + 2px)' : 'calc(66.66% + 0px)')
              }"
            ></div>
            
            <button @click="setPreference(config.key, 0)" class="flex-1 h-full z-20 flex items-center justify-center">
               <span class="text-[9px] font-black uppercase transition-colors" :class="tripStore.preferences[config.key] === 0 ? 'text-indigo-600' : 'text-slate-400'">선호</span>
            </button>
            <button @click="setPreference(config.key, 0.5)" class="flex-1 h-full z-20 flex items-center justify-center">
               <div class="w-1 h-1 rounded-full bg-slate-300" :class="tripStore.preferences[config.key] === 0.5 ? 'bg-indigo-400' : ''"></div>
            </button>
            <button @click="setPreference(config.key, 1)" class="flex-1 h-full z-20 flex items-center justify-center">
               <span class="text-[9px] font-black uppercase transition-colors" :class="tripStore.preferences[config.key] === 1 ? 'text-indigo-600' : 'text-slate-400'">선호</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Agent Logs (Polished Processing Feed) -->
    <div v-if="tripStore.isProcessing" class="mt-4 animate-in fade-in zoom-in-95 duration-700">
      <div class="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-2xl shadow-indigo-100/20 relative overflow-hidden">
        <!-- Decoration light -->
        <div class="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/5 blur-[60px] rounded-full"></div>
        
        <div class="flex items-center gap-3 mb-8">
          <div class="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Loader2 class="w-5 h-5 text-white animate-spin" />
          </div>
          <div>
            <h4 class="text-sm font-black text-slate-900 tracking-tight">AI 플래너가 분석 중입니다</h4>
          </div>
        </div>

        <div class="space-y-4">
          <div v-for="(log, idx) in tripStore.logs" :key="idx" class="flex gap-4 group animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div class="shrink-0 w-5 flex flex-col items-center">
              <!-- Dot Container matched to text line-height (approx 16px) -->
              <div class="h-4 flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-600 shadow-[0_0_8px_#4f46e5] group-last:scale-125"></div>
              </div>
              <div class="w-[1px] flex-1 bg-slate-100 group-last:hidden"></div>
            </div>
            <div class="flex-1">
              <span class="text-[11px] font-bold text-slate-600 leading-4 tracking-tight block">
                {{ log }}
              </span>
            </div>
          </div>
          
          <!-- Current Action pulse (Aligned with logs) -->
          <div class="flex gap-4 items-start">
            <div class="shrink-0 w-5 flex items-center justify-center h-4">
              <div class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping"></div>
            </div>
            <span class="text-[11px] font-black text-indigo-500 tracking-tight leading-4 flex-1">
              최적의 경로를 계산하고 있습니다...
            </span>
          </div>

          <!-- Background Process Info (Refined) -->
          <div class="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 opacity-50">
            <Info class="w-3 h-3 text-slate-400" />
            <p class="text-[10px] font-black text-slate-400 tracking-tight">
              분석 작업이 백그라운드에서 계속 진행됩니다
            </p>
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
