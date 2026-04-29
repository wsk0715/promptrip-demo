<script setup lang="ts">
import { ref } from 'vue';
import { useTripPlanner } from '../services/tripService';
import { Send, MapPin, Loader2, Info } from 'lucide-vue-next';

const prompt = ref('');
const { currentTrip, logs, isProcessing, error, startPlanning } = useTripPlanner();

const handleSearch = () => {
  if (!prompt.value.trim()) return;
  startPlanning(prompt.value);
};
</script>

<template>
  <div class="max-w-4xl mx-auto p-4 space-y-8">
    <!-- Search Section -->
    <div class="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 ring-1 ring-slate-200/50">
      <h2 class="text-3xl font-black text-slate-900 mb-2 flex items-center gap-3">
        <MapPin class="text-indigo-600 w-8 h-8" />
        Where to next?
      </h2>
      <p class="text-slate-500 mb-6">Describe your perfect trip and let AI do the rest.</p>
      
      <div class="relative group">
        <textarea
          v-model="prompt"
          placeholder="e.g., Jeonju 2-day food tour with historical focus"
          class="w-full p-5 pr-16 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none h-32 text-lg placeholder:text-slate-400 group-hover:border-slate-200"
          :disabled="isProcessing"
          @keydown.enter.prevent="handleSearch"
        ></textarea>
        <button 
          @click="handleSearch"
          :disabled="isProcessing || !prompt.trim()"
          class="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
        >
          <Send v-if="!isProcessing" class="w-6 h-6" />
          <Loader2 v-else class="w-6 h-6 animate-spin" />
        </button>
      </div>
    </div>

    <!-- Processing Logs -->
    <div v-if="logs.length > 0 || isProcessing" class="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm shadow-inner relative overflow-hidden ring-1 ring-white/10">
      <div class="flex items-center gap-2 mb-4 text-slate-500 border-b border-white/10 pb-3">
        <div class="flex gap-1.5">
          <div class="w-3 h-3 rounded-full bg-red-500/20"></div>
          <div class="w-3 h-3 rounded-full bg-amber-500/20"></div>
          <div class="w-3 h-3 rounded-full bg-emerald-500/20"></div>
        </div>
        <span class="ml-2">Trip Agent Logs</span>
      </div>
      <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
        <div v-for="(log, i) in logs" :key="i" class="flex gap-3 animate-in fade-in slide-in-from-left-2 transition-all">
          <span class="text-indigo-400 opacity-50">{{ i + 1 }}</span>
          <span>{{ log }}</span>
        </div>
      </div>
      <div v-if="isProcessing" class="mt-4 flex items-center gap-2 text-indigo-400 animate-pulse">
        <Loader2 class="w-4 h-4 animate-spin" />
        <span>Thinking...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border-2 border-red-100 p-6 rounded-2xl flex items-start gap-4 text-red-700 animate-in shake">
      <Info class="w-6 h-6 mt-1 flex-shrink-0" />
      <div>
        <h3 class="font-bold text-lg">Planning Interrupted</h3>
        <p class="text-red-600">{{ error }}</p>
      </div>
    </div>

    <!-- Result Section -->
    <div v-if="currentTrip?.plans && !isProcessing" class="animate-in fade-in zoom-in-95 duration-500">
      <h3 class="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        🎯 {{ currentTrip.title || 'Your Customized Plan' }}
      </h3>
      <div class="space-y-8">
        <div v-for="day in currentTrip.plans" :key="day.day" class="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div class="flex items-center gap-3 mb-6">
            <div class="bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wider uppercase">
              Day {{ day.day }}
            </div>
            <div class="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div class="space-y-6 relative ml-4 border-l-2 border-indigo-50 pl-8 py-2">
            <div v-for="(item, idx) in day.items" :key="idx" class="relative">
              <!-- Timeline indicator -->
              <div class="absolute -left-[41px] top-1.5 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 ring-4 ring-indigo-50"></div>
              
              <div class="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <span class="text-sm font-bold text-indigo-500 tabular-nums">{{ item.time }}</span>
                <h4 class="font-bold text-slate-900 text-lg">{{ item.location }}</h4>
              </div>
              <p class="mt-1 text-slate-600 leading-relaxed">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.animate-in {
  animation: enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes enter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
