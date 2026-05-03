<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NaverMap from '../components/NaverMap.vue'
import TripDashboard from '../components/TripDashboard.vue'
import MapWidgetFrame from '../components/widgets/MapWidgetFrame.vue'
import NearbyWidget from '../components/widgets/NearbyWidget.vue'
import DistrictInfoWidget from '../components/widgets/DistrictInfoWidget.vue'
import DirectionsWidget from '../components/widgets/DirectionsWidget.vue'
import { Sparkles, Star, Search, Menu, Navigation, Map, User, Compass, MapPin } from 'lucide-vue-next'
import { getRecommendedDistricts } from '../api/districtApi'
import { getNearbyPlaces } from '../api/tourApi'
import { useTripStore } from '../services/tripService'
import type { Place } from '../api/tourApi'
import type { District } from '../types/district'
import type { TripResponse } from '../types/trip'

const router = useRouter()
const mapRef = ref<any>(null)
const searchQuery = ref('')
const districts = ref<District[]>([])
const places = ref<Place[]>([])
const tripStore = useTripStore()
const recentCourses = ref<TripResponse[]>([])
const activeTab = ref('home')
const activeCategory = ref('전체')

// Expose icons for template bindings
const icons = {
  Compass,
  Sparkles,
  MapPin,
  Navigation
}

/**
 * Unified Widget State
 * Default is 'nearby'
 */
const activeWidget = ref<'chat' | 'district' | 'directions' | 'nearby'>('nearby')
const selectedDistrict = ref<District | null>(null)
const isLocationReady = ref(false)
const initialCoords = ref({ lat: 37.5665, lng: 126.9780 }) // Fixed Seoul City Hall

// Refs for programmatic widget control
const chatFrameRef = ref<any>(null)

// Debounce timer for API calls
let moveEndTimer: ReturnType<typeof setTimeout> | null = null

// Mapping labels to Tour API contentTypeId
const categoryMap: Record<string, string> = {
  '전체': '',
  '🛋️ 감성카페': '39', 
  '🌙 야경명소': '12', 
  '🌲 조용한숲': '12', 
}

const toggleWidget = (type: 'chat' | 'directions' | 'nearby') => {
  if (activeWidget.value === type) {
    // If closing current, go back to nearby
    activeWidget.value = 'nearby'
  } else {
    activeWidget.value = type
  }
}

const handleDistrictSelect = (district: District) => {
  selectedDistrict.value = district
  activeWidget.value = 'district'
}

const goToHistory = () => {
  activeTab.value = 'history'
  router.push('/history')
}

const handleMapMove = (center: { lat: number, lng: number }) => {
  if (moveEndTimer) clearTimeout(moveEndTimer)
  moveEndTimer = setTimeout(() => {
    fetchNearby(center.lat, center.lng)
  }, 800)
}

const selectCategory = (cat: string) => {
  activeCategory.value = cat
}

const filteredPlaces = computed(() => {
  const typeId = categoryMap[activeCategory.value]
  if (!typeId) return places.value
  return places.value.filter(p => p.contentTypeId === typeId)
})

const goToCurrentLocation = () => {
  mapRef.value?.setCenter(initialCoords.value.lat, initialCoords.value.lng)
  fetchNearby(initialCoords.value.lat, initialCoords.value.lng)
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  activeWidget.value = 'chat'
  // Auto-expand when manual search starts
  setTimeout(() => chatFrameRef.value?.snapTo('MAX'), 100)
}

const handleProcessingStart = () => {
  // Auto-expand when AI planning starts (preset or manual)
  chatFrameRef.value?.snapTo('MAX')
}

const handlePlannerReset = () => {
  // Clear course and shrink back to initial chat state
  tripStore.resetPlanner()
  chatFrameRef.value?.snapTo('MID')
}

const handleTripUpdate = (course: TripResponse) => {
  tripStore.currentTrip = course
  if (!recentCourses.value.find(c => c.title === course.title)) {
    recentCourses.value.unshift(course)
    if (recentCourses.value.length > 5) recentCourses.value.pop()
  }
  activeWidget.value = 'nearby'
}

const fetchNearby = async (lat: number, lng: number) => {
  try {
    const result = await getNearbyPlaces(lat, lng, 3000)
    if (result.success) {
      places.value = result.data
    }
  } catch (error) {
    console.error('Failed to fetch nearby places:', error)
  }
}

onMounted(async () => {
  try {
    const result = await getRecommendedDistricts()
    if (result.success) {
      districts.value = result.data
    }
    isLocationReady.value = true
    fetchNearby(initialCoords.value.lat, initialCoords.value.lng)
  } catch (error) {
    console.error(error)
    isLocationReady.value = true
  }
})
</script>

<template>
  <div class="h-screen flex flex-col bg-white text-slate-900 font-sans overflow-hidden">
    <template v-if="isLocationReady">
      <!-- ① Compact Header -->
      <header class="shrink-0 z-[100] bg-white border-b border-slate-100 px-3 py-2.5 shadow-sm">
        <div class="max-w-md mx-auto w-full">
          <div class="bg-slate-50 rounded-2xl border border-slate-200 flex items-center p-0.5 group focus-within:ring-4 focus-within:ring-indigo-50 transition-all">
            <button class="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
              <Menu class="w-5 h-5" />
            </button>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="어디로 떠나고 싶으신가요?"
              class="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 placeholder:text-slate-400 font-bold px-1 text-[13px]"
              @keydown.enter="handleSearch"
            />
            <button @click="handleSearch" class="p-2 bg-indigo-600 text-white rounded-xl shadow-md active:scale-95 transition-all">
              <Search class="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <!-- ② Main Content -->
      <main class="flex-1 relative overflow-hidden bg-slate-50">
        <!-- Compact Category Overlay -->
        <div class="absolute top-3 left-0 right-0 z-20 pointer-events-none">
          <div class="flex gap-1.5 overflow-x-auto no-scrollbar px-3 max-w-md mx-auto pointer-events-auto">
            <button 
              v-for="cat in ['전체', '🛋️ 감성카페', '🌙 야경명소', '🌲 조용한숲']" 
              :key="cat" 
              @click="selectCategory(cat)"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-[10px] font-black shadow-lg transition-all whitespace-nowrap active:scale-95 border backdrop-blur-md"
              :class="activeCategory === cat 
                ? 'bg-indigo-600 text-white border-transparent' 
                : 'bg-white/90 border-white/50 text-slate-700'"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <NaverMap 
          ref="mapRef" 
          :districts="districts" 
          :course="tripStore.currentTrip" 
          :places="filteredPlaces" 
          :initialLat="initialCoords.lat"
          :initialLng="initialCoords.lng"
          @map-move="handleMapMove"
          @district-click="handleDistrictSelect"
        />

        <!-- Side Buttons (Precisely positioned in rem) -->
        <div class="absolute right-4 bottom-[6.5rem] z-30 flex flex-col gap-3">
          <button 
            @click="goToCurrentLocation"
            class="w-12 h-12 bg-white text-indigo-600 rounded-2xl shadow-lg flex items-center justify-center active:scale-90 transition-all border border-slate-100"
          >
            <Navigation class="w-6 h-6 fill-indigo-50" />
          </button>
        </div>

        <!-- Systematic Map Widgets (Contained in Main) -->
        
        <!-- 1. Nearby Widget (Default/Background) -->
        <MapWidgetFrame 
          :show="activeWidget === 'nearby'" 
          :minHeight="2.5" 
          :midHeight="5" 
          :maxHeight="22"
          :persistent="true"
          title="주변 장소"
          :icon="icons.Compass"
        >
          <NearbyWidget :places="filteredPlaces" />
        </MapWidgetFrame>

        <!-- 2. AI Chat Overlay -->
        <MapWidgetFrame 
          ref="chatFrameRef"
          :show="activeWidget === 'chat'" 
          @close="activeWidget = 'nearby'"
          :minHeight="5"
          :midHeight="22"
          :maxHeight="42"
          title="AI 코스"
          :icon="icons.Sparkles"
        >
          <TripDashboard 
            @trip-update="handleTripUpdate" 
            @processing-start="handleProcessingStart"
            @reset="handlePlannerReset"
          />
        </MapWidgetFrame>

        <!-- 3. District Info Overlay -->
        <MapWidgetFrame 
          :show="activeWidget === 'district' && !!selectedDistrict" 
          @close="activeWidget = 'nearby'"
          :minHeight="10"
          :midHeight="20"
          :maxHeight="40"
          title="구역 상세 정보"
          :icon="icons.MapPin"
        >
          <DistrictInfoWidget v-if="selectedDistrict" :district="selectedDistrict" />
        </MapWidgetFrame>

        <!-- 4. Directions/Recent History Overlay -->
        <MapWidgetFrame 
          :show="activeWidget === 'directions'" 
          @close="activeWidget = 'nearby'"
          :minHeight="5"
          :midHeight="22"
          :maxHeight="40"
          title="최근 길찾기"
          :icon="icons.Navigation"
        >
          <DirectionsWidget :recentCourses="recentCourses" @selectCourse="tripStore.currentTrip = $event; activeWidget = 'nearby'" />
        </MapWidgetFrame>
      </main>

      <!-- ③ Compact Footer -->
      <footer class="shrink-0 z-[100000] w-full bg-slate-900 border-t border-white/5 pb-safe">
        <div class="max-w-md mx-auto px-2 flex justify-between items-center h-18">
          <!-- 1. Explore -->
          <button @click="activeTab = 'home'; activeWidget = 'nearby'" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeTab === 'home' && activeWidget === 'nearby' ? 'text-indigo-400' : 'text-slate-500'">
            <Map class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-tight">탐색</span>
          </button>

          <!-- 2. Directions -->
          <button @click="toggleWidget('directions')" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeWidget === 'directions' ? 'text-indigo-400' : 'text-slate-500'">
            <div class="relative">
              <Compass class="w-5 h-5" />
              <div v-if="recentCourses.length > 0 && activeWidget !== 'directions'" class="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full flex items-center justify-center border border-slate-900">
                <Sparkles class="w-1.5 h-1.5 text-white" />
              </div>
            </div>
            <span class="text-[9px] font-black uppercase tracking-tight">길찾기</span>
          </button>
          
          <!-- 3. AI Course -->
          <button @click="toggleWidget('chat')" class="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
            :class="activeWidget === 'chat' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500'">
            <div class="relative">
              <Sparkles class="w-5 h-5" :class="{ 'animate-pulse': activeWidget === 'chat' }" />
              <div v-if="activeWidget !== 'chat'" class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
            <span class="text-[9px] font-black uppercase tracking-tight">AI코스</span>
          </button>

          <!-- 4. History -->
          <button @click="goToHistory" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeTab === 'history' ? 'text-amber-400' : 'text-slate-500'">
            <Star class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-tight">기록</span>
          </button>

          <!-- 5. My -->
          <button class="flex-1 flex flex-col items-center gap-1 text-slate-500">
            <User class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-tight">My</span>
          </button>
        </div>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
