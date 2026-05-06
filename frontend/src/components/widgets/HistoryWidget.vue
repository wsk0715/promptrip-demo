<script setup lang="ts">
import { ref } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Award, Share2, ChevronRight, X, Star, Sparkles } from 'lucide-vue-next';
import { formatDate, getEmotionIcon } from '../../utils/formatUtils';
import WidgetContainer from '../common/WidgetContainer.vue';
import SafeImage from '../common/SafeImage.vue';

const tripStore = useTripStore();
const activeSubTab = ref<'mine' | 'community'>('mine');
const selectedHistoryTrip = ref<any | null>(null);
const emit = defineEmits(['close', 'start-journey', 'view-plan', 'history-focus', 'share-mode']);

const handleSubTabChange = (tab: 'mine' | 'community') => {
  activeSubTab.value = tab;
  if (tab === 'community' && tripStore.communityTrips.length === 0) {
    tripStore.fetchCommunityTrips();
  }
};

const handleTripClick = (trip: any) => {
  selectedHistoryTrip.value = trip;
  emit('history-focus', trip);
};

const handleShare = () => {
  if (selectedHistoryTrip.value) {
    emit('share-mode', selectedHistoryTrip.value);
  }
};

const handleImport = (trip: any) => {
  tripStore.importCommunityTrip(trip);
  emit('view-plan');
};

const getPlaceTitle = (trip: any, placeId: string) => {
  const allItems = trip.plans.flatMap((p: any) => p.items);
  return allItems.find((p: any) => p.contentId === placeId)?.title || '장소 정보 없음';
};

const getPlaceImage = (trip: any, placeId: string) => {
  const allItems = trip.plans.flatMap((p: any) => p.items);
  return allItems.find((p: any) => p.contentId === placeId)?.firstImage;
};
</script>

<template>
  <WidgetContainer padding="p-0" space="space-y-0">
    <template #header>
      <div class="flex px-6 pt-4 gap-6 border-b border-slate-100 bg-white shadow-sm">
        <button 
          @click="handleSubTabChange('mine')"
          class="pb-3 border-b-2 text-sm font-black transition-all"
          :class="activeSubTab === 'mine' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400'"
        >
          나의 기록
        </button>
        <button 
          @click="handleSubTabChange('community')"
          class="pb-3 border-b-2 text-sm font-black transition-all"
          :class="activeSubTab === 'community' ? 'border-indigo-600 text-slate-900' : 'border-transparent text-slate-400'"
        >
          여정 둘러보기
        </button>
      </div>
    </template>

    <div class="p-6 space-y-5">
      <div v-if="activeSubTab === 'mine'" class="space-y-4">
        <div v-if="tripStore.historyTrips.length === 0" class="flex flex-col items-center justify-center py-16 text-center">
          <div class="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-indigo-100/50 flex items-center justify-center mb-6">
            <Award class="w-10 h-10 text-slate-200" />
          </div>
          <h4 class="text-base font-black text-slate-900">아직 기록이 없어요</h4>
          <p class="text-xs font-bold text-slate-400 mt-2 leading-relaxed">첫 여정을 완료하고<br/>소중한 추억을 남겨보세요!</p>
          <button @click="emit('start-journey')" class="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black shadow-lg">여행 시작하기</button>
        </div>

        <div v-else class="space-y-4">
          <div 
            v-for="trip in tripStore.historyTrips" :key="trip.id"
            @click="handleTripClick(trip)"
            class="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all group cursor-pointer"
          >
            <div class="flex justify-between items-center">
              <div class="space-y-1">
                <span class="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{{ formatDate(trip.completedAt) }}</span>
                <h4 class="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{{ trip.title }}</h4>
              </div>
              <div class="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <Star class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span class="text-xs font-black text-slate-700">{{ trip.visits.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="space-y-6">
        <div v-for="trip in tripStore.communityTrips" :key="trip.id" class="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
          <div class="relative h-44">
            <SafeImage :src="trip.plans[0].items[0].firstImage" class-name="w-full h-full" />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
            <div class="absolute bottom-4 left-6 flex items-center gap-2">
              <img :src="trip.authorImage" class="w-6 h-6 rounded-full border border-white/50" />
              <span class="text-[10px] font-black text-white">{{ trip.authorName }}</span>
            </div>
          </div>
          <div class="p-5">
            <h4 class="text-base font-black text-slate-900 mb-1 leading-tight">{{ trip.title }}</h4>
            <div class="flex items-center justify-between pt-4 border-t border-slate-50">
              <span class="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{{ trip.likes }} LIKES</span>
              <button @click="handleImport(trip)" class="text-xs font-black text-slate-900 flex items-center gap-1">가져오기 <ChevronRight class="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. Record Detail Overlay (Ultra Clean & Image-rich) -->
    <Transition name="slide-up">
      <div v-if="selectedHistoryTrip" class="absolute inset-0 z-[100] bg-white flex flex-col overflow-hidden">
        <WidgetContainer padding="p-0" space="space-y-0" class="!bg-white">
          <template #header>
            <div class="px-6 py-3 flex items-center justify-between border-b border-slate-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
              <button @click="selectedHistoryTrip = null; emit('history-focus', null)" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-all">
                <X class="w-5 h-5" />
              </button>
              <span class="text-[9px] font-black text-indigo-500 uppercase tracking-[0.3em]">Trip Memoir</span>
              <div class="w-8"></div>
            </div>
          </template>

          <div class="flex-1 overflow-y-auto custom-scrollbar pb-32">
            <div class="px-6 pt-10 pb-8 text-center bg-white">
              <span class="inline-block px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[9px] font-black uppercase tracking-widest mb-4">
                {{ formatDate(selectedHistoryTrip.completedAt) }}
              </span>
              <h2 class="text-2xl font-black text-slate-900 leading-tight tracking-tight mb-2 break-keep">
                {{ selectedHistoryTrip.title }}
              </h2>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {{ selectedHistoryTrip.visits.length }} Places Explored
              </p>
            </div>

            <div class="px-5 space-y-6">
              <div v-for="(visit, idx) in selectedHistoryTrip.visits" :key="idx" class="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 flex flex-col">
                <SafeImage 
                  :src="getPlaceImage(selectedHistoryTrip, visit.placeId)" 
                  class-name="h-52 w-full"
                />

                <div class="p-5">
                  <div class="flex justify-between items-start mb-3">
                    <div class="space-y-1">
                      <div class="flex items-center gap-2">
                        <span class="text-sm">{{ getEmotionIcon(visit.emotion) }}</span>
                        <h4 class="text-base font-black text-slate-900 leading-tight">{{ getPlaceTitle(selectedHistoryTrip, visit.placeId) }}</h4>
                      </div>
                    </div>
                    <div class="flex gap-0.5 pt-1">
                      <Star v-for="i in 5" :key="i" class="w-2.5 h-2.5" :class="i <= visit.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'" />
                    </div>
                  </div>
                  
                  <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                    <p class="text-[13px] font-bold text-slate-600 leading-relaxed italic">
                      "{{ visit.comment }}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="absolute bottom-0 inset-x-0 p-5 bg-white/90 backdrop-blur-xl border-t border-slate-50 z-30">
              <button 
                @click="handleShare"
                class="w-full py-4 bg-slate-900 text-white rounded-2xl text-[12px] font-black shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <Share2 class="w-4 h-4" />
                이 여정 공유하기
              </button>
            </div>
          </template>
        </WidgetContainer>
      </div>
    </Transition>
  </WidgetContainer>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
