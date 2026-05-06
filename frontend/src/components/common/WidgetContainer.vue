<script setup lang="ts">
interface Props {
  padding?: string;
  space?: string;
}

withDefaults(defineProps<Props>(), {
  padding: 'p-6',
  space: 'space-y-6'
});
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 overflow-hidden relative">
    <!-- Header Area (Sticky) -->
    <div v-if="$slots.header" class="shrink-0 z-20">
      <slot name="header" />
    </div>

    <!-- Main Content Area (Scrollable) -->
    <div 
      class="flex-1 overflow-y-auto custom-scrollbar"
      :class="[padding, space]"
    >
      <slot />
    </div>

    <!-- Footer Area (Sticky) -->
    <div v-if="$slots.footer" class="shrink-0 z-20">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
