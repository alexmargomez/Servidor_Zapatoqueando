<template>
  <div class="space-y-6">
    <!-- Tarjetas KPI de Resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Senderos</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ routesList.length }}</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center text-xl">🥾</div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Kilómetros Trazados</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">
            {{ routesList.reduce((acc, r) => acc + (r.distance_km ?? calculatePathKm(r.geometry?.coordinates)), 0).toFixed(2) }} km
          </p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">📏</div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Tiempo Total Estimado</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">
            {{ routesList.reduce((acc, r) => acc + (Number(r.duration) || 0), 0) }} min
          </p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-xl">⏱️</div>
      </div>
    </div>

    <!-- Header y Acción Principal -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
      <div>
        <h3 class="text-lg font-extrabold text-emerald-950">Senderos y Rutas Ecológicas</h3>
        <p class="text-xs sm:text-sm text-slate-500">Traza rutas punto por punto en el mapa con cálculo automático de kilómetros y duración.</p>
      </div>
      <button 
        @click="openModal()" 
        type="button"
        class="bg-emerald-950 hover:bg-emerald-900 text-white font-extrabold py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm self-start sm:self-auto"
      >
        <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
        <span>Nueva Ruta</span>
      </button>
    </div>

    <!-- Lista de Rutas -->
    <div class="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-slate-500 font-medium">Cargando senderos...</div>
      
      <div v-else-if="routesList.length === 0" class="p-8 text-center text-slate-500 font-medium">
        No hay rutas creadas aún.
      </div>
      
      <template v-else>
        <!-- Vista Desktop (Tabla) -->
        <table class="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr class="bg-stone-50 border-b border-slate-200/80 text-slate-500 text-xs uppercase tracking-wider">
              <th class="p-4 font-extrabold">Nombre</th>
              <th class="p-4 font-extrabold">Descripción</th>
              <th class="p-4 font-extrabold text-center">Distancia (Auto)</th>
              <th class="p-4 font-extrabold text-center">Tiempo Est.</th>
              <th class="p-4 font-extrabold text-center">Dificultad</th>
              <th class="p-4 font-extrabold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route in routesList" :key="route.id" class="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
              <td class="p-4 font-extrabold text-emerald-950">
                <div class="flex items-center gap-2.5">
                  <span class="w-4 h-4 rounded-full shrink-0 ring-2 ring-slate-200" :style="{ backgroundColor: route.color }"></span>
                  <span>{{ route.name }}</span>
                </div>
                <div v-if="route.difficulty_breakdown && route.difficulty_breakdown.length > 0" class="mt-1.5 flex h-1.5 w-32 rounded-full overflow-hidden bg-slate-100">
                  <div
                    v-for="seg in route.difficulty_breakdown"
                    :key="seg.difficulty"
                    :style="{ width: seg.percentage + '%', backgroundColor: seg.color }"
                    :title="`${seg.difficulty}: ${seg.percentage}%`"
                  ></div>
                </div>
              </td>
              <td class="p-4 text-sm text-slate-600 max-w-xs truncate">{{ route.description }}</td>
              <td class="p-4 text-center font-extrabold text-emerald-900 tabular-metrics">
                <span class="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 text-xs">
                  📏 {{ route.distance_label || getPathDistanceLabel(route.geometry?.coordinates) }}
                </span>
              </td>
              <td class="p-4 text-center text-sm font-bold text-slate-700 tabular-metrics">{{ route.duration }} min</td>
              <td class="p-4 text-center">
                <span class="px-2.5 py-1 rounded-full text-xs font-extrabold border" :class="getDifficultyBadgeClass(route.difficulty)">
                  {{ route.difficulty }}
                </span>
              </td>
              <td class="p-4 text-right space-x-2 whitespace-nowrap">
                <button @click="openModal(route)" type="button" class="text-emerald-800 hover:text-emerald-950 font-bold text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer">Editar</button>
                <button @click="deleteItem(route.id)" type="button" class="text-rose-600 hover:text-rose-800 font-bold text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Vista Móvil (Tarjetas) -->
        <div class="md:hidden flex flex-col">
          <div v-for="route in routesList" :key="'mob-'+route.id" class="p-4 border-b border-slate-100 last:border-b-0 hover:bg-emerald-50/30 transition-colors">
            <div class="flex justify-between items-start mb-2">
              <div class="font-extrabold text-emerald-950 text-base flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: route.color }"></span>
                {{ route.name }}
              </div>
              <div class="flex gap-2">
                <button @click="openModal(route)" type="button" class="text-emerald-800 hover:text-emerald-950 font-bold text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors">Editar</button>
                <button @click="deleteItem(route.id)" type="button" class="text-rose-600 hover:text-rose-800 font-bold text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors">Eliminar</button>
              </div>
            </div>
            <p class="text-xs text-slate-600 mb-3 line-clamp-2">{{ route.description }}</p>
            <div class="flex flex-wrap gap-2 text-xs font-bold tabular-metrics">
              <div class="flex items-center gap-1 text-emerald-900 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/60">
                <span>📏 {{ route.distance_label || getPathDistanceLabel(route.geometry?.coordinates) }}</span>
              </div>
              <div class="flex items-center gap-1 text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
                <span>⏱️ {{ route.duration }} min</span>
              </div>
              <div class="flex items-center gap-1 px-2.5 py-0.5 rounded-full border" :class="getDifficultyBadgeClass(route.difficulty)">
                <span>{{ route.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        <div class="bg-stone-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <div>
            <h3 class="text-lg font-extrabold text-emerald-950">{{ form.id ? 'Editar Ruta por Tramos' : 'Nueva Ruta por Tramos' }}</h3>
            <p class="text-xs text-slate-500">Elige el color del tramo mientras marcas puntos en el mapa; la dificultad final se calcula automáticamente.</p>
          </div>
          <button @click="showModal = false" type="button" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="flex-1 flex flex-row relative overflow-hidden">
          <!-- Formulario Lado Izquierdo (o Bottom Sheet en móvil) -->
          <form @submit.prevent="saveItem" id="routeForm" 
            :class="[
              'bg-white z-10 md:static md:w-[360px] lg:w-[390px] md:h-full md:border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0',
              'absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.15)] md:shadow-none md:rounded-none',
              isFormExpanded ? 'h-[78vh]' : 'h-[65px] md:h-full'
            ]"
          >
            <!-- Toggle Móvil -->
            <div class="md:hidden flex justify-center items-center h-[65px] shrink-0 border-b border-slate-200 cursor-pointer bg-stone-50 rounded-t-3xl hover:bg-emerald-50/50" @click="isFormExpanded = !isFormExpanded">
              <div class="flex flex-col items-center text-emerald-800">
                <svg v-if="!isFormExpanded" class="w-6 h-6 animate-bounce mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                <svg v-else class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                <span class="text-xs font-extrabold uppercase tracking-wider">{{ isFormExpanded ? 'Ocultar Formulario' : 'Llenar Datos y Ver Cálculo' }}</span>
              </div>
            </div>

            <!-- Contenido del formulario -->
            <div class="p-4 md:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Nombre del Sendero</label>
                <input v-model="form.name" type="text" placeholder="Ej. Camino de Lengerke - Mirador" :class="['w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950 font-medium', errors.name ? 'border-rose-500 bg-rose-50 focus:ring-rose-500' : '']">
                <p v-if="errors.name" class="text-xs text-rose-600 mt-1 font-bold">{{ errors.name }}</p>
              </div>

              <div>
                <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Descripción y Recomendaciones</label>
                <textarea v-model="form.description" rows="2" placeholder="Describe el paisaje, puntos de agua o recomendaciones..." class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950 text-sm"></textarea>
              </div>

              <!-- Selector de Pincel de Color para el Próximo Tramo -->
              <div class="bg-stone-50 border border-slate-200 rounded-2xl p-3.5 space-y-2.5">
                <div class="flex items-center justify-between">
                  <label class="text-[11px] font-extrabold uppercase tracking-wider text-emerald-950">🎨 Color del Tramo al Trazar</label>
                  <span class="text-[10px] font-bold text-slate-500">Pincel activo</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="opt in difficultyOptions"
                    :key="opt.level"
                    type="button"
                    @click="activeBrushDifficulty = opt.level"
                    :class="[
                      'px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all cursor-pointer',
                      activeBrushDifficulty === opt.level
                        ? 'bg-emerald-950 text-white border-emerald-950 shadow-md scale-[1.02]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-600/40'
                    ]"
                  >
                    <span class="w-3.5 h-3.5 rounded-full shrink-0 border border-white/80 shadow-2xs" :style="{ backgroundColor: opt.color }"></span>
                    <div class="text-left leading-tight">
                      <div>{{ opt.level }}</div>
                      <div :class="['text-[10px] font-semibold', activeBrushDifficulty === opt.level ? 'text-amber-300' : 'text-slate-400']">{{ opt.hint }}</div>
                    </div>
                  </button>
                </div>
                <p class="text-[11px] text-slate-500 leading-snug">
                  💡 Cambia de color mientras marcas puntos en el mapa o <strong>haz clic sobre un tramo ya dibujado</strong> para cambiarle su dificultad.
                </p>
              </div>

              <!-- Termómetro de Dificultad Global y Métricas Calculadas Automáticamente -->
              <div class="bg-emerald-950 text-white rounded-2xl p-4 space-y-3 shadow-md">
                <div class="flex items-center justify-between gap-2">
                  <div>
                    <div class="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Resultado Final Automático</div>
                    <div class="text-xs text-emerald-100/80">Calculado según los colores de tus tramos</div>
                  </div>
                  <span class="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm border border-white/20" :style="{ backgroundColor: computedGlobalColor, color: '#fff' }">
                    {{ computedGlobalDifficulty }}
                  </span>
                </div>

                <!-- Barra Termómetro Proporcional Multicolor -->
                <div class="space-y-1.5">
                  <div class="h-3 w-full rounded-full bg-white/15 overflow-hidden flex p-0.5 gap-0.5">
                    <div
                      v-for="item in computedDifficultyBreakdown"
                      :key="item.difficulty"
                      class="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
                      :style="{ width: item.percentage + '%', backgroundColor: item.color }"
                      :title="`${item.difficulty}: ${item.distance_km} km (${item.percentage}%)`"
                    ></div>
                  </div>
                  <div class="flex flex-wrap gap-1.5 pt-0.5">
                    <span
                      v-for="item in computedDifficultyBreakdown"
                      :key="'lbl-'+item.difficulty"
                      class="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1 tabular-metrics"
                    >
                      <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: item.color }"></span>
                      <span>{{ item.difficulty }}: {{ item.percentage }}%</span>
                    </span>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-2.5 pt-1">
                  <div class="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <div class="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Distancia Total</div>
                    <div class="text-base font-extrabold text-white tabular-metrics mt-0.5">📏 {{ computedDistanceLabel }}</div>
                  </div>
                  <div class="bg-white/10 rounded-xl p-2.5 border border-white/10">
                    <div class="text-[10px] text-emerald-200 font-bold uppercase tracking-wider">Tiempo Ponderado</div>
                    <div class="text-base font-extrabold text-amber-300 tabular-metrics mt-0.5">⏱️ {{ computedDurationMinutes }} min</div>
                  </div>
                </div>
                <p class="text-[10px] text-emerald-200/80 leading-snug tabular-metrics">
                  {{ currentPath.length }} puntos marcados · {{ Math.max(0, currentPath.length - 1) }} tramos evaluados.
                </p>
              </div>
            </div>
          </form>

          <!-- Mapa Lado Derecho (Fondo en móvil) -->
          <div class="flex-1 h-full flex flex-col relative bg-slate-100 z-0 pb-[65px] md:pb-0">
            <div id="admin-route-map" class="w-full h-full z-10"></div>

            <!-- Barra Flotante de Pincel de Color Directo en el Mapa -->
            <div class="absolute top-3 left-3 right-16 z-[1000] pointer-events-none flex flex-wrap items-center gap-1.5">
              <div class="bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-1 pointer-events-auto flex-wrap">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-2 hidden sm:inline">Tramo:</span>
                <button
                  v-for="opt in difficultyOptions"
                  :key="'map-brush-'+opt.level"
                  type="button"
                  @click="activeBrushDifficulty = opt.level"
                  :class="[
                    'px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer',
                    activeBrushDifficulty === opt.level
                      ? 'bg-emerald-950 text-white shadow-xs scale-[1.03]'
                      : 'text-slate-700 hover:bg-slate-100'
                  ]"
                >
                  <span class="w-3 h-3 rounded-full shrink-0 border border-white" :style="{ backgroundColor: opt.color }"></span>
                  <span>{{ opt.level }}</span>
                </button>
              </div>
            </div>
            
            <!-- Controles Flotantes del Mapa (Deshacer / Limpiar) -->
            <div class="absolute top-3 right-3 z-[1000] flex flex-col gap-2">
              <button type="button" @click="undoLastPoint" :disabled="currentPath.length === 0" class="bg-white p-2.5 rounded-xl shadow-lg text-emerald-950 hover:text-emerald-700 disabled:opacity-50 transition-colors cursor-pointer" title="Deshacer último punto">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
              </button>
              <button type="button" @click="clearPath" :disabled="currentPath.length === 0" class="bg-white p-2.5 rounded-xl shadow-lg text-slate-700 hover:text-rose-600 disabled:opacity-50 transition-colors cursor-pointer" title="Limpiar ruta completa">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-stone-50 px-5 md:px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0 relative z-20">
          <button type="button" @click="showModal = false" class="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-sm">Cancelar</button>
          <button type="button" @click="saveItem" :disabled="saving" class="bg-emerald-950 hover:bg-emerald-900 text-white font-extrabold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center cursor-pointer text-sm">
            <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full mr-2"></span>
            Guardar Ruta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { apiFetch } from '../../utils/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const isFormExpanded = ref(false)

watch(isFormExpanded, async () => {
  await nextTick()
  if (map) {
    map.invalidateSize()
    setTimeout(() => {
      if (map) map.invalidateSize()
    }, 320)
  }
})

const difficultyOptions = [
  { level: 'Fácil', color: '#eab308', weight: 1, speedKmh: 4.5, hint: 'Plano · Amarillo' },
  { level: 'Media', color: '#f97316', weight: 2, speedKmh: 4.0, hint: 'Moderado · Naranja' },
  { level: 'Difícil', color: '#ea580c', weight: 3, speedKmh: 3.2, hint: 'Exigente · Naranja Osc.' },
  { level: 'Experto', color: '#dc2626', weight: 4, speedKmh: 2.5, hint: 'Alta pendiente · Rojo' }
]

const getDifficultyMeta = (level) => {
  return difficultyOptions.find(o => o.level === level) || difficultyOptions[0]
}

const getDifficultyBadgeClass = (difficulty) => {
  switch (difficulty) {
    case 'Fácil':
      return 'bg-amber-50 text-amber-800 border-amber-200'
    case 'Media':
      return 'bg-orange-50 text-orange-800 border-orange-200'
    case 'Difícil':
      return 'bg-orange-100 text-orange-900 border-orange-300'
    case 'Experto':
      return 'bg-rose-50 text-rose-800 border-rose-200'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200'
  }
}

const activeBrushDifficulty = ref('Fácil')

const routesList = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)

const form = ref({
  id: null,
  name: '',
  description: '',
  duration: 5,
  difficulty: 'Fácil',
  color: '#eab308'
})

const errors = ref({})

// Lista de puntos [lng, lat] y dificultad de cada tramo [i -> i+1]
const currentPath = ref([])
const segmentDifficulties = ref([])

const haversinePairKm = (pt1, pt2) => {
  if (!Array.isArray(pt1) || !Array.isArray(pt2) || pt1.length < 2 || pt2.length < 2) return 0
  const [lng1, lat1] = pt1
  const [lng2, lat2] = pt2
  if (typeof lat1 !== 'number' || typeof lng1 !== 'number' || typeof lat2 !== 'number' || typeof lng2 !== 'number') {
    return 0
  }
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calcular distancia en km de cualquier arreglo de coordenadas [[lng, lat], ...]
const calculatePathKm = (coords) => {
  if (!Array.isArray(coords) || coords.length < 2) return 0
  let totalKm = 0
  for (let i = 0; i < coords.length - 1; i++) {
    totalKm += haversinePairKm(coords[i], coords[i + 1])
  }
  return totalKm
}

const getPathDistanceLabel = (coords) => {
  const km = calculatePathKm(coords)
  if (km <= 0) return '0 m'
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(2)} km`
}

// Segmentos detallados con distancia y duración individual
const detailedSegments = computed(() => {
  const pts = currentPath.value
  if (!Array.isArray(pts) || pts.length < 2) return []
  const list = []
  for (let i = 0; i < pts.length - 1; i++) {
    const level = segmentDifficulties.value[i] || 'Fácil'
    const meta = getDifficultyMeta(level)
    const distKm = haversinePairKm(pts[i], pts[i + 1])
    const durationMin = (distKm / meta.speedKmh) * 60
    list.push({
      index: i,
      coords: [pts[i], pts[i + 1]],
      difficulty: meta.level,
      color: meta.color,
      weight: meta.weight,
      distance_km: distKm,
      duration_min: durationMin
    })
  }
  return list
})

const computedDistanceKm = computed(() => {
  return detailedSegments.value.reduce((acc, s) => acc + s.distance_km, 0)
})

const computedDistanceLabel = computed(() => getPathDistanceLabel(currentPath.value))

// Duración ponderada sumando el tiempo real de cada tramo según su dificultad
const computedDurationMinutes = computed(() => {
  if (detailedSegments.value.length === 0) return 5
  const totalMin = detailedSegments.value.reduce((acc, s) => acc + s.duration_min, 0)
  return Math.max(5, Math.round(totalMin))
})

// Cálculo automático de la Dificultad Global al finalizar o trazar los segmentos
const computedGlobalDifficulty = computed(() => {
  const segs = detailedSegments.value
  const totalKm = computedDistanceKm.value
  if (segs.length === 0 || totalKm <= 0) {
    return activeBrushDifficulty.value || 'Fácil'
  }

  let weightedSum = 0
  let expertKm = 0
  let hardKm = 0

  for (const s of segs) {
    weightedSum += s.distance_km * s.weight
    if (s.difficulty === 'Experto') expertKm += s.distance_km
    if (s.difficulty === 'Difícil') hardKm += s.distance_km
  }

  let effectiveScore = weightedSum / totalKm
  const expertRatio = expertKm / totalKm
  const hardPlusExpertRatio = (hardKm + expertKm) / totalKm

  if (expertRatio >= 0.3 || expertKm >= 0.6) {
    effectiveScore = Math.max(effectiveScore, 3.3)
  } else if (expertRatio >= 0.15 || hardPlusExpertRatio >= 0.35) {
    effectiveScore = Math.max(effectiveScore, 2.45)
  }

  if (effectiveScore >= 3.25) return 'Experto'
  if (effectiveScore >= 2.4) return 'Difícil'
  if (effectiveScore >= 1.55) return 'Media'
  return 'Fácil'
})

const computedGlobalColor = computed(() => {
  return getDifficultyMeta(computedGlobalDifficulty.value).color
})

const computedDifficultyBreakdown = computed(() => {
  const segs = detailedSegments.value
  const totalKm = computedDistanceKm.value
  if (segs.length === 0 || totalKm <= 0) {
    const meta = getDifficultyMeta(activeBrushDifficulty.value)
    return [{ difficulty: meta.level, color: meta.color, distance_km: 0, percentage: 100 }]
  }

  const totals = { 'Fácil': 0, 'Media': 0, 'Difícil': 0, 'Experto': 0 }
  for (const s of segs) {
    totals[s.difficulty] = (totals[s.difficulty] || 0) + s.distance_km
  }

  return difficultyOptions
    .filter(opt => totals[opt.level] > 0)
    .map(opt => ({
      difficulty: opt.level,
      color: opt.color,
      distance_km: Number(totals[opt.level].toFixed(2)),
      percentage: Math.max(1, Math.round((totals[opt.level] / totalKm) * 100))
    }))
})

let map = null
let segmentsLayerGroup = null
let markersGroup = null

const loadData = async () => {
  try {
    loading.value = true
    const res = await apiFetch('/api/routes')
    const data = await res.json()
    routesList.value = data.features.map(f => ({
      id: f.properties.id,
      name: f.properties.name,
      description: f.properties.description,
      duration: f.properties.duration,
      distance_km: f.properties.distance_km,
      distance_label: f.properties.distance_label,
      difficulty: f.properties.difficulty,
      color: f.properties.color,
      segments: f.properties.segments || f.geometry?.segments || [],
      difficulty_breakdown: f.properties.difficulty_breakdown || [],
      geometry: f.geometry
    }))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const renderPath = () => {
  if (!map) return
  if (segmentsLayerGroup) {
    segmentsLayerGroup.clearLayers()
  } else {
    segmentsLayerGroup = L.layerGroup().addTo(map)
  }
  if (markersGroup) {
    markersGroup.clearLayers()
  } else {
    markersGroup = L.layerGroup().addTo(map)
  }

  // Dibujar cada tramo con su propio color de dificultad
  detailedSegments.value.forEach((seg) => {
    const latlngs = [
      [seg.coords[0][1], seg.coords[0][0]],
      [seg.coords[1][1], seg.coords[1][0]]
    ]

    // Halo oscuro exterior para alto contraste sobre imagen satelital
    L.polyline(latlngs, {
      color: '#052e16',
      weight: 8,
      opacity: 0.45,
      interactive: false
    }).addTo(segmentsLayerGroup)

    const segLine = L.polyline(latlngs, {
      color: seg.color,
      weight: 5,
      opacity: 0.95
    }).addTo(segmentsLayerGroup)

    // Permitir cambiar el color de un tramo haciendo clic sobre él
    segLine.on('click', (ev) => {
      L.DomEvent.stopPropagation(ev)
      segmentDifficulties.value[seg.index] = activeBrushDifficulty.value
      renderPath()
    })
  })

  // Dibujar vértices
  const latlngs = currentPath.value.map(pt => [pt[1], pt[0]])
  latlngs.forEach((latlng, index) => {
    const segColor = index === 0
      ? '#10b981'
      : getDifficultyMeta(segmentDifficulties.value[index - 1] || activeBrushDifficulty.value).color
    L.circleMarker(latlng, {
      radius: index === 0 || index === latlngs.length - 1 ? 6 : 4,
      fillColor: index === 0 ? '#10b981' : (index === latlngs.length - 1 ? '#ef4444' : '#ffffff'),
      color: segColor,
      weight: 2.5,
      opacity: 1,
      fillOpacity: 1
    }).addTo(markersGroup)
  })
}

const initAdminMap = () => {
  if (map) map.remove()
  segmentsLayerGroup = null
  markersGroup = null
  
  const center = [6.8168, -73.2687]
  map = L.map('admin-route-map').setView(center, 15)
  L.tileLayer('/map-cache/{z}/{x}/{y}.jpg', {
    maxZoom: 22,
    maxNativeZoom: 19
  }).addTo(map)

  map.on('click', (e) => {
    if (currentPath.value.length >= 1) {
      segmentDifficulties.value.push(activeBrushDifficulty.value)
    }
    currentPath.value.push([e.latlng.lng, e.latlng.lat])
    renderPath()
  })
  
  renderPath()
  
  if (currentPath.value.length > 0) {
    const latlngs = currentPath.value.map(pt => [pt[1], pt[0]])
    map.fitBounds(L.polyline(latlngs).getBounds(), { padding: [50, 50] })
  }
}

const openModal = async (item = null) => {
  if (item) {
    const coords = Array.isArray(item.geometry?.coordinates) ? [...item.geometry.coordinates] : []
    currentPath.value = coords
    const rawSegs = item.geometry?.segments || item.segments || []
    const loadedDiffs = []
    for (let i = 0; i < Math.max(0, coords.length - 1); i++) {
      loadedDiffs.push(rawSegs[i]?.difficulty || item.difficulty || 'Fácil')
    }
    segmentDifficulties.value = loadedDiffs
    activeBrushDifficulty.value = loadedDiffs[loadedDiffs.length - 1] || item.difficulty || 'Fácil'
    form.value = {
      id: item.id,
      name: item.name,
      description: item.description,
      duration: computedDurationMinutes.value || item.duration || 5,
      difficulty: item.difficulty || 'Fácil',
      color: item.color || '#eab308'
    }
  } else {
    currentPath.value = []
    segmentDifficulties.value = []
    activeBrushDifficulty.value = 'Fácil'
    form.value = {
      id: null, name: '', description: '', duration: 5, difficulty: 'Fácil', color: '#eab308'
    }
  }
  errors.value = {}
  showModal.value = true
  
  await nextTick()
  initAdminMap()
}

const undoLastPoint = () => {
  if (currentPath.value.length === 0) return
  currentPath.value.pop()
  if (segmentDifficulties.value.length > Math.max(0, currentPath.value.length - 1)) {
    segmentDifficulties.value.pop()
  }
  renderPath()
}

const clearPath = () => {
  currentPath.value = []
  segmentDifficulties.value = []
  renderPath()
}

const saveItem = async () => {
  errors.value = {}
  
  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = 'El nombre es obligatorio'
  }

  if (Object.keys(errors.value).length > 0) {
    isFormExpanded.value = true
    return
  }

  if (currentPath.value.length < 2) {
    alert('Una ruta debe tener al menos 2 puntos dibujados en el mapa.')
    return
  }

  form.value.duration = computedDurationMinutes.value
  form.value.difficulty = computedGlobalDifficulty.value
  form.value.color = computedGlobalColor.value

  const segmentsMetadata = detailedSegments.value.map(s => ({
    difficulty: s.difficulty,
    color: s.color
  }))

  const payload = {
    ...form.value,
    geojson: {
      type: 'LineString',
      coordinates: currentPath.value,
      segments: segmentsMetadata
    }
  }

  try {
    saving.value = true
    const url = form.value.id ? `/api/routes/${form.value.id}` : '/api/routes'
    const method = form.value.id ? 'PUT' : 'POST'
    
    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Error al guardar')
    }
    
    showModal.value = false
    loadData()
  } catch (err) {
    alert(err.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta ruta?')) return
  try {
    const res = await apiFetch(`/api/routes/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar')
    loadData()
  } catch (err) {
    alert('Error al eliminar')
  }
}

onMounted(() => {
  loadData()
})

onBeforeUnmount(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>
