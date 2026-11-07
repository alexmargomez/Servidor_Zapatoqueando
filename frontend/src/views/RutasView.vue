<template>
  <div class="fixed bottom-0 left-0 w-full z-[2000] pointer-events-none">
    
    <!-- Contenedor Principal (Panel Inferior Estilo AllTrails) -->
    <div 
      style="padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0.75rem));"
      class="relative w-full bg-stone-50/95 backdrop-blur-xl shadow-[0_-12px_40px_rgba(5,46,22,0.18)] flex flex-col pointer-events-auto border-t border-emerald-950/10 rounded-t-3xl transition-transform pb-3 md:pb-5"
    >
      <!-- Indicador visual de arrastre / minimizar -->
      <div class="w-full flex justify-center pt-2 pb-0.5" @click="minimizeToMap">
        <div class="w-10 h-1 rounded-full bg-slate-300 cursor-pointer"></div>
      </div>

      <!-- Barra Superior del Panel de Senderos -->
      <div class="px-3.5 sm:px-6 pt-1.5 pb-2 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/70">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-950 text-amber-400 flex items-center justify-center text-xs sm:text-sm shadow-xs">🥾</span>
          <div>
            <h2 class="text-xs sm:text-base font-extrabold text-emerald-950 leading-tight">Rutas y Senderos Ecológicos</h2>
            <p class="text-[10px] sm:text-[11px] text-slate-500">Toca una ruta para ver su trazado en el mapa</p>
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
            @click="minimizeToMap" 
            type="button" 
            class="bg-emerald-950 hover:bg-emerald-900 text-amber-400 py-1.5 px-3 rounded-full transition-colors flex items-center gap-1 text-[11px] sm:text-xs font-extrabold shadow-sm cursor-pointer" 
            title="Ocultar lista y ver el mapa completo"
          >
            <span>🗺️ Ver mapa</span>
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.4" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>

      <!-- Contenido Scrollable Horizontal -->
      <div class="w-full overflow-x-auto px-3.5 sm:px-6 pt-2.5 pb-1 hide-scrollbar flex flex-row gap-3 sm:gap-4 items-stretch">
        
        <div v-if="loading" class="flex justify-center w-full py-6">
          <div class="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <div v-else-if="filteredRutas.length === 0" class="text-center p-4 w-full bg-white rounded-2xl border border-slate-200/80">
          <p class="text-slate-500 font-semibold text-xs sm:text-sm">No hay rutas disponibles para este filtro.</p>
        </div>

        <!-- Tarjetas de Ruta -->
        <div 
          v-else
          v-for="(ruta, index) in filteredRutas" 
          :key="ruta.id || index"
          @click="selectAndExploreRuta(ruta)"
          :class="[
            'shrink-0 w-68 sm:w-72 md:w-80 bg-white rounded-2xl p-3.5 sm:p-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between relative overflow-hidden border',
            selectedRutaId === (ruta.id || ruta.name)
              ? 'border-amber-400 ring-2 ring-amber-400/40 bg-amber-50/15 shadow-lg'
              : 'border-slate-200/80 hover:border-emerald-700/40 shadow-sm hover:shadow-md'
          ]"
        >
          <!-- Franja cromática superior multicolor por tramos de dificultad -->
          <div v-if="ruta.difficulty_breakdown && ruta.difficulty_breakdown.length > 0" class="absolute top-0 inset-x-0 h-1.5 flex overflow-hidden">
            <div
              v-for="seg in ruta.difficulty_breakdown"
              :key="seg.difficulty"
              class="h-full transition-all duration-300"
              :style="{ width: `${seg.percent ?? seg.percentage ?? 100}%`, backgroundColor: seg.color }"
              :title="`${seg.difficulty}: ${seg.percent ?? seg.percentage ?? 100}%`"
            ></div>
          </div>
          <div v-else class="absolute top-0 inset-x-0 h-1.5" :style="{ backgroundColor: ruta.color || '#eab308' }"></div>

          <div class="pt-1">
            <div class="flex justify-between items-start gap-2 mb-1">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-offset-1 ring-slate-200" :style="{ backgroundColor: ruta.color || '#eab308' }"></span>
                <h3 class="font-extrabold text-emerald-950 text-xs sm:text-sm md:text-base leading-tight group-hover:text-emerald-800 transition-colors truncate">
                  {{ ruta.name || `Ruta Ecológica ${index + 1}` }}
                </h3>
              </div>
              <span :class="['text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 border', getDifficultyBadgeClass(ruta.difficulty)]" title="Dificultad calculada automáticamente según los tramos del sendero">
                {{ ruta.difficulty || 'Fácil' }}
              </span>
            </div>
            <p class="text-[11px] sm:text-xs text-slate-500 mb-2 line-clamp-2 leading-relaxed">
              {{ ruta.description || 'Explora los hermosos paisajes y senderos históricos de Zapatoca.' }}
            </p>

            <!-- Métricas de Distancia, Tiempo y Paradas Cercanas -->
            <div class="mb-2.5 flex flex-wrap items-center gap-1.5 tabular-metrics">
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                📏 {{ ruta.distance_label || '0 m' }}
              </span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                ⏱️ {{ formatDuration(ruta.duration) }}
              </span>
              <span
                v-if="ruta.nearbyStopsCount > 0"
                class="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-950 bg-amber-100/90 px-2 py-0.5 rounded-md border border-amber-300/80"
              >
                🍹 {{ ruta.nearbyStopsCount }} {{ ruta.nearbyStopsCount === 1 ? 'parada' : 'paradas' }}
              </span>
            </div>
          </div>

          <!-- Botones de Acción Directos e Intuitivos -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <button
              v-if="ruta.startCoord"
              @click.stop="openStartDirections(ruta)"
              type="button"
              title="Guiarme al punto de inicio en el mapa"
              class="text-[11px] font-extrabold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-emerald-950 transition-colors cursor-pointer shrink-0"
            >
              🟢 Ir al Inicio
            </button>
            <button
              @click.stop="selectAndExploreRuta(ruta)"
              type="button"
              class="flex-1 text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-amber-400 shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>🗺️ Ver en el mapa</span>
              <span>→</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const rutas = ref([])
const loading = ref(true)
const selectedRutaId = ref(null)
const difficultyFilter = ref('Todas')

const DIFFICULTY_COLORS = {
  'Fácil': '#eab308',
  'Media': '#f97316',
  'Difícil': '#ea580c',
  'Experto': '#dc2626'
}

const filteredRutas = computed(() => {
  if (difficultyFilter.value === 'Todas') return rutas.value
  return rutas.value.filter(r => (r.difficulty || 'Fácil') === difficultyFilter.value)
})

const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty) {
    case 'Fácil':
      return 'bg-amber-100 text-amber-900 border-amber-300'
    case 'Media':
      return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'Difícil':
      return 'bg-orange-200/80 text-orange-950 border-orange-400'
    case 'Experto':
      return 'bg-rose-100 text-rose-800 border-rose-300'
    default:
      return 'bg-amber-100 text-amber-900 border-amber-300'
  }
}

const distanceMetersBetween = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
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
  selectedRutaId.value = ruta.id || ruta.name
  window.dispatchEvent(new CustomEvent('route-focus-start', { detail: ruta }))
  router.push('/')
}

const minimizeToMap = () => {
  router.push('/')
}

const selectAndExploreRuta = (ruta) => {
  selectedRutaId.value = ruta.id || ruta.name
  const event = new CustomEvent('route-selected', { detail: ruta })
  window.dispatchEvent(event)
  router.push('/')
}

onMounted(async () => {
  try {
    const [routesRes, placesRes] = await Promise.all([
      fetch('/api/routes'),
      fetch('/api/places').catch(() => null)
    ])
    const data = await routesRes.json()
    let allPlaces = []
    if (placesRes && placesRes.ok) {
      const placesJson = await placesRes.json().catch(() => ({}))
      allPlaces = Array.isArray(placesJson.data) ? placesJson.data : []
    }
    
    if (data.type === 'FeatureCollection' && data.features) {
      rutas.value = data.features.map(f => {
        const coords = f.geometry?.coordinates || []
        const km = f.properties?.distance_km ?? calculateDistanceKm(coords)
        const distance_label = f.properties?.distance_label || formatDistanceLabel(km)
        const fallbackDiff = f.properties?.difficulty || 'Fácil'
        const fallbackColor = DIFFICULTY_COLORS[fallbackDiff] || f.properties?.color || '#eab308'
        const segments = f.properties?.segments || f.geometry?.segments || []
        const rawBreakdown = f.properties?.difficulty_breakdown || [
          { difficulty: fallbackDiff, color: fallbackColor, distance_km: km, percentage: 100 }
        ]
        const difficulty_breakdown = rawBreakdown.map(b => ({
          ...b,
          percent: b.percentage ?? b.percent ?? 100,
          percentage: b.percentage ?? b.percent ?? 100
        }))
        const startCoord = coords.length > 0 ? coords[0] : null
        const endCoord = coords.length > 1 ? coords[coords.length - 1] : null

        // Contar negocios/paradas cercanos al inicio o meta del sendero (radio 750m)
        let nearbyStopsCount = 0
        if (allPlaces.length > 0 && (startCoord || endCoord)) {
          nearbyStopsCount = allPlaces.filter(p => {
            const pLat = Number(p.location?.lat)
            const pLng = Number(p.location?.lng)
            if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) return false
            const nearStart = startCoord ? distanceMetersBetween(startCoord[1], startCoord[0], pLat, pLng) <= 750 : false
            const nearEnd = endCoord ? distanceMetersBetween(endCoord[1], endCoord[0], pLat, pLng) <= 750 : false
            return nearStart || nearEnd
          }).length
        }

        return {
          ...f.properties,
          coordinates: coords,
          segments,
          difficulty_breakdown,
          distance_km: km,
          distance_label,
          startCoord,
          endCoord,
          nearbyStopsCount
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

