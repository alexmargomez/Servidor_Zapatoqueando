<template>
  <div class="fixed bottom-0 left-0 w-full z-[2000] pointer-events-none">
    
    <!-- Contenedor Principal (Panel Inferior) -->
    <div 
      class="relative w-full bg-white/95 backdrop-blur-md shadow-[0_-10px_40px_rgba(0,0,0,0.12)] flex flex-col pointer-events-auto border-t border-gray-100 transition-transform pb-4 md:pb-6"
    >
      <!-- Botón Flotante Central para Cerrar -->
      <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 z-30">
        <button @click="close" class="bg-black/75 backdrop-blur-md text-white/95 py-1.5 px-5 rounded-full hover:bg-black transition-colors shadow-lg flex items-center gap-2 text-xs font-medium border border-white/10 cursor-pointer" title="Cerrar panel">
          Cerrar
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
      </div>

      <!-- Contenido Scrollable Horizontal -->
      <div class="w-full overflow-x-auto p-4 hide-scrollbar flex flex-row gap-4 items-stretch mt-2">
        
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
          :key="ruta.id || index"
          @click="selectRuta(ruta)"
          :class="[
            'shrink-0 w-64 md:w-76 bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border cursor-pointer transition-all group flex flex-col justify-between',
            selectedRutaId === (ruta.id || ruta.name)
              ? 'border-yellow-400 ring-2 ring-yellow-400/40 bg-yellow-50/20'
              : 'border-gray-100 hover:border-yellow-300'
          ]"
        >
          <div>
            <div class="flex justify-between items-start gap-2 mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0 shadow-sm" :style="{ backgroundColor: ruta.color || '#eab308' }"></span>
                <h3 class="font-bold text-green-950 text-sm md:text-base leading-tight group-hover:text-green-700 transition-colors truncate">
                  {{ ruta.name || `Ruta Ecológica ${index + 1}` }}
                </h3>
              </div>
              <span class="bg-green-100 text-green-800 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                {{ ruta.difficulty || 'Trekking' }}
              </span>
            </div>
            <p class="text-[11px] md:text-xs text-gray-500 mb-3 line-clamp-2">
              {{ ruta.description || 'Explora los hermosos paisajes y senderos de Zapatoca.' }}
            </p>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-gray-50">
            <div class="flex items-center text-[11px] text-gray-500 font-medium gap-2.5 flex-wrap">
              <span class="flex items-center gap-1 font-semibold text-green-800 bg-green-50 px-1.5 py-0.5 rounded-md border border-green-100" title="Distancia calculada automáticamente">
                📏 {{ ruta.distance_label || '0 m' }}
              </span>
              <span class="flex items-center gap-1" title="Tiempo estimado">
                <svg class="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ formatDuration(ruta.duration) }}
              </span>
            </div>
            <span 
              :class="[
                'text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors',
                selectedRutaId === (ruta.id || ruta.name)
                  ? 'bg-yellow-400 text-green-950'
                  : 'text-yellow-700 bg-yellow-50 group-hover:bg-yellow-400 group-hover:text-green-950'
              ]"
            >
              {{ selectedRutaId === (ruta.id || ruta.name) ? 'En Mapa ✓' : 'Ver en Mapa' }}
            </span>
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
const selectedRutaId = ref(null)

// Cálculo automático de distancia (Haversine) desde coordenadas [lng, lat]
const calculateDistanceKm = (coords) => {
  if (!coords || coords.length < 2) return 0
  const R = 6371
  const toRad = (deg) => (deg * Math.PI) / 180
  let totalKm = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i]
    const [lng2, lat2] = coords[i + 1]
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    totalKm += R * c
  }
  return Math.round(totalKm * 100) / 100
}

const formatDistanceLabel = (km) => {
  if (!km || km <= 0) return '0 m'
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(2)} km`
}

const formatDuration = (duration) => {
  const mins = parseInt(duration, 10)
  if (!mins || isNaN(mins)) return duration || '15 min'
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

const close = () => {
  selectedRutaId.value = null
  const event = new CustomEvent('route-unselected')
  window.dispatchEvent(event)
  router.push('/')
}

const selectRuta = (ruta) => {
  selectedRutaId.value = ruta.id || ruta.name
  const event = new CustomEvent('route-selected', { detail: ruta })
  window.dispatchEvent(event)
}

onUnmounted(() => {
  const event = new CustomEvent('route-unselected')
  window.dispatchEvent(event)
})

onMounted(async () => {
  try {
    const response = await fetch('/api/routes')
    const data = await response.json()
    
    if (data.type === 'FeatureCollection' && data.features) {
      rutas.value = data.features.map(f => {
        const coords = f.geometry?.coordinates || []
        const km = f.properties?.distance_km ?? calculateDistanceKm(coords)
        const distance_label = f.properties?.distance_label || formatDistanceLabel(km)
        return {
          ...f.properties,
          distance_km: km,
          distance_label
        }
      })
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
