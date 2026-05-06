<script setup lang="ts">
import { ref } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Award, Share2, ChevronRight, Heart, MapPin, X } from 'lucide-vue-next';
import { formatDate, getEmotionIcon } from '../../utils/formatUtils';

const tripStore = useTripStore();
const activeSubTab = ref<'mine' | 'community'>('mine');
const selectedHistoryTrip = ref<any | null>(null);
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
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 overflow-hidden">
    <!-- Tab Headers -->
    <div class="flex px-5 pt-4 gap-6 border-b border-slate-100 bg-white">
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
    <div class="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5">
      
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
            @click="selectedHistoryTrip = trip"
            class="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group cursor-pointer"
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
              
              <!-- Connection Lines (SVG) -->
              <svg class="absolute inset-0 w-full h-full opacity-30">
                <line 
                  v-for="(_, idx) in trip.visits.slice(1)" :key="idx"
                  :x1="`${(idx + 1) * (100 / (trip.visits.length + 1))}%`" 
                  :y1="`${30 + (idx % 2 === 0 ? 30 : -10)}%`"
                  :x2="`${(idx + 2) * (100 / (trip.visits.length + 1))}%`" 
                  :y2="`${30 + ((idx + 1) % 2 === 0 ? 30 : -10)}%`"
                  stroke="white" 
                  stroke-width="0.5" 
                  stroke-dasharray="2 2"
                />
              </svg>

              <div class="relative w-full h-full">
                 <div v-for="(visit, idx) in trip.visits" :key="idx" 
                      class="absolute w-1.5 h-1.5 rounded-full animate-pulse"
                      :style="{ 
                        left: `${(idx + 1) * (100 / (trip.visits.length + 1))}%`, 
                        top: `${30 + (idx % 2 === 0 ? 30 : -10)}%`,
                        backgroundColor: visit.color || 'white',
                        boxShadow: `0 0 8px ${visit.color || 'white'}`
                      }"
                 ></div>
              </div>
              <div class="absolute bottom-2 right-3 text-[8px] font-black text-white/40 tracking-widest uppercase italic">Star Mode</div>
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

          <div class="p-4">
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
      <div v-if="tripStore.historyTrips.length > 0 && activeSubTab === 'mine'" class="bg-indigo-600 rounded-[2rem] p-5 text-white shadow-xl shadow-indigo-100">
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

    <!-- 3. History Detail Overlay -->
    <Transition name="slide-up">
      <div v-if="selectedHistoryTrip" class="fixed inset-0 z-[1000] bg-slate-900 text-white flex flex-col">
        <!-- Header -->
        <div class="px-6 py-8 flex items-center justify-between">
          <button @click="selectedHistoryTrip = null" class="p-2 bg-white/10 rounded-full text-white/60">
            <X class="w-5 h-5" />
          </button>
          <div class="text-center">
            <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 block">Memory Archive</span>
            <h4 class="text-lg font-black tracking-tight">{{ selectedHistoryTrip.title }}</h4>
          </div>
          <button class="p-2 bg-white/10 rounded-full text-white/60">
            <Share2 class="w-5 h-5" />
          </button>
        </div>

        <!-- Full Constellation Canvas -->
        <div class="flex-1 relative flex items-center justify-center p-10">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4338ca20_0%,_transparent_70%)]"></div>
          
          <div class="relative w-full aspect-square max-w-sm">
            <!-- Constellation Lines -->
            <svg class="absolute inset-0 w-full h-full opacity-40">
              <line 
                v-for="(_, idx) in selectedHistoryTrip.visits.slice(1)" :key="idx"
                :x1="`${10 + (idx * 20)}%`" :y1="`${50 + (idx % 2 === 0 ? 20 : -20)}%`"
                :x2="`${10 + ((idx + 1) * 20)}%`" :y2="`${50 + ((idx + 1) % 2 === 0 ? 20 : -20)}%`"
                stroke="white" stroke-width="1" stroke-dasharray="4 4"
              />
            </svg>

            <!-- Star Points -->
            <div 
              v-for="(visit, idx) in selectedHistoryTrip.visits" :key="idx"
              class="absolute group cursor-pointer"
              :style="{ 
                left: `${10 + (idx * 20)}%`, 
                top: `${50 + (idx % 2 === 0 ? 20 : -20)}%`,
                transform: 'translate(-50%, -50%)'
              }"
            >
              <div 
                class="w-4 h-4 rounded-full shadow-lg animate-pulse"
                :style="{ backgroundColor: visit.color, boxShadow: `0 0 15px ${visit.color}` }"
              ></div>
              <!-- Floating Label (Mini) -->
              <div class="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-[8px] font-bold bg-white/10 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">{{ visit.placeId }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Review Timeline -->
        <div class="shrink-0 bg-white/5 backdrop-blur-xl border-t border-white/10 p-6 max-h-[40vh] overflow-y-auto">
          <h5 class="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
            <Heart class="w-3 h-3" /> 여정 한줄평
          </h5>
          <div class="space-y-6">
            <div v-for="(visit, idx) in selectedHistoryTrip.visits" :key="idx" class="flex gap-4">
              <div class="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-sm" :style="{ backgroundColor: `${visit.color}20`, color: visit.color }">
                {{ getEmotionIcon(visit.emotion) }}
              </div>
              <div class="flex-1 space-y-1">
                <h6 class="text-[11px] font-black text-white/90">방문지 {{ idx + 1 }}</h6>
                <p class="text-xs font-medium text-white/60 leading-relaxed">{{ visit.comment }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
