<script setup lang="ts">
import { Clock, Users, Ticket, Plus, MapPin, Star, Info } from 'lucide-vue-next'
import type { District } from '../../types/district'
import type { Place } from '../../api/tourApi'
import { computed } from 'vue'
import { useTripStore } from '../../services/tripService'
import WidgetContainer from '../common/WidgetContainer.vue'
import BottomActionBar from '../common/BottomActionBar.vue'

const tripStore = useTripStore()
const props = defineProps<{
  district: District
  places: Place[]
}>()

const emit = defineEmits(['addToCourse', 'place-select'])

const residentPlaces = computed(() => {
  const filtered = tripStore.filterPlacesByDistrict(props.district, props.places);
  // Randomly shuffle to provide variety
  return [...filtered].sort(() => 0.5 - Math.random()).slice(0, 8);
});
</script>

<template>
  <WidgetContainer padding="p-0" space="space-y-0">
    <template #header>
      <!-- Original Header: Background Image + Title Overlay -->
      <div class="relative h-64 shrink-0 overflow-hidden">
        <img :src="district.image" class="w-full h-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6">
          <div class="flex items-center gap-2 mb-2">
            <div 
              class="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
              :style="{ backgroundColor: district.color }"
            ></div>
            <span class="text-[10px] font-black uppercase tracking-widest text-white/70">
              {{ district.status }} ZONE
            </span>
          </div>
          <h2 class="text-3xl font-black text-white tracking-tight">{{ district.name }}</h2>
        </div>
      </div>
    </template>

    <div class="p-6 space-y-8">
      <!-- Original Description Style -->
      <section>
        <p class="text-sm font-medium text-slate-500 leading-relaxed">{{ district.description }}</p>
      </section>

      <!-- Original Stats Grid Style (bg-slate-50 cards) -->
      <div class="grid grid-cols-2 gap-3">
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
      <div class="flex flex-wrap gap-1.5">
        <span 
          v-for="tag in district.keywords" 
          :key="tag"
          class="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-lg shadow-sm"
        >
          #{{ tag }}
        </span>
      </div>

      <!-- Recommended Places List -->
      <div class="flex flex-col gap-4 pb-32">
        <h4 class="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          📍 이 구역 추천 장소
          <span class="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{{ residentPlaces.length }}</span>
        </h4>
        
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
      </div>
    </div>

    <template #footer>
      <BottomActionBar 
        primaryText="코스에 추가"
        :primaryIcon="Plus"
        :secondaryIcon="Ticket"
        @primary-click="emit('addToCourse', district)"
        @secondary-click="() => console.log('View Benefits')"
      />
    </template>
  </WidgetContainer>
</template>
