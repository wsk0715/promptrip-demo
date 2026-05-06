<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Clock, ArrowRight, Navigation, SlidersHorizontal, X, Sparkles, Check, Flag, GripVertical, RefreshCcw, Save, Share2, RotateCcw, History, ChevronRight, MapPin, Footprints, Car, Star } from 'lucide-vue-next';

const tripStore = useTripStore();
const isEditing = ref(false);
const draggedIndex = ref<number | null>(null);

const emit = defineEmits(['trip-update', 'place-click', 'edit-mode-change']);

// Navigation logic: Find the first unvisited place
const nextPlace = computed(() => {
  if (!tripStore.currentTrip) return null;
  for (const day of tripStore.currentTrip.plans) {
    for (const item of day.items) {
      if (!tripStore.isPlaceVisited(item.contentId)) return item;
    }
  }
  return null;
});

const handleStartEdit = () => {
  isEditing.value = true;
  emit('edit-mode-change', true);
};

const handleSaveEdit = () => {
  isEditing.value = false;
  emit('edit-mode-change', false);
};

const handleCancelEdit = () => {
  isEditing.value = false;
  emit('edit-mode-change', false);
};

const handleConfirmTrip = () => {
  tripStore.confirmTrip();
  emit('trip-update', tripStore.currentTrip);
};

const handleReplaceItem = (index: number) => {
  tripStore.replaceItemWithAlternative(index);
};

const getTravelInfo = (fromIdx: number, toIdx: number) => {
  const plan = (tripStore.currentTrip || tripStore.pendingTrip)?.plans[0];
  if (!plan) return null;
  
  const from = plan.items[fromIdx];
  const to = plan.items[toIdx];
  if (!from || !to) return null;

  const R = 6371e3; 
  const lat1 = from.mapY * Math.PI / 180;
  const lat2 = to.mapY * Math.PI / 180;
  const deltaLat = (to.mapY - from.mapY) * Math.PI / 180;
  const deltaLng = (to.mapX - from.mapX) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; 

  if (distance < 1000) {
    const walkingTime = Math.round(distance / 60);
    return { type: 'walk', dist: `${Math.round(distance)}m`, time: `${walkingTime}분` };
  } else {
    const drivingTime = Math.round((distance / 1000) * 4) + 2;
    return { type: 'car', dist: `${(distance / 1000).toFixed(1)}km`, time: `${drivingTime}분` };
  }
};

const handlePointerDown = (index: number, e: PointerEvent) => {
  e.stopPropagation();
  draggedIndex.value = index;
  
  const onPointerMove = (moveEvent: PointerEvent) => {
    const elementUnder = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
    const itemUnder = elementUnder?.closest('[data-drag-index]');
    
    if (itemUnder) {
      const targetIndex = parseInt(itemUnder.getAttribute('data-drag-index') || '-1');
      if (targetIndex !== -1 && targetIndex !== draggedIndex.value) {
        tripStore.reorderPendingTrip(draggedIndex.value!, targetIndex);
        draggedIndex.value = targetIndex;
      }
    }
  };
  
  const onPointerUp = () => {
    draggedIndex.value = null;
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
  };
  
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative">
    <!-- CASE 1: ACTIVE NAVIGATION MODE (Balanced & Slim) -->
    <div v-if="tripStore.currentTrip" class="h-full flex flex-col overflow-hidden bg-slate-50/40">
      <div class="flex-1 overflow-y-auto px-5 py-8 custom-scrollbar pb-32">
        <div v-for="day in tripStore.currentTrip.plans" :key="day.day" class="relative">
          <!-- Slimmer Timeline Line -->
          <div class="absolute left-6 top-2 bottom-2 w-px bg-slate-200"></div>
          
          <div class="space-y-6 pb-8">
            <div 
              v-for="(item, idx) in day.items" 
              :key="item.contentId" 
              class="relative pl-12 transition-all duration-300"
              :class="tripStore.isPlaceVisited(item.contentId) ? 'opacity-30 grayscale' : 'opacity-100'"
            >
              <!-- Consistent Node -->
              <div 
                class="absolute left-[20px] top-4 w-2 h-2 rounded-full border-2 border-white shadow-sm z-10"
                :class="tripStore.isPlaceVisited(item.contentId) ? 'bg-slate-300' : 'bg-indigo-600'"
              ></div>

              <!-- Slim Card Container -->
              <div 
                class="bg-white rounded-[1.2rem] p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer relative"
                @click="emit('place-click', item)"
              >
                <div class="flex items-center justify-between">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest">Step {{ idx + 1 }}</span>
                      <span v-if="item.contentId === nextPlace?.contentId && !tripStore.isPlaceVisited(item.contentId)" class="px-1.5 py-0.5 bg-indigo-50 text-indigo-500 text-[8px] font-black rounded-md">NEXT</span>
                    </div>
                    <h4 class="font-bold text-slate-900 text-sm truncate leading-none">{{ item.title }}</h4>
                    <p class="text-[10px] font-medium text-slate-400 truncate mt-1">{{ item.addr1 }}</p>
                  </div>

                  <button 
                    @click.stop="tripStore.quickRecordVisit(item.contentId)"
                    class="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ml-3"
                    :class="tripStore.isPlaceVisited(item.contentId) ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-300 border border-slate-100'"
                  >
                    <Check class="w-4 h-4" />
                  </button>
                </div>

                <!-- Subtle Travel Info at Bottom -->
                <div v-if="idx < day.items.length - 1 && !tripStore.isPlaceVisited(item.contentId)" class="absolute -bottom-4 left-4 z-20">
                  <div class="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                    <component :is="getTravelInfo(idx, idx + 1)?.type === 'walk' ? Footprints : Car" class="w-2.5 h-2.5 text-slate-300" />
                    <span class="text-[8px] font-black text-slate-400">{{ getTravelInfo(idx, idx + 1)?.time }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-6 z-50">
        <button @click="tripStore.stopNavigation()" class="w-full py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Flag class="w-4 h-4" /> 여정 종료
        </button>
      </div>
    </div>

    <!-- CASE 2: RECOMMENDATION RESULT MODE -->
    <div v-else-if="tripStore.pendingTrip" class="h-full flex flex-col overflow-hidden bg-slate-50/30">
      <div class="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar pb-32">
        <div class="mb-10">
          <div class="flex items-center gap-2 mb-4">
            <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded border border-indigo-100 uppercase">AI Proposal</span>
            <span class="text-slate-300 text-[10px] font-medium">|</span>
            <span class="text-slate-400 text-[10px] font-bold">{{ tripStore.pendingTrip.totalDuration }} 소요 예상</span>
          </div>
          <h3 class="text-3xl font-black text-slate-900 tracking-tight leading-tight">{{ tripStore.pendingTrip.title }}</h3>
          <p class="text-sm font-medium text-slate-500 mt-3 leading-relaxed line-clamp-2">{{ tripStore.pendingTrip.summary }}</p>
        </div>

        <div v-for="day in tripStore.pendingTrip.plans" :key="day.day" class="relative">
          <div class="absolute left-6 top-4 bottom-4 w-px bg-slate-200"></div>
          <div class="space-y-10 pb-8">
            <div 
              v-for="(item, idx) in day.items" 
              :key="item.contentId" 
              class="relative pl-14 transition-all duration-300" 
              :data-drag-index="idx" 
              :class="draggedIndex === idx ? 'opacity-30 scale-95' : ''"
            >
              <div class="absolute left-[20px] top-1.5 w-[9px] h-[9px] rounded-full bg-white border-2 border-slate-300 z-10"></div>
              <div class="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-sm relative group hover:shadow-md transition-all">
                <div class="flex items-center gap-4">
                  <div v-if="isEditing" @pointerdown="handlePointerDown(idx, $event)" class="shrink-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-colors" style="touch-action: none;">
                    <GripVertical class="w-5 h-5" />
                  </div>
                  <div class="flex-1 min-w-0" @click="emit('place-click', item)">
                    <div class="flex items-center gap-2 mb-1">
                      <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Step {{ idx + 1 }}</span>
                      <span class="text-slate-200 font-light">•</span>
                      <span class="text-[9px] font-black text-indigo-400">{{ item.aiMetadata?.time || '00:00' }}</span>
                    </div>
                    <h4 class="font-bold text-slate-900 text-base truncate">{{ item.title }}</h4>
                    <p class="text-[11px] font-medium text-slate-400 truncate">{{ item.addr1 }}</p>
                    <div v-if="idx < day.items.length - 1" class="flex items-center gap-2 mt-4 text-[10px] font-black text-indigo-400/70 bg-indigo-50/50 w-fit px-2.5 py-1 rounded-lg border border-indigo-100/30">
                      <ArrowRight class="w-3.5 h-3.5" />
                      <span>{{ getTravelInfo(idx, idx + 1)?.dist }} 이동 ({{ getTravelInfo(idx, idx + 1)?.time }})</span>
                    </div>
                  </div>
                  <div v-if="isEditing" class="shrink-0 flex gap-1.5">
                    <button @click.stop="handleReplaceItem(idx)" class="w-9 h-9 bg-slate-50 text-indigo-500 rounded-full flex items-center justify-center hover:bg-indigo-100 transition-colors"><RefreshCcw class="w-4 h-4" /></button>
                    <button @click.stop="tripStore.removeItemFromPending(idx)" class="w-9 h-9 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center hover:text-rose-500 hover:bg-rose-50 transition-colors"><X class="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-6 z-50">
        <div v-if="isEditing" class="flex gap-3">
          <button @click="handleCancelEdit" class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[2rem] text-xs font-black">취소</button>
          <button @click="handleSaveEdit" class="flex-[2] py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black flex items-center justify-center gap-2 shadow-lg"><Check class="w-4 h-4" />편집 저장</button>
        </div>
        <div v-else class="flex gap-3">
          <button @click="handleStartEdit" class="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"><SlidersHorizontal class="w-5 h-5" /></button>
          <button @click="handleConfirmTrip" class="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"><Navigation class="w-4 h-4 fill-white" />코스 시작하기</button>
        </div>
      </div>
    </div>

    <!-- CASE 3: EMPTY STATE -->
    <div v-else class="h-full flex flex-col bg-white p-8 overflow-hidden">
      <div class="flex items-center gap-2 mb-2"><div class="w-1 h-1 bg-indigo-500 rounded-full"></div><span class="text-indigo-600 text-[10px] font-black uppercase tracking-widest">Archive</span></div>
      <h3 class="text-3xl font-black text-slate-900 tracking-tight leading-tight mb-10">최근 생성한<br/>여정을 선택하세요</h3>
      <div class="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
        <div v-for="(trip, idx) in tripStore.recentTrips" :key="idx" @click="tripStore.importCommunityTrip(trip)" class="bg-slate-50 border border-slate-100 p-6 rounded-[2.5rem] hover:border-indigo-200 transition-all cursor-pointer group shadow-sm">
          <div class="flex items-center justify-between mb-3"><span class="px-2 py-0.5 bg-indigo-600 text-white text-[8px] font-black rounded uppercase tracking-widest">AI Pick</span><span class="text-[10px] font-bold text-slate-400">{{ trip.totalDuration }}</span></div>
          <h5 class="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{{ trip.title }}</h5>
          <p class="text-[11px] font-medium text-slate-400 mt-1 line-clamp-2">{{ trip.summary }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
