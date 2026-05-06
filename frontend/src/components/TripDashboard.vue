<script setup lang="ts">
import { ref } from 'vue';
import { useTripStore } from '../services/tripService';
import { Send, Loader2, Wand2, Clock, ArrowRight, Navigation, SlidersHorizontal, X, Sparkles, Check } from 'lucide-vue-next';

const tripStore = useTripStore();
const isEditing = ref(false);

const emit = defineEmits(['trip-update', 'processing-start', 'reset', 'place-click', 'edit-mode-change']);

const handleSearch = () => {
  if (!tripStore.prompt.trim()) return;
  emit('processing-start');
  tripStore.startPlanning(tripStore.prompt);
};

const handleStartEdit = () => {
  isEditing.value = true;
  emit('edit-mode-change', true);
};

const handleSaveEdit = () => {
  isEditing.value = false;
  emit('edit-mode-change', false);
  // Any specific save logic if needed, but store is already updated reactively
};

const handleCancelEdit = () => {
  isEditing.value = false;
  emit('edit-mode-change', false);
  // If we wanted to rollback, we'd need a clone of the trip, but let's keep it simple for now
};

const handleConfirmTrip = () => {
  tripStore.confirmTrip();
  emit('trip-update', tripStore.currentTrip);
};
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden">
    <Transition name="fade-slide" mode="out-in">
      <!-- VIEW A: Input & Log View -->
      <div v-if="!tripStore.pendingTrip || tripStore.isProcessing" key="input" class="flex-1 flex flex-col gap-6 p-6 overflow-y-auto custom-scrollbar">
        <div class="flex flex-col gap-4">
          <div class="space-y-1 mb-2">
            <h3 class="text-xl font-black text-slate-900 tracking-tight">어디로 떠날까요?</h3>
          </div>

          <div class="relative group">
            <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Wand2 class="w-5 h-5 text-indigo-500 group-focus-within:animate-pulse" />
            </div>
            <input 
              v-model="tripStore.prompt"
              @keyup.enter="handleSearch"
              placeholder="예: 해운대 달맞이길 카페 코스"
              class="w-full bg-slate-50 border-2 border-transparent focus:border-indigo-100 focus:bg-white rounded-2xl py-5 pl-12 pr-4 text-sm font-bold shadow-sm transition-all outline-none"
              :disabled="tripStore.isProcessing"
            />
            <button 
              @click="handleSearch"
              :disabled="tripStore.isProcessing || !tripStore.prompt.trim()"
              class="absolute right-3 top-3 p-2.5 bg-slate-900 text-white rounded-xl active:scale-95 transition-all disabled:opacity-50"
            >
              <Send v-if="!tripStore.isProcessing" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
            </button>
          </div>

          <div v-if="!tripStore.isProcessing" class="flex flex-wrap gap-2">
            <button 
              v-for="preset in ['🛋️ 카페 투어', '🌙 야경 산책', '🌲 힐링 스팟']"
              :key="preset"
              @click="tripStore.prompt = preset; handleSearch()"
              class="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[11px] font-black text-slate-600 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm"
            >
              {{ preset }}
            </button>
          </div>
        </div>

        <div v-if="tripStore.isProcessing" class="animate-in fade-in zoom-in-95 duration-500">
          <div class="bg-slate-900 text-slate-300 p-5 rounded-3xl font-mono text-[11px] shadow-2xl relative overflow-hidden border border-white/5">
            <div class="flex items-center gap-2 mb-4 text-slate-500 border-b border-white/10 pb-3">
              <div class="flex gap-1">
                <div class="w-2 h-2 rounded-full bg-rose-500/50"></div>
                <div class="w-2 h-2 rounded-full bg-amber-500/50"></div>
                <div class="w-2 h-2 rounded-full bg-emerald-500/50"></div>
              </div>
              <span class="text-[9px] uppercase tracking-widest font-black ml-2 text-slate-400">Agent Logs</span>
            </div>
            <div class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              <div v-for="(log, idx) in tripStore.logs" :key="idx" class="flex gap-3 animate-in fade-in slide-in-from-left-3">
                <span class="text-indigo-500/50 font-bold w-4">{{ idx + 1 }}</span>
                <span class="font-medium tracking-tight">{{ log }}</span>
              </div>
              <div class="flex gap-3 items-center text-indigo-400 animate-pulse mt-2">
                <span class="text-indigo-500/50 font-bold w-4">></span>
                <span class="font-bold">계산 중...</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- VIEW B: Result View -->
      <div v-else-if="tripStore.pendingTrip" key="result" class="flex-1 flex flex-col overflow-hidden relative">
        <!-- Scrollable Content -->
        <div class="flex-1 overflow-y-auto p-6 custom-scrollbar pb-24">
          <div class="px-1 -mt-2 mb-6">
            <h3 class="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {{ tripStore.pendingTrip.title }}
            </h3>
            <p class="text-sm font-medium text-slate-500 mt-2 leading-relaxed">
              {{ tripStore.pendingTrip.summary }}
            </p>
            <div class="flex items-center gap-2 mt-4">
              <span class="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100">
                {{ tripStore.pendingTrip.totalDuration }} 소요 예상
              </span>
            </div>
          </div>

          <div class="space-y-8">
            <div v-for="day in tripStore.pendingTrip.plans" :key="day.day" class="space-y-5">
              <div class="flex items-center gap-3 px-1">
                <span class="text-xs font-black text-slate-400 uppercase tracking-widest">Day {{ day.day }}</span>
                <div class="h-px flex-1 bg-slate-100"></div>
              </div>
              
              <div class="space-y-6 relative ml-3 border-l-2 border-slate-100 pl-7 py-1">
                <div v-for="(item, idx) in day.items" :key="idx" class="relative group">
                  <!-- Marker Icon -->
                  <div class="absolute -left-[39px] top-0 w-6 h-6 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center text-[10px] font-black text-indigo-600 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    {{ idx + 1 }}
                  </div>
                  
                  <!-- Card -->
                  <div 
                    class="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all cursor-pointer relative"
                    @click="emit('place-click', item)"
                  >
                    <button 
                      v-if="isEditing"
                      @click.stop="tripStore.removeItemFromPending(idx)"
                      class="absolute -top-2 -right-2 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-md z-10 animate-in zoom-in"
                    >
                      <X class="w-4 h-4" />
                    </button>

                    <div class="flex justify-between items-start mb-2">
                      <h4 class="font-black text-slate-900 text-base">{{ item.title }}</h4>
                      <span v-if="item.aiMetadata?.time" class="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-lg">{{ item.aiMetadata.time }}</span>
                    </div>
                    
                    <p class="text-xs font-semibold text-slate-500 leading-snug mb-3">{{ item.addr1 }}</p>
                    
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
          <template v-if="!isEditing">
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
    </Transition>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
