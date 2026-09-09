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
        class="bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-5 rounded-lg shadow transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Nueva Ruta
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500 font-medium">Cargando...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-gray-100 text-gray-500 text-sm">
            <th class="p-4 font-bold">Nombre</th>
            <th class="p-4 font-bold hidden md:table-cell">Descripción</th>
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
            <td class="p-4 text-sm text-gray-600 hidden md:table-cell">{{ route.description }}</td>
            <td class="p-4 text-center">{{ route.duration }} min</td>
            <td class="p-4 text-center">{{ route.difficulty }}</td>
            <td class="p-4 text-right space-x-2">
              <button @click="openModal(route)" class="text-blue-600 hover:text-blue-800 font-medium text-sm px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors">Editar</button>
              <button @click="deleteItem(route.id)" class="text-red-600 hover:text-red-800 font-medium text-sm px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors">Eliminar</button>
            </td>
          </tr>
          <tr v-if="routesList.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">No hay rutas creadas aún.</td>
          </tr>
        </tbody>
      </table>
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
        
        <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
          <!-- Formulario Lado Izquierdo -->
          <form @submit.prevent="saveItem" id="routeForm" class="w-full md:w-1/3 overflow-y-auto p-6 space-y-4 border-r border-gray-100">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
              <input v-model="form.name" type="text" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
              <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"></textarea>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block text-sm font-bold text-gray-700 mb-1">Duración (min)</label>
                <input v-model="form.duration" type="number" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
              </div>
              <div class="flex-1">
                <label class="block text-sm font-bold text-gray-700 mb-1">Dificultad</label>
                <select v-model="form.difficulty" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
                  <option value="Fácil">Fácil</option>
                  <option value="Media">Media</option>
                  <option value="Difícil">Difícil</option>
                  <option value="Experto">Experto</option>
                </select>
              </div>
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Color de la Ruta (Hex)</label>
              <input v-model="form.color" type="color" required class="w-full h-10 px-1 py-1 border rounded-lg cursor-pointer">
            </div>

            <div class="pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-bold text-gray-700">Puntos de la Ruta ({{ currentPath.length }})</label>
                <button type="button" @click="undoLastPoint" :disabled="currentPath.length === 0" class="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded disabled:opacity-50">Deshacer Último</button>
              </div>
              <p class="text-xs text-gray-500 mb-2">Haz clic en el mapa de la derecha para dibujar la ruta punto a punto.</p>
              <button type="button" @click="clearPath" class="w-full text-xs bg-red-100 hover:bg-red-200 text-red-700 py-1.5 rounded font-bold transition-colors">
                Limpiar Ruta Completa
              </button>
            </div>
          </form>

          <!-- Mapa Lado Derecho -->
          <div class="w-full md:w-2/3 h-[400px] md:h-auto flex flex-col relative">
            <div id="admin-route-map" class="w-full h-full bg-slate-100"></div>
          </div>
        </div>

        <div class="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button type="submit" form="routeForm" :disabled="saving" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors flex items-center">
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
  color: '#22c55e'
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
    routesList.value = data.data.features.map(f => ({
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
      id: null, name: '', description: '', duration: 60, difficulty: 'Fácil', color: '#22c55e'
    }
    currentPath.value = []
  }
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
