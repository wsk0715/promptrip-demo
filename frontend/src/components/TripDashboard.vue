<script setup lang="ts">
import { ref } from 'vue';
import { useTripPlanner } from '../services/tripService';
import { Send, Loader2, Wand2, Coffee, Moon, Utensils, TreePine, MapPin, Clock, ArrowRight } from 'lucide-vue-next';

const { currentTrip, logs, isProcessing, error, prompt, startPlanning, resetPlanner } = useTripPlanner();

const emit = defineEmits(['trip-update', 'processing-start', 'reset']);

const presets = [
  { id: 'random', label: '계획 없이 추천', icon: Wand2, query: '서울시청 주변으로 계획 없이 가볼만한 곳 추천해줘' },
  { id: 'nearby', label: '지금 주변 추천', icon: MapPin, query: '현재 위치 주변의 숨은 명소 알려줘' },
  { id: 'quiet', label: '조용한 곳', icon: TreePine, query: '서울 시내에서 혼잡도가 낮고 조용한 힐링 장소 추천해줘' },
  { id: 'food', label: '맛집 중심', icon: Utensils, query: '줄 서지 않아도 맛있는 로컬 맛집 위주로 코스 짜줘' },
  { id: 'cafe', label: '감성 카페', icon: Coffee, query: '사진 찍기 좋고 분위기 있는 감성 카페 위주로 추천해줘' },
  { id: 'night', label: '야경 코스', icon: Moon, query: '서울의 밤을 즐길 수 있는 야경 명소 코스 알려줘' },
];

const handleSearch = () => {
  if (!prompt.value.trim()) return;
  emit('processing-start');
  startPlanning(prompt.value);
};

const handlePresetClick = (query: string) => {
  prompt.value = query;
  emit('processing-start');
  startPlanning(query);
};
</script>

<template>
  <div class="p-4 space-y-6">
    <!-- Quick Presets -->
    <div v-if="!isProcessing && !currentTrip" class="px-1 animate-in">
      <div class="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
        <button 
          v-for="preset in presets" 
          :key="preset.id"
          @click="handlePresetClick(preset.query)"
          class="shrink-0 flex items-center gap-2 px-4 py-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all active:scale-95 group"
        >
          <component :is="preset.icon" class="w-4 h-4 text-indigo-500 group-hover:scale-110 transition-transform" />
          <span class="text-xs font-bold text-slate-700">{{ preset.label }}</span>
        </button>
      </div>
    </div>

    <!-- Search Section (Simplified Widget Style) -->
    <div v-if="!currentTrip || isProcessing" class="bg-slate-50 p-4 rounded-3xl border border-slate-200/60 shadow-inner">
      <div class="relative group">
        <textarea
          v-model="prompt"
          placeholder="어디로 떠나고 싶으신가요? (예: 전주 1박 2일 먹방 여행)"
          class="w-full p-4 pr-14 bg-white border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none h-32 text-base font-medium placeholder:text-slate-400 shadow-sm"
          :disabled="isProcessing"
          @keydown.enter.prevent="handleSearch"
        ></textarea>
        <button 
          @click="handleSearch"
          :disabled="isProcessing || !prompt.trim()"
          class="absolute bottom-4 right-4 p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-90 disabled:opacity-50"
        >
          <Send v-if="!isProcessing" class="w-6 h-6" />
          <Loader2 v-else class="w-6 h-6 animate-spin" />
        </button>
      </div>
    </div>

    <!-- Processing Logs -->
    <div v-if="logs.length > 0 || isProcessing" class="bg-slate-900 text-slate-300 p-5 rounded-2xl font-mono text-xs shadow-inner relative overflow-hidden">
      <div class="flex items-center gap-2 mb-3 text-slate-500 border-b border-white/10 pb-2">
        <span class="text-[10px] uppercase tracking-widest font-bold">Trip Agent Logs</span>
      </div>
      <div class="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
        <div v-for="(log, i) in logs" :key="i" class="flex gap-2 animate-in fade-in slide-in-from-left-2">
          <span class="text-indigo-400 opacity-50">{{ i + 1 }}</span>
          <span>{{ log }}</span>
        </div>
      </div>
    </div>

    <!-- Result Section (Enhanced for MVP) -->
    <div v-if="currentTrip?.plans && !isProcessing" class="animate-in fade-in zoom-in-95 duration-500 pb-4">
      <div class="px-2 mb-6">
        <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          🎯 {{ currentTrip.title }}
        </h3>
        <p class="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
          {{ currentTrip.summary }}
        </p>
        <div class="flex items-center gap-2 mt-4">
          <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-tighter">
            Estimated {{ currentTrip.totalDuration }}
          </span>
        </div>
      </div>

      <div class="space-y-6">
        <div v-for="day in currentTrip.plans" :key="day.day" class="space-y-4">
          <div class="flex items-center gap-3 px-2">
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Day {{ day.day }}</span>
            <div class="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div class="space-y-4 relative ml-3 border-l-2 border-slate-100 pl-7 py-1">
            <div v-for="(item, idx) in day.items" :key="idx" class="relative group">
              <!-- Number Indicator -->
              <div class="absolute -left-[39px] top-0 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                {{ idx + 1 }}
              </div>
              
              <div class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-2">
                  <h4 class="font-black text-slate-900 text-base">{{ item.location }}</h4>
                  <span class="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">{{ item.time }}</span>
                </div>
                
                <p class="text-xs font-semibold text-slate-500 leading-snug mb-3">{{ item.description }}</p>
                
                <div class="bg-slate-50 rounded-xl p-3 border border-slate-100/50 mb-3">
                  <p class="text-[11px] font-bold text-slate-600 leading-tight">
                    <span class="text-indigo-600">✨ 추천 이유:</span> {{ item.reason }}
                  </p>
                </div>

                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-1.5 text-slate-400">
                    <Clock class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold">{{ item.avgStay }} 체류</span>
                  </div>
                  <div v-if="item.travelTimeNext" class="flex items-center gap-1.5 text-indigo-400">
                    <ArrowRight class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold">{{ item.travelTimeNext }} 이동</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="grid grid-cols-2 gap-3 mt-8 px-2">
        <button 
          @click="emit('reset')"
          class="py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition-colors"
        >
          다시 추천받기
        </button>
        <button 
          @click="emit('trip-update', currentTrip)"
          class="py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
        >
          <Navigation class="w-4 h-4 fill-white" />
          안내 시작
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.animate-in {
  animation: enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes enter {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
