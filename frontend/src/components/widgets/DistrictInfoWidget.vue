<script setup lang="ts">
import { Clock, Users, Ticket, Plus, MapPin, Star } from 'lucide-vue-next'
import type { District } from '../../types/district'
import type { Place } from '../../api/tourApi'
import { computed } from 'vue'
import { useTripStore } from '../../services/tripService'

const tripStore = useTripStore()
const props = defineProps<{
  district: District
  places: Place[]
}>()

const emit = defineEmits(['addToCourse', 'place-select'])

// Business logic moved to tripStore, keeping the original design intact
const residentPlaces = computed(() => {
  return tripStore.filterPlacesByDistrict(props.district, props.places)
})
</script>

<template>
  <div class="h-full flex flex-col overflow-hidden relative bg-white">
    <!-- 1. Scrollable Content Area -->
    <div class="flex-1 overflow-y-auto p-6 custom-scrollbar pb-32">
      <!-- Header -->
      <div class="flex flex-col gap-1.5 mb-6">
        <div class="flex items-center gap-2">
          <div 
            class="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            :style="{ backgroundColor: district.color }"
          ></div>
          <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {{ district.status }} ZONE
          </span>
        </div>
        <h3 class="text-2xl font-black text-slate-900 tracking-tight">{{ district.name }}</h3>
        <p class="text-sm font-medium text-slate-500 leading-relaxed">{{ district.description }}</p>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-3 mb-6">
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div class="p-2 bg-white rounded-xl shadow-sm text-slate-400">
            <Clock class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase">예상 체류</span>
            <span class="text-xs font-black text-slate-700">{{ district.avgTime || '1시간' }}</span>
          </div>
        </div>
        <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
          <div class="p-2 bg-white rounded-xl shadow-sm text-slate-400">
            <Users class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-bold text-slate-400 uppercase">혼잡도</span>
            <span class="text-xs font-black text-slate-700">{{ district.congestion || '보통' }}</span>
          </div>
        </div>
      </div>

      <!-- Keywords -->
      <div class="flex flex-wrap gap-1.5 mb-8">
        <span 
          v-for="tag in district.keywords" 
          :key="tag"
          class="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg shadow-sm"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Resident Places List -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
            📍 이 구역 추천 장소
            <span class="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{{ residentPlaces.length }}</span>
          </h4>
        </div>
        
        <div v-if="residentPlaces.length > 0" class="flex flex-col gap-3">
          <div 
            v-for="place in residentPlaces" 
            :key="place.contentId"
            class="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 hover:shadow-md transition-all group cursor-pointer"
            @click="emit('place-select', place)"
          >
            <div class="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
              <img v-if="place.firstImage" :src="place.firstImage" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
                <MapPin class="w-6 h-6" />
              </div>
            </div>
            
            <div class="flex-1 min-w-0">
              <h5 class="text-sm font-bold text-slate-900 truncate">{{ place.title }}</h5>
              <div class="flex items-center gap-2 mt-1">
                <div v-if="place.rating" class="flex items-center gap-1">
                  <Star class="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span class="text-[10px] font-bold text-slate-600">{{ place.rating }}</span>
                </div>
                <span class="text-[10px] font-medium text-slate-400">{{ place.addr1 }}</span>
              </div>
            </div>
            
            <button 
              @click.stop="emit('addToCourse', place)"
              class="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white rounded-xl transition-all"
            >
              <Plus class="w-4 h-4" />
            </button>
          </div>
        </div>
        <div v-else class="py-8 flex flex-col items-center justify-center gap-2 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 text-slate-400">
          <MapPin class="w-6 h-6 opacity-20" />
          <p class="text-[10px] font-bold uppercase tracking-widest">추천 장소가 없습니다</p>
        </div>
      </div>
    </div>

    <!-- 2. Fixed Floating Bottom Action Bar -->
    <div class="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-6 z-30 shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
      <div class="grid grid-cols-2 gap-3 max-w-md mx-auto">
        <button class="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-[2rem] text-xs font-black shadow-lg shadow-slate-200 active:scale-95 transition-all">
          <Ticket class="w-4 h-4" />
          혜택 보기
        </button>
        <button 
          @click="emit('addToCourse', district)"
          class="flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all"
        >
          <Plus class="w-4 h-4" />
          코스에 추가
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
