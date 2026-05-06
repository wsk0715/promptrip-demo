<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { District } from '../types/district'
import type { TripResponse } from '../types/trip'
import type { Place } from '../api/tourApi'
import { Sparkles } from 'lucide-vue-next'

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

const emit = defineEmits(['map-move', 'district-click', 'place-click', 'star-click'])

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
const circles = ref<any[]>([])
const markers = ref<any[]>([])
const placeMarkers = ref<any[]>([])
const polylines = ref<any[]>([])
const userMarker = ref<any>(null)

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
              <div class="relative group cursor-pointer animate-in zoom-in duration-500">
                <div class="w-8 h-8 ${visit ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'} rounded-full flex items-center justify-center border-2 border-white shadow-lg relative z-10">
                  <span class="text-[12px] font-black">${visit ? '⭐' : index + 1}</span>
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
  if (!map || !props.course || typeof window.naver === 'undefined') return
  const path: any[] = []
  props.course.plans.forEach(plan => {
    plan.items.forEach((item) => {
      const position = new window.naver.maps.LatLng(item.mapY, item.mapX)
      path.push(position)
      const visit = props.visits?.find(v => v.placeId === item.contentId)
      const marker = new window.naver.maps.Marker({
        position: position,
        map: map,
        icon: {
          content: `
            <div class="relative flex flex-col items-center animate-in zoom-in duration-1000">
              <div class="absolute inset-0 bg-white/40 blur-2xl scale-[2.5] animate-pulse"></div>
              <div class="w-12 h-12 bg-white text-indigo-600 rounded-full flex items-center justify-center border-4 border-white shadow-[0_0_30px_rgba(255,255,255,0.8)] relative z-10 scale-110">
                <span class="text-2xl">${visit ? getEmotionIcon(visit.emotion) : '✨'}</span>
              </div>
              <div class="mt-4 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/30 relative z-10">
                <span class="text-[10px] font-black text-white tracking-widest whitespace-nowrap uppercase">${item.title}</span>
              </div>
            </div>
          `,
          anchor: new window.naver.maps.Point(24, 24)
        },
        zIndex: 2000
      })
      markers.value.push(marker)
    })
  })
  if (path.length > 1) {
    const polyline = new window.naver.maps.Polyline({ map: map, path: path, strokeColor: '#FFFFFF', strokeOpacity: 0.8, strokeWeight: 6, zIndex: 1500 })
    const glowLine = new window.naver.maps.Polyline({ map: map, path: path, strokeColor: '#818CF8', strokeOpacity: 0.3, strokeWeight: 20, zIndex: 1400 })
    polylines.value.push(polyline, glowLine)
    const bounds = new window.naver.maps.LatLngBounds(path[0], path[0])
    path.forEach(p => bounds.extend(p))
    map.fitBounds(bounds)
    map.panBy(new window.naver.maps.Point(0, -100))
  }
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
                <div class="absolute inset-0 bg-white/20 blur-lg scale-150 ${isFocused ? 'animate-pulse' : ''}"></div>
                <div class="w-8 h-8 ${isFocused ? 'bg-white text-indigo-600 scale-110' : 'bg-indigo-600/40 text-white/50'} rounded-full flex items-center justify-center border-2 border-white/50 shadow-lg relative z-10 transition-all">
                  <span class="text-[12px] font-black">⭐</span>
                </div>
              </div>
            `,
            anchor: new window.naver.maps.Point(16, 16)
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
    <Transition name="fade">
      <div v-if="isShareMode" class="absolute inset-0 z-[1000] pointer-events-none flex flex-col justify-between">
        <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        <div class="relative p-8 pt-12 text-center animate-in slide-in-from-top-10 duration-1000">
          <div class="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
            <Sparkles class="w-4 h-4 text-amber-300" />
            <span class="text-[11px] font-black text-white uppercase tracking-[0.3em]">Trip Memoir Shared</span>
          </div>
          <h1 class="text-4xl font-black text-white tracking-tight drop-shadow-2xl">{{ course?.title }}</h1>
        </div>
        <div class="relative p-10 pb-16 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent animate-in slide-in-from-bottom-10 duration-1000">
          <div class="flex justify-between items-end max-w-md mx-auto">
            <div class="space-y-1">
              <span class="text-white/50 text-[10px] font-black uppercase tracking-widest block">Completed At</span>
              <p class="text-xl font-bold text-white">{{ course?.completedAt ? new Date(course.completedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }) : '' }}</p>
            </div>
            <div class="text-right">
              <span class="text-white/50 text-[10px] font-black uppercase tracking-widest block mb-1">Total Distance</span>
              <p class="text-2xl font-black text-indigo-400">12.4 <span class="text-xs text-white/40">KM</span></p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 1s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
