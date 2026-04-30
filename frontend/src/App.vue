<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-slate-50 selection:bg-indigo-100">
    <!-- Navbar -->
    <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
      <div class="max-w-7xl mx-auto flex justify-between items-center">
        <RouterLink to="/" class="flex items-center gap-2">
          <div class="bg-indigo-600 p-2 rounded-xl">
             <Plane class="text-white w-6 h-6" />
          </div>
          <span class="text-2xl font-black tracking-tighter text-slate-900">PROMPTRIP</span>
        </RouterLink>
        <div class="flex gap-6 text-sm font-medium text-slate-600">
          <RouterLink to="/" class="hover:text-indigo-600 transition-colors" active-class="text-indigo-600">Map</RouterLink>
          <RouterLink to="/dashboard" class="hover:text-indigo-600 transition-colors" active-class="text-indigo-600">Dashboard</RouterLink>
        </div>
      </div>
    </nav>

    <RouterView />

    <footer class="mt-auto py-8 text-center text-slate-400 text-sm border-t border-slate-100">
      &copy; 2026 Promptrip AI Agent. Built with Vue 3 & Spring Boot 3.4
    </footer>
  </div>
</template>

<script lang="ts">
import { Plane } from 'lucide-vue-next';
export default { components: { Plane } }
</script>

<style>
body {
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
