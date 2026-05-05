<script setup lang="ts">
import { ref, watch } from 'vue'
import { ArrowLeft, Search, X, Clock, TrendingUp, MapPin, SlidersHorizontal, RotateCcw } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string
  show: boolean
  initialFilter?: boolean
}>()

const emit = defineEmits(['update:modelValue', 'close', 'search'])

const inputRef = ref<HTMLInputElement | null>(null)
const isFilterExpanded = ref(props.initialFilter || false)

// Filter States
const selectedSort = ref('recommend')
const radius = ref(3000)
const categories = ref(['관광지', '음식점', '카페', '문화시설', '축제/공연', '레포츠', '쇼핑', '숙박'])
const selectedCategories = ref(['관광지', '음식점', '카페'])

const toggleCategory = (cat: string) => {
  if (selectedCategories.value.includes(cat)) {
    selectedCategories.value = selectedCategories.value.filter(c => c !== cat)
  } else {
    selectedCategories.value.push(cat)
  }
}

const recentSearches = ['전포 카페거리', '해운대 블루라인파크', '영도 흰여울마을']
const popularThemes = [
  { icon: '🌙', label: '심야 데이트' },
  { icon: '☕', label: '감성 카페' },
  { icon: '🌲', label: '조용한 숲길' },
  { icon: '📸', label: '인생샷 명소' },
  { icon: '🏛️', label: '역사 탐방' },
  { icon: '🛒', label: '전통 시장' }
]

const handleClose = () => {
  emit('close')
}

const handleSelect = (query: string) => {
  emit('update:modelValue', query)
  emit('search', query)
}

const handleClear = () => {
  emit('update:modelValue', '')
}

const resetFilters = () => {
  selectedSort.value = 'recommend'
  radius.value = 3000
  selectedCategories.value = ['관광지', '음식점', '카페']
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    setTimeout(() => inputRef.value?.focus(), 100)
    isFilterExpanded.value = props.initialFilter || false
  }
})
</script>

<template>
    <div v-if="show" class="fixed inset-0 z-[200] bg-white flex flex-col overflow-hidden">
      <!-- Search Header Area (Fixed) -->
      <header class="shrink-0 bg-white">
        <!-- Row 1: Search Bar (Matches MainView Layout) -->
        <div class="px-4 py-3 flex items-center gap-3 border-b border-slate-50">
          <!-- Left Icon (Back) -->
          <button @click="handleClose" class="p-2 -ml-2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all">
            <ArrowLeft class="w-6 h-6" />
          </button>
          
          <!-- Search Input Bar -->
          <div class="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 gap-3 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <Search class="w-4 h-4 text-slate-400" />
            <input 
              ref="inputRef"
              :value="modelValue"
              @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
              @keydown.enter="handleSelect(modelValue)"
              type="text" 
              placeholder="지역, 테마, 관광지 검색"
              class="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 font-semibold text-sm p-0"
            />
            <button v-if="modelValue" @click="handleClear" class="p-1 text-slate-400 hover:text-slate-600">
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Right Search Button -->
          <button 
            @click="handleSelect(modelValue)"
            class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 active:scale-90 transition-all"
          >
            <Search class="w-5 h-5" />
          </button>
        </div>

        <!-- Row 2: Filter Summary Carousel (Fixed) -->
        <div class="px-4 py-2 flex items-center gap-0 border-b border-slate-100">
          <!-- Scrollable Chips Area -->
          <div class="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar pr-3">
            <div class="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-xl border border-indigo-100 whitespace-nowrap shadow-sm">
              {{ radius < 1000 ? radius + 'm' : (radius / 1000).toFixed(1) + 'km' }}
            </div>
            <div class="px-3 py-1.5 bg-slate-50 text-slate-600 text-[10px] font-black rounded-xl border border-slate-200 whitespace-nowrap">
              {{ selectedSort === 'recommend' ? '추천순' : selectedSort === 'dist' ? '거리순' : '인기순' }}
            </div>
            <div v-for="cat in selectedCategories" :key="cat" class="px-3 py-1.5 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-xl border border-slate-100 whitespace-nowrap">
              {{ cat }}
            </div>
          </div>
          
          <!-- Fixed Filter Toggle Button -->
          <div class="shrink-0 pl-3 border-l border-slate-100">
            <button 
              @click="isFilterExpanded = !isFilterExpanded"
              :class="isFilterExpanded ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white border-slate-200 text-slate-400'"
              class="w-8 h-8 flex items-center justify-center rounded-xl active:scale-90 transition-all hover:bg-slate-50 border shadow-sm"
            >
              <SlidersHorizontal class="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Container -->
      <main class="flex-1 overflow-y-auto relative bg-slate-50/30">
        <!-- Filter Panel -->
        <div v-if="isFilterExpanded" class="p-5 flex flex-col gap-8">
          <!-- Sort Options -->
          <section class="flex flex-col gap-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">정렬 기준</h4>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="opt in [{id:'recommend', label:'추천순'}, {id:'dist', label:'거리순'}, {id:'pop', label:'인기순'}]"
                :key="opt.id"
                @click="selectedSort = opt.id"
                :class="selectedSort === opt.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500'"
                class="py-2.5 rounded-xl border text-[11px] font-bold transition-all active:scale-95"
              >
                {{ opt.label }}
              </button>
            </div>
          </section>

          <!-- Radius Slider -->
          <section class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">검색 반경</h4>
              <div class="px-2.5 py-1 bg-indigo-100 rounded-lg text-xs font-black text-indigo-700">
                {{ radius < 1000 ? radius + 'm' : (radius / 1000).toFixed(1) + 'km' }}
              </div>
            </div>
            <div class="relative px-1 py-2">
              <input 
                type="range" v-model="radius" min="500" max="5000" step="500"
                class="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div class="flex justify-between text-[10px] font-bold text-slate-300 px-1">
              <span>500m</span>
              <span>5km</span>
            </div>
          </section>

          <!-- Category Multi-select -->
          <section class="flex flex-col gap-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">카테고리 선택</h4>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="cat in categories" :key="cat"
                @click="toggleCategory(cat)"
                :class="selectedCategories.includes(cat) ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-slate-400 border-slate-100'"
                class="px-4 py-2.5 rounded-2xl border text-[11px] font-bold transition-all active:scale-95"
              >
                {{ cat }}
              </button>
            </div>
          </section>

          <div class="flex gap-3 pt-4 border-t border-slate-200/50">
            <button @click="resetFilters" class="p-4 bg-white text-slate-400 border border-slate-200 rounded-2xl active:scale-95 transition-all hover:bg-slate-50 shadow-sm">
              <RotateCcw class="w-5 h-5" />
            </button>
            <button 
              @click="isFilterExpanded = false"
              class="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-sm font-black shadow-xl shadow-slate-200 active:scale-95 transition-all hover:bg-slate-800"
            >
              필터 적용하기
            </button>
          </div>
        </div>

        <!-- Default Search Content (Recent/Trending) -->
        <div v-else class="p-5 flex flex-col gap-8">
          <!-- Recent Searches -->
          <section class="flex flex-col gap-4">
            <div class="flex justify-between items-center">
              <h4 class="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Clock class="w-4 h-4" /> 최근 검색어
              </h4>
              <button class="text-[10px] font-black text-slate-300 hover:text-indigo-600 transition-colors uppercase">Clear All</button>
            </div>
            <div class="flex flex-col">
              <div 
                v-for="search in recentSearches" :key="search"
                @click="handleSelect(search)"
                class="flex items-center justify-between py-2.5 group cursor-pointer border-b border-slate-50 last:border-0 active:bg-slate-50 rounded-2xl px-3 -mx-3 transition-all"
              >
                <div class="flex items-center gap-4">
                  <div class="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <MapPin class="w-4 h-4 text-slate-300 group-hover:text-indigo-500" />
                  </div>
                  <span class="text-sm font-bold text-slate-600 group-hover:text-indigo-600">{{ search }}</span>
                </div>
                <button @click.stop class="p-2 text-slate-200 hover:text-red-400">
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          <!-- Trending Themes -->
          <section class="flex flex-col gap-4">
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <TrendingUp class="w-3.5 h-3.5" /> 지금 인기 있는 테마
            </h4>
            <div class="flex flex-wrap gap-2">
              <button 
                v-for="theme in popularThemes" :key="theme.label"
                @click="handleSelect(theme.label)"
                class="px-3.5 py-2 bg-white hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 rounded-xl text-[11px] font-bold text-slate-600 hover:text-indigo-600 transition-all flex items-center gap-2 active:scale-95 shadow-sm"
              >
                <span class="text-sm">{{ theme.icon }}</span>
                {{ theme.label }}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
</template>

<style scoped>
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  height: 24px;
  width: 24px;
  border-radius: 50%;
  background: white;
  border: 5px solid #4f46e5;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
  cursor: pointer;
  margin-top: -8px;
}

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
