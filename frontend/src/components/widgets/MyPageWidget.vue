<script setup lang="ts">
import { User, Settings, Bell, ShieldCheck, HelpCircle, LogOut, ChevronRight, Award } from 'lucide-vue-next';

const menuItems = [
  { icon: Bell, label: '알림 설정', count: 2 },
  { icon: ShieldCheck, label: '개인정보 보호' },
  { icon: HelpCircle, label: '고객센터' },
  { icon: Settings, label: '환경 설정' },
];
</script>

<template>
  <div class="h-full flex flex-col bg-slate-50 overflow-hidden">
    <!-- Scrollable Content Container -->
    <div class="flex-1 overflow-y-auto custom-scrollbar">
      
      <!-- 1. Compact Profile Section (Now Scrollable) -->
      <div class="bg-white px-6 pt-6 pb-6 border-b border-slate-50">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-100">
              <User class="w-7 h-7 text-white" />
            </div>
            <div class="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-lg border-2 border-white flex items-center justify-center">
              <Award class="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <div class="space-y-0.5">
            <h3 class="text-base font-black text-slate-900 tracking-tight">안티-러버 님</h3>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase">Level 12</span>
              <span class="text-[9px] font-bold text-slate-400 italic">상위 5%</span>
            </div>
          </div>
        </div>

        <!-- Compact Quick Stats -->
        <div class="grid grid-cols-3 gap-3 mt-6">
          <div class="bg-slate-50 rounded-xl p-3 text-center group hover:bg-indigo-50 transition-colors">
            <div class="text-base font-black text-slate-900">24</div>
            <div class="text-[8px] font-black text-slate-400 uppercase tracking-widest">기록</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3 text-center group hover:bg-indigo-50 transition-colors">
            <div class="text-base font-black text-slate-900">152</div>
            <div class="text-[8px] font-black text-slate-400 uppercase tracking-widest">별점</div>
          </div>
          <div class="bg-slate-50 rounded-xl p-3 text-center group hover:bg-indigo-50 transition-colors">
            <div class="text-base font-black text-slate-900">8</div>
            <div class="text-[8px] font-black text-slate-400 uppercase tracking-widest">찜</div>
          </div>
        </div>
      </div>

      <!-- 2. Menu List -->
      <div class="p-4 space-y-2">
        <button 
          v-for="item in menuItems" :key="item.label"
          class="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-slate-50 hover:border-indigo-100 hover:shadow-sm active:scale-98 transition-all group"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
              <component :is="item.icon" class="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
            </div>
            <span class="text-xs font-bold text-slate-700 group-hover:text-slate-900">{{ item.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="item.count" class="px-1.5 py-0.5 bg-red-50 text-red-500 rounded-md text-[8px] font-black">{{ item.count }}</span>
            <ChevronRight class="w-3 h-3 text-slate-300" />
          </div>
        </button>

        <!-- Logout -->
        <button class="w-full flex items-center gap-2 p-4 text-slate-400 hover:text-red-500 transition-colors">
          <LogOut class="w-3.5 h-3.5" />
          <span class="text-[10px] font-black uppercase tracking-widest">로그아웃</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.05); border-radius: 10px; }
</style>
