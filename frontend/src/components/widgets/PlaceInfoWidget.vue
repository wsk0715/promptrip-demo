<script setup lang="ts">
import { MapPin, Phone, Share2, Plus, Star, Image as ImageIcon, Sparkles } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import WidgetContainer from '../common/WidgetContainer.vue'
import BottomActionBar from '../common/BottomActionBar.vue'

const props = defineProps<{
  place: any 
}>()

const emit = defineEmits(['addToCourse'])
const imageError = ref(false)
const handleImageError = () => {
  imageError.value = true
}

watch(() => props.place, () => {
  imageError.value = false
})
</script>

<template>
  <WidgetContainer padding="p-0" space="space-y-0">
    <template #header>
      <!-- Original Image Header Layout -->
      <div class="relative h-48 w-full overflow-hidden shrink-0 bg-slate-100">
        <img 
          v-if="place.firstImage && !imageError" 
          :src="place.firstImage" 
          class="w-full h-full object-cover" 
          :alt="place.title"
          @error="handleImageError"
        />
        <div v-else class="w-full h-full bg-gradient-to-br from-indigo-500 via-indigo-600 to-slate-800 flex items-center justify-center">
          <div class="flex flex-col items-center gap-2">
            <ImageIcon class="w-10 h-10 text-white/20" />
            <span class="text-[10px] font-bold text-white/30 uppercase tracking-widest">No Image</span>
          </div>
        </div>

        <!-- Original AI Badge Placement -->
        <div v-if="place.aiMetadata" class="absolute top-4 left-6 z-10 flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-600/90 backdrop-blur-md rounded-lg shadow-xl border border-white/20 animate-in fade-in zoom-in duration-500">
          <Sparkles class="w-3.5 h-3.5 text-white" />
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Original Content Layout -->
    <div class="p-5 flex flex-col gap-5 pb-32">
      <!-- AI Reason Card (Original Style) -->
      <div v-if="place.aiMetadata" class="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50 -mt-2">
        <p class="text-xs font-bold text-slate-700 leading-relaxed">
          <span class="text-indigo-600">✨ AI 추천 포인트:</span> {{ place.aiMetadata.reason }}
        </p>
      </div>

      <!-- Location & Tel (Original Style) -->
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
    </div>

    <template #footer>
      <BottomActionBar 
        primaryText="코스에 추가"
        :primaryIcon="Plus"
        :secondaryIcon="Star"
        @primary-click="emit('addToCourse', place)"
        @secondary-click="() => console.log('Toggle Favorite')"
      />
    </template>
  </WidgetContainer>
</template>
