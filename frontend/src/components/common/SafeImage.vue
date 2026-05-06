<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  src?: string;
  alt?: string;
  className?: string;
}>();

const isLoading = ref(true);
const isError = ref(false);

const handleLoad = () => {
  isLoading.value = false;
};

const handleError = () => {
  isLoading.value = false;
  isError.value = true;
};
</script>

<template>
  <div class="relative overflow-hidden bg-slate-100" :class="className">
    <!-- Skeleton Loading -->
    <div 
      v-if="isLoading" 
      class="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] animate-shimmer"
    ></div>

    <!-- Fallback when no image or error -->
    <div 
      v-if="!src || isError" 
      class="absolute inset-0 flex items-center justify-center bg-indigo-50/50"
    >
      <div class="w-10 h-10 rounded-full bg-indigo-100/50 flex items-center justify-center">
        <div class="w-2 h-2 bg-indigo-200 rounded-full"></div>
      </div>
    </div>

    <!-- Actual Image -->
    <img 
      v-if="src && !isError"
      :src="src" 
      :alt="alt"
      @load="handleLoad"
      @error="handleError"
      class="w-full h-full object-cover transition-opacity duration-700"
      :class="isLoading ? 'opacity-0' : 'opacity-100'"
    />
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.animate-shimmer {
  animation: shimmer 2s infinite linear;
}
</style>
