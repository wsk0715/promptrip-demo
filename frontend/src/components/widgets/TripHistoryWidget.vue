<script setup lang="ts">
import { useTripStore } from '../../services/tripService';
import { History } from 'lucide-vue-next';

const tripStore = useTripStore();
</script>

<template>
  <div class="h-full flex flex-col bg-white p-8 overflow-hidden">
    <div class="flex items-center gap-2 mb-2">
      <div class="w-1 h-1 bg-indigo-500 rounded-full"></div>
      <span class="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Archive</span>
    </div>
    <h3 class="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-10">최근 생성한<br/>여정을 선택하세요</h3>
    
    <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
      <div 
        v-for="(trip, idx) in tripStore.recentTrips" 
        :key="idx" 
        @click="tripStore.importCommunityTrip(trip)" 
        class="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] hover:border-indigo-200 transition-all cursor-pointer group shadow-sm"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded uppercase tracking-widest">AI Pick</span>
          <span class="text-[10px] font-bold text-slate-400">{{ trip.totalDuration }}</span>
        </div>
        <h5 class="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{{ trip.title }}</h5>
        <p class="text-[11px] font-medium text-slate-400 mt-1 line-clamp-2">{{ trip.summary }}</p>
      </div>
      
      <div v-if="tripStore.recentTrips.length === 0" class="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-slate-100 rounded-[3rem] opacity-30">
        <History class="w-10 h-10 text-slate-200" />
        <p class="text-xs font-black text-slate-300 uppercase tracking-widest">No History</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
