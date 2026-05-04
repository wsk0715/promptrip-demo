<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import NaverMap from '../components/NaverMap.vue'
import TripDashboard from '../components/TripDashboard.vue'
import MapWidgetFrame from '../components/widgets/MapWidgetFrame.vue'
import NearbyWidget from '../components/widgets/NearbyWidget.vue'
import DistrictInfoWidget from '../components/widgets/DistrictInfoWidget.vue'
import PlaceInfoWidget from '../components/widgets/PlaceInfoWidget.vue'
import SearchOverlay from '../components/widgets/SearchOverlay.vue'
import DirectionsWidget from '../components/widgets/DirectionsWidget.vue'
import { Sparkles, Star, Search, Navigation, Map, User, Compass, MapPin, SlidersHorizontal, Plane, RotateCcw } from 'lucide-vue-next'
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
  Navigation,
  SlidersHorizontal,
  Plane,
  Search
}

/**
 * Unified Widget State
 * Default is 'nearby'
 */
const activeWidget = ref<'chat' | 'district' | 'directions' | 'nearby' | 'place' | 'filter' | 'searchHub'>('nearby')
const selectedDistrict = ref<District | null>(null)
const selectedPlace = ref<Place | null>(null)
const isLocationReady = ref(false)
const isMapMoved = ref(false)
const currentMapCenter = ref({ lat: 37.5665, lng: 126.9780 })
const isSearchFilterInitial = ref(false)
const initialCoords = ref({ lat: 37.5665, lng: 126.9780 }) // Fixed Seoul City Hall

// Refs for programmatic widget control
const chatFrameRef = ref<any>(null)


// Mapping labels to Tour API contentTypeId
const categoryMap: Record<string, string> = {
  '전체': '',
  '🛋️ 감성카페': '39', 
  '🌙 야경명소': '12', 
  '🌲 조용한숲': '12', 
}

const toggleWidget = (type: 'chat' | 'directions' | 'nearby' | 'filter' | 'searchHub' | 'district' | 'place') => {
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

const handlePlaceSelect = (place: Place) => {
  selectedPlace.value = place
  activeWidget.value = 'place'
}

const goToHistory = () => {
  activeTab.value = 'history'
  router.push('/history')
}

const handleMapMove = (center: { lat: number, lng: number }) => {
  currentMapCenter.value = center
  isMapMoved.value = true
}

const searchThisArea = () => {
  fetchNearby(currentMapCenter.value.lat, currentMapCenter.value.lng)
  isMapMoved.value = false
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
  // Switch to nearby view to show search results instead of calling AI
  activeWidget.value = 'nearby'
  console.log(`General search triggered: ${searchQuery.value}`)
  // Optional: Trigger a map focus or specific place filtering here
}

const handleProcessingStart = () => {
  // Auto-expand when AI planning starts (preset or manual)
  chatFrameRef.value?.snapTo('MAX')
}

const handlePlannerReset = () => {
  // Clear both pending and confirmed courses via store
  tripStore.resetPlanner()
  chatFrameRef.value?.snapTo('MID')
}

const handleAddToCourse = (place: Place) => {
  tripStore.addPlaceToPending(place)
  activeWidget.value = 'chat'
  chatFrameRef.value?.snapTo('MAX')
}

const handleTripUpdate = (course: TripResponse) => {
  // This is called when "Start Navigation" is clicked
  // Store already has the course in currentTrip, we just handle UI transition and history
  if (course && !recentCourses.value.find(c => c.title === course.title)) {
    recentCourses.value.unshift(course)
    if (recentCourses.value.length > 5) recentCourses.value.pop()
  }
  
  // Close AI dashboard and show the map with the confirmed course
  activeWidget.value = 'nearby'
  
  // Optional: Auto-focus the map on the new course bounds
  console.log('Navigation started with course:', course.title)
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
      <!-- ① Refined Search Header -->
      <header class="shrink-0 z-[100] bg-white border-b border-slate-100">
        <div class="max-w-md mx-auto w-full px-4 py-3 flex items-center gap-3">
          <!-- Left Icon (Plane) -->
          <button class="p-2 -ml-2 text-indigo-600 active:scale-90 transition-all">
            <Plane class="w-6 h-6 fill-indigo-50" />
          </button>

          <!-- Search Bar Trigger -->
          <div 
            class="flex-1 bg-slate-100 rounded-2xl flex items-center px-4 py-2 gap-3 hover:bg-slate-200/50 transition-all cursor-pointer group"
            @click="activeWidget = 'searchHub'; isSearchFilterInitial = false"
          >
            <Search class="w-4 h-4 text-slate-400 group-hover:text-indigo-500" />
            <span class="flex-1 text-slate-400 font-semibold text-sm">지역, 테마, 관광지 검색</span>
          </div>

          <!-- Right Search Button -->
          <button 
            @click="activeWidget = 'searchHub'; isSearchFilterInitial = false"
            class="p-2.5 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-100 active:scale-90 transition-all"
          >
            <Search class="w-5 h-5" />
          </button>
        </div>
      </header>

      <!-- Full-screen Search Overlay -->
      <SearchOverlay 
        v-model="searchQuery" 
        :show="activeWidget === 'searchHub'" 
        :initialFilter="isSearchFilterInitial"
        @close="activeWidget = 'nearby'; isSearchFilterInitial = false"
        @search="handleSearch"
      />

      <!-- ② Main Content -->
      <main class="flex-1 relative overflow-hidden bg-slate-50">
        <!-- Search this area floating button -->
        <Transition name="slide-down">
          <div v-if="isMapMoved" class="absolute top-16 left-0 right-0 z-[40] flex justify-center pointer-events-none">
            <button 
              @click="searchThisArea"
              class="pointer-events-auto flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-indigo-100 text-indigo-600 active:scale-95 transition-all"
            >
              <RotateCcw class="w-3.5 h-3.5" />
              <span class="text-[11px] font-bold">현재 위치에서 검색</span>
            </button>
          </div>
        </Transition>

        <!-- Compact Category Overlay -->
        <div class="absolute top-3 left-0 right-0 z-20 pointer-events-none">
          <div class="flex gap-1.5 overflow-x-auto no-scrollbar px-3 max-w-md mx-auto pointer-events-auto">
            <button 
              v-for="cat in ['전체', '🛋️ 감성카페', '🌙 야경명소', '🌲 조용한숲']" 
              :key="cat" 
              @click="selectCategory(cat)"
              class="shrink-0 px-3.5 py-1.5 rounded-full text-[10px] font-semibold shadow-lg transition-all whitespace-nowrap active:scale-95 border backdrop-blur-md"
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
          @place-click="handlePlaceSelect"
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
          <template #header-action>
            <button 
              @click="handlePlannerReset"
              class="p-2 text-slate-400 hover:text-indigo-600 transition-colors mr-2 active:rotate-180 duration-500"
              title="전체 초기화"
            >
              <RotateCcw class="w-5 h-5" />
            </button>
          </template>
          <TripDashboard 
            @trip-update="handleTripUpdate" 
            @processing-start="handleProcessingStart"
            @reset="handlePlannerReset"
            @place-click="handlePlaceSelect"
          />
        </MapWidgetFrame>

        <!-- 3. District Info Overlay -->
        <MapWidgetFrame 
          :show="activeWidget === 'district' && !!selectedDistrict" 
          @close="activeWidget = 'nearby'"
          :minHeight="5"
          :midHeight="20"
          :maxHeight="40"
          title="구역 상세 정보"
          :icon="icons.MapPin"
        >
          <DistrictInfoWidget 
            v-if="selectedDistrict" 
            :district="selectedDistrict" 
            :places="places"
            @place-select="handlePlaceSelect"
            @add-to-course="handleAddToCourse"
          />
        </MapWidgetFrame>

        <!-- 3.5 Place Info Overlay -->
        <MapWidgetFrame 
          :show="activeWidget === 'place' && !!selectedPlace" 
          @close="activeWidget = 'nearby'"
          :minHeight="5"
          :midHeight="25"
          :maxHeight="45"
          title="장소 상세 정보"
          :icon="icons.MapPin"
        >
          <PlaceInfoWidget v-if="selectedPlace" :place="selectedPlace" />
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
            <span class="text-[9px] font-medium uppercase tracking-tight">탐색</span>
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
            <span class="text-[9px] font-medium uppercase tracking-tight">길찾기</span>
          </button>
          
          <!-- 3. AI Course -->
          <button @click="toggleWidget('chat')" class="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all active:scale-95"
            :class="activeWidget === 'chat' ? 'bg-indigo-600/20 text-indigo-400' : 'text-slate-500'">
            <div class="relative">
              <Sparkles class="w-5 h-5" :class="{ 'animate-pulse': activeWidget === 'chat' }" />
              <div v-if="activeWidget !== 'chat'" class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
            <span class="text-[9px] font-medium uppercase tracking-tight">AI코스</span>
          </button>

          <!-- 4. History -->
          <button @click="goToHistory" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeTab === 'history' ? 'text-amber-400' : 'text-slate-500'">
            <Star class="w-5 h-5" />
            <span class="text-[9px] font-medium uppercase tracking-tight">기록</span>
          </button>

          <!-- 5. My -->
          <button class="flex-1 flex flex-col items-center gap-1 text-slate-500">
            <User class="w-5 h-5" />
            <span class="text-[9px] font-medium uppercase tracking-tight">My</span>
          </button>
        </div>
      </footer>
    </template>
  </div>
</template>

<style scoped>
.slide-down-enter-active, .slide-down-leave-active {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}
.slide-down-enter-from, .slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
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
