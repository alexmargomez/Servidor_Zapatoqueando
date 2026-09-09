<template>
  <div class="fixed inset-0 z-[2000] flex justify-end md:items-center md:justify-center pointer-events-none">
    
    <!-- Backdrop oscuro -->
    <div 
      class="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
      @click="close"
    ></div>

    <!-- Contenedor Principal (Panel Lateral en Móvil, Modal grande en Desktop) -->
    <div 
      class="relative w-full h-full md:w-[70vw] md:max-w-4xl bg-white md:rounded-3xl shadow-2xl flex flex-col pointer-events-auto transition-transform overflow-hidden"
    >
      <!-- Cabecera -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-end items-center bg-white sticky top-0 z-10 absolute right-0">
        <button @click="close" class="bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 p-2 rounded-full transition-colors focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Contenido de Descarga -->
      <div class="flex-1 overflow-y-auto flex flex-col md:flex-row bg-white">
        <!-- Izquierda: Info -->
        <div class="flex-1 p-8 md:p-12 flex flex-col justify-center items-center md:items-start text-center md:text-left">
          <img src="/logo.png" alt="Zapatoqueando Logo" class="h-24 md:h-32 mb-6 drop-shadow-md" />
          <h2 class="text-3xl md:text-5xl font-black text-green-950 tracking-tighter mb-4 leading-tight">Lleva Zapatoca en tu bolsillo</h2>
          <p class="text-gray-500 text-lg md:text-xl mb-8 max-w-md">
            Descarga nuestra aplicación oficial y accede a mapas offline, notificaciones de eventos y rutas guiadas por GPS sin consumir tus datos.
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 w-full justify-center md:justify-start">
            <button class="flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:-translate-y-1">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 384 512"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
              <div class="text-left">
                <div class="text-[10px] uppercase tracking-widest opacity-80">Consíguelo en el</div>
                <div class="text-xl">App Store</div>
              </div>
            </button>
            <button class="flex items-center justify-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg hover:-translate-y-1">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 512 512"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
              <div class="text-left">
                <div class="text-[10px] uppercase tracking-widest opacity-80">Disponible en</div>
                <div class="text-xl">Google Play</div>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Derecha: Mockup -->
        <div class="hidden md:flex flex-1 bg-yellow-400 items-center justify-center p-12 relative overflow-hidden">
          <div class="absolute w-64 h-64 bg-white/30 rounded-full blur-3xl -top-10 -right-10"></div>
          <div class="absolute w-64 h-64 bg-green-500/20 rounded-full blur-3xl bottom-10 left-10"></div>
          <div class="w-64 h-[500px] bg-black rounded-[3rem] border-[8px] border-gray-900 shadow-2xl relative flex items-center justify-center overflow-hidden z-10 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
            <!-- Mockup Screen Content -->
            <img src="/hero-bg.jpeg" class="w-full h-full object-cover absolute inset-0 opacity-80" />
            <div class="relative z-10 text-white font-black text-2xl drop-shadow-lg text-center px-4">
              La magia de Zapatoca<br>en tus manos
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const close = () => {
  router.push('/')
}
</script>
