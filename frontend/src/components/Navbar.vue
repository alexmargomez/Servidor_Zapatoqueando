<template>
  <header 
    class="fixed top-0 left-0 w-full z-[1010] px-3 sm:px-6 py-3 md:py-4 flex justify-between items-center bg-transparent pointer-events-none"
  >
    <!-- Píldora de Marca -->
    <router-link 
      to="/" 
      @click="isMobileMenuOpen = false"
      class="flex items-center gap-2.5 sm:gap-3 group cursor-pointer pointer-events-auto bg-white/92 backdrop-blur-xl px-3.5 py-1.5 sm:py-2 rounded-full shadow-[0_8px_28px_rgba(5,46,22,0.14)] border border-white/80 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(5,46,22,0.2)] hover:bg-white"
    >
      <img src="/logo.png" alt="Zapatoqueando Logo" class="h-9 sm:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-sm" />
      <div class="pr-2">
        <h1 class="text-base sm:text-xl font-extrabold tracking-tight text-emerald-950 leading-none">ZAPATOQUEANDO</h1>
        <span class="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-emerald-700/85 mt-0.5">Zapatoca · Clima de Seda</span>
      </div>
    </router-link>
    
    <!-- Botón Menú Móvil -->
    <button 
      @click="isMobileMenuOpen = !isMobileMenuOpen" 
      type="button"
      aria-label="Abrir menú de navegación"
      class="md:hidden p-2.5 text-emerald-950 focus:outline-none pointer-events-auto bg-white/92 backdrop-blur-xl rounded-full shadow-[0_8px_24px_rgba(5,46,22,0.14)] border border-white/80 transition-all duration-200 active:scale-95 cursor-pointer"
    >
      <svg v-if="!isMobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
      <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>

    <!-- Navegación Desktop (Cápsula Flotante) -->
    <nav class="hidden md:flex items-center gap-1.5 bg-white/90 rounded-full p-1.5 backdrop-blur-xl border border-white/80 shadow-[0_8px_28px_rgba(5,46,22,0.14)] pointer-events-auto">
      <router-link 
        to="/" 
        exact-active-class="bg-emerald-950 text-white shadow-sm"
        class="font-bold text-sm px-4 py-2 rounded-full transition-all duration-200 hover:bg-emerald-50 text-emerald-950 flex items-center gap-1.5"
      >
        <svg class="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
        <span>Mapa</span>
      </router-link>

      <router-link 
        to="/rutas" 
        active-class="bg-emerald-950 text-white shadow-sm"
        class="font-bold text-sm px-4 py-2 rounded-full transition-all duration-200 hover:bg-emerald-50 text-emerald-950 flex items-center gap-1.5"
      >
        <svg class="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
        <span>Rutas</span>
      </router-link>

      <router-link 
        to="/eventos" 
        active-class="bg-emerald-950 text-white shadow-sm"
        class="font-bold text-sm px-4 py-2 rounded-full transition-all duration-200 hover:bg-emerald-50 text-emerald-950 flex items-center gap-1.5"
      >
        <svg class="w-4 h-4 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <span>Eventos</span>
      </router-link>
      
      <router-link 
        to="/descargar" 
        class="ml-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold py-2 px-5 rounded-full shadow-[0_4px_14px_rgba(234,179,8,0.35)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.45)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95 text-xs uppercase tracking-wider flex items-center gap-1.5"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
        <span>Descargar</span>
      </router-link>

      <!-- Acceso Admin Discreto -->
      <router-link 
        :to="isLoggedIn ? '/admin' : '/admin/login'" 
        class="ml-1 text-emerald-950/75 hover:text-emerald-950 bg-emerald-950/5 hover:bg-emerald-950/10 border border-emerald-950/10 px-3 py-2 rounded-full transition-all duration-200 text-xs font-bold flex items-center gap-1"
        :title="isLoggedIn ? 'Ir al Panel Admin' : 'Iniciar Sesión'"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
        <span>{{ isLoggedIn ? 'Admin' : 'Login' }}</span>
      </router-link>
    </nav>

    <!-- Menú Móvil Desplegable -->
    <transition name="slide-fade">
      <nav v-if="isMobileMenuOpen" class="absolute top-[68px] left-3 right-3 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(5,46,22,0.22)] flex flex-col p-4 gap-2 md:hidden border border-emerald-950/10 pointer-events-auto">
        <router-link @click="isMobileMenuOpen = false" to="/" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50/80 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">🗺️</div>
          <div>
            <div class="font-extrabold text-emerald-950 text-sm">Mapa Interactivo</div>
            <div class="text-xs text-slate-500">Explora comercios, hoteles y atractivos</div>
          </div>
        </router-link>

        <router-link @click="isMobileMenuOpen = false" to="/rutas" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50/80 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">🥾</div>
          <div>
            <div class="font-extrabold text-emerald-950 text-sm">Rutas y Senderos</div>
            <div class="text-xs text-slate-500">Caminatas ecológicas con distancia y tiempo</div>
          </div>
        </router-link>

        <router-link @click="isMobileMenuOpen = false" to="/eventos" class="flex items-center gap-3 p-3 rounded-2xl hover:bg-emerald-50/80 transition-colors">
          <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">🎭</div>
          <div>
            <div class="font-extrabold text-emerald-950 text-sm">Agenda Cultural y Eventos</div>
            <div class="text-xs text-slate-500">Ferias, festivales y destacados del pueblo</div>
          </div>
        </router-link>

        <div class="pt-2 mt-1 border-t border-slate-100 flex items-center gap-2">
          <router-link @click="isMobileMenuOpen = false" to="/descargar" class="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold py-3 px-4 rounded-2xl shadow-md text-xs uppercase tracking-wider text-center">
            📱 Descargar App
          </router-link>
          <router-link 
            @click="isMobileMenuOpen = false" 
            :to="isLoggedIn ? '/admin' : '/admin/login'" 
            class="py-3 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{{ isLoggedIn ? '⚙️ Admin' : '🔐 Login' }}</span>
          </router-link>
        </div>
      </nav>
    </transition>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isMobileMenuOpen = ref(false)

const isLoggedIn = computed(() => {
  // Reacts when route changes
  route.fullPath
  return Boolean(localStorage.getItem('admin_token'))
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
