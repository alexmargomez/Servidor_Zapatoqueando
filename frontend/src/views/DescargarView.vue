<template>
  <div class="fixed inset-0 z-[2000] flex justify-end md:items-center md:justify-center pointer-events-none">
    
    <!-- Backdrop oscuro -->
    <div 
      class="absolute inset-0 bg-emerald-950/55 backdrop-blur-sm pointer-events-auto transition-opacity"
      @click="close"
    ></div>

    <!-- Contenedor Principal -->
    <div 
      class="relative w-full h-full md:w-[86vw] md:max-w-4xl md:h-auto md:max-h-[90vh] bg-white md:rounded-3xl shadow-2xl flex flex-col pointer-events-auto transition-transform overflow-hidden border border-white/50"
    >
      <!-- Botón Cerrar Flotante -->
      <button 
        @click="close" 
        type="button"
        class="absolute top-4 right-4 z-30 bg-white/90 hover:bg-rose-50 hover:text-rose-600 text-slate-700 backdrop-blur-md p-2.5 rounded-full shadow-md transition-colors focus:outline-none cursor-pointer"
        title="Cerrar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <!-- Contenido de Descarga -->
      <div class="flex-1 overflow-y-auto flex flex-col md:flex-row bg-stone-50">
        <!-- Izquierda: Info y Beneficios -->
        <div class="flex-1 p-7 sm:p-10 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <div class="inline-flex items-center gap-2 bg-emerald-100 text-emerald-900 text-xs font-extrabold px-3 py-1 rounded-full mb-4">
            <span>🌿</span>
            <span>Zapatoca · La Ciudad del Clima de Seda</span>
          </div>
          <h2 class="text-3xl md:text-4xl font-extrabold text-emerald-950 tracking-tight mb-3 leading-tight">
            Lleva a Zapatoca en tu bolsillo
          </h2>
          <p class="text-slate-600 text-sm md:text-base mb-6 max-w-md leading-relaxed">
            Recorre los senderos de Lengerke, ubica miradores, cafés y hoteles con nuestro motor cartográfico de respuesta instantánea.
          </p>

          <!-- Píldoras de Valor Real -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full mb-7 text-left">
            <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div class="text-base mb-1">🗺️</div>
              <div class="text-xs font-extrabold text-emerald-950">Mapa en Caché</div>
              <div class="text-[11px] text-slate-500">Carga ultrarrápida de calles</div>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div class="text-base mb-1">🛰️</div>
              <div class="text-xs font-extrabold text-emerald-950">Senderos GPS</div>
              <div class="text-[11px] text-slate-500">Distancias y tiempos reales</div>
            </div>
            <div class="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div class="text-base mb-1">🎭</div>
              <div class="text-xs font-extrabold text-emerald-950">Agenda Viva</div>
              <div class="text-[11px] text-slate-500">Eventos y comercios al día</div>
            </div>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3.5 w-full justify-center md:justify-start">
            <button 
              @click="notifyStore('App Store (iOS)')"
              type="button"
              class="flex items-center justify-center gap-3 bg-emerald-950 hover:bg-emerald-900 text-white font-bold py-3.5 px-5 rounded-2xl transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <svg class="w-6 h-6 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              <div class="text-left">
                <div class="text-[10px] uppercase tracking-widest opacity-75">Próximamente en</div>
                <div class="text-base leading-tight font-extrabold">App Store</div>
              </div>
            </button>
            <button 
              @click="notifyStore('Google Play (Android)')"
              type="button"
              class="flex items-center justify-center gap-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3.5 px-5 rounded-2xl transition-all shadow-md hover:-translate-y-0.5 cursor-pointer"
            >
              <svg class="w-6 h-6 shrink-0 text-amber-300" fill="currentColor" viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
              <div class="text-left">
                <div class="text-[10px] uppercase tracking-widest opacity-75">Disponible pronto en</div>
                <div class="text-base leading-tight font-extrabold">Google Play</div>
              </div>
            </button>
          </div>

          <transition name="fade">
            <div v-if="storeNotice" class="mt-4 bg-amber-50 border border-amber-300 text-emerald-950 text-xs font-semibold px-4 py-3 rounded-xl w-full">
              {{ storeNotice }}
            </div>
          </transition>
        </div>
        
        <!-- Derecha: Mockup Esmeralda Clima de Seda -->
        <div class="hidden md:flex w-[360px] bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800 items-center justify-center p-10 relative overflow-hidden shrink-0">
          <div class="absolute w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -top-10 -right-10"></div>
          <div class="absolute w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl bottom-10 left-10"></div>
          <div class="w-56 h-[430px] bg-slate-950 rounded-[2.75rem] border-[7px] border-emerald-950/90 shadow-2xl relative flex flex-col justify-between overflow-hidden z-10 p-4">
            <img src="/hero-bg.jpeg" alt="App Preview" class="w-full h-full object-cover absolute inset-0 opacity-75" />
            <div class="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/30 to-transparent"></div>

            <div class="relative z-10 flex items-center gap-2 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full self-start shadow-md">
              <img src="/logo.png" alt="Logo" class="w-5 h-5 object-contain" />
              <span class="text-[10px] font-extrabold text-emerald-950">ZAPATOQUEANDO</span>
            </div>

            <div class="relative z-10 space-y-2.5">
              <div class="bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-white/60">
                <div class="text-[10px] font-extrabold uppercase text-emerald-700">🥾 Sendero Activo</div>
                <div class="text-xs font-extrabold text-emerald-950">Mirador Guane</div>
                <div class="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-600 tabular-metrics">
                  <span class="bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded">📏 2.4 km</span>
                  <span>⏱️ 38 min</span>
                </div>
              </div>
              <div class="text-white font-extrabold text-sm text-center drop-shadow-sm">
                Explora Zapatoca en tiempo real
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const storeNotice = ref('')

const notifyStore = (storeName) => {
  storeNotice.value = `¡La versión nativa para ${storeName} estará disponible muy pronto! Puedes agregar esta Web App directamente a tu pantalla de inicio y usar el GPS en vivo ahora mismo.`
}

const close = () => {
  router.push('/')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
