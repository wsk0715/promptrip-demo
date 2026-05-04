<script setup lang="ts">
import { ref } from 'vue';
import { useTripStore } from '../../services/tripService';
import { Star, CheckCircle2, Loader2 } from 'lucide-vue-next';

const props = defineProps<{
  placeName: string;
  placeId: string;
  lat: number;
  lng: number;
}>();

const emit = defineEmits(['close', 'success']);
const tripStore = useTripStore();

const rating = ref(5);
const selectedEmotion = ref('happy');
const comment = ref('');
const isSubmitting = ref(false);

const emotions = [
  { id: 'happy', icon: '😊', label: '행복' },
  { id: 'peaceful', icon: '🧘', label: '평온' },
  { id: 'excited', icon: '🤩', label: '설렘' },
  { id: 'melancholy', icon: '🌧️', label: '차분' }
];

const handleConfirm = () => {
  isSubmitting.value = true;
  // Simulate logic delay
  setTimeout(() => {
    tripStore.recordVisit({
      placeId: props.placeId,
      rating: rating.value,
      emotion: selectedEmotion.value,
      comment: comment.value
    });
    isSubmitting.value = false;
    emit('success');
  }, 1000);
};
</script>

<template>
  <div class="fixed inset-0 z-[200000] flex items-center justify-center px-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" @click="emit('close')"></div>
    
    <!-- Modal -->
    <div class="relative w-full max-w-sm bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
      <div class="p-8">
        <!-- Header -->
        <div class="flex flex-col items-center text-center mb-8">
          <div class="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle2 class="w-8 h-8 text-indigo-600" />
          </div>
          <h2 class="text-2xl font-black text-slate-900 leading-tight">
            목적지에 도착했네요!<br/>
            <span class="text-indigo-600">"{{ placeName }}"</span>
          </h2>
          <p class="text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">방문 인증 및 기록</p>
        </div>

        <!-- Content -->
        <div class="space-y-6">
          <!-- Rating -->
          <div class="flex flex-col items-center">
            <div class="flex gap-1 mb-2">
              <button 
                v-for="i in 5" :key="i" 
                @click="rating = i"
                class="transition-all active:scale-90"
              >
                <Star 
                  class="w-8 h-8" 
                  :class="i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'" 
                />
              </button>
            </div>
            <span class="text-xs font-black text-slate-500">{{ rating }}점 - {{ rating === 5 ? '최고였어요!' : '좋았어요' }}</span>
          </div>

          <!-- Emotions -->
          <div class="grid grid-cols-4 gap-2">
            <button 
              v-for="emo in emotions" :key="emo.id"
              @click="selectedEmotion = emo.id"
              class="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all active:scale-95"
              :class="selectedEmotion === emo.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400'"
            >
              <span class="text-xl">{{ emo.icon }}</span>
              <span class="text-[10px] font-black">{{ emo.label }}</span>
            </button>
          </div>

          <!-- Comment -->
          <div class="relative">
            <textarea 
              v-model="comment"
              placeholder="이곳에서의 감상을 한 줄로 남겨보세요..."
              class="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold min-h-[80px] focus:ring-2 focus:ring-indigo-100 transition-all outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3 mt-8">
          <button 
            @click="emit('close')"
            class="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl text-xs font-black active:scale-95 transition-all"
          >
            나중에 하기
          </button>
          <button 
            @click="handleConfirm"
            :disabled="isSubmitting"
            class="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 v-if="!isSubmitting" class="w-4 h-4" />
            <Loader2 v-else class="w-4 h-4 animate-spin" />
            인증 완료
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-bounce {
  animation: bounce 2s infinite;
}
@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
</style>
