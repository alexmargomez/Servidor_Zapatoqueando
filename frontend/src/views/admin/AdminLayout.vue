<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-green-950 text-white flex flex-col shadow-xl z-20">
      <div class="p-6 border-b border-green-900">
        <h1 class="text-2xl font-black text-white">Zapatoqueando</h1>
        <p class="text-green-400 text-sm mt-1">Admin Panel</p>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <router-link 
          to="/admin/posters" 
          class="block px-4 py-3 rounded-lg text-green-100 hover:bg-green-800 transition-colors"
          active-class="bg-green-800 font-bold text-white"
        >
          🖼️ Publicidades
        </router-link>
        
        <router-link 
          to="/admin/places" 
          class="block px-4 py-3 rounded-lg text-green-100 hover:bg-green-800 transition-colors"
          active-class="bg-green-800 font-bold text-white"
        >
          📍 Lugares
        </router-link>
        
        <router-link 
          to="/admin/routes" 
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
    <main class="flex-1 flex flex-col h-screen overflow-hidden">
      <!-- Topbar Navbar -->
      <header class="bg-white shadow-sm px-8 py-4 flex justify-between items-center z-10">
        <h2 class="text-xl font-bold text-gray-800 capitalize">
          {{ currentRouteName }}
        </h2>
        <a href="/" target="_blank" class="text-sm font-bold text-green-700 hover:text-green-800 bg-green-50 px-4 py-2 rounded-lg">
          Ver Sitio Web &rarr;
        </a>
      </header>
      
      <!-- Router View Container -->
      <div class="flex-1 overflow-y-auto p-8 relative">
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
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

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
