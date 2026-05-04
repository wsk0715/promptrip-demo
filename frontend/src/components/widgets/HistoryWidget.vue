<script setup lang="ts">
import { ref } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Award, Share2, ChevronRight, Heart, MapPin } from 'lucide-vue-next';

const tripStore = useTripStore();
const activeSubTab = ref<'mine' | 'community'>('mine');
const emit = defineEmits(['close', 'start-journey', 'view-plan']);

const handleSubTabChange = (tab: 'mine' | 'community') => {
  activeSubTab.value = tab;
  if (tab === 'community' && tripStore.communityTrips.length === 0) {
    tripStore.fetchCommunityTrips();
  }
};

const handleImport = (trip: any) => {
  tripStore.importCommunityTrip(trip);
  emit('view-plan');
};

const formatDate = (iso: string) => {
  if (!iso) return '진행 중';
  return new Date(iso).toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getEmotionIcon = (emotion: string) => {
  const icons: Record<string, string> = {
    happy: '😊',
    peaceful: '🧘',
    excited: '🤩',
    melancholy: '🌧️'
  };
  return icons[emotion] || '✨';
};
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 overflow-hidden">
    <!-- Tab Headers -->
    <div class="flex px-6 pt-4 gap-6 border-b border-slate-100 bg-white">
      <button 
        @click="handleSubTabChange('mine')"
        class="pb-3 border-b-2 text-sm font-black transition-all"
        :class="activeSubTab === 'mine' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400'"
      >
        나의 여정
      </button>
      <button 
        @click="handleSubTabChange('community')"
        class="pb-3 border-b-2 text-sm font-black transition-all"
        :class="activeSubTab === 'community' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400'"
      >
        여정 둘러보기
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
      
      <!-- 1. My Journeys Tab -->
      <div v-if="activeSubTab === 'mine'" class="space-y-6">
        <!-- Empty State -->
        <div v-if="tripStore.historyTrips.length === 0" class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-indigo-100/50 flex items-center justify-center mb-6">
            <Award class="w-10 h-10 text-slate-200" />
          </div>
          <h4 class="text-base font-black text-slate-900">아직 완성된 여정이 없어요</h4>
          <p class="text-xs font-bold text-slate-400 mt-2 leading-relaxed">
            여행 코스를 완주하고 나만의<br/>아름다운 여정 기록을 남겨보세요!
          </p>
          <button 
            @click="emit('start-journey')"
            class="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
          >
            첫 여행 시작하기
          </button>
        </div>

        <!-- History List -->
        <div v-else class="space-y-4">
          <div 
            v-for="trip in tripStore.historyTrips" :key="trip.id"
            class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group cursor-pointer"
          >
            <div class="flex justify-between items-start mb-4">
              <div class="space-y-1">
                <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{{ formatDate(trip.completedAt) }}</span>
                <h4 class="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{{ trip.title }}</h4>
              </div>
              <button class="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                <Share2 class="w-4 h-4" />
              </button>
            </div>

            <!-- Constellation Preview (Abstract) -->
            <div class="relative h-20 bg-slate-900 rounded-2xl overflow-hidden mb-4 p-4 flex items-center justify-center">
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
              <div class="relative w-full h-full">
                 <div v-for="(_, idx) in trip.visits" :key="idx" 
                      class="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white] animate-pulse"
                      :style="{ 
                        left: `${(idx + 1) * 20}%`, 
                        top: `${30 + (idx % 2 === 0 ? 30 : -10)}%` 
                      }"
                 ></div>
              </div>
              <div class="absolute bottom-2 right-3 text-[8px] font-black text-white/40 tracking-widest uppercase italic">Archive Mode</div>
            </div>

            <div class="flex items-center justify-between">
              <div class="flex -space-x-2">
                <div 
                  v-for="(visit, idx) in trip.visits.slice(0, 3)" :key="idx"
                  class="w-8 h-8 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center text-sm shadow-sm"
                >
                  {{ getEmotionIcon(visit.emotion) }}
                </div>
              </div>
              <div class="flex items-center gap-1 text-slate-300">
                <span class="text-[10px] font-black uppercase tracking-tight">상세 보기</span>
                <ChevronRight class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Community Tab -->
      <div v-else class="space-y-6 animate-in slide-in-from-right duration-300">
        <div 
          v-for="trip in tripStore.communityTrips" :key="trip.id"
          class="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all group"
        >
          <!-- Image Header -->
          <div class="relative h-48">
            <img :src="trip.plans[0].items[0].firstImage" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
            
            <!-- Author Overlay -->
            <div class="absolute bottom-4 left-6 flex items-center gap-3">
              <img :src="trip.authorImage" class="w-8 h-8 rounded-full border-2 border-white" />
              <span class="text-xs font-black text-white">{{ trip.authorName }}</span>
            </div>
            
            <!-- Like Count -->
            <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1.5 border border-white/20">
              <Heart class="w-3.5 h-3.5 text-white fill-white" />
              <span class="text-[11px] font-black text-white">{{ trip.likes }}</span>
            </div>
          </div>

          <div class="p-6">
            <div class="flex gap-2 mb-3">
              <span v-for="tag in trip.tags" :key="tag" class="px-2 py-1 bg-indigo-50 text-indigo-500 rounded-lg text-[9px] font-black">#{{ tag }}</span>
            </div>
            <h4 class="text-lg font-black text-slate-900 mb-2 leading-tight">{{ trip.title }}</h4>
            <p class="text-[11px] font-bold text-slate-400 line-clamp-2 leading-relaxed mb-4">{{ trip.summary }}</p>
            
            <div class="flex items-center justify-between pt-4 border-t border-slate-50">
              <div class="flex items-center gap-2 text-slate-400">
                <MapPin class="w-3 h-3" />
                <span class="text-[10px] font-bold">{{ trip.plans[0].items.length }}개의 장소</span>
              </div>
              <button 
                @click="handleImport(trip)"
                class="text-indigo-600 text-[11px] font-black flex items-center gap-1 hover:translate-x-1 transition-transform"
              >
                가져오기 <ChevronRight class="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Common Stats Section (Optional) -->
      <div v-if="tripStore.historyTrips.length > 0 && activeSubTab === 'mine'" class="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-xl shadow-indigo-100">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
            <Award class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <h5 class="text-sm font-black">여정 기록가</h5>
            <p class="text-[10px] font-bold text-white/70">총 {{ tripStore.visitedPlaces.length }}개의 장소를 기록했습니다.</p>
          </div>
          <div class="text-right">
            <span class="text-xs font-black">Level 1</span>
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
