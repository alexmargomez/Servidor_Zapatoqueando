<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Mobile overlay -->
    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/50 z-20 md:hidden"></div>
    
    <!-- Sidebar -->
    <aside :class="['w-64 bg-green-950 text-white flex flex-col shadow-xl z-30 fixed inset-y-0 left-0 transform transition duration-200 ease-in-out md:relative md:translate-x-0', isSidebarOpen ? 'translate-x-0' : '-translate-x-full']">
      <div class="p-6 border-b border-green-900">
        <h1 class="text-2xl font-black text-white">Zapatoqueando</h1>
        <p class="text-green-400 text-sm mt-1">Admin Panel</p>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <router-link 
          to="/admin/posters" 
          @click="isSidebarOpen = false"
          class="block px-4 py-3 rounded-lg text-green-100 hover:bg-green-800 transition-colors"
          active-class="bg-green-800 font-bold text-white"
        >
          🖼️ Publicidades
        </router-link>
        
        <router-link 
          to="/admin/places" 
          @click="isSidebarOpen = false"
          class="block px-4 py-3 rounded-lg text-green-100 hover:bg-green-800 transition-colors"
          active-class="bg-green-800 font-bold text-white"
        >
          📍 Lugares
        </router-link>
        
        <router-link 
          to="/admin/routes" 
          @click="isSidebarOpen = false"
          class="block px-4 py-3 rounded-lg text-green-100 hover:bg-green-800 transition-colors"
          active-class="bg-green-800 font-bold text-white"
        >
          🗺️ Rutas (Mapa)
        </router-link>
      </nav>

      <div class="p-4 border-t border-green-900">
        <button 
          @click="logout" 
          class="w-full text-left px-4 py-3 rounded-lg text-red-300 hover:bg-red-900/50 hover:text-red-200 transition-colors flex items-center gap-2"
        >
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-screen overflow-hidden w-full">
      <!-- Topbar Navbar -->
      <header class="bg-white shadow-sm px-4 md:px-8 py-4 flex justify-between items-center z-10">
        <div class="flex items-center gap-3">
          <button @click="isSidebarOpen = true" class="md:hidden text-gray-500 hover:text-gray-700">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          <h2 class="text-lg md:text-xl font-bold text-gray-800 capitalize truncate">
            {{ currentRouteName }}
          </h2>
        </div>
        <a href="/" target="_blank" class="text-xs md:text-sm font-bold text-green-700 hover:text-green-800 bg-green-50 px-3 py-2 rounded-lg whitespace-nowrap ml-2">
          Ver Sitio &rarr;
        </a>
      </header>
      
      <!-- Router View Container -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 relative">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
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
