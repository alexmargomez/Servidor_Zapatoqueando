<template>
  <div class="space-y-6">
    <!-- Header y Acción Principal -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div>
        <h3 class="text-lg font-bold text-gray-800">Tus Rutas</h3>
        <p class="text-sm text-gray-500">Administra las rutas dibujándolas punto por punto en el mapa.</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-gray-900 hover:bg-black text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Nueva Ruta
      </button>
    </div>

    <!-- Lista de Rutas -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500 font-medium">Cargando...</div>
      
      <div v-else-if="routesList.length === 0" class="p-8 text-center text-gray-500">
        No hay rutas creadas aún.
      </div>
      
      <template v-else>
        <!-- Vista Desktop (Tabla) -->
        <table class="w-full text-left border-collapse hidden md:table">
          <thead>
            <tr class="bg-slate-50 border-b border-gray-100 text-gray-500 text-sm">
              <th class="p-4 font-bold">Nombre</th>
              <th class="p-4 font-bold">Descripción</th>
              <th class="p-4 font-bold text-center">Duración</th>
              <th class="p-4 font-bold text-center">Dificultad</th>
              <th class="p-4 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="route in routesList" :key="route.id" class="border-b border-gray-50 hover:bg-slate-50 transition-colors">
              <td class="p-4 font-bold text-gray-800 flex items-center gap-2">
                <span class="w-4 h-4 rounded-full" :style="{ backgroundColor: route.color }"></span>
                {{ route.name }}
              </td>
              <td class="p-4 text-sm text-gray-600">{{ route.description }}</td>
              <td class="p-4 text-center">{{ route.duration }} min</td>
              <td class="p-4 text-center">
                <span class="px-2 py-1 bg-gray-100 rounded text-xs font-bold">{{ route.difficulty }}</span>
              </td>
              <td class="p-4 text-right space-x-2">
                <button @click="openModal(route)" class="text-blue-600 hover:text-blue-800 font-medium text-sm px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors">Editar</button>
                <button @click="deleteItem(route.id)" class="text-red-600 hover:text-red-800 font-medium text-sm px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Vista Móvil (Tarjetas) -->
        <div class="md:hidden flex flex-col">
          <div v-for="route in routesList" :key="'mob-'+route.id" class="p-4 border-b border-gray-100 last:border-b-0 hover:bg-slate-50 transition-colors">
            <div class="flex justify-between items-start mb-2">
              <div class="font-bold text-gray-800 text-lg flex items-center gap-2">
                <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: route.color }"></span>
                {{ route.name }}
              </div>
              <div class="flex gap-2">
                <button @click="openModal(route)" class="text-blue-600 hover:text-blue-800 font-medium text-sm px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">Editar</button>
                <button @click="deleteItem(route.id)" class="text-red-600 hover:text-red-800 font-medium text-sm px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">Eliminar</button>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-3 line-clamp-2">{{ route.description }}</p>
            <div class="flex gap-4 text-sm font-medium">
              <div class="flex items-center gap-1 text-gray-500">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                {{ route.duration }} min
              </div>
              <div class="flex items-center gap-1 text-gray-500">
                <span class="px-2 py-0.5 bg-gray-100 rounded text-xs font-bold text-gray-600">{{ route.difficulty }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        <div class="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 class="text-lg font-bold text-gray-800">{{ form.id ? 'Editar Ruta' : 'Nueva Ruta' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <div class="flex-1 flex flex-row relative overflow-hidden">
          <!-- Formulario Lado Izquierdo (o Bottom Sheet en móvil) -->
          <form @submit.prevent="saveItem" id="routeForm" 
            :class="[
              'bg-white z-10 md:static md:w-1/3 md:h-full md:border-r border-gray-100 flex flex-col transition-all duration-300',
              'absolute bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.15)] md:shadow-none md:rounded-none',
              isFormExpanded ? 'h-[75vh]' : 'h-[65px] md:h-full'
            ]"
          >
            <!-- Toggle Móvil -->
            <div class="md:hidden flex justify-center items-center h-[65px] shrink-0 border-b border-gray-100 cursor-pointer bg-white rounded-t-3xl hover:bg-gray-50" @click="isFormExpanded = !isFormExpanded">
              <div class="flex flex-col items-center text-green-700">
                <svg v-if="!isFormExpanded" class="w-6 h-6 animate-bounce mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
                <svg v-else class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                <span class="text-xs font-bold uppercase tracking-wider">{{ isFormExpanded ? 'Ocultar Formulario' : 'Llenar Datos de la Ruta' }}</span>
              </div>
            </div>

            <!-- Contenido del formulario -->
            <div class="p-4 md:p-6 space-y-4 overflow-y-auto flex-1">
            <div>
              <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Nombre</label>
              <input v-model="form.name" type="text" :class="['w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all transition-colors', errors.name ? 'border-red-500 bg-red-50 focus:ring-red-500' : '']">
              <p v-if="errors.name" class="text-xs text-red-500 mt-1 font-bold">{{ errors.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Descripción</label>
              <textarea v-model="form.description" rows="3" class="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all transition-colors"></textarea>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Duración (min)</label>
                <input v-model="form.duration" type="number" :class="['w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all transition-colors', errors.duration ? 'border-red-500 bg-red-50 focus:ring-red-500' : '']">
                <p v-if="errors.duration" class="text-xs text-red-500 mt-1 font-bold">{{ errors.duration }}</p>
              </div>
              <div class="flex-1">
                <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Dificultad</label>
                <select v-model="form.difficulty" class="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all bg-white transition-colors">
                  <option value="Fácil">Fácil (Amarillo)</option>
                  <option value="Media">Media (Naranja Claro)</option>
                  <option value="Difícil">Difícil (Naranja Oscuro)</option>
                  <option value="Experto">Experto (Rojo)</option>
                </select>
              </div>
            </div>
            </div>
          </form>

          <!-- Mapa Lado Derecho (Fondo en móvil) -->
          <div class="w-full md:w-2/3 h-full flex flex-col relative bg-slate-100 z-0 pb-[65px] md:pb-0">
            <div id="admin-route-map" class="w-full h-full z-10"></div>
            
            <!-- Controles Flotantes del Mapa -->
            <div class="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
              <button type="button" @click="undoLastPoint" :disabled="currentPath.length === 0" class="bg-white p-2.5 rounded-lg shadow-lg text-gray-700 hover:text-blue-600 disabled:opacity-50 transition-colors" title="Deshacer último punto">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path></svg>
              </button>
              <button type="button" @click="clearPath" :disabled="currentPath.length === 0" class="bg-white p-2.5 rounded-lg shadow-lg text-gray-700 hover:text-red-600 disabled:opacity-50 transition-colors" title="Limpiar ruta completa">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </div>
        </div>

        <div class="bg-slate-50 px-4 md:px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 relative z-20">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button type="button" @click="saveItem" :disabled="saving" class="bg-gray-900 hover:bg-black text-white font-medium py-2 px-6 rounded-xl shadow-sm transition-colors flex items-center">
            <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            Guardar Ruta
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { apiFetch } from '../../utils/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const isFormExpanded = ref(false)

const routesList = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)

const form = ref({
  id: null,
  name: '',
  description: '',
  duration: 60,
  difficulty: 'Fácil',
  color: '#eab308' // Default Amarillo for Fácil
})

const errors = ref({})

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

// Lista de puntos [lng, lat] para GeoJSON LineString
const currentPath = ref([])

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
  L.tileLayer('http://{s}.google.com/vt/lyrs=s&hl=es&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
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
    form.value = {
      id: item.id,
      name: item.name,
      description: item.description,
      duration: item.duration,
      difficulty: item.difficulty,
      color: item.color
    }
    // Cargar line string. GeoJSON es [lng, lat]
    currentPath.value = [...item.geometry.coordinates]
  } else {
    form.value = {
      id: null, name: '', description: '', duration: 60, difficulty: 'Fácil', color: '#eab308'
    }
    currentPath.value = []
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
  if (!form.value.duration || form.value.duration <= 0) {
    errors.value.duration = 'La duración debe ser mayor a 0'
  }

  if (Object.keys(errors.value).length > 0) {
    isFormExpanded.value = true
    return
  }

  if (currentPath.value.length < 2) {
    alert('Una ruta debe tener al menos 2 puntos dibujados en el mapa.')
    return
  }

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
    
    await apiFetch(url, {
      method,
      body: JSON.stringify(payload)
    })
    
    showModal.value = false
    loadData()
  } catch (err) {
    alert('Error al guardar')
  } finally {
    saving.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta ruta?')) return
  try {
    await apiFetch(`/api/routes/${id}`, { method: 'DELETE' })
    loadData()
  } catch (err) {
    alert('Error al eliminar')
  }
}

onMounted(() => {
  loadData()
})
</script>
