<template>
  <header 
    class="fixed top-0 left-0 w-full z-[1010] px-4 md:px-6 py-4 flex justify-between items-center bg-transparent pointer-events-none"
  >
    <router-link 
      to="/" 
      @click="isMobileMenuOpen = false"
      class="flex items-center gap-3 group cursor-pointer pointer-events-auto bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/95"
    >
      <img src="/logo.png" alt="Zapatoqueando Logo" class="h-10 md:h-13 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md" />
      <h1 class="text-xl md:text-2xl font-black tracking-tighter text-green-950 drop-shadow-sm pr-2">ZAPATOQUEANDO</h1>
    </router-link>
    
    <!-- Mobile Hamburger Button -->
    <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2.5 text-green-950 focus:outline-none pointer-events-auto bg-white/85 backdrop-blur-md rounded-full shadow-sm transition-all duration-300">
      <svg v-if="!isMobileMenuOpen" class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
      <svg v-else class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-1.5 bg-white/80 rounded-full px-4 py-2 backdrop-blur-md border border-white/50 shadow-sm pointer-events-auto">
      <router-link 
        to="/eventos" 
        class="font-bold px-5 py-2 rounded-full transition-all duration-300 hover:bg-green-50 text-green-950"
        active-class="bg-green-900/10 text-green-950"
      >
        Eventos
      </router-link>
      <router-link 
        to="/rutas" 
        class="font-bold px-5 py-2 rounded-full transition-all duration-300 hover:bg-green-50 text-green-950"
        active-class="bg-green-900/10 text-green-950"
      >
        Rutas
      </router-link>
      
      <router-link 
        to="/descargar" 
        class="ml-1 bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black py-2.5 px-7 rounded-full shadow-[0_4px_14px_0_rgba(250,204,21,0.39)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.23)] hover:-translate-y-0.5 transition-all duration-300 active:scale-95 uppercase tracking-wide text-sm block"
      >
        Descargar
      </router-link>

      <!-- Botón de Login discreto / menos visible -->
      <router-link 
        :to="isLoggedIn ? '/admin' : '/admin/login'" 
        class="ml-1 text-green-950/45 hover:text-green-950/90 hover:bg-green-950/5 px-3 py-2 rounded-full transition-all duration-300 text-xs font-semibold flex items-center gap-1"
        :title="isLoggedIn ? 'Ir al Panel Admin' : 'Ingresar al Panel'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <span>{{ isLoggedIn ? 'Admin' : 'Ingresar' }}</span>
      </router-link>
    </nav>

    <!-- Mobile Nav Overlay -->
    <transition name="slide-fade">
      <nav v-if="isMobileMenuOpen" class="absolute top-[76px] left-4 right-4 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl flex flex-col items-center py-7 gap-5 md:hidden border border-gray-100 pointer-events-auto">
        <router-link @click="isMobileMenuOpen = false" to="/eventos" class="text-xl font-black text-green-950 hover:text-yellow-500">Eventos</router-link>
        <router-link @click="isMobileMenuOpen = false" to="/rutas" class="text-xl font-black text-green-950 hover:text-yellow-500">Rutas</router-link>
        <router-link @click="isMobileMenuOpen = false" to="/descargar" class="mt-1 bg-yellow-400 text-green-950 font-black py-3.5 px-10 rounded-full shadow-lg text-base uppercase tracking-wide block">
          Descargar App
        </router-link>
        <router-link 
          @click="isMobileMenuOpen = false" 
          :to="isLoggedIn ? '/admin' : '/admin/login'" 
          class="mt-2 pt-3 border-t border-gray-100 w-3/4 text-center text-xs font-semibold text-gray-400 hover:text-green-950 flex items-center justify-center gap-1.5 transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
          <span>{{ isLoggedIn ? 'Panel Admin' : 'Ingresar' }}</span>
        </router-link>
      </nav>
    </transition>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isScrolled = ref(false)
const isMobileMenuOpen = ref(false)

const isHome = computed(() => route.path === '/')
const isLoggedIn = computed(() => {
  // Reacts when route changes
  route.fullPath
  return Boolean(localStorage.getItem('admin_token'))
})

const handleScroll = (e) => {
  const scrollTop = e.detail !== undefined ? e.detail : window.scrollY
  isScrolled.value = scrollTop > 50
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('home-scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('home-scroll', handleScroll)
})
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.98);
}
</style>
