<template>
  <div class="min-h-screen bg-stone-50 flex">
    <!-- Mobile overlay -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs z-20 md:hidden"></div>
    
    <!-- Sidebar Ejecutiva -->
    <aside :class="['w-64 bg-emerald-950 text-white flex flex-col shadow-2xl z-30 fixed inset-y-0 left-0 transform transition duration-200 ease-in-out md:relative md:translate-x-0 border-r border-emerald-900', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="p-6 border-b border-emerald-900/80 flex items-center gap-3">
        <img src="/logo.png" alt="Logo" class="w-10 h-10 object-contain bg-white/95 rounded-xl p-1 shadow-sm" />
        <div>
          <h1 class="text-lg font-extrabold text-white leading-tight">Zapatoqueando</h1>
          <p class="text-amber-400 text-[11px] font-bold uppercase tracking-wider">Estación Admin</p>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-1.5">
        <router-link 
          to="/admin/posters" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100/85 hover:bg-emerald-900 hover:text-white transition-all text-sm font-medium"
          active-class="bg-emerald-900 font-extrabold text-white border-l-4 border-amber-400 shadow-xs"
        >
          <span>🖼️</span>
          <span>Publicidades y Eventos</span>
        </router-link>
        
        <router-link 
          to="/admin/places" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100/85 hover:bg-emerald-900 hover:text-white transition-all text-sm font-medium"
          active-class="bg-emerald-900 font-extrabold text-white border-l-4 border-amber-400 shadow-xs"
        >
          <span>📍</span>
          <span>Directorio de Lugares</span>
        </router-link>
        
        <router-link 
          to="/admin/routes" 
          @click="isSidebarOpen = false"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-emerald-100/85 hover:bg-emerald-900 hover:text-white transition-all text-sm font-medium"
          active-class="bg-emerald-900 font-extrabold text-white border-l-4 border-amber-400 shadow-xs"
        >
          <span>🥾</span>
          <span>Senderos y Rutas</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-emerald-900/80">
        <button 
          @click="logout" 
          type="button"
          class="w-full text-left px-4 py-3 rounded-xl text-rose-300 hover:bg-rose-950/60 hover:text-rose-200 transition-colors flex items-center gap-2.5 text-sm font-bold cursor-pointer"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden w-full">
      <!-- Topbar Ejecutiva -->
      <header class="bg-white border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex justify-between items-center z-10">
        <div class="flex items-center gap-3">
          <button @click="isSidebarOpen = true" type="button" class="md:hidden text-slate-600 hover:text-emerald-950 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <div>
            <h2 class="text-base md:text-xl font-extrabold text-emerald-950 capitalize truncate">
              {{ currentRouteName }}
            </h2>
            <p class="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Sincronización en tiempo real activa con el mapa público</span>
            </p>
          </div>
        </div>
        <router-link to="/" class="text-xs md:text-sm font-extrabold text-emerald-950 hover:bg-amber-300 bg-amber-400 px-4 py-2 rounded-xl whitespace-nowrap ml-2 shadow-xs transition-colors flex items-center gap-1.5">
          <span>🗺️</span>
          <span>Ver Mapa Público</span>
        </router-link>
      </header>
      
      <!-- Router View Container -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 relative bg-stone-50">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isSidebarOpen = ref(false)

const currentRouteName = computed(() => {
  const path = route.path
  if (path.includes('posters')) return 'Gestión de Publicidades'
  if (path.includes('places')) return 'Gestión de Lugares'
  if (path.includes('routes')) return 'Gestión de Rutas'
  return 'Panel de Control'
})

const logout = () => {
  localStorage.removeItem('admin_token')
  router.push('/admin/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
