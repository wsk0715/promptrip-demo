<script setup lang="ts">
import { ref } from 'vue';
import { useTripPlanner } from '../services/tripService';
import { Send, MapPin, Loader2, Info } from 'lucide-vue-next';

const prompt = ref('');
const { currentTrip, logs, isProcessing, error, startPlanning } = useTripPlanner();

const handleSearch = () => {
  if (!prompt.value.trim()) return;
  startPlanning(prompt.value);
};
</script>

<<template>
  <div class="p-4 space-y-6">
    <!-- Search Section -->
    <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 ring-1 ring-slate-200/50">
      <h2 class="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
        <MapPin class="text-indigo-600 w-6 h-6" />
        Where to next?
      </h2>
      <p class="text-slate-500 text-sm mb-4">Describe your perfect trip and let AI do the rest.</p>
      
      <div class="relative group">
        <textarea
          v-model="prompt"
          placeholder="e.g., Jeonju 2-day food tour..."
          class="w-full p-4 pr-12 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all resize-none h-28 text-base placeholder:text-slate-400"
          :disabled="isProcessing"
          @keydown.enter.prevent="handleSearch"
        ></textarea>
        <button 
          @click="handleSearch"
          :disabled="isProcessing || !prompt.trim()"
          class="absolute bottom-3 right-3 p-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Send v-if="!isProcessing" class="w-5 h-5" />
          <Loader2 v-else class="w-5 h-5 animate-spin" />
        </button>
      </div>
    </div>

    <!-- Processing Logs -->
    <div v-if="logs.length > 0 || isProcessing" class="bg-slate-900 text-slate-300 p-5 rounded-2xl font-mono text-xs shadow-inner relative overflow-hidden">
      <div class="flex items-center gap-2 mb-3 text-slate-500 border-b border-white/10 pb-2">
        <span class="text-[10px] uppercase tracking-widest font-bold">Trip Agent Logs</span>
      </div>
      <div class="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar">
        <div v-for="(log, i) in logs" :key="i" class="flex gap-2 animate-in fade-in slide-in-from-left-2">
          <span class="text-indigo-400 opacity-50">{{ i + 1 }}</span>
          <span>{{ log }}</span>
        </div>
      </div>
    </div>

    <!-- Result Section -->
    <div v-if="currentTrip?.plans && !isProcessing" class="animate-in fade-in zoom-in-95 duration-500 pb-4">
      <h3 class="text-lg font-bold text-slate-800 mb-4 px-2">
        🎯 {{ currentTrip.title || 'Your Plan' }}
      </h3>
      <div class="space-y-4">
        <div v-for="day in currentTrip.plans" :key="day.day" class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div class="flex items-center gap-2 mb-4">
            <div class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
              Day {{ day.day }}
            </div>
            <div class="h-px flex-1 bg-slate-50"></div>
          </div>
          
          <div class="space-y-5 relative ml-2 border-l-2 border-indigo-50 pl-6 py-1">
            <div v-for="(item, idx) in day.items" :key="idx" class="relative">
              <div class="absolute -left-[29px] top-1.5 w-3 h-3 rounded-full bg-white border-[3px] border-indigo-600"></div>
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-bold text-indigo-400 tabular-nums uppercase tracking-tighter">{{ item.time }}</span>
                <h4 class="font-bold text-slate-900 text-sm">{{ item.location }}</h4>
                <p class="text-xs text-slate-500 leading-relaxed">{{ item.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
.animate-in {
  animation: enter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes enter {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
