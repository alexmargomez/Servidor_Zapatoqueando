<template>
  <div class="fixed inset-0 z-[2000] flex justify-end md:items-center md:justify-center pointer-events-none">
    
    <!-- Backdrop oscuro (Solo visible en Desktop o si se quiere fondo oscuro) -->
    <div 
      class="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
      @click="close"
    ></div>

    <!-- Contenedor Principal (Panel Lateral en Móvil, Modal grande en Desktop) -->
    <div 
      class="relative w-full h-full md:w-[90vw] md:h-[90vh] md:max-w-6xl bg-white md:rounded-3xl shadow-2xl flex flex-col pointer-events-auto transition-transform overflow-hidden"
    >
      <!-- Cabecera -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <span class="text-yellow-500 font-bold tracking-widest uppercase text-xs mb-1 block">Agenda Cultural</span>
          <h2 class="text-2xl md:text-4xl font-black text-green-950 tracking-tighter">Eventos en Zapatoca</h2>
        </div>
        <button @click="close" class="bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 p-2 md:p-3 rounded-full transition-colors focus:outline-none">
          <svg class="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Contenido Scrollable -->
      <div class="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
        <p class="text-lg md:text-xl text-gray-500 max-w-3xl mb-8">
          Descubre los eventos culturales, ferias y festividades que dan vida a nuestro hermoso pueblo. No te pierdas de nada.
        </p>
        
        <!-- Placeholder Estado Vacío -->
        <div class="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-12 bg-white text-center">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h3 class="text-xl font-bold text-gray-700 mb-2">Próximamente...</h3>
          <p class="text-gray-400 font-medium max-w-sm">
            Estamos preparando la cartelera de eventos más increíble para ti. ¡Vuelve pronto!
          </p>
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

<style scoped>
/* Opcional: Personalizar el scrollbar del modal */
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f8fafc;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>
