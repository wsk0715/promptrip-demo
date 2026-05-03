<script setup lang="ts">
import type { Place } from '../../api/tourApi'

const props = defineProps<{
  places: Place[]
}>()
</script>

<template>
  <div class="px-4 py-1">
    <div class="grid grid-cols-1 gap-2.5">
      <div 
        v-for="place in places" 
        :key="place.contentId" 
        class="bg-white p-2.5 rounded-2xl border border-slate-100 flex gap-3 hover:border-indigo-100 transition-all active:scale-[0.98] shadow-sm"
      >
        <img 
          :src="place.firstImage || '/placeholder.png'" 
          class="w-16 h-16 object-cover rounded-xl bg-slate-50" 
        />
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
