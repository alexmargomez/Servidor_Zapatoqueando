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
              <td class="p-4 font-extrabold text-emerald-950 flex items-center gap-2.5">
                <span class="w-4 h-4 rounded-full shrink-0 ring-2 ring-slate-200" :style="{ backgroundColor: route.color }"></span>
                <span>{{ route.name }}</span>
              </td>
              <td class="p-4 text-sm text-slate-600 max-w-xs truncate">{{ route.description }}</td>
              <td class="p-4 text-center font-extrabold text-emerald-900 tabular-metrics">
                <span class="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 text-xs">
                  📏 {{ route.distance_label || getPathDistanceLabel(route.geometry?.coordinates) }}
                </span>
              </td>
              <td class="p-4 text-center text-sm font-bold text-slate-700 tabular-metrics">{{ route.duration }} min</td>
              <td class="p-4 text-center">
                <span class="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-extrabold">{{ route.difficulty }}</span>
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
              <div class="flex items-center gap-1 text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
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
          <h3 class="text-lg font-extrabold text-emerald-950">{{ form.id ? 'Editar Ruta' : 'Nueva Ruta' }}</h3>
          <button @click="showModal = false" type="button" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="flex-1 flex flex-row relative overflow-hidden">
          <!-- Formulario Lado Izquierdo (o Bottom Sheet en móvil) -->
          <form @submit.prevent="saveItem" id="routeForm" 
            :class="[
              'bg-white z-10 md:static md:w-1/3 md:h-full md:border-r border-slate-200 flex flex-col transition-all duration-300',
              'absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.15)] md:shadow-none md:rounded-none',
              isFormExpanded ? 'h-[75vh]' : 'h-[65px] md:h-full'
            ]"
          >
            <!-- Toggle Móvil -->
            <div class="md:hidden flex justify-center items-center h-[65px] shrink-0 border-b border-slate-200 cursor-pointer bg-stone-50 rounded-t-3xl hover:bg-emerald-50/50" @click="isFormExpanded = !isFormExpanded">
              <div class="flex flex-col items-center text-emerald-800">
                <svg v-if="!isFormExpanded" class="w-6 h-6 animate-bounce mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                <svg v-else class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                <span class="text-xs font-extrabold uppercase tracking-wider">{{ isFormExpanded ? 'Ocultar Formulario' : 'Llenar Datos de la Ruta' }}</span>
              </div>
            </div>

            <!-- Contenido del formulario -->
            <div class="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Nombre</label>
              <input v-model="form.name" type="text" :class="['w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950 font-medium', errors.name ? 'border-rose-500 bg-rose-50 focus:ring-rose-500' : '']">
              <p v-if="errors.name" class="text-xs text-rose-600 mt-1 font-bold">{{ errors.name }}</p>
            </div>
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Descripción</label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950"></textarea>
            </div>
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Dificultad</label>
              <select v-model="form.difficulty" class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all font-bold text-emerald-950">
                <option value="Fácil">Fácil (Amarillo)</option>
                <option value="Media">Media (Naranja Claro)</option>
                <option value="Difícil">Difícil (Naranja Oscuro)</option>
                <option value="Experto">Experto (Rojo)</option>
              </select>
            </div>

            <!-- Tarjeta de Distancia y Tiempo Calculados Automáticamente -->
            <div class="bg-stone-50 border border-slate-200 rounded-2xl p-4 space-y-2.5">
              <div class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Cálculo Automático por Trazado</div>
              <div class="grid grid-cols-2 gap-3">
                <div class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                  <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Distancia Total</div>
                  <div class="text-base font-extrabold text-emerald-950 tabular-metrics mt-0.5">📏 {{ computedDistanceLabel }}</div>
                </div>
                <div class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs">
                  <div class="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Tiempo Estimado</div>
                  <div class="text-base font-extrabold text-emerald-800 tabular-metrics mt-0.5">⏱️ {{ computedDurationMinutes }} min</div>
                </div>
              </div>
              <p class="text-[11px] text-slate-500 leading-snug tabular-metrics">
                Se calcula automáticamente al marcar los puntos de la ruta en el mapa ({{ currentPath.length }} puntos trazados).
              </p>
            </div>
            </div>
          </form>

          <!-- Mapa Lado Derecho (Fondo en móvil) -->
          <div class="w-full md:w-2/3 h-full flex flex-col relative bg-slate-100 z-0 pb-[65px] md:pb-0">
            <div id="admin-route-map" class="w-full h-full z-10"></div>
            
            <!-- Controles Flotantes del Mapa -->
            <div class="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
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
  color: '#eab308' // Default Amarillo for Fácil
})

const errors = ref({})

// Lista de puntos [lng, lat] para GeoJSON LineString
const currentPath = ref([])

// Calcular distancia en km de cualquier arreglo de coordenadas [[lng, lat], ...]
const calculatePathKm = (coords) => {
  if (!Array.isArray(coords) || coords.length < 2) return 0
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371 // km
  let totalKm = 0
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i]
    const [lng2, lat2] = coords[i + 1]
    if (typeof lat1 !== 'number' || typeof lng1 !== 'number' || typeof lat2 !== 'number' || typeof lng2 !== 'number') {
      continue
    }
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    totalKm += R * c
  }
  return totalKm
}

const getPathDistanceLabel = (coords) => {
  const km = calculatePathKm(coords)
  if (km <= 0) return '0 m'
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toFixed(2)} km`
}

const computedDistanceKm = computed(() => calculatePathKm(currentPath.value))
const computedDistanceLabel = computed(() => getPathDistanceLabel(currentPath.value))

// Velocidad promedio en caminata según dificultad (km/h)
const computedDurationMinutes = computed(() => {
  const km = computedDistanceKm.value
  if (km <= 0) return 5
  const speedMap = {
    'Fácil': 4.5,
    'Media': 4.0,
    'Difícil': 3.2,
    'Experto': 2.5
  }
  const speed = speedMap[form.value.difficulty] || 4.0
  return Math.max(5, Math.round((km / speed) * 60))
})

// Watcher para cambiar el color según la dificultad
watch(() => form.value.difficulty, (newDiff) => {
  switch(newDiff) {
    case 'Fácil':
      form.value.color = '#eab308' // Amarillo
      break
    case 'Media':
      form.value.color = '#f97316' // Naranja claro
      break
    case 'Difícil':
      form.value.color = '#ea580c' // Naranja oscuro
      break
    case 'Experto':
      form.value.color = '#dc2626' // Rojo
      break
  }
})

let map = null
let polylineLayer = null
let markersGroup = null

const loadData = async () => {
  try {
    loading.value = true
    const res = await apiFetch('/api/routes')
    const data = await res.json()
    // El backend devuelve FeatureCollection
    routesList.value = data.features.map(f => ({
      id: f.properties.id,
      name: f.properties.name,
      description: f.properties.description,
      duration: f.properties.duration,
      distance_km: f.properties.distance_km,
      distance_label: f.properties.distance_label,
      difficulty: f.properties.difficulty,
      color: f.properties.color,
      geometry: f.geometry // LineString
    }))
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const renderPath = () => {
  if (!map) return
  if (polylineLayer) {
    map.removeLayer(polylineLayer)
  }
  if (markersGroup) {
    markersGroup.clearLayers()
  } else {
    markersGroup = L.layerGroup().addTo(map)
  }

  // Convertir [lng, lat] a [lat, lng] para Leaflet polyline
  const latlngs = currentPath.value.map(pt => [pt[1], pt[0]])
  
  polylineLayer = L.polyline(latlngs, {
    color: form.value.color,
    weight: 4,
    opacity: 0.8
  }).addTo(map)

  // Dibujar puntos para verlos
  latlngs.forEach((latlng, index) => {
    const circle = L.circleMarker(latlng, {
      radius: 4,
      fillColor: index === 0 ? '#10b981' : (index === latlngs.length - 1 ? '#ef4444' : '#ffffff'),
      color: form.value.color,
      weight: 2,
      opacity: 1,
      fillOpacity: 1
    }).addTo(markersGroup)
  })
}

// Observar el color para repintar la línea en tiempo real
watch(() => form.value.color, () => {
  if (polylineLayer) {
    polylineLayer.setStyle({ color: form.value.color })
  }
})

const initAdminMap = () => {
  if (map) map.remove()
  
  const center = [6.8168, -73.2687]
  map = L.map('admin-route-map').setView(center, 15)
  L.tileLayer('/map-cache/{z}/{x}/{y}.jpg', {
    maxZoom: 22,
    maxNativeZoom: 19
  }).addTo(map)

  map.on('click', (e) => {
    // Agregar punto [lng, lat]
    currentPath.value.push([e.latlng.lng, e.latlng.lat])
    renderPath()
  })
  
  renderPath()
  
  // Si hay ruta, hacer zoom a ella
  if (currentPath.value.length > 0) {
    const latlngs = currentPath.value.map(pt => [pt[1], pt[0]])
    map.fitBounds(L.polyline(latlngs).getBounds(), { padding: [50, 50] })
  }
}

const openModal = async (item = null) => {
  if (item) {
    // Cargar line string. GeoJSON es [lng, lat]
    currentPath.value = [...item.geometry.coordinates]
    form.value = {
      id: item.id,
      name: item.name,
      description: item.description,
      duration: computedDurationMinutes.value || item.duration || 5,
      difficulty: item.difficulty,
      color: item.color
    }
  } else {
    currentPath.value = []
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
  currentPath.value.pop()
  renderPath()
}

const clearPath = () => {
  currentPath.value = []
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

  // Calcular automáticamente la duración estimada según la distancia y dificultad del trazado
  form.value.duration = computedDurationMinutes.value

  const payload = {
    ...form.value,
    geojson: {
      type: "LineString",
      coordinates: currentPath.value // Formato [lng, lat]
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
