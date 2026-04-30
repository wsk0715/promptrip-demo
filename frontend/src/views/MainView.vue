<script setup lang="ts">
import { ref } from 'vue'
import NaverMap from '../components/NaverMap.vue'
import TripDashboard from '../components/TripDashboard.vue'
import { MessageSquare, X, Sparkles } from 'lucide-vue-next'

const isChatOpen = ref(false)

const toggleChat = () => {
  isChatOpen.value = !isChatOpen.value
}
</script>

<template>
  <div class="h-[calc(100vh-80px)] w-full relative overflow-hidden">
    <!-- Base Map -->
    <NaverMap />
    
    <!-- Floating Action Button -->
    <button 
      @click="toggleChat"
      class="fixed bottom-8 right-8 z-50 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl shadow-indigo-300 flex items-center justify-center hover:scale-110 hover:bg-indigo-700 active:scale-95 transition-all group"
    >
      <X v-if="isChatOpen" class="w-8 h-8" />
      <div v-else class="relative">
        <MessageSquare class="w-8 h-8" />
        <Sparkles class="absolute -top-2 -right-2 w-4 h-4 text-amber-300 animate-pulse" />
      </div>
    </button>

    <!-- AI Planner Overlay -->
    <Transition name="slide-fade">
      <div v-show="isChatOpen" class="fixed bottom-28 right-8 z-40 w-[450px] max-w-[calc(100vw-4rem)] max-h-[70vh] bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.15)] border border-white/20 overflow-hidden flex flex-col">
        <div class="p-6 bg-indigo-600 text-white flex justify-between items-center shrink-0">
          <div class="flex items-center gap-3">
            <Sparkles class="w-5 h-5 text-amber-300" />
            <span class="font-bold tracking-tight">AI Trip Planner</span>
          </div>
          <button @click="isChatOpen = false" class="p-1 hover:bg-white/20 rounded-lg transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>
        
        <div class="overflow-y-auto p-2 custom-scrollbar">
          <TripDashboard />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px) scale(0.95);
  opacity: 0;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>
