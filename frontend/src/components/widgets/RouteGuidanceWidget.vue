<script setup lang="ts">
import { computed } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Clock, Check, Flag, Footprints, Car } from 'lucide-vue-next';

const tripStore = useTripStore();
const emit = defineEmits(['place-click']);

const nextPlace = computed(() => {
  if (!tripStore.currentTrip) return null;
  for (const day of tripStore.currentTrip.plans) {
    for (const item of day.items) {
      if (!tripStore.isPlaceVisited(item.contentId)) return item;
    }
  }
  return null;
});
</script>

<template>
  <div v-if="tripStore.currentTrip" class="h-full flex flex-col overflow-hidden bg-slate-50/40">
    <div class="flex-1 overflow-y-auto px-5 py-8 custom-scrollbar pb-32">
      <div v-for="day in tripStore.currentTrip.plans" :key="day.day" class="relative">
        <div class="absolute left-6 top-2 bottom-2 w-px bg-slate-200"></div>
        <div class="space-y-6 pb-8">
          <div 
            v-for="(item, idx) in day.items" 
            :key="item.contentId" 
            class="relative pl-12 transition-all duration-300"
            :class="tripStore.isPlaceVisited(item.contentId) ? 'opacity-30 grayscale' : 'opacity-100'"
          >
            <!-- Marker -->
            <div 
              class="absolute left-[20px] top-4 w-2 h-2 rounded-full border-2 border-white shadow-sm z-10"
              :class="tripStore.isPlaceVisited(item.contentId) ? 'bg-slate-300' : 'bg-indigo-600'"
            ></div>

            <!-- Card -->
            <div 
              class="bg-white rounded-[1.2rem] p-4 border border-slate-100 shadow-sm relative group cursor-pointer"
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
                  :class="tripStore.isPlaceVisited(item.contentId) ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-100 text-slate-200 hover:text-indigo-500'"
                >
                  <Check class="w-4 h-4" />
                </button>
              </div>
              
              <!-- Travel Distance Divider -->
              <div v-if="idx < day.items.length - 1 && !tripStore.isPlaceVisited(item.contentId)" class="absolute -bottom-4 left-4 z-20">
                <div class="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-slate-100 rounded-lg shadow-sm">
                  <component :is="tripStore.getTravelInfoBetweenItems(tripStore.currentTrip, idx, idx + 1)?.type === 'walk' ? Footprints : Car" class="w-2.5 h-2.5 text-slate-300" />
                  <span class="text-[8px] font-black text-slate-400">{{ tripStore.getTravelInfoBetweenItems(tripStore.currentTrip, idx, idx + 1)?.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Bar -->
    <div class="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-6 py-6 z-50">
      <button @click="tripStore.stopNavigation()" class="w-full py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all">
        <Flag class="w-4 h-4" /> 여정 종료
      </button>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
