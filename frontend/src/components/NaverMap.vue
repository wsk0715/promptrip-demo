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
  visits?: any[]
  bottomOffset?: number
}>()

const emit = defineEmits(['map-move', 'district-click', 'place-click'])

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

const getCategoryTheme = (typeId: string) => {
  const themes: Record<string, { bg: string, text: string, dot: string }> = {
    '12': { bg: 'bg-indigo-600', text: 'text-white', dot: 'bg-white' }, // 관광지
    '39': { bg: 'bg-amber-500', text: 'text-white', dot: 'bg-white' },  // 음식점/카페
    '32': { bg: 'bg-purple-600', text: 'text-white', dot: 'bg-white' }, // 숙박
    'default': { bg: 'bg-white', text: 'text-slate-800', dot: 'bg-indigo-500' }
  }
  return themes[typeId] || themes.default
}

const drawPlaces = () => {
  if (!map || !props.places) return
  props.places.forEach(place => {
    const position = new naver.maps.LatLng(place.mapY, place.mapX)
    const theme = getCategoryTheme(place.contentTypeId)
    
    const marker = new naver.maps.Marker({
      position: position,
      map: map,
      title: place.title,
      icon: {
        content: `
          <div class="flex flex-col items-center group cursor-pointer">
            <!-- Place Dot -->
            <div class="w-5 h-5 ${theme.bg} rounded-full border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] flex items-center justify-center">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
            <!-- Place Label -->
            <div class="mt-px leading-none">
              <span class="text-[11px] font-bold text-slate-800 whitespace-nowrap tracking-tight"
                style="text-shadow: 0 0 2px #fff, 0 0 2px #fff, 0 0 2px #fff; line-height: 1;">
                ${place.title}
              </span>
            </div>
          </div>
        `,
        anchor: new naver.maps.Point(20, 10)
      }
    })

    naver.maps.Event.addListener(marker, 'click', () => {
      emit('place-click', place)
    })

    placeMarkers.value.push(marker)
  })
}

const drawCourse = () => {
  if (!map || !props.course || !props.course.plans) return
  
  const path: any[] = []
  const emotionColors: Record<string, string> = {
    happy: '#FBBF24', // Gold
    peaceful: '#10B981', // Emerald
    excited: '#F43F5E', // Rose
    melancholy: '#6366F1' // Indigo
  }
  
  props.course.plans.forEach(plan => {
    plan.items.forEach((item, index) => {
      if (item.mapY && item.mapX) {
        const position = new naver.maps.LatLng(item.mapY, item.mapX)
        path.push(position)

        // Check if this place is visited
        const visit = props.visits?.find(v => v.placeId === item.contentId)
        const isVisited = !!visit
        const starColor = visit ? (emotionColors[visit.emotion] || '#FBBF24') : '#4F46E5'

        const marker = new naver.maps.Marker({
          position: position,
          map: map,
          title: item.title,
          icon: {
            content: isVisited ? `
              <div class="relative group cursor-pointer animate-in zoom-in duration-500">
                <div class="w-10 h-10 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" class="w-8 h-8 drop-shadow-[0_0_8px_${starColor}]" fill="${starColor}">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
                  </svg>
                </div>
                </div>
              </div>
            ` : `
              <div class="relative group cursor-pointer">
                <div class="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black border-2 border-white shadow-lg text-[11px] group-hover:scale-110 transition-all">
                  ${index + 1}
                </div>
              </div>
            `,
            anchor: new naver.maps.Point(16, 16)
          },
          zIndex: 200
        })
        markers.value.push(marker)

        naver.maps.Event.addListener(marker, 'click', () => {
          emit('place-click', item)
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
    map.fitBounds(bounds)
    // Apply offset after fitting bounds to keep the course above overlays
    if (props.bottomOffset) {
      map.panBy(new naver.maps.Point(0, props.bottomOffset / 2))
    }

    // Add distance/time labels between points
    for (let i = 0; i < path.length - 1; i++) {
            // Simple distance estimation for the label
            const midLat = (path[i].lat() + path[i+1].lat()) / 2;
            const midLng = (path[i].lng() + path[i+1].lng()) / 2;
            const dist = Math.sqrt(Math.pow(path[i].lat() - path[i+1].lat(), 2) + Math.pow(path[i].lng() - path[i+1].lng(), 2)) * 111000;
            const distText = dist < 1000 ? `${Math.round(dist)}m` : `${(dist/1000).toFixed(1)}km`;
            const timeText = dist < 1000 ? `${Math.round(dist/80)}분` : `${Math.round((dist/1000)*2.5)}분`;

            const label = new naver.maps.Marker({
              position: new naver.maps.LatLng(midLat, midLng),
              map: map,
              icon: {
                content: `
                  <div class="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-100 shadow-sm flex items-center gap-1.5 origin-center">
                  <span class="text-[10px] font-black text-indigo-600">${timeText}</span>
                  <div class="w-px h-2 bg-slate-200"></div>
                  <span class="text-[10px] font-medium text-slate-500">${distText}</span>
                </div>
                `,
                anchor: new naver.maps.Point(40, 10)
              },
              zIndex: 50
            })
            markers.value.push(label)
    }
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

const setCenter = (lat: number, lng: number, zoom?: number) => {
  if (!map) return
  const center = new naver.maps.LatLng(lat, lng)
  map.panTo(center) // Smooth move
  
  if (zoom !== undefined) {
    map.setZoom(zoom)
  }

  // Apply visual offset for overlays
  if (props.bottomOffset) {
    map.panBy(new naver.maps.Point(0, props.bottomOffset / 2))
  }
  
  updateUserLocation(lat, lng)
}

const panByOffset = (x: number, y: number) => {
  if (!map) return
  map.panBy(new naver.maps.Point(x, y))
}

defineExpose({
  setCenter,
  updateUserLocation,
  panByOffset
})

watch([() => props.districts, () => props.course, () => props.places, () => props.visits], () => {
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
      position: naver.maps.Position.RIGHT_TOP,
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
