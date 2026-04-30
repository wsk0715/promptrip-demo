<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mapContainer = ref<HTMLElement | null>(null)
let map: any = null

onMounted(() => {
  if (typeof naver === 'undefined') {
    console.error('Naver Maps script not loaded')
    return
  }

  const mapOptions = {
    center: new naver.maps.LatLng(37.5665, 126.9780), // Seoul
    zoom: 14,
    zoomControl: true,
    zoomControlOptions: {
      position: naver.maps.Position.TOP_RIGHT
    }
  }

  if (mapContainer.value) {
    map = new naver.maps.Map(mapContainer.value, mapOptions)
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
    <div v-if="!naver" class="flex items-center justify-center h-full text-slate-400 font-medium">
      Loading Maps SDK...
    </div>
  </div>
</template>

<style scoped>
/* Any additional map styling */
</style>
