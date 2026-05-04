<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="h-screen w-full bg-white overflow-hidden">
    <RouterView />
  </div>
</template>

<style>
/* Global Reset for App Style */
html {
  font-size: 100%; /* Reset to standard base */
}
body, html {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  background-color: #f8fafc;
}

#app {
  height: 100%;
  width: 100%;
}

/* Hide scrollbars globally for a cleaner app look */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
