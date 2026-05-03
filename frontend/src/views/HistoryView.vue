<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Star, Share2, Download, Map, Sparkles, User } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null

const mockVisits = [
  { name: '광안리 해수욕장', lat: 35.153, lng: 129.118, date: '2024.04.15' },
  { name: '해운대 달맞이길', lat: 35.158, lng: 129.175, date: '2024.04.16' },
  { name: '영도 흰여울문화마을', lat: 35.080, lng: 129.045, date: '2024.04.20' },
  { name: '감천 문화마을', lat: 35.097, lng: 129.010, date: '2024.04.22' }
]

onMounted(() => {
  if (typeof (window as any).naver === 'undefined') return

  const mapOptions = {
    center: new naver.maps.LatLng(35.13, 129.09),
    zoom: 12,
    background: '#0F172A',
    styles: [
      {
        "featureType": "all",
        "elementType": "all",
        "stylers": [
          { "invert_lightness": true },
          { "saturation": -100 },
          { "lightness": -50 },
          { "visibility": "on" }
        ]
      },
      {
        "featureType": "poi",
        "stylers": [{ "visibility": "off" }]
      }
    ]
  }

  if (mapContainer.value) {
    map = new naver.maps.Map(mapContainer.value, mapOptions)
    
    const path: any[] = []
    mockVisits.forEach((visit) => {
      const position = new naver.maps.LatLng(visit.lat, visit.lng)
      path.push(position)

      new naver.maps.Marker({
        position: position,
        map: map,
        icon: {
          content: `
            <div class="relative">
              <div class="absolute inset-0 bg-amber-400 blur-md opacity-60 animate-pulse rounded-full"></div>
              <div class="relative bg-white p-1 rounded-full shadow-lg">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" class="text-amber-500 fill-amber-500">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
            </div>
          `,
          anchor: new naver.maps.Point(12, 12)
        }
      })
    })

    new naver.maps.Polyline({
      map: map,
      path: path,
      strokeColor: '#FBBF24',
      strokeOpacity: 0.4,
      strokeWeight: 1
    })
  }
})

const goHome = () => router.push('/')
</script>

<template>
  <div class="h-screen w-full bg-slate-950 relative flex flex-col overflow-hidden text-white font-sans">
    <!-- Map Container (Night Mode) -->
    <div ref="mapContainer" class="flex-1 w-full"></div>

    <!-- Top Overlay (Instead of Header) -->
    <div class="absolute top-6 left-0 right-0 z-10 px-6 flex justify-between items-center">
      <div class="bg-slate-900/80 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl">
        <h1 class="text-sm font-black tracking-widest uppercase flex items-center gap-2">
          <Star class="w-4 h-4 text-amber-400 fill-amber-400" />
          My Constellation
        </h1>
      </div>
      <button class="p-3 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-2xl text-white shadow-2xl active:scale-95">
        <Share2 class="w-5 h-5" />
      </button>
    </div>

    <!-- Footer Summary Card (Fixed relative to viewport) -->
    <div class="fixed bottom-24 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] max-w-md bg-white/10 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 text-white shadow-2xl">
      <div class="flex justify-between items-center">
        <div class="flex flex-col">
          <span class="text-slate-400 text-[9px] uppercase font-black tracking-widest">누적 방문</span>
          <p class="text-2xl font-black mt-1 leading-none">12 <span class="text-[10px] font-bold text-slate-500 ml-1 uppercase">Spots</span></p>
        </div>
        <div class="h-8 w-px bg-white/10 mx-2"></div>
        <div class="flex flex-col">
          <span class="text-slate-400 text-[9px] uppercase font-black tracking-widest">누적 거리</span>
          <p class="text-2xl font-black mt-1 leading-none">42.5 <span class="text-[10px] font-bold text-slate-500 ml-1 uppercase">km</span></p>
        </div>
        <button class="bg-amber-400 hover:bg-amber-500 text-slate-950 p-4 rounded-[1.5rem] transition-all shadow-xl shadow-amber-400/20 active:scale-95 group">
          <Download class="w-6 h-6 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>

    <!-- Bottom Navigation Menu (Fixed to bottom: 0) -->
    <div class="fixed bottom-0 left-0 z-40 w-full bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 pb-safe">
      <div class="max-w-md mx-auto p-2 flex justify-around items-center h-20">
        <button 
          @click="goHome"
          class="flex flex-col items-center gap-1.5 py-2.5 px-6 rounded-3xl transition-all text-slate-400 hover:text-white"
        >
          <Map class="w-5 h-5" />
          <span class="text-[10px] font-black uppercase tracking-tighter">탐색</span>
        </button>
        
        <button 
          @click="goHome"
          class="flex flex-col items-center gap-1.5 py-2.5 px-6 rounded-3xl text-slate-400 hover:text-white transition-all"
        >
          <Sparkles class="w-5 h-5" />
          <span class="text-[10px] font-black uppercase tracking-tighter">AI코스</span>
        </button>

        <button 
          class="flex flex-col items-center gap-1.5 py-2.5 px-6 rounded-3xl transition-all text-amber-400 bg-white/10"
        >
          <Star class="w-5 h-5" />
          <span class="text-[10px] font-black uppercase tracking-tighter">기록</span>
        </button>

        <button 
          class="flex flex-col items-center gap-1.5 py-2.5 px-6 rounded-3xl text-slate-400 hover:text-white transition-all"
        >
          <User class="w-5 h-5" />
          <span class="text-[10px] font-black uppercase tracking-tighter">My</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:deep(.naver-container) {
  background-color: #0F172A !important;
}
</style>
