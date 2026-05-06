<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import NaverMap from '../components/NaverMap.vue'
import AiCourseGenerator from '../components/widgets/AiCourseGenerator.vue'
import RouteDetailView from '../components/widgets/RouteDetailView.vue'
import MapWidgetFrame from '../components/widgets/MapWidgetFrame.vue'
import NearbyWidget from '../components/widgets/NearbyWidget.vue'
import DistrictInfoWidget from '../components/widgets/DistrictInfoWidget.vue'
import PlaceInfoWidget from '../components/widgets/PlaceInfoWidget.vue'
import SearchOverlay from '../components/widgets/SearchOverlay.vue'
import DirectionsWidget from '../components/widgets/DirectionsWidget.vue'
import HistoryWidget from '../components/widgets/HistoryWidget.vue'
import VisitAuthModal from '../components/widgets/VisitAuthModal.vue'
import MyPageWidget from '../components/widgets/MyPageWidget.vue'
import ReviewModal from '../components/widgets/ReviewModal.vue'
import { Sparkles, Star, Search, Navigation, Map as MapIcon, User, Compass, MapPin, Plane, RotateCcw } from 'lucide-vue-next'
import { getRecommendedDistricts } from '../api/districtApi'
import { getNearbyPlaces } from '../api/tourApi'
import { useTripStore } from '../services/tripService'
import type { Place } from '../api/tourApi'
import type { District } from '../types/district'
import type { TripResponse } from '../types/trip'

import { useWidgetController } from '../composables/useWidget'

const mapRef = ref<any>(null)
const chatFrameRef = ref<any>(null) 
const routeFrameRef = ref<any>(null)
const nearbyFrameRef = ref<any>(null)
const historyFrameRef = ref<any>(null)
const myFrameRef = ref<any>(null)
const placeFrameRef = ref<any>(null)
const districtFrameRef = ref<any>(null)
const searchQuery = ref('')
const districts = ref<District[]>([])
const places = ref<Place[]>([])
const tripStore = useTripStore()
const activeTab = ref('home')
const activeCategory = ref('전체')

// Widget Controllers
const chatController = useWidgetController(chatFrameRef)
const routeController = useWidgetController(routeFrameRef)
const nearbyController = useWidgetController(nearbyFrameRef)
const historyController = useWidgetController(historyFrameRef)
const myController = useWidgetController(myFrameRef)
const placeController = useWidgetController(placeFrameRef)
const districtController = useWidgetController(districtFrameRef)

// Expose icons for template bindings
const icons = {
  Compass,
  Sparkles,
  MapPin,
  Navigation,
  Plane,
  Search,
  Star,
  User
}

/**
 * Unified Widget State
 * Default is 'nearby'
 */
const activeWidget = ref<'chat' | 'route' | 'district' | 'directions' | 'nearby' | 'place' | 'filter' | 'searchHub' | 'history' | 'my'>('nearby')
const selectedDistrict = ref<District | null>(null)
const selectedPlace = ref<Place | null>(null)
const isLocationReady = ref(false)
const isMapMoved = ref(false)
const currentMapCenter = ref({ lat: 35.1587, lng: 129.1604 })
const isSearchFilterInitial = ref(false)
const initialCoords = ref({ lat: 35.1587, lng: 129.1604 }) // Fixed Busan Haeundae
const userLocation = ref({ lat: 35.1587, lng: 129.1604 })
const showVisitAuth = ref(false)
const showReviewModal = ref(false)
const nearPlace = ref<any>(null)
const lastWidgetHeight = ref(0)

const handleWidgetHeightChange = ({ id, height }: { id: string, height: number }) => {
  // Only respond to the current active widget or nearby (if it's the primary one shown)
  if (id !== activeWidget.value) return
  
  if (!mapRef.value) return
  const delta = height - lastWidgetHeight.value
  // Pan map by half of the height change to maintain visual center
  mapRef.value.panByOffset(0, delta / 2)
  lastWidgetHeight.value = height
}

// Mapping labels to Tour API contentTypeId
const categoryMap: Record<string, string> = {
  '전체': '',
  '🛋️ 감성카페': '39', 
  '🌙 야경명소': '12', 
  '🌲 조용한숲': '12', 
}

const toggleWidget = (type: typeof activeWidget.value) => {
  if (activeWidget.value === 'directions' && type !== 'directions' && !tripStore.currentTrip) {
    tripStore.pendingTrip = null
  }

  if (activeWidget.value === type) {
    // Toggle OFF: Close current and return to nearby MIN
    if (type === 'directions' && !tripStore.currentTrip) {
      tripStore.pendingTrip = null
    }
    activeWidget.value = 'nearby'
    activeTab.value = 'home'
    nearbyController.snapTo('MIN')
  } else {
    // Toggle ON: Switch to new widget
    activeWidget.value = type
    
    // Always reset nearby to MIN when moving away from it or starting another widget
    if (type !== 'nearby') {
      nearbyController.snapTo('MIN')
    }

    if (type === 'history') {
      activeTab.value = 'history'
      setTimeout(() => historyController.snapTo('MID'), 50)
    } else if (type === 'my') {
      activeTab.value = 'my'
      setTimeout(() => myController.snapTo('MID'), 50)
    } else {
      activeTab.value = 'home'
      if (type === 'nearby') {
        nearbyController.snapTo('MIN')
      }
      if (type === 'chat') setTimeout(() => chatController.snapTo('MID'), 50)
      if (type === 'directions') setTimeout(() => routeController.snapTo('MID'), 50)
    }
  }
}

const handleExploreClick = () => {
  if (activeWidget.value !== 'nearby') {
    activeWidget.value = 'nearby'
    activeTab.value = 'home'
    // Switch to nearby but keep it at MIN as requested
    setTimeout(() => nearbyController.snapTo('MIN'), 50)
  } else {
    // Toggle height only if already in nearby
    const current = nearbyController.getCurrentLevel()
    if (current === 'MIN') {
      nearbyController.snapTo('MID')
    } else {
      nearbyController.snapTo('MIN')
    }
  }
}

const handlePlaceSelect = (place: Place) => {
  selectedPlace.value = place
  // If we are in directions mode, don't switch to place widget, just center the map
  if (activeWidget.value === 'directions') {
    mapRef.value?.setCenter(place.mapY, place.mapX)
    return
  }
  activeWidget.value = 'place'
  placeController.snapTo('MID')
}

const handleDistrictSelect = (district: District) => {
  selectedDistrict.value = district
  activeWidget.value = 'district'
  districtController.snapTo('MID')
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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
          Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const filteredPlaces = computed(() => {
  if (activeWidget.value === 'directions' || !!tripStore.currentTrip) {
    return [];
  }
  
  if (districts.value.length === 0) return places.value;

  // Group places by district (Only 1-2 per district)
  const curatedPlaces: Place[] = [];
  const districtMap = new Map<string, number>(); // districtId -> count

  // Prioritize places within districts
  const candidatePlaces = [...places.value].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  for (const place of candidatePlaces) {
    for (const district of districts.value) {
      const dist = calculateDistance(district.lat, district.lng, place.mapY, place.mapX);
      
      // If within district radius (or slightly more)
      if (dist <= district.radius * 1.2) {
        const count = districtMap.get(district.id) || 0;
        if (count < 2) { // Limit to 2 places per district
          curatedPlaces.push(place);
          districtMap.set(district.id, count + 1);
          break; // Found its home district
        }
      }
    }
  }

  // Filter by category if needed
  if (activeCategory.value === '전체') return curatedPlaces;
  const catCode = categoryMap[activeCategory.value];
  return curatedPlaces.filter(p => p.contentTypeId === catCode);
});

const goToCurrentLocation = () => {
  mapRef.value?.setCenter(initialCoords.value.lat, initialCoords.value.lng)
  fetchNearby(initialCoords.value.lat, initialCoords.value.lng)
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  activeWidget.value = 'nearby'
  console.log(`General search triggered: ${searchQuery.value}`)
}

const handleProcessingStart = () => {
  chatController.snapTo('MAX')
}

// Auto-switch to Directions Detail when planning is finished
watch(() => tripStore.isProcessing, (isProcessing) => {
  if (!isProcessing && tripStore.pendingTrip) {
    activeWidget.value = 'directions'
    
    tripStore.logs = []
    tripStore.prompt = ''
    
    routeController.snapTo('MID')
  }
})

const handleHistorySelect = (course: TripResponse) => {
  tripStore.pendingTrip = course
  routeController.snapTo('MID')
}

const handleEditModeChange = (isEditing: boolean) => {
  if (isEditing) {
    routeController.snapTo('MAX')
  } else {
    routeController.snapTo('MID')
  }
}

const handleAddToCourse = (place: Place) => {
  tripStore.addPlaceToPending(place)
  activeWidget.value = 'chat'
  chatController.snapTo('MAX')
}

const handleTripUpdate = (course: TripResponse) => {
  activeWidget.value = 'directions'
  activeTab.value = 'home'
  setTimeout(() => {
    routeController.snapTo('MID')
  }, 50)
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

// Proximity Detection Logic
const checkProximity = () => {
  if (!tripStore.currentTrip) return

  tripStore.currentTrip.plans.forEach(plan => {
    plan.items.forEach(item => {
      if (tripStore.isPlaceVisited(item.contentId)) return;

      const dist = getDistance(userLocation.value.lat, userLocation.value.lng, item.mapY, item.mapX)
      if (dist < 0.2) { 
        nearPlace.value = item
        showVisitAuth.value = true
      }
    })
  })
}

const handleVisitSuccess = (placeId: string) => {
  showVisitAuth.value = false
  const place = tripStore.currentTrip?.plans.flatMap(p => p.items).find(i => i.contentId === placeId)
  if (place) {
    tripStore.pendingVisitPlace = place
    showReviewModal.value = true
  }
}

const handleReviewSubmit = (review: any) => {
  if (tripStore.pendingVisitPlace) {
    tripStore.recordVisit({
      placeId: tripStore.pendingVisitPlace.contentId,
      emotion: review.emotion,
      comment: review.text,
      color: review.color,
      rating: 5
    })
    showReviewModal.value = false
    tripStore.pendingVisitPlace = null
  }
}

// Mock GPS Simulator
const teleportTo = (lat: number, lng: number) => {
  userLocation.value = { lat, lng }
  mapRef.value?.setCenter(lat, lng)
  checkProximity()
}

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const deg2rad = (deg: number) => deg * (Math.PI / 180)

onMounted(async () => {
  try {
    const result = await getRecommendedDistricts()
    if (result.success) {
      districts.value = result.data
    }
    isLocationReady.value = true
    fetchNearby(initialCoords.value.lat, initialCoords.value.lng)
    
    // Ensure nearby widget starts at MIN to keep map as main focus
    setTimeout(() => {
      nearbyController.snapTo('MIN')
    }, 500)
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
          <div v-if="isMapMoved && activeWidget === 'nearby'" class="absolute top-16 left-0 right-0 z-[40] flex justify-center pointer-events-none">
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
          :course="(activeWidget === 'directions' && tripStore.pendingTrip) || tripStore.currentTrip" 
          :places="filteredPlaces" 
          :visits="tripStore.currentTrip?.visits || []"
          :initialLat="initialCoords.lat"
          :initialLng="initialCoords.lng"
          :bottomOffset="lastWidgetHeight"
          @map-move="handleMapMove"
          @district-click="handleDistrictSelect"
          @place-click="handlePlaceSelect"
        />

        <!-- Side Buttons -->
        <div class="absolute right-4 bottom-[6rem] z-30 flex flex-col gap-3">
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
          id="nearby"
          ref="nearbyFrameRef"
          :show="activeWidget === 'nearby'" 
          :minHeight="5" 
          :midHeight="32" 
          :maxHeight="42"
          @height-change="handleWidgetHeightChange"
          title="주변 장소"
          :icon="icons.Compass"
        >
          <NearbyWidget 
            :places="filteredPlaces" 
            :districts="districts"
            @select-district="handleDistrictSelect"
            @select-place="handlePlaceSelect"
          />
        </MapWidgetFrame>

        <!-- 2. AI Planner Widget (Generator) -->
        <MapWidgetFrame 
          id="chat"
          ref="chatFrameRef"
          :show="activeWidget === 'chat'" 
          @close="activeWidget = 'nearby'; activeTab = 'home'; nearbyController.snapTo('MIN')"
          @height-change="handleWidgetHeightChange"
          :minHeight="5"
          :midHeight="32"
          :maxHeight="42"
          title="AI 여행 코스 추천"
          :icon="icons.Sparkles"
        >
          <AiCourseGenerator @processing-start="handleProcessingStart" />
        </MapWidgetFrame>

        <!-- 3. District Info Overlay -->
        <MapWidgetFrame 
          id="district"
          ref="districtFrameRef"
          :show="activeWidget === 'district' && !!selectedDistrict" 
          @close="activeWidget = 'nearby'; activeTab = 'home'; nearbyController.snapTo('MIN')"
          @height-change="handleWidgetHeightChange"
          :minHeight="5"
          :midHeight="32"
          :maxHeight="42"
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
          id="place"
          ref="placeFrameRef"
          :show="activeWidget === 'place' && !!selectedPlace" 
          @close="activeWidget = 'nearby'; activeTab = 'home'; nearbyController.snapTo('MIN')"
          @height-change="handleWidgetHeightChange"
          :minHeight="5"
          :midHeight="32"
          :maxHeight="42"
          title="장소 상세 정보"
          :icon="icons.MapPin"
        >
          <PlaceInfoWidget v-if="selectedPlace" :place="selectedPlace" />
        </MapWidgetFrame>

        <!-- 4. Directions Widget (List OR Detail) -->
        <MapWidgetFrame 
          id="directions"
          ref="routeFrameRef"
          :show="activeWidget === 'directions'" 
          @close="activeWidget = 'nearby'; activeTab = 'home'; tripStore.pendingTrip = null; nearbyController.snapTo('MIN')"
          @height-change="handleWidgetHeightChange"
          :minHeight="5"
          :midHeight="32"
          :maxHeight="42"
          :title="tripStore.pendingTrip ? '경로 상세 정보' : '최근 길찾기'"
          :icon="icons.Navigation"
        >
          <RouteDetailView 
            v-if="tripStore.pendingTrip || tripStore.currentTrip"
            @trip-update="handleTripUpdate"
            @edit-mode-change="handleEditModeChange"
            @place-click="handlePlaceSelect"
          />
          <DirectionsWidget 
            v-else
            :recentCourses="tripStore.recentTrips" 
            @selectCourse="handleHistorySelect" 
          />
        </MapWidgetFrame>

        <!-- 5. History & Social Widget -->
        <MapWidgetFrame 
          id="history"
          ref="historyFrameRef"
          :show="activeWidget === 'history'" 
          @close="activeWidget = 'nearby'; activeTab = 'home'; nearbyController.snapTo('MIN')"
          @height-change="handleWidgetHeightChange"
          :minHeight="5"
          :midHeight="32"
          :maxHeight="42"
          title="나의 여행 기록"
          :icon="icons.Star"
        >
          <HistoryWidget 
            @close="activeWidget = 'nearby'; activeTab = 'home'; nearbyController.snapTo('MIN')" 
            @start-journey="activeWidget = 'chat'; activeTab = 'home'"
            @view-plan="activeWidget = 'directions'; activeTab = 'home'; nearbyController.snapTo('MIN')"
          />
        </MapWidgetFrame>

        <!-- 6. My Page Widget -->
        <MapWidgetFrame 
          id="my"
          ref="myFrameRef"
          :show="activeWidget === 'my'" 
          @close="activeWidget = 'nearby'; activeTab = 'home'; nearbyController.snapTo('MIN')"
          @height-change="handleWidgetHeightChange"
          :minHeight="5"
          :midHeight="32"
          :maxHeight="42"
          title="마이페이지"
          :icon="icons.User"
        >
          <MyPageWidget />
        </MapWidgetFrame>

        <VisitAuthModal 
          v-if="showVisitAuth && nearPlace"
          :placeName="nearPlace.title"
          :placeId="nearPlace.contentId"
          :lat="nearPlace.mapY"
          :lng="nearPlace.mapX"
          @close="showVisitAuth = false"
          @success="handleVisitSuccess"
        />

        <!-- Review Modal (Star Recording) -->
        <ReviewModal 
          :show="showReviewModal"
          :placeName="tripStore.pendingVisitPlace?.title || ''"
          :placeId="tripStore.pendingVisitPlace?.contentId || ''"
          @close="showReviewModal = false"
          @submit="handleReviewSubmit"
        />
      </main>

      <!-- ③ Compact Footer -->
      <footer class="shrink-0 z-[100000] w-full bg-slate-900 border-t border-white/5 pb-safe">
        <div class="max-w-md mx-auto px-2 flex justify-between items-center h-18">
          <!-- 1. Explore -->
          <button @click="handleExploreClick" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeTab === 'home' && activeWidget === 'nearby' ? 'text-indigo-400' : 'text-slate-500'">
            <MapIcon class="w-5 h-5" />
            <span class="text-[9px] font-medium uppercase tracking-tight">탐색</span>
          </button>

          <!-- 2. Directions -->
          <button @click="toggleWidget('directions')" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeWidget === 'directions' ? 'text-indigo-400' : 'text-slate-500'">
            <div class="relative">
              <Compass class="w-5 h-5" />
              <div v-if="tripStore.recentTrips.length > 0 && activeWidget !== 'directions'" class="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full flex items-center justify-center border border-slate-900">
                <Sparkles class="w-1.5 h-1.5 text-white" />
              </div>
            </div>
            <span class="text-[9px] font-medium uppercase tracking-tight">길찾기</span>
          </button>
          
          <!-- 3. AI Course -->
          <button @click="toggleWidget('chat')" class="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl transition-all active:scale-95 bg-indigo-600/20"
            :class="activeWidget === 'chat' ? 'text-indigo-400' : 'text-slate-400'">
            <div class="relative">
              <Sparkles class="w-5 h-5" :class="{ 'animate-pulse': activeWidget === 'chat' && tripStore.isProcessing }" />
              <div v-if="activeWidget !== 'chat' && !tripStore.pendingTrip" class="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping"></div>
            </div>
            <span class="text-[9px] font-medium uppercase tracking-tight">AI코스</span>
          </button>

          <!-- 4. History -->
          <button @click="toggleWidget('history')" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeTab === 'history' ? 'text-indigo-400' : 'text-slate-500'">
            <Star class="w-5 h-5" />
            <span class="text-[9px] font-medium uppercase tracking-tight">기록</span>
          </button>

          <!-- 5. My -->
          <button @click="toggleWidget('my')" class="flex-1 flex flex-col items-center gap-1 transition-all"
            :class="activeTab === 'my' ? 'text-indigo-400' : 'text-slate-500'">
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
