<script setup lang="ts">
import { ref } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Clock, ArrowRight, Navigation, SlidersHorizontal, X, Sparkles, Check } from 'lucide-vue-next';

const tripStore = useTripStore();
const isEditing = ref(false);

const emit = defineEmits(['trip-update', 'place-click', 'edit-mode-change']);

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
</script>

<template>
  <div v-if="tripStore.currentTrip || tripStore.pendingTrip" class="h-full flex flex-col overflow-hidden relative">
    <!-- Scrollable Content -->
    <div class="flex-1 overflow-y-auto p-5 custom-scrollbar pb-24">
      <div class="px-1 -mt-2 mb-6">
        <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          🎯 {{ (tripStore.currentTrip || tripStore.pendingTrip).title }}
        </h3>
        <p class="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
          {{ (tripStore.currentTrip || tripStore.pendingTrip).summary }}
        </p>
        <div class="flex items-center gap-2 mt-4">
          <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">
            {{ (tripStore.currentTrip || tripStore.pendingTrip).totalDuration }} 소요 예상
          </span>
          <span v-if="tripStore.currentTrip" class="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full border border-amber-100 animate-pulse">
            현재 안내 중
          </span>
        </div>
      </div>

      <div class="space-y-8">
        <div v-for="day in (tripStore.currentTrip || tripStore.pendingTrip).plans" :key="day.day" class="space-y-5">
          <div class="flex items-center gap-3 px-1">
            <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Day {{ day.day }}</span>
            <div class="h-px flex-1 bg-slate-100"></div>
          </div>
          
          <div class="space-y-6 relative ml-3 border-l-2 border-slate-100 pl-7 py-1">
            <div v-for="(item, idx) in day.items" :key="idx" class="relative group">
              <!-- Marker Icon -->
              <div 
                class="absolute -left-[39px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm transition-colors"
                :class="tripStore.isPlaceVisited(item.contentId) 
                  ? 'bg-emerald-500 text-white border-none' 
                  : 'bg-white border-2 border-indigo-600 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'"
              >
                <Check v-if="tripStore.isPlaceVisited(item.contentId)" class="w-3.5 h-3.5" />
                <span v-else>{{ idx + 1 }}</span>
              </div>
              
              <!-- Card -->
              <div 
                class="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer relative"
                :class="{ 'opacity-60 grayscale-[0.3]': tripStore.isPlaceVisited(item.contentId) }"
                @click="emit('place-click', item)"
              >
                <!-- Edit Mode Delete Button -->
                <button 
                  v-if="isEditing"
                  @click.stop="tripStore.removeItemFromPending(idx)"
                  class="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-md z-10 animate-in zoom-in"
                >
                  <X class="w-4 h-4" />
                </button>

                <!-- Card Content Header -->
                <div class="flex justify-between items-start mb-3">
                  <div class="flex-1 min-w-0 pr-2">
                    <h4 class="font-black text-slate-900 text-base flex items-center gap-2 truncate">
                      {{ item.title }}
                      <Check v-if="tripStore.isPlaceVisited(item.contentId)" class="w-4 h-4 text-emerald-500 shrink-0" />
                    </h4>
                    <p class="text-xs font-semibold text-slate-500 leading-snug mt-0.5 truncate">{{ item.addr1 }}</p>
                  </div>

                  <!-- Action Area -->
                  <div class="flex flex-col items-end gap-2 shrink-0">
                    <span v-if="item.aiMetadata?.time" class="text-[10px] font-bold text-indigo-500 bg-indigo-50/50 px-2 py-0.5 rounded-lg border border-indigo-100/50">
                      {{ item.aiMetadata.time }}
                    </span>
                    
                    <button 
                      v-if="tripStore.currentTrip && !tripStore.isPlaceVisited(item.contentId)"
                      @click.stop="tripStore.quickRecordVisit(item.contentId)"
                      class="px-3 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] font-black shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95 transition-all flex items-center gap-1.5"
                    >
                      <Navigation class="w-3 h-3 fill-white" />
                      방문
                    </button>
                  </div>
                </div>
                
                <div v-if="item.aiMetadata?.reason" class="bg-slate-50 rounded-xl p-3 border border-slate-100/50 mb-3">
                  <p class="text-[11px] font-bold text-slate-600 leading-tight">
                    <span class="text-indigo-600">✨ 추천 이유:</span> {{ item.aiMetadata.reason }}
                  </p>
                </div>

                <div class="flex items-center gap-4">
                  <div v-if="item.aiMetadata?.avgStay" class="flex items-center gap-1.5 text-slate-400">
                    <Clock class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold">{{ item.aiMetadata.avgStay }} 체류</span>
                  </div>
                  <div v-if="item.aiMetadata?.travelTimeNext" class="flex items-center gap-1.5 text-indigo-400">
                    <ArrowRight class="w-3.5 h-3.5" />
                    <span class="text-[10px] font-bold">{{ item.aiMetadata.travelTimeNext }} 이동</span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="isEditing" class="pt-2 flex justify-center -ml-7 animate-in slide-in-from-top-2">
              <button class="flex items-center gap-2 px-5 py-2.5 bg-white border border-indigo-100 rounded-2xl text-[10px] font-black text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm">
                <Sparkles class="w-3.5 h-3.5" />
                장소 추가 추천받기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Actions -->
    <div class="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-6 py-4 flex gap-3 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
      <template v-if="tripStore.currentTrip">
        <button 
          @click="tripStore.stopNavigation()"
          class="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg shadow-slate-200 transition-all flex items-center justify-center gap-2 active:scale-95"
        >
          <X class="w-4 h-4" />
          안내 종료
        </button>
      </template>
      <template v-else-if="!isEditing">
        <button 
          @click="handleStartEdit"
          class="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-xs font-black hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <SlidersHorizontal class="w-4 h-4" />
          경로 수정하기
        </button>
        <button 
          @click="handleConfirmTrip"
          class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <Navigation class="w-4 h-4 fill-white" />
          안내 시작
        </button>
      </template>
      <template v-else>
        <button 
          @click="handleCancelEdit"
          class="px-6 py-4 bg-slate-50 text-slate-400 rounded-2xl text-xs font-black hover:bg-slate-100 transition-colors active:scale-95"
        >
          취소
        </button>
        <button 
          @click="handleSaveEdit"
          class="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 active:scale-95"
        >
          <Check class="w-4 h-4" />
          수정 완료
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
