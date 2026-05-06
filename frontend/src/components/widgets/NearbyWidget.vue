<script setup lang="ts">
import { ref, watch } from 'vue'
import { Image as ImageIcon, Map as MapIcon, MapPin, ChevronRight, Sparkles, Zap } from 'lucide-vue-next'
import type { Place } from '../../api/tourApi'

const props = defineProps<{
  places: Place[],
  districts: any[]
}>()

const activeTab = ref<'district' | 'place'>('district')
const emit = defineEmits(['select-district', 'select-place'])
const imageErrors = ref<Record<string, boolean>>({})

const handleImageError = (id: string) => {
  imageErrors.value[id] = true
}

watch(() => props.places, () => {
  imageErrors.value = {}
}, { deep: false })
</script>

<template>
  <div class="h-full flex flex-col bg-white">
    <!-- 1. Custom Tab Bar -->
    <div class="px-6 pt-4 pb-2">
      <div class="bg-slate-100 p-1.5 rounded-[2rem] flex relative overflow-hidden">
        <!-- Sliding Background Slider -->
        <div 
          class="absolute h-[calc(100%-12px)] top-1.5 bg-white rounded-[1.5rem] shadow-sm transition-all duration-500 ease-out z-10"
          :style="{ 
            width: 'calc(50% - 6px)',
            left: activeTab === 'district' ? '6px' : 'calc(50% + 0px)' 
          }"
        ></div>
        
        <button 
          @click="activeTab = 'district'"
          class="flex-1 py-3 text-[11px] font-black uppercase tracking-widest z-20 transition-colors duration-300 flex items-center justify-center gap-2"
          :class="activeTab === 'district' ? 'text-indigo-600' : 'text-slate-400'"
        >
          <MapIcon class="w-3.5 h-3.5" />
          구역
        </button>
        <button 
          @click="activeTab = 'place'"
          class="flex-1 py-3 text-[11px] font-black uppercase tracking-widest z-20 transition-colors duration-300 flex items-center justify-center gap-2"
          :class="activeTab === 'place' ? 'text-indigo-600' : 'text-slate-400'"
        >
          <MapPin class="w-3.5 h-3.5" />
          장소
        </button>
      </div>
    </div>

    <!-- 2. Content Area -->
    <div class="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
      <!-- Area Tab Content -->
      <div v-if="activeTab === 'district'" class="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500">
        <div 
          v-for="district in districts" 
          :key="district.id"
          @click="emit('select-district', district)"
          class="group bg-slate-50 border border-slate-100 p-5 rounded-[2.5rem] hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/20 transition-all active:scale-[0.98] cursor-pointer"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div 
                class="w-2.5 h-2.5 rounded-full"
                :style="{ backgroundColor: district.color, boxShadow: `0 0 8px ${district.color}80` }"
              ></div>
              <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">{{ district.status }} ZONE</span>
            </div>
            <span class="text-[10px] font-black text-indigo-600 italic tracking-tight">가까움</span>
          </div>
          
          <div class="flex justify-between items-start gap-4">
            <div class="flex-1 min-w-0">
              <h4 class="font-black text-slate-900 text-base mb-1 tracking-tight">{{ district.name }}</h4>
              <p class="text-[11px] font-bold text-slate-400 leading-relaxed line-clamp-2">
                {{ district.description }}
              </p>
            </div>
            <div class="shrink-0 p-3 bg-white rounded-2xl shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <ChevronRight class="w-4 h-4 text-slate-300 group-hover:text-white" />
            </div>
          </div>

          <div class="flex flex-wrap gap-1.5 mt-4">
            <span v-for="tag in district.keywords" :key="tag" class="px-2.5 py-1 bg-white border border-slate-200 text-slate-500 text-[9px] font-black rounded-lg">
              #{{ tag }}
            </span>
          </div>
        </div>
      </div>

      <!-- Place Tab Content -->
      <div v-else class="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
        <div 
          v-for="place in places" 
          :key="place.contentId" 
          @click="emit('select-place', place)"
          class="bg-white p-3 rounded-[2rem] border border-slate-100 flex gap-4 hover:border-indigo-200 transition-all active:scale-[0.98] shadow-sm group cursor-pointer"
        >
          <div class="w-16 h-16 shrink-0 overflow-hidden rounded-2xl bg-slate-50 relative">
            <img 
              v-if="place.firstImage && !imageErrors[place.contentId]"
              :src="place.firstImage" 
              @error="handleImageError(place.contentId)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div v-else class="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <ImageIcon class="w-5 h-5 text-slate-300" />
            </div>
          </div>
          
          <div class="flex-1 flex flex-col justify-center min-w-0">
            <h5 class="font-black text-slate-900 text-[13px] leading-tight truncate tracking-tight">{{ place.title }}</h5>
            <p class="text-[10px] font-bold text-slate-400 mt-1 truncate">{{ place.addr1 }}</p>
            <div class="flex items-center gap-2 mt-2">
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded-md border border-indigo-100/50">
                {{ place.dist ? (place.dist/1000).toFixed(1) + 'km' : '가까움' }}
              </span>
              <div v-if="place.aiMetadata" class="flex items-center gap-1 text-amber-500">
                <Zap class="w-3 h-3 fill-amber-500" />
                <span class="text-[9px] font-black uppercase">Trending</span>
              </div>
            </div>
          </div>
          
          <div class="self-center pr-2">
            <ChevronRight class="w-4 h-4 text-slate-200 group-hover:text-indigo-400 transition-colors" />
          </div>
        </div>

        <div v-if="places.length === 0" class="py-20 text-center flex flex-col items-center gap-4">
          <div class="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
            <MapPin class="w-6 h-6 text-slate-200" />
          </div>
          <p class="text-slate-400 text-xs font-black uppercase tracking-widest">주변 장소가 없습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
