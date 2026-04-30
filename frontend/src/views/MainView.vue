<script setup lang="ts">
import NaverMap from '../components/NaverMap.vue'
</script>

<template>
  <div class="h-[calc(100vh-80px)] w-full relative">
    <NaverMap />
    
    <!-- Overlay UI for search or info -->
    <div class="absolute top-6 left-6 z-10 w-96 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-white/20">
      <h1 class="text-2xl font-black text-slate-900 mb-4 tracking-tighter">Explore Places</h1>
      <p class="text-slate-500 text-sm mb-6">Discover amazing locations for your next trip.</p>
      
      <div class="flex flex-col gap-3">
        <button @click="$router.push('/dashboard')" class="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex justify-center items-center gap-2">
          Start AI Planner
        </button>
      </div>
    </div>
  </div>
</template>
