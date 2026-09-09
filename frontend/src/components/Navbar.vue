<template>
  <header 
    class="fixed top-0 left-0 w-full z-[1010] px-6 py-4 flex justify-between items-center bg-transparent pointer-events-none"
  >
    <div class="flex items-center gap-3 group cursor-pointer pointer-events-auto bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm transition-all duration-300 hover:shadow-md hover:bg-white/90">
      <img src="/logo.png" alt="Zapatoqueando Logo" class="h-12 md:h-14 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md" />
      <h1 class="text-2xl md:text-3xl font-black tracking-tighter text-green-950 drop-shadow-sm pr-2">ZAPATOQUEANDO</h1>
    </div>
    
    <!-- Mobile Hamburger Button -->
    <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="md:hidden p-2 text-green-950 focus:outline-none pointer-events-auto bg-white/80 backdrop-blur-md rounded-full shadow-sm transition-all duration-300">
      <svg v-if="!isMobileMenuOpen" class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
      <svg v-else class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-2 bg-white/70 rounded-full px-4 py-2 backdrop-blur-md border border-white/40 shadow-sm pointer-events-auto">
      <router-link to="/eventos" class="font-bold px-5 py-2 rounded-full transition-all duration-300 hover:bg-green-50 text-green-950">Eventos</router-link>
      <router-link to="/rutas" class="font-bold px-5 py-2 rounded-full transition-all duration-300 hover:bg-green-50 text-green-950">Rutas</router-link>
      
      <router-link to="/descargar" class="ml-2 bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black py-3 px-8 rounded-full shadow-[0_4px_14px_0_rgba(250,204,21,0.39)] hover:shadow-[0_6px_20px_rgba(250,204,21,0.23)] hover:-translate-y-1 transition-all duration-300 active:scale-95 uppercase tracking-wide text-sm block">
        Descargar
      </router-link>
    </nav>

    <!-- Mobile Nav Overlay -->
    <transition name="slide-fade">
      <nav v-if="isMobileMenuOpen" class="absolute top-[80px] left-0 w-full bg-white shadow-xl flex flex-col items-center py-8 gap-6 md:hidden border-t border-gray-100 pointer-events-auto">
        <router-link @click="isMobileMenuOpen = false" to="/eventos" class="text-2xl font-black text-green-950 hover:text-yellow-500">Eventos</router-link>
        <router-link @click="isMobileMenuOpen = false" to="/rutas" class="text-2xl font-black text-green-950 hover:text-yellow-500">Rutas</router-link>
        <router-link @click="isMobileMenuOpen = false" to="/descargar" class="mt-4 bg-yellow-400 text-green-950 font-black py-4 px-12 rounded-full shadow-lg text-lg uppercase tracking-wide block">
          Descargar App
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

const handleScroll = (e) => {
  // e could be a standard Event or a CustomEvent from HomeView
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
