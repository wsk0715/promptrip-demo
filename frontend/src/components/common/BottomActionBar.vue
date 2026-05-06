<script setup lang="ts">
import { type Component } from 'vue';

interface Props {
  primaryText: string;
  primaryIcon?: Component;
  secondaryIcon?: Component;
}

defineProps<Props>();
defineEmits(['primary-click', 'secondary-click']);
</script>

<template>
  <div class="absolute bottom-0 inset-x-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-6 z-50">
    <div class="flex gap-3">
      <!-- Secondary Circle Button (Optional) -->
      <button 
        v-if="secondaryIcon"
        @click="$emit('secondary-click')"
        class="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-200 transition-all active:scale-95"
      >
        <component :is="secondaryIcon" class="w-5 h-5" />
      </button>

      <!-- Primary Wide Button -->
      <button 
        @click="$emit('primary-click')"
        class="flex-1 py-4 bg-indigo-600 text-white rounded-[2rem] text-xs font-black shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        <component :is="primaryIcon" class="w-4 h-4 fill-white" v-if="primaryIcon" />
        {{ primaryText }}
      </button>
    </div>
  </div>
</template>
