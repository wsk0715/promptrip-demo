<script setup lang="ts">
import { ref, computed } from 'vue';
import { X, Camera, Star, Heart, Cloud, Sparkles, Smile } from 'lucide-vue-next';

const props = defineProps<{
  show: boolean;
  placeName: string;
  placeId: string;
}>();

const emit = defineEmits(['close', 'submit']);

const reviewText = ref('');
const selectedEmotion = ref<string | null>(null);

const emotions = [
  { id: 'joy', label: '즐거움', color: '#FBBF24', icon: Smile },
  { id: 'peace', label: '여유', color: '#3B82F6', icon: Cloud },
  { id: 'healing', label: '힐링', color: '#10B981', icon: Heart },
  { id: 'inspiration', label: '영감', color: '#8B5CF6', icon: Sparkles },
  { id: 'excitement', label: '활기', color: '#F59E0B', icon: Star },
];

const handleSubmit = () => {
  if (!selectedEmotion.value) return;
  
  emit('submit', {
    emotion: selectedEmotion.value,
    text: reviewText.value,
    color: emotions.find(e => e.id === selectedEmotion.value)?.color,
    timestamp: new Date().toISOString()
  });
  
  // Reset
  reviewText.value = '';
  selectedEmotion.value = null;
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <!-- Header -->
        <div class="relative px-6 py-8 text-center bg-gradient-to-b from-slate-50 to-white">
          <button @click="handleClose" class="absolute top-6 right-6 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
            <X class="w-5 h-5" />
          </button>
          
          <div class="inline-flex items-center justify-center w-16 h-16 mb-4 bg-indigo-50 rounded-3xl text-indigo-600">
            <Star class="w-8 h-8 fill-indigo-600/10" />
          </div>
          
          <h3 class="text-xl font-black text-slate-900 tracking-tight leading-tight">
            {{ placeName }}에서의<br/>시간은 어떠셨나요?
          </h3>
        </div>

        <div class="px-6 pb-8 space-y-8">
          <!-- Emotion Selector -->
          <div class="space-y-4">
            <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest text-center">지금 내 감정의 별빛</h4>
            <div class="flex justify-between items-center px-2">
              <button 
                v-for="emotion in emotions" 
                :key="emotion.id"
                @click="selectedEmotion = emotion.id"
                class="group flex flex-col items-center gap-2 transition-all active:scale-90"
              >
                <div 
                  class="w-12 h-12 rounded-2xl flex items-center justify-center transition-all border-2"
                  :style="{ 
                    backgroundColor: selectedEmotion === emotion.id ? `${emotion.color}20` : '#F8FAFC',
                    borderColor: selectedEmotion === emotion.id ? emotion.color : 'transparent',
                    color: selectedEmotion === emotion.id ? emotion.color : '#94A3B8'
                  }"
                >
                  <component :is="emotion.icon" class="w-6 h-6" :class="{ 'fill-current opacity-20': selectedEmotion === emotion.id }" />
                </div>
                <span 
                  class="text-[10px] font-bold transition-colors"
                  :class="selectedEmotion === emotion.id ? 'text-slate-900' : 'text-slate-400'"
                >
                  {{ emotion.label }}
                </span>
              </button>
            </div>
          </div>

          <!-- Review Input -->
          <div class="space-y-4">
            <div class="relative">
              <textarea 
                v-model="reviewText"
                placeholder="이곳에서의 감상을 한 줄로 남겨보세요..."
                class="w-full h-24 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
              ></textarea>
            </div>

            <!-- Mock Photo Upload -->
            <div class="flex items-center gap-3 p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100 transition-all group">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors shadow-sm">
                <Camera class="w-5 h-5" />
              </div>
              <div class="flex flex-col">
                <span class="text-xs font-bold text-slate-600">오늘의 순간 기록하기</span>
                <span class="text-[10px] font-medium text-slate-400">사진 추가 (선택사항)</span>
              </div>
            </div>
          </div>

          <!-- Submit Action -->
          <button 
            @click="handleSubmit"
            :disabled="!selectedEmotion"
            class="w-full py-4 rounded-2xl text-sm font-black transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:shadow-none"
            :class="selectedEmotion ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'"
          >
            <Star class="w-4 h-4 fill-white" />
            별자리에 저장하기
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
