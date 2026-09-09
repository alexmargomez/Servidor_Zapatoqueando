<template>
  <div class="space-y-6">
    <!-- Header y Acción Principal -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div>
        <h3 class="text-lg font-bold text-gray-800">Tus Lugares</h3>
        <p class="text-sm text-gray-500">Administra los lugares turísticos, hoteles y restaurantes.</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-5 rounded-lg shadow transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Nuevo Lugar
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500 font-medium">Cargando...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-gray-100 text-gray-500 text-sm">
            <th class="p-4 font-bold">Lugar</th>
            <th class="p-4 font-bold hidden md:table-cell">Dirección</th>
            <th class="p-4 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="place in places" :key="place.place_id" class="border-b border-gray-50 hover:bg-slate-50 transition-colors">
            <td class="p-3">
              <div class="flex items-center gap-3">
                <img :src="place.image_url || 'https://via.placeholder.com/40'" class="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                <div>
                  <span class="font-semibold text-gray-800">{{ place.name }}</span>
                  <span class="block text-xs text-gray-500">{{ place.category }}</span>
                </div>
              </div>
            </td>
            <td class="p-4 text-sm text-gray-600 hidden md:table-cell">{{ place.formatted_address }}</td>
            <td class="p-4 text-right space-x-2">
              <button @click="openModal(place)" class="text-blue-600 hover:text-blue-800 font-medium text-sm px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors">Editar</button>
              <button @click="deleteItem(place.place_id)" class="text-red-600 hover:text-red-800 font-medium text-sm px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors">Eliminar</button>
            </td>
          </tr>
          <tr v-if="places.length === 0">
            <td colspan="3" class="p-8 text-center text-gray-500">No hay lugares creados aún.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <div class="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 class="text-lg font-bold text-gray-800">{{ form.id ? 'Editar Lugar' : 'Nuevo Lugar' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveItem" class="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          <div class="flex-1 space-y-4">
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Nombre</label>
              <input v-model="form.name" type="text" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">Dirección</label>
              <input v-model="form.formatted_address" type="text" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <div>
              <label class="block text-sm font-bold text-gray-700 mb-1">URL de la Imagen</label>
              <input v-model="form.image_url" type="url" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            </div>
            <!-- Category Select -->
            <div class="flex flex-col gap-1">
              <label for="category" class="font-bold text-gray-700">Categoría</label>
              <select v-model="form.category" id="category" required class="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-400 focus:border-transparent">
                <option value="Hospedajes">🏨 Hospedajes</option>
                <option value="Restaurantes">🍽️ Restaurantes</option>
                <option value="CafeBar">☕ CafeBar</option>
                <option value="Fuentes de soda">🥤 Fuentes de soda</option>
                <option value="Lugares turísticos">📸 Lugares turísticos</option>
                <option value="Puntos de interés">📍 Puntos de interés</option>
              </select>
            </div>
          </div>

          <!-- Mapa Selector de Coordenadas -->
          <div class="flex-1 flex flex-col min-h-[300px]">
            <label class="block text-sm font-bold text-gray-700 mb-1">Ubicación (Haz clic en el mapa)</label>
            <div class="flex gap-2 mb-2">
              <input v-model="form.lat" type="number" step="any" placeholder="Latitud" required class="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm" readonly>
              <input v-model="form.lng" type="number" step="any" placeholder="Longitud" required class="w-full px-3 py-2 border rounded-lg bg-gray-50 outline-none text-sm" readonly>
            </div>
            <div id="admin-map" class="flex-1 w-full rounded-xl border border-gray-300 z-10 bg-slate-100"></div>
          </div>
        </form>

        <div class="bg-slate-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button @click="saveItem" type="button" :disabled="saving" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors flex items-center">
            <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
            Guardar
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

// Helper to create a minimal colored dot icon
const createMinimalDot = (colorHex) => {
  return L.divIcon({
    className: 'minimal-marker',
    html: `<div style="background-color: ${colorHex}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.4); cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.2)'" onmouseout="this.style.transform='scale(1)'"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'Hospedajes': return '#3b82f6'; // blue
    case 'Restaurantes': return '#f97316'; // orange
    case 'CafeBar': return '#8b5cf6'; // purple
    case 'Fuentes de soda': return '#06b6d4'; // cyan
    case 'Lugares turísticos': return '#ec4899'; // pink
    case 'Puntos de interés': return '#64748b'; // slate
    default: return '#eab308'; // yellow default
  }
}

const places = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)

const form = ref({
  id: null,
  name: '',
  formatted_address: '',
  image_url: '',
  category: 'Lugares turísticos',
  lat: null,
  lng: null
})

let map = null
let marker = null

const loadData = async () => {
  try {
    loading.value = true
    const res = await apiFetch('/api/places')
    const data = await res.json()
    places.value = data.data
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const initAdminMap = () => {
  if (map) map.remove()
  
  // Zapatoca Center
  const center = [6.8168, -73.2687]
  const mapCenter = form.value.lat ? [form.value.lat, form.value.lng] : center
  
  map = L.map('admin-map').setView(mapCenter, 15)
  L.tileLayer('http://{s}.google.com/vt/lyrs=s&hl=es&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20
  }).addTo(map)

  // Load existing places
  places.value.forEach(place => {
    if (place.location && place.location.lat && place.location.lng) {
      const markerColor = getCategoryColor(place.category)
      L.marker([place.location.lat, place.location.lng], { icon: createMinimalDot(markerColor) }).addTo(map)
    }
  })

  if (form.value.lat && form.value.lng) {
    const markerColor = getCategoryColor(form.value.category)
    marker = L.marker([form.value.lat, form.value.lng], { icon: createMinimalDot(markerColor) }).addTo(map)
  }

  map.on('click', (e) => {
    form.value.lat = e.latlng.lat
    form.value.lng = e.latlng.lng
    
    const markerColor = getCategoryColor(form.value.category)
    if (marker) {
      marker.setLatLng(e.latlng)
      marker.setIcon(createMinimalDot(markerColor))
    } else {
      marker = L.marker(e.latlng, { icon: createMinimalDot(markerColor) }).addTo(map)
    }
  })
}

const openModal = async (item = null) => {
  if (item) {
    form.value = {
      id: item.place_id,
      name: item.name,
      formatted_address: item.formatted_address,
      image_url: item.image_url,
      category: item.category || 'Lugares turísticos',
      lat: item.location.lat,
      lng: item.location.lng
    }
  } else {
    form.value = {
      id: null, name: '', formatted_address: '', image_url: '', 
      category: 'Lugares turísticos', lat: null, lng: null
    }
  }
  showModal.value = true
  
  await nextTick()
  initAdminMap()
}

const saveItem = async () => {
  if (!form.value.lat || !form.value.lng) {
    alert('Por favor selecciona una ubicación en el mapa.')
    return
  }
  try {
    saving.value = true
    const url = form.value.id ? `/api/places/${form.value.id}` : '/api/places'
    const method = form.value.id ? 'PUT' : 'POST'
    
    await apiFetch(url, {
      method,
      body: JSON.stringify(form.value)
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
  if (!confirm('¿Estás seguro de eliminar este lugar?')) return
  try {
    await apiFetch(`/api/places/${id}`, { method: 'DELETE' })
    loadData()
  } catch (err) {
    alert('Error al eliminar')
  }
}

onMounted(() => {
  loadData()
})
</script>
