<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import type { District } from '../types/district'
import type { TripResponse } from '../types/trip'
import type { Place } from '../api/tourApi'

const props = defineProps<{
  districts?: District[]
  course?: TripResponse | null
  places?: Place[]
  initialLat: number
  initialLng: number
}>()

const emit = defineEmits(['map-move', 'district-click'])

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null
const circles = ref<any[]>([])
const markers = ref<any[]>([])
const placeMarkers = ref<any[]>([])
const polylines = ref<any[]>([])
const infoWindows = ref<any[]>([])
const userMarker = ref<any>(null)

const clearMap = () => {
  circles.value.forEach(c => c.setMap(null))
  markers.value.forEach(m => m.setMap(null))
  placeMarkers.value.forEach(pm => pm.setMap(null))
  polylines.value.forEach(p => p.setMap(null))
  infoWindows.value.forEach(iw => iw.close())
  circles.value = []
  markers.value = []
  placeMarkers.value = []
  polylines.value = []
  infoWindows.value = []
}

const drawDistricts = () => {
  if (!map || !props.districts) return
  props.districts.forEach(district => {
    const center = new naver.maps.LatLng(district.lat, district.lng)
    const circle = new naver.maps.Circle({
      map: map,
      center: center,
      radius: district.radius,
      fillColor: district.color,
      fillOpacity: 0.15,
      strokeWeight: 0,
      clickable: true
    })

    naver.maps.Event.addListener(circle, 'click', () => {
      emit('district-click', district)
    })

    circles.value.push(circle)
  })
}

const drawPlaces = () => {
  if (!map || !props.places) return
  props.places.forEach(place => {
    const position = new naver.maps.LatLng(place.mapY, place.mapX)
    const marker = new naver.maps.Marker({
      position: position,
      map: map,
      title: place.title,
      icon: {
        content: `
          <div class="relative group">
            <div class="absolute -inset-2 bg-white/50 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div class="relative bg-white p-1.5 rounded-full shadow-md border border-slate-200 text-indigo-600">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2.5" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
          </div>
        `,
        anchor: new naver.maps.Point(12, 12)
      }
    })

    const infoWindow = new naver.maps.InfoWindow({
      content: `
        <div class="p-3 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white min-w-[200px] max-w-[250px]">
          ${place.firstImage ? `<img src="${place.firstImage}" class="w-full h-24 object-cover rounded-xl mb-2" />` : ''}
          <h4 class="font-bold text-slate-900 leading-tight text-sm">${place.title}</h4>
          <p class="text-[10px] text-slate-500 mt-1">${place.addr1}</p>
        </div>`,
      borderWidth: 0,
      backgroundColor: 'transparent',
      disableAnchor: true,
      pixelOffset: new naver.maps.Point(0, -10)
    })

    naver.maps.Event.addListener(marker, 'click', () => {
      infoWindows.value.forEach(iw => iw.close())
      infoWindow.open(map, marker)
    })

    placeMarkers.value.push(marker)
    infoWindows.value.push(infoWindow)
  })
}

const drawCourse = () => {
  if (!map || !props.course || !props.course.plans) return
  
  const path: any[] = []
  
  props.course.plans.forEach(plan => {
    plan.items.forEach((item, index) => {
      if (item.lat && item.lng) {
        const position = new naver.maps.LatLng(item.lat, item.lng)
        path.push(position)

        const marker = new naver.maps.Marker({
          position: position,
          map: map,
          title: item.location,
          icon: {
            content: `<div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-lg text-xs">${index + 1}</div>`,
            anchor: new naver.maps.Point(16, 16)
          }
        })
        markers.value.push(marker)

        const infoWindow = new naver.maps.InfoWindow({
          content: `<div class="p-3 bg-white rounded-xl shadow-xl border-0 min-w-[150px]">
                      <h4 class="font-bold text-indigo-900 text-sm">${item.location}</h4>
                      <p class="text-[10px] text-slate-500 mt-1">${item.time} - ${item.description}</p>
                    </div>`,
          borderWidth: 0,
          backgroundColor: 'transparent',
          disableAnchor: true,
          pixelOffset: new naver.maps.Point(0, -10)
        })
        infoWindows.value.push(infoWindow)

        naver.maps.Event.addListener(marker, 'click', () => {
          infoWindows.value.forEach(iw => iw.close())
          infoWindow.open(map, marker)
        })
      }
    })
  })

  if (path.length > 1) {
    const polyline = new naver.maps.Polyline({
      map: map,
      path: path,
      strokeColor: '#4F46E5',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      strokeStyle: 'dash'
    })
    polylines.value.push(polyline)
    
    const bounds = new naver.maps.LatLngBounds(path[0], path[0])
    path.forEach(p => bounds.extend(p))
    map.panToBounds(bounds)
  }
}

const updateMap = () => {
  if (!map) return
  clearMap()
  drawDistricts()
  drawPlaces()
  drawCourse()
}

const updateUserLocation = (lat: number, lng: number) => {
  if (!map) return
  const position = new naver.maps.LatLng(lat, lng)
  
  if (userMarker.value) {
    userMarker.value.setPosition(position)
  } else {
    userMarker.value = new naver.maps.Marker({
      position: position,
      map: map,
      title: '내 위치',
      icon: {
        content: `
          <div class="relative">
            <div class="absolute -inset-2 bg-blue-500/30 rounded-full"></div>
            <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        `,
        anchor: new naver.maps.Point(8, 8)
      },
      zIndex: 100
    })
  }
}

const setCenter = (lat: number, lng: number) => {
  if (!map) return
  const center = new naver.maps.LatLng(lat, lng)
  map.setCenter(center)
  map.setZoom(15)
  updateUserLocation(lat, lng)
}

defineExpose({
  setCenter,
  updateUserLocation
})

watch([() => props.districts, () => props.course, () => props.places], () => {
  updateMap()
}, { deep: true })

onMounted(() => {
  if (typeof (window as any).naver === 'undefined') {
    console.error('Naver Maps script not loaded')
    return
  }

  const mapOptions = {
    center: new naver.maps.LatLng(props.initialLat, props.initialLng),
    zoom: 15,
    zoomControl: false, 
    mapTypeControl: false,
    scaleControl: false,
    logoControl: true,
    logoControlOptions: {
      position: naver.maps.Position.TOP_RIGHT
    },
    mapDataControl: false
  }

  if (mapContainer.value) {
    map = new naver.maps.Map(mapContainer.value, mapOptions)
    
    // Show initial user location marker
    updateUserLocation(props.initialLat, props.initialLng)

    // Add event listener for map movement
    naver.maps.Event.addListener(map, 'idle', () => {
      const center = map.getCenter()
      emit('map-move', { lat: center.lat(), lng: center.lng() })
    })

    if (props.districts || props.places || props.course) updateMap()
  }
})

declare global {
  interface Window {
    naver: any
  }
}
const naver = (window as any).naver
</script>

<template>
  <div ref="mapContainer" class="w-full h-full bg-slate-100">
    <!-- Map will be rendered here -->
    <div v-if="!naver" class="flex items-center justify-center h-full text-slate-400 font-medium text-sm">
      지도를 불러오는 중...
    </div>
  </div>
</template>

<style scoped>
/* Any additional map styling */
</style>
