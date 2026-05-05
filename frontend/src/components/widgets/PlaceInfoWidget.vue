<script setup lang="ts">
import { MapPin, Phone, Share2, Plus, Star, Image as ImageIcon, Sparkles } from 'lucide-vue-next'
import { ref, watch } from 'vue'

const props = defineProps<{
  place: any // Using any for flexibility or create a common type
}>()

const emit = defineEmits(['addToCourse'])
const imageError = ref(false)
const handleImageError = () => {
  imageError.value = true
}

// Reset error state when place changes
watch(() => props.place, () => {
  imageError.value = false
})
</script>

<template>
  <div class="flex flex-col gap-0">
    <!-- Image Header -->
    <div class="relative h-48 w-full overflow-hidden shrink-0 bg-slate-100">
      <img 
        v-if="place.firstImage && !imageError" 
        :src="place.firstImage" 
        class="w-full h-full object-cover" 
        :alt="place.title"
        @error="handleImageError"
      />
      <!-- Fallback UI for missing/broken image -->
      <div v-else class="w-full h-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-800 flex items-center justify-center">
        <div class="flex flex-col items-center gap-2">
          <ImageIcon class="w-10 h-10 text-white/20" />
          <span class="text-[10px] font-bold text-white/30 uppercase tracking-widest">No Image</span>
        </div>
      </div>

      <!-- AI Recommended Badge (Based on normalized metadata) -->
      <div v-if="place.aiMetadata" class="absolute top-4 left-6 z-10 flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 animate-in fade-in zoom-in duration-500">
        <div class="relative">
          <Sparkles class="w-3.5 h-3.5 text-white" />
          <div class="absolute -top-0.5 -right-0.5 w-1 h-1 bg-white rounded-full animate-ping"></div>
        </div>
        <span class="text-[9px] font-black text-white uppercase tracking-tighter">AI Recommended</span>
      </div>

      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      <div class="absolute bottom-4 left-6 right-6 flex justify-between items-end">
        <div class="flex flex-col">
          <h3 class="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
            {{ place.title }}
            <Sparkles v-if="place.aiMetadata" class="w-4 h-4 text-indigo-400 fill-indigo-400" />
          </h3>
          <div class="flex items-center gap-2 mt-1.5">
            <div v-if="place.isOpen !== undefined" 
              class="px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider"
              :class="place.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'"
            >
              {{ place.isOpen ? '영업 중' : '영업 종료' }}
            </div>
            <div v-if="place.rating" class="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/20">
              <Star class="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
              <span class="text-[10px] font-bold text-white">{{ place.rating }}</span>
              <span class="text-[9px] font-medium text-white/60">({{ place.reviewCount?.toLocaleString() }})</span>
            </div>
          </div>
        </div>
        <button class="p-2.5 bg-white/20 backdrop-blur-md rounded-xl text-white border border-white/30 active:scale-90 transition-all">
          <Share2 class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-5 flex flex-col gap-5">
      <!-- AI Reason Card (If available) -->
      <div v-if="place.aiMetadata" class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 -mt-2">
        <p class="text-xs font-bold text-slate-700 leading-relaxed">
          <span class="text-indigo-600">✨ AI 추천 포인트:</span> {{ place.aiMetadata.reason }}
        </p>
      </div>

      <!-- Location & Tel -->
      <div class="flex flex-col gap-3">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <MapPin class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase">주소</span>
            <span class="text-sm font-semibold text-slate-700 leading-tight">{{ place.addr1 }}</span>
          </div>
        </div>
        
        <div v-if="place.tel" class="flex items-start gap-3">
          <div class="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <Phone class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase">연락처</span>
            <span class="text-sm font-semibold text-slate-700 leading-tight">{{ place.tel }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Grid -->
      <div class="grid grid-cols-2 gap-3 mt-2">
        <button class="flex items-center justify-center gap-2 py-3.5 bg-slate-100 text-slate-600 rounded-2xl text-xs font-bold active:scale-95 transition-all">
          <Star class="w-4 h-4" />
          즐겨찾기
        </button>
        <button 
          @click="emit('addToCourse', place)"
          class="flex items-center justify-center gap-2 py-3.5 bg-indigo-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          <Plus class="w-4 h-4" />
          코스에 추가
        </button>
      </div>
    </div>
  </div>
</template>
