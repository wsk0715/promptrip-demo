<script setup lang="ts">
import { ref, watch } from 'vue'
import { Image as ImageIcon } from 'lucide-vue-next'
import type { Place } from '../../api/tourApi'

const props = defineProps<{
  places: Place[]
}>()

const imageErrors = ref<Record<string, boolean>>({})

const handleImageError = (id: string) => {
  imageErrors.value[id] = true
}

// Reset errors if places change significantly (optional, but good for reactivity)
watch(() => props.places, () => {
  imageErrors.value = {}
}, { deep: false })
</script>

<template>
  <div class="px-4 py-1">
    <div class="grid grid-cols-1 gap-2.5">
      <div 
        v-for="place in places" 
        :key="place.contentId" 
        class="bg-white p-2.5 rounded-2xl border border-slate-100 flex gap-3 hover:border-indigo-100 transition-all active:scale-[0.98] shadow-sm"
      >
        <div class="w-16 h-16 shrink-0 overflow-hidden rounded-xl bg-slate-50 relative">
          <img 
            v-if="place.firstImage && !imageErrors[place.contentId]"
            :src="place.firstImage" 
            @error="handleImageError(place.contentId)"
            class="w-full h-full object-cover" 
          />
          <div v-else class="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
            <ImageIcon class="w-5 h-5 text-slate-300" />
          </div>
        </div>
        <div class="flex-1 flex flex-col justify-center overflow-hidden">
          <h5 class="font-bold text-slate-900 text-[13px] leading-tight truncate">{{ place.title }}</h5>
          <p class="text-[10px] text-slate-500 mt-1 truncate font-medium">{{ place.addr1 }}</p>
          <div class="flex gap-2 mt-1.5">
            <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-md">
              {{ place.dist ? (place.dist/1000).toFixed(1) + 'km' : '가까움' }}
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="places.length === 0" class="py-10 text-center">
        <p class="text-slate-400 text-xs font-medium">주변에 장소가 없습니다.</p>
      </div>
    </div>
  </div>
</template>
