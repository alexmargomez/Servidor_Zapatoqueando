<template>
  <div class="fixed bottom-0 left-0 w-full z-[2000] pointer-events-none">
    
    <!-- Contenedor Principal (Panel Inferior) -->
    <div 
      class="relative w-full bg-white/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pointer-events-auto border-t border-gray-100 transition-transform pb-4 md:pb-6"
    >
      <!-- Botón Flotante Central para Cerrar -->
      <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
        <button @click="close" class="bg-black/70 backdrop-blur-md text-white/90 py-1.5 px-5 rounded-full hover:bg-black/90 transition-colors shadow-lg flex items-center gap-2 text-xs font-medium border border-white/10" title="Cerrar panel">
          Cerrar
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>

      <!-- Contenido Scrollable Horizontal -->
      <div class="w-full overflow-x-auto p-4 hide-scrollbar flex flex-row gap-4 items-center mt-2">
        
        <div v-if="loading" class="flex justify-center w-full py-4">
          <div class="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="rutas.length === 0" class="text-center p-4 w-full bg-white rounded-2xl border border-gray-100">
          <p class="text-gray-400 font-medium text-sm">No hay rutas disponibles por el momento.</p>
        </div>

        <!-- Tarjetas de Ruta (Mini) -->
        <div 
          v-else
          v-for="(ruta, index) in rutas" 
          :key="index"
          @click="selectRuta(ruta)"
          class="shrink-0 w-64 md:w-72 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all hover:border-yellow-300 group"
        >
          <div class="flex justify-between items-start mb-1.5">
            <h3 class="font-bold text-green-950 text-sm md:text-base leading-tight group-hover:text-green-700 transition-colors truncate pr-2">{{ ruta.name || `Ruta Ecológica ${index + 1}` }}</h3>
            <span class="bg-green-100 text-green-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Trekking</span>
          </div>
          <p class="text-[10px] md:text-xs text-gray-500 mb-3 line-clamp-1">Explora los hermosos paisajes de Zapatoca.</p>
          <div class="flex items-center justify-between">
             <div class="flex items-center text-[10px] text-gray-400 font-medium gap-2">
               <span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 2h 30m</span>
               <span class="flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> Alta</span>
             </div>
             <button class="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2.5 py-1 rounded-full group-hover:bg-yellow-400 group-hover:text-green-950 transition-colors">
               Ver en Mapa
             </button>
          </div>
        </div>
        
        <!-- Espaciador final para scroll completo -->
        <div class="shrink-0 w-4 h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rutas = ref([])
const loading = ref(true)

const close = () => {
  // Disparar evento para limpiar selección en el mapa
  const event = new CustomEvent('route-unselected');
  window.dispatchEvent(event);
  router.push('/')
}

const selectRuta = (ruta) => {
  // Emitir evento global que será escuchado por LugaresView (el mapa)
  const event = new CustomEvent('route-selected', { detail: ruta });
  window.dispatchEvent(event);
}

onMounted(async () => {
  try {
    const response = await fetch('/api/routes')
    const data = await response.json()
    
    if (data.type === 'FeatureCollection' && data.features) {
      // Extraer propiedades para listar
      rutas.value = data.features.map(f => f.properties)
    }
  } catch (err) {
    console.error('Error fetching routes:', err)
  } finally {
    loading.value = false
  }
})

</script>

<style scoped>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
