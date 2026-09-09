<template>
  <div class="fixed inset-y-0 right-0 z-[2000] flex justify-end pointer-events-none w-full">
    
    <!-- Backdrop oscuro (Solo en móvil para cerrar al hacer clic afuera) -->
    <div 
      class="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto md:hidden transition-opacity"
      @click="close"
    ></div>

    <!-- Contenedor Principal (Panel Lateral Derecho) -->
    <div 
      class="relative w-full md:w-[420px] h-full bg-white shadow-2xl flex flex-col pointer-events-auto border-l border-gray-100 transition-transform"
    >
      <!-- Cabecera -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <div>
          <span class="text-yellow-500 font-bold tracking-widest uppercase text-[10px] mb-1 block">Aventura Viva</span>
          <h2 class="text-2xl font-black text-green-950 tracking-tighter">Rutas Naturales</h2>
        </div>
        <button @click="close" class="bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 p-2 rounded-full transition-colors focus:outline-none">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Contenido Scrollable -->
      <div class="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 hide-scrollbar flex flex-col gap-4">
        <p class="text-sm text-gray-500 mb-2 font-medium">
          Selecciona una ruta para visualizarla en el mapa.
        </p>
        
        <div v-if="loading" class="flex justify-center py-10">
          <div class="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="rutas.length === 0" class="text-center p-8 bg-white rounded-2xl border border-gray-100">
          <p class="text-gray-400 font-medium">No hay rutas disponibles por el momento.</p>
        </div>

        <div v-else class="flex flex-col gap-4">
          <!-- Tarjeta de Ruta -->
          <div 
            v-for="(ruta, index) in rutas" 
            :key="index"
            @click="selectRuta(ruta)"
            class="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-100 cursor-pointer transition-all hover:border-yellow-300 group"
          >
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-green-950 text-lg leading-tight group-hover:text-green-700 transition-colors">{{ ruta.name || `Ruta Ecológica ${index + 1}` }}</h3>
              <span class="bg-green-100 text-green-800 text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider">Trekking</span>
            </div>
            <p class="text-xs text-gray-500 mb-3 line-clamp-2">Explora los hermosos paisajes de Zapatoca a través de esta espectacular ruta de senderismo.</p>
            <div class="flex items-center justify-between">
               <div class="flex items-center text-xs text-gray-400 font-medium gap-3">
                 <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> 2h 30m</span>
                 <span class="flex items-center gap-1"><svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg> Alta</span>
               </div>
               <button class="text-xs font-bold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full group-hover:bg-yellow-400 group-hover:text-green-950 transition-colors">
                 Ver en Mapa
               </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
