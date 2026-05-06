<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Clock, ArrowRight, Navigation, SlidersHorizontal, X, Sparkles, Check, Flag, GripVertical, RefreshCcw, Save, Share2, RotateCcw, History, ChevronRight } from 'lucide-vue-next';

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

const handleReRecommend = () => {
  tripStore.reRecommend();
};

const handleReplaceItem = (index: number) => {
  tripStore.replaceItemWithAlternative(index);
};

// Real-time Travel Distance & Time Calculation
const getTravelInfo = (fromIdx: number, toIdx: number) => {
  const plan = (tripStore.currentTrip || tripStore.pendingTrip)?.plans[0];
  if (!plan) return null;
  
  const from = plan.items[fromIdx];
  const to = plan.items[toIdx];
  if (!from || !to) return null;

  // Haversine formula for distance in meters
  const R = 6371e3; // Earth radius in meters
  const lat1 = from.mapY * Math.PI / 180;
  const lat2 = to.mapY * Math.PI / 180;
  const deltaLat = (to.mapY - from.mapY) * Math.PI / 180;
  const deltaLng = (to.mapX - from.mapX) * Math.PI / 180;

  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // in meters

  // Estimates
  if (distance < 1000) {
    const walkingTime = Math.round(distance / 80); // ~5km/h
    return `약 ${Math.round(distance)}m (도보 ${walkingTime}분)`;
  } else {
    const drivingTime = Math.round((distance / 1000) * 2.5); // ~24km/h average city speed
    return `약 ${(distance / 1000).toFixed(1)}km (차량 ${drivingTime}분)`;
  }
};

// Custom Pointer-based Reordering (Robust for Mobile/Desktop)
const handlePointerDown = (index: number, e: PointerEvent) => {
  // Prevent widget frame from catching this
  e.stopPropagation();
  
  draggedIndex.value = index;
  
  const onPointerMove = (moveEvent: PointerEvent) => {
    // Find the element currently under the pointer
    const elementUnder = document.elementFromPoint(moveEvent.clientX, moveEvent.clientY);
    const itemUnder = elementUnder?.closest('[data-drag-index]');
    
    if (itemUnder) {
      const targetIndex = parseInt(itemUnder.getAttribute('data-drag-index') || '-1');
      if (targetIndex !== -1 && targetIndex !== draggedIndex.value) {
        // Swap items in store
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
  <div class="h-full flex flex-col overflow-hidden relative bg-white">
    <!-- Active/Pending Trip View -->
    <div v-if="tripStore.currentTrip || tripStore.pendingTrip" class="h-full flex flex-col overflow-hidden relative">
      
      <!-- 1. Navigation Header (Active Mode Only) -->
      <div v-if="tripStore.currentTrip && nextPlace" class="px-6 pt-6 pb-2 shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
        <div class="bg-indigo-600 rounded-[2.5rem] p-7 shadow-2xl shadow-indigo-200 relative overflow-hidden">
          <!-- Decoration Light -->
          <div class="absolute -top-12 -right-12 w-40 h-40 bg-white/10 blur-[60px] rounded-full"></div>
          
          <div class="relative z-10 flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <span class="px-3 py-1 bg-white/20 text-white text-[10px] font-black rounded-full backdrop-blur-md border border-white/10 uppercase tracking-widest">Next Stop</span>
              <div class="flex items-center gap-1.5 text-white/80">
                <Clock class="w-3.5 h-3.5" />
                <span class="text-[10px] font-bold">{{ nextPlace.aiMetadata?.time || '일정 확인' }}</span>
              </div>
            </div>
            
            <div class="space-y-1">
              <h2 class="text-2xl font-black text-white tracking-tight leading-none truncate">
                {{ nextPlace.title }}
              </h2>
              <p class="text-white/60 text-xs font-medium truncate">{{ nextPlace.addr1 }}</p>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <div class="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div class="h-full bg-white w-1/3 animate-pulse"></div>
              </div>
              <span class="text-[10px] font-black text-white italic">
                {{ (function() {
                  const plans = (tripStore.currentTrip || tripStore.pendingTrip)?.plans[0];
                  if (!plans) return '도착 예정';
                  const nextIdx = plans.items.findIndex(item => item.contentId === nextPlace?.contentId);
                  if (nextIdx <= 0) return '이동 시작';
                  return getTravelInfo(nextIdx - 1, nextIdx);
                })() }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. Scrollable Timeline -->
      <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar pb-32">
        <!-- Preview Header (Shown only when NOT navigating) -->
        <div v-if="!tripStore.currentTrip" class="mb-8 animate-in fade-in slide-in-from-left-4">
          <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">
            {{ tripStore.pendingTrip?.title }}
          </h3>
          <p class="text-sm font-medium text-slate-400 mt-2 leading-relaxed">
            {{ tripStore.pendingTrip?.summary }}
          </p>
          <div class="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-full border border-slate-100">
            <Clock class="w-3 h-3" />
            {{ tripStore.pendingTrip?.totalDuration }} 예상
          </div>
        </div>

        <!-- Timeline Items -->
        <div class="space-y-10">
          <div v-for="day in (tripStore.currentTrip || tripStore.pendingTrip).plans" :key="day.day" class="space-y-6">
            <!-- Day Divider -->
            <div v-if="!tripStore.currentTrip" class="flex items-center gap-3">
              <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Day {{ day.day }}</span>
              <div class="h-px flex-1 bg-slate-100"></div>
            </div>
            
            <div class="relative pl-8 space-y-12">
              <!-- Continuous Timeline Line -->
              <div class="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100"></div>

              <div 
                v-for="(item, idx) in day.items" 
                :key="item.contentId" 
                class="relative group transition-all duration-300"
                :class="draggedIndex === idx ? 'opacity-30 scale-95' : ''"
                :data-drag-index="idx"
              >
                <!-- Timeline Marker -->
                <div 
                  class="absolute -left-8 top-1 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all duration-500"
                  :class="tripStore.isPlaceVisited(item.contentId) 
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                    : item.contentId === nextPlace?.contentId
                      ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100 ring-4 ring-indigo-50 scale-110'
                      : 'bg-white border-2 border-slate-200 text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-400'"
                >
                  <Check v-if="tripStore.isPlaceVisited(item.contentId)" class="w-4 h-4" />
                  <Navigation v-else-if="item.contentId === nextPlace?.contentId" class="w-3.5 h-3.5 fill-white" />
                  <span v-else class="text-[10px] font-black">{{ idx + 1 }}</span>
                </div>
                
                <!-- Content Card -->
                <div 
                  class="relative transition-all duration-300 flex items-start gap-4"
                  :class="[
                    tripStore.isPlaceVisited(item.contentId) ? 'opacity-50' : 'opacity-100',
                    item.contentId === nextPlace?.contentId ? 'scale-[1.02]' : ''
                  ]"
                  @click="emit('place-click', item)"
                >
                  <!-- Drag Handle -->
                  <div 
                    v-if="isEditing" 
                    class="shrink-0 mt-1 cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 animate-in zoom-in no-drag"
                    style="touch-action: none;"
                    @pointerdown="handlePointerDown(idx, $event)"
                  >
                    <GripVertical class="w-5 h-5" />
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start">
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-1">
                          <h4 class="font-black text-slate-900 text-base truncate">{{ item.title }}</h4>
                          <span v-if="item.contentId === nextPlace?.contentId" class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[8px] font-black rounded uppercase tracking-wider border border-indigo-100 animate-pulse">Next</span>
                        </div>
                        <p class="text-[11px] font-semibold text-slate-400 truncate">{{ item.addr1 }}</p>
                      </div>

                      <!-- Visit Action -->
                      <button 
                        v-if="tripStore.currentTrip && !isEditing"
                        @click.stop="tripStore.quickRecordVisit(item.contentId)"
                        class="shrink-0 w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-100 active:scale-90 transition-all flex items-center justify-center"
                        :class="{ 'bg-emerald-500 text-white shadow-lg shadow-emerald-100 border-none': item.contentId === nextPlace?.contentId }"
                      >
                        <Check v-if="!tripStore.isPlaceVisited(item.contentId)" class="w-5 h-5" />
                        <Check v-else class="w-5 h-5" />
                      </button>
                    </div>

                    <!-- Meta Info (Hide in Edit Mode) -->
                    <div v-if="!isEditing" class="flex items-center gap-3 mt-3">
                      <div class="flex items-center gap-1.5 text-slate-400">
                        <Clock class="w-3 h-3" />
                        <span class="text-[10px] font-bold">{{ item.aiMetadata?.avgStay || '60분' }}</span>
                      </div>
                      <!-- Real-time Travel Info -->
                      <div v-if="idx < day.items.length - 1" class="flex items-center gap-1.5 text-indigo-400/70 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/30">
                        <ArrowRight class="w-3 h-3" />
                        <span class="text-[10px] font-black">{{ getTravelInfo(idx, idx + 1) }}</span>
                      </div>
                    </div>

                    <!-- Reason Tag (Hide in Edit Mode) -->
                    <div v-if="!isEditing && !tripStore.isPlaceVisited(item.contentId) && item.aiMetadata?.reason" class="mt-4 p-3 bg-slate-50/50 rounded-2xl border border-slate-100/50 italic text-[10px] text-slate-500 leading-relaxed">
                      "{{ item.aiMetadata.reason }}"
                    </div>
                  
                    <!-- Edit Delete/Replace Buttons -->
                    <div v-if="isEditing" class="absolute -top-1 -right-1 flex gap-1.5 z-20">
                      <button 
                        @click.stop="handleReplaceItem(idx)"
                        class="w-7 h-7 bg-white border border-indigo-100 rounded-full flex items-center justify-center text-indigo-500 hover:bg-indigo-50 shadow-sm transition-colors"
                        title="다른 장소로 변경"
                      >
                        <RotateCcw class="w-3.5 h-3.5" />
                      </button>
                      <button 
                        @click.stop="tripStore.removeItemFromPending(idx)"
                        class="w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-sm transition-colors"
                        title="삭제"
                      >
                        <X class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Sticky Bottom Control Bar (Plan-aligned) -->
        <div class="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-6 z-30 shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
          <!-- Navigation Active Mode -->
          <div v-if="tripStore.currentTrip" class="flex gap-3">
            <button 
              @click="tripStore.stopNavigation()"
              class="flex-1 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black shadow-xl shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Flag class="w-4 h-4" />
              여행 종료하기
            </button>
          </div>

          <!-- Edit Mode Actions -->
          <div v-else-if="isEditing" class="flex gap-3">
            <button 
              @click="handleCancelEdit"
              class="px-8 py-4 bg-slate-50 text-slate-400 rounded-[2rem] text-xs font-black hover:bg-slate-100 transition-colors"
            >
              취소
            </button>
            <button 
              @click="handleSaveEdit"
              class="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Check class="w-4 h-4" />
              편집 완료
            </button>
          </div>

          <!-- Planning Result Actions (Minimalist) -->
          <div v-else class="flex gap-3">
            <button 
              @click="handleStartEdit"
              class="w-16 py-4 bg-slate-100 text-slate-400 rounded-[2rem] flex items-center justify-center hover:bg-slate-200 transition-colors"
              title="코스 수정"
            >
              <SlidersHorizontal class="w-4 h-4" />
            </button>
            <button 
              class="w-16 py-4 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-colors"
              title="저장하기"
            >
              <Save class="w-4 h-4" />
            </button>
            <button 
              @click="handleConfirmTrip"
              class="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Navigation class="w-4 h-4 fill-white" />
              코스 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State / Recent Trips View -->
    <div v-else class="h-full flex flex-col p-6 overflow-y-auto custom-scrollbar">
      <div class="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
        <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          🗺️ 어디로 가고 싶으신가요?
        </h3>
        <p class="text-sm font-medium text-slate-400 mt-2">
          최근에 탐색한 경로를 선택하거나 AI 탐색 탭에서 새 코스를 만들어보세요.
        </p>
      </div>

      <!-- Recent Trips List -->
      <div v-if="tripStore.recentTrips.length > 0" class="space-y-6">
        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
          <History class="w-3 h-3" />
          최근 생성된 코스
        </h4>
        <div class="grid grid-cols-1 gap-4">
          <div 
            v-for="(trip, idx) in tripStore.recentTrips" 
            :key="idx"
            class="bg-slate-50 border border-slate-100 p-5 rounded-[2.5rem] hover:border-indigo-200 transition-all active:scale-[0.98] cursor-pointer group shadow-sm"
            @click="tripStore.importCommunityTrip(trip)"
          >
            <!-- Top Section: Title/Badge and Duration -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="shrink-0 text-[9px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded-md">AI 추천</span>
                  <h5 class="font-black text-slate-900 text-sm truncate">{{ trip.title }}</h5>
                </div>
              </div>
              <div class="shrink-0 flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-slate-100 shadow-sm">
                <Clock class="w-3 h-3 text-indigo-500" />
                <span class="text-[10px] font-black text-slate-600 whitespace-nowrap">{{ trip.totalDuration }}</span>
              </div>
            </div>

            <!-- Bottom Section: Full Description -->
            <div class="flex items-start gap-4">
              <div class="flex-1 min-w-0">
                <p class="text-[11px] font-bold text-slate-500 leading-relaxed text-pretty">
                  {{ trip.summary }}
                </p>
              </div>
              <ChevronRight class="shrink-0 w-5 h-5 text-slate-300 group-hover:text-indigo-400 self-center transition-colors" />
            </div>
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
