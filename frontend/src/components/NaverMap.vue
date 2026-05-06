<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { District } from '../types/district'
import type { TripResponse } from '../types/trip'
import type { Place } from '../api/tourApi'
import { Sparkles, X, Plane } from 'lucide-vue-next'

const props = defineProps<{
  districts?: District[]
  course?: TripResponse | null
  places?: Place[]
  initialLat: number
  initialLng: number
  visits?: any[]
  bottomOffset?: number
  isHistoryMode?: boolean
  isShareMode?: boolean
  historyTrips?: any[]
}>()

const emit = defineEmits(['map-move', 'district-click', 'place-click', 'star-click', 'close-share'])

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
const circles = ref<any[]>([])
const markers = ref<any[]>([])
const placeMarkers = ref<any[]>([])
const polylines = ref<any[]>([])
const userMarker = ref<any>(null)

const formatDate = (date: any) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

const clearMap = () => {
  circles.value.forEach(c => c.setMap(null))
  markers.value.forEach(m => m.setMap(null))
  placeMarkers.value.forEach(pm => pm.setMap(null))
  polylines.value.forEach(p => p.setMap(null))
  circles.value = []
  markers.value = []
  placeMarkers.value = []
  polylines.value = []
}

const drawDistricts = () => {
  if (!map || !props.districts || typeof window.naver === 'undefined') return
  props.districts.forEach(district => {
    const center = new window.naver.maps.LatLng(district.lat, district.lng)
    const circle = new window.naver.maps.Circle({
      map: map,
      center: center,
      radius: district.radius,
      fillColor: district.color,
      fillOpacity: 0.15,
      strokeWeight: 0,
      clickable: true
    })
    window.naver.maps.Event.addListener(circle, 'click', () => emit('district-click', district))
    circles.value.push(circle)
  })
}

const drawPlaces = () => {
  if (!map || !props.places || typeof window.naver === 'undefined') return
  props.places.forEach(place => {
    const position = new window.naver.maps.LatLng(place.mapY, place.mapX)
    const marker = new window.naver.maps.Marker({
      position: position,
      map: map,
      icon: {
        content: `
          <div class="flex flex-col items-center">
            <div class="w-5 h-5 bg-indigo-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <span class="text-[10px] font-black text-slate-800 bg-white/80 px-1.5 rounded mt-0.5">${place.title}</span>
          </div>
        `,
        anchor: new window.naver.maps.Point(20, 10)
      }
    })
    window.naver.maps.Event.addListener(marker, 'click', () => emit('place-click', place))
    placeMarkers.value.push(marker)
  })
}

const drawCourse = () => {
  if (!map || !props.course || !props.course.plans || typeof window.naver === 'undefined') return
  const path: any[] = []
  props.course.plans.forEach(plan => {
    plan.items.forEach((item, index) => {
      if (item.mapY && item.mapX) {
        const position = new window.naver.maps.LatLng(item.mapY, item.mapX)
        path.push(position)
        const visit = props.visits?.find(v => v.placeId === item.contentId)
        const marker = new window.naver.maps.Marker({
          position: position,
          map: map,
          icon: {
            content: `
              <div class="relative group cursor-pointer">
                <div class="w-7 h-7 ${visit ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'} rounded-full flex items-center justify-center border-2 border-white shadow-md relative z-10">
                  <span class="text-[11px] font-black">${visit ? '⭐' : index + 1}</span>
                </div>
              </div>
            `,
            anchor: new window.naver.maps.Point(16, 16)
          },
          zIndex: 200
        })
        markers.value.push(marker)
        window.naver.maps.Event.addListener(marker, 'click', () => emit('place-click', item))
      }
    })
  })
  if (path.length > 1) {
    const polyline = new window.naver.maps.Polyline({ map: map, path: path, strokeColor: '#4F46E5', strokeOpacity: 0.8, strokeWeight: 4, strokeStyle: 'dash' })
    polylines.value.push(polyline)
  }
}

const drawShareMode = () => {
  if (!map || !props.course || !props.course.plans || typeof window.naver === 'undefined') return
  
  const path: any[] = []
  props.course.plans.forEach(plan => {
    plan.items.forEach((item) => {
      path.push(new window.naver.maps.LatLng(item.mapY, item.mapX))
    })
  })

  if (path.length > 0) {
    const bounds = new window.naver.maps.LatLngBounds(path[0], path[0])
    path.forEach(p => bounds.extend(p))
    map.fitBounds(bounds)
    // Pan slightly to give room for the bottom info
    map.panBy(new window.naver.maps.Point(0, -100))
  }
  // Icons and Lines are removed as requested to keep the map clean
}

const getEmotionIcon = (emotion: string) => {
  if (!emotion) return '✨';
  const parts = emotion.split(' ');
  return parts.length > 1 ? parts[0] : emotion;
}

const drawHistoryConstellations = () => {
  if (!map || !props.historyTrips || !props.isHistoryMode || typeof window.naver === 'undefined') return
  props.historyTrips.forEach(trip => {
    const tripPath: any[] = []
    const isFocused = props.course?.id === trip.id
    trip.plans.forEach(plan => {
      plan.items.forEach(item => {
        const position = new window.naver.maps.LatLng(item.mapY, item.mapX)
        tripPath.push(position)
        const visit = trip.visits?.find((v: any) => v.placeId === item.contentId)
        if (!visit) return
        const marker = new window.naver.maps.Marker({
          position: position,
          map: map,
          icon: {
            content: `
              <div class="relative group">
                <div class="w-6 h-6 ${isFocused ? 'bg-white text-indigo-600 scale-110' : 'bg-indigo-600/60 text-white/50'} rounded-full flex items-center justify-center border-2 border-white shadow-md relative z-10 transition-all">
                  <span class="text-[10px] font-black">⭐</span>
                </div>
              </div>
            `,
            anchor: new window.naver.maps.Point(12, 12)
          },
          zIndex: isFocused ? 1000 : 500
        })
        markers.value.push(marker)
      })
    })
    if (isFocused && tripPath.length > 1) {
      const polyline = new window.naver.maps.Polyline({ map: map, path: tripPath, strokeColor: '#FFFFFF', strokeOpacity: 0.4, strokeWeight: 2, strokeStyle: 'dash' })
      polylines.value.push(polyline)
    }
  })
}

const updateMap = () => {
  if (!map) return
  clearMap()
  if (props.isShareMode) drawShareMode()
  else if (props.isHistoryMode) drawHistoryConstellations()
  else { drawDistricts(); drawPlaces(); drawCourse(); }
}

const updateUserLocation = (lat: number, lng: number) => {
  if (!map || typeof window.naver === 'undefined') return
  const position = new window.naver.maps.LatLng(lat, lng)
  if (userMarker.value) userMarker.value.setPosition(position)
  else {
    userMarker.value = new window.naver.maps.Marker({
      position: position, map: map, icon: {
        content: `<div class="relative"><div class="absolute -inset-2 bg-blue-500/30 rounded-full"></div><div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div></div>`,
        anchor: new window.naver.maps.Point(8, 8)
      }, zIndex: 100
    })
  }
}

const setCenter = (lat: number, lng: number, zoom?: number) => {
  if (!map || typeof window.naver === 'undefined') return
  const center = new window.naver.maps.LatLng(lat, lng)
  if (zoom !== undefined) map.setZoom(zoom)
  map.setCenter(center)
  if (props.bottomOffset) map.panBy(new window.naver.maps.Point(0, props.bottomOffset / 2))
  updateUserLocation(lat, lng)
}

const panByOffset = (x: number, y: number) => { 
  if (map && typeof window.naver !== 'undefined') {
    map.panBy(new window.naver.maps.Point(x, y)) 
  }
}

defineExpose({ setCenter, updateUserLocation, panByOffset })

watch([() => props.districts, () => props.course, () => props.places, () => props.visits, () => props.isShareMode, () => props.isHistoryMode], () => updateMap(), { deep: true })

onMounted(() => {
  if (typeof window.naver === 'undefined') return
  const mapOptions = {
    center: new window.naver.maps.LatLng(props.initialLat, props.initialLng),
    zoom: 15, zoomControl: false, mapTypeControl: false, scaleControl: false, logoControl: true,
    logoControlOptions: { position: window.naver.maps.Position.RIGHT_TOP }, mapDataControl: false
  }
  if (mapContainer.value) {
    map = new window.naver.maps.Map(mapContainer.value, mapOptions)
    updateUserLocation(props.initialLat, props.initialLng)
    window.naver.maps.Event.addListener(map, 'idle', () => {
      const center = map.getCenter()
      emit('map-move', { lat: center.lat(), lng: center.lng() })
    })
    updateMap()
  }
})
</script>

<template>
  <div ref="mapContainer" class="w-full h-full bg-slate-100 relative overflow-hidden">
    <!-- Premium Share Mode Overlay (Cinema Style) -->
    <Transition name="fade">
      <div v-if="isShareMode" class="fixed inset-0 z-[999999] pointer-events-none flex flex-col justify-between p-10">
        <!-- Subtle Vignette instead of dark overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-slate-900/60 backdrop-blur-[1px] pointer-events-auto"></div>
        
        <!-- Header: Minimal Brand & Close -->
        <div class="relative z-10 flex justify-between items-start pointer-events-auto">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20">
              <Plane class="w-4 h-4 text-white" />
            </div>
            <span class="text-[9px] font-black text-white/60 uppercase tracking-[0.4em]">Memoir Captured</span>
          </div>
          <button 
            @click="emit('close-share')" 
            class="w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all active:scale-90"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- Center: Empty for Map Focus -->
        <div class="flex-1"></div>

        <!-- Footer: Trip Info & Place List -->
        <div class="relative z-10 animate-in slide-in-from-bottom-10 duration-1000 pointer-events-auto">
          <div class="max-w-xl mx-auto text-center space-y-6">
            <!-- Title & Date -->
            <div class="space-y-2">
              <h1 class="text-3xl font-black text-white tracking-tighter drop-shadow-2xl">
                {{ course?.title }}
              </h1>
              <p class="text-[10px] font-bold text-white/50 tracking-[0.3em] uppercase">
                {{ formatDate(course?.completedAt) }}
              </p>
            </div>

            <!-- Horizontal Place List (Subtle) -->
            <div class="flex flex-wrap justify-center gap-x-4 gap-y-2 opacity-80">
              <div v-for="item in course?.plans[0].items" :key="item.contentId" class="flex items-center gap-1.5">
                <div class="w-1 h-1 bg-indigo-400 rounded-full"></div>
                <span class="text-[9px] font-black text-white/70 uppercase tracking-widest">{{ item.title }}</span>
              </div>
            </div>

            <!-- Stats Bar -->
            <div class="flex justify-center gap-12 pt-6 border-t border-white/10">
              <div class="text-center">
                <span class="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Total Spots</span>
                <p class="text-lg font-black text-white">{{ course?.plans[0].items.length }}</p>
              </div>
              <div class="text-center">
                <span class="text-[8px] font-black text-white/30 uppercase tracking-widest block mb-1">Distance Log</span>
                <p class="text-lg font-black text-indigo-400">12.4 <span class="text-[9px]">KM</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

/* Custom scrollbar to keep it clean */
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
</style>
