<template>
  <div class="fixed bottom-0 left-0 w-full z-[2000] pointer-events-none">
    
    <!-- Contenedor Principal (Panel Inferior Estilo AllTrails) -->
    <div 
      class="relative w-full bg-stone-50/95 backdrop-blur-xl shadow-[0_-12px_40px_rgba(5,46,22,0.18)] flex flex-col pointer-events-auto border-t border-emerald-950/10 rounded-t-3xl transition-transform pb-4 md:pb-6"
    >
      <!-- Barra Superior del Panel de Senderos -->
      <div class="px-4 sm:px-6 pt-3.5 pb-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70">
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-xl bg-emerald-950 text-amber-400 flex items-center justify-center text-sm shadow-xs">🥾</span>
          <div>
            <h2 class="text-sm sm:text-base font-extrabold text-emerald-950 leading-tight">Rutas y Senderos Ecológicos</h2>
            <p class="text-[11px] text-slate-500 hidden sm:block">Selecciona un sendero para trazar su recorrido, inicio y meta en el mapa</p>
          </div>
        </div>

        <!-- Filtros rápidos de dificultad + Botones de Acción -->
        <div class="flex items-center gap-1.5 flex-wrap">
          <div class="hidden md:flex items-center gap-1 bg-slate-200/70 p-1 rounded-full mr-1">
            <button 
              v-for="diff in ['Todas', 'Fácil', 'Media', 'Difícil', 'Experto']" 
              :key="diff"
              type="button"
              @click="difficultyFilter = diff"
              :class="[
                'px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer',
                difficultyFilter === diff ? 'bg-emerald-950 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-950'
              ]"
            >
              {{ diff }}
            </button>
          </div>

          <button 
            v-if="selectedRutaId"
            @click="exploreOnMap" 
            type="button" 
            class="bg-emerald-950 hover:bg-emerald-900 text-amber-400 py-1.5 px-3.5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-extrabold shadow-sm cursor-pointer"
            title="Minimizar panel y mantener la ruta activa en el mapa"
          >
            <span>🗺️ Explorar ruta</span>
          </button>

          <button 
            @click="close" 
            type="button" 
            class="bg-slate-200/80 hover:bg-rose-100 text-slate-700 hover:text-rose-700 py-1.5 px-3.5 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer" 
            title="Cerrar panel de rutas"
          >
            <span>Cerrar</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido Scrollable Horizontal -->
      <div class="w-full overflow-x-auto px-4 sm:px-6 pt-3 pb-1 hide-scrollbar flex flex-row gap-4 items-stretch">
        
        <div v-if="loading" class="flex justify-center w-full py-6">
          <div class="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="filteredRutas.length === 0" class="text-center p-5 w-full bg-white rounded-2xl border border-slate-200/80">
          <p class="text-slate-500 font-semibold text-sm">No hay rutas disponibles para este filtro.</p>
        </div>

        <!-- Tarjetas de Ruta -->
        <div 
          v-else
          v-for="(ruta, index) in filteredRutas" 
          :key="ruta.id || index"
          @click="selectRuta(ruta)"
          :class="[
            'shrink-0 w-72 md:w-80 bg-white rounded-2xl p-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between relative overflow-hidden border',
            selectedRutaId === (ruta.id || ruta.name)
              ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-50/15 shadow-lg -translate-y-0.5'
              : 'border-slate-200/80 hover:border-emerald-700/40 shadow-sm hover:shadow-md'
          ]"
        >
          <!-- Franja cromática superior del color del trazado -->
          <div class="absolute top-0 inset-x-0 h-1.5" :style="{ backgroundColor: ruta.color || '#eab308' }"></div>

          <div class="pt-1">
            <div class="flex justify-between items-start gap-2 mb-1.5">
              <div class="flex items-center gap-2 min-w-0">
                <span class="w-3 h-3 rounded-full shrink-0 ring-2 ring-offset-1 ring-slate-200" :style="{ backgroundColor: ruta.color || '#eab308' }"></span>
                <h3 class="font-extrabold text-emerald-950 text-sm md:text-base leading-tight group-hover:text-emerald-800 transition-colors truncate">
                  {{ ruta.name || `Ruta Ecológica ${index + 1}` }}
                </h3>
              </div>
              <span :class="['text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 border', getDifficultyBadgeClass(ruta.difficulty)]">
                {{ ruta.difficulty || 'Fácil' }}
              </span>
            </div>
            <p class="text-xs text-slate-500 mb-3 line-clamp-2 leading-relaxed">
              {{ ruta.description || 'Explora los hermosos paisajes y senderos históricos de Zapatoca.' }}
            </p>
          </div>

          <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 gap-2">
            <div class="flex items-center text-[11px] text-slate-600 font-semibold gap-2 flex-wrap tabular-metrics">
              <span class="flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60" title="Distancia calculada automáticamente">
                📏 {{ ruta.distance_label || '0 m' }}
              </span>
              <span class="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg" title="Tiempo estimado de caminata">
                ⏱️ {{ formatDuration(ruta.duration) }}
              </span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
              <button
                v-if="ruta.startCoord"
                @click.stop="openStartDirections(ruta)"
                type="button"
                title="Cómo llegar al punto de inicio de la ruta"
                class="text-[11px] font-bold px-2 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 text-emerald-900 transition-colors cursor-pointer"
              >
                🧭 Inicio
              </button>
              <span 
                :class="[
                  'text-[11px] font-extrabold px-2.5 py-1 rounded-full transition-colors',
                  selectedRutaId === (ruta.id || ruta.name)
                    ? 'bg-emerald-950 text-amber-400 shadow-xs'
                    : 'text-emerald-900 bg-amber-100/80 group-hover:bg-amber-400 group-hover:text-emerald-950'
                ]"
              >
                {{ selectedRutaId === (ruta.id || ruta.name) ? 'En Mapa ✓' : 'Trazar →' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Espaciador final para scroll completo -->
        <div class="shrink-0 w-4 h-full"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rutas = ref([])
const loading = ref(true)
const selectedRutaId = ref(null)
const difficultyFilter = ref('Todas')

const filteredRutas = computed(() => {
  if (difficultyFilter.value === 'Todas') return rutas.value
  return rutas.value.filter(r => (r.difficulty || 'Fácil') === difficultyFilter.value)
})

const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty) {
    case 'Fácil':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    case 'Media':
      return 'bg-amber-100 text-amber-800 border-amber-200'
    case 'Difícil':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'Experto':
      return 'bg-rose-100 text-rose-800 border-rose-200'
    default:
      return 'bg-emerald-100 text-emerald-800 border-emerald-200'
  }
}

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

const openStartDirections = (ruta) => {
  if (!ruta?.startCoord) return
  const [lng, lat] = ruta.startCoord
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank', 'noopener')
}

const exploreOnMap = () => {
  router.push('/')
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
          distance_label,
          startCoord: coords.length > 0 ? coords[0] : null,
          endCoord: coords.length > 1 ? coords[coords.length - 1] : null
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

