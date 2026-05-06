<script setup lang="ts">
import { ref } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Clock, ArrowRight, SlidersHorizontal, X, Check, GripVertical, RefreshCcw, Navigation } from 'lucide-vue-next';
import type { TripResponse } from '../../types/trip';
import type { Place } from '../../api/tourApi';

const tripStore = useTripStore();
const isEditing = ref(false);
const draggedIndex = ref<number | null>(null);

const emit = defineEmits(['place-click', 'edit-mode-change']);

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

const handleReplaceItem = (index: number) => {
  tripStore.replaceItemWithAlternative(index);
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
  <div v-if="tripStore.pendingTrip" class="h-full flex flex-col overflow-hidden bg-slate-50/30">
    <div class="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar pb-32">
      <!-- Header -->
      <div class="mb-10">
        <div class="flex items-center gap-2 mb-4">
          <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded border border-indigo-100 uppercase">AI Proposal</span>
          <span class="text-slate-400 text-[10px] font-bold">{{ tripStore.pendingTrip.totalDuration }} 소요 예상</span>
        </div>
        <h3 class="text-3xl font-black text-slate-900 tracking-tight leading-tight">{{ tripStore.pendingTrip.title }}</h3>
        <p class="text-sm font-medium text-slate-500 mt-3 leading-relaxed line-clamp-2">{{ tripStore.pendingTrip.summary }}</p>
      </div>

      <!-- Timeline -->
      <div v-for="day in tripStore.pendingTrip.plans" :key="day.day" class="relative">
        <div class="absolute left-6 top-4 bottom-4 w-px bg-slate-200"></div>
        <div class="space-y-8 pb-8">
          <div 
            v-for="(item, idx) in day.items" 
            :key="item.contentId" 
            class="relative pl-14" 
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
                    <span>{{ tripStore.getTravelInfoBetweenItems(tripStore.pendingTrip, idx, idx + 1)?.dist }} 이동 ({{ tripStore.getTravelInfoBetweenItems(tripStore.pendingTrip, idx, idx + 1)?.time }})</span>
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

    <!-- Action Bar -->
    <div class="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-6 z-50">
      <div v-if="isEditing" class="flex gap-3">
        <button @click="handleCancelEdit" class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[2rem] text-xs font-black">취소</button>
        <button @click="handleSaveEdit" class="flex-[2] py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black flex items-center justify-center gap-2 shadow-lg"><Check class="w-4 h-4" />편집 저장</button>
      </div>
      <div v-else class="flex gap-3">
        <button @click="handleStartEdit" class="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all"><SlidersHorizontal class="w-5 h-5" /></button>
        <button @click="tripStore.confirmTrip()" class="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"><Navigation class="w-4 h-4 fill-white" />코스 시작하기</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
</style>
