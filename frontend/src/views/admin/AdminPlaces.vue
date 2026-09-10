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
        class="bg-gray-900 hover:bg-black text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Nuevo Lugar
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
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
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative">
        <div class="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center shrink-0">
          <h3 class="text-lg font-bold text-gray-800">{{ form.id ? 'Editar Lugar' : 'Nuevo Lugar' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveItem" class="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
          <div class="flex-1 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Nombre</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Dirección</label>
              <input v-model="form.formatted_address" type="text" required class="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Descripción</label>
              <textarea v-model="form.description" rows="3" required class="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-500/10 rounded-xl outline-none transition-all"></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500 text-sm mb-1">Imagen (Sube una foto)</label>
              <div class="flex gap-2 items-center mb-2">
                <input type="file" @change="handleImageUpload" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-black outline-none cursor-pointer transition-all"/>
                <span v-if="uploadingImage" class="animate-spin h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full shrink-0"></span>
              </div>
            </div>
            <!-- Category Select -->
            <div class="flex flex-col gap-1">
              <label for="category" class="font-medium text-gray-500 text-sm">Categoría</label>
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

            <!-- Se eliminó el botón normal de ubicación de aquí, se movió abajo como un "handle" gigante -->
        </form>

        <!-- Handle gigante para abrir el mapa (similar a AdminRoutes) -->
        <div class="flex justify-center items-center h-[65px] shrink-0 border-t border-gray-100 cursor-pointer bg-slate-50 hover:bg-gray-100 transition-colors" @click="showMapSheet = true">
          <div class="flex flex-col items-center" :class="form.lat ? 'text-green-600' : 'text-gray-500'">
            <svg v-if="!form.lat" class="w-6 h-6 animate-bounce mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            <svg v-else class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span class="text-xs font-bold uppercase tracking-wider">{{ form.lat ? 'Ubicación Seleccionada (✓)' : 'Abrir Mapa y Seleccionar Ubicación' }}</span>
          </div>
        </div>

        <!-- Bottom Sheet del Mapa -->
        <div class="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transition-transform duration-300 z-50 flex flex-col h-[80%]" :class="showMapSheet ? 'translate-y-0' : 'translate-y-full'">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white rounded-t-2xl shrink-0">
            <h4 class="font-bold text-gray-800">Seleccionar Ubicación</h4>
            <button @click="showMapSheet = false" type="button" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="px-6 py-2 text-sm text-gray-500 bg-slate-50 text-center shrink-0">Haz clic en el mapa para marcar la ubicación.</div>
          <div id="admin-map" class="flex-1 w-full bg-slate-100"></div>
          <div class="p-4 bg-white border-t border-gray-100 shrink-0">
            <button @click="showMapSheet = false" type="button" class="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 rounded-xl shadow-sm transition-colors">Confirmar Ubicación</button>
          </div>
        </div>

        <div class="bg-slate-50 px-4 md:px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button type="button" @click="closeModal" class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
          <button @click="saveItem" type="button" :disabled="saving" class="bg-gray-900 hover:bg-black text-white font-medium py-2 px-6 rounded-xl shadow-sm transition-colors flex items-center">
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
const uploadingImage = ref(false)
const showModal = ref(false)

const form = ref({
  id: null,
  name: '',
  description: '',
  formatted_address: '',
  image_url: '',
  image_file: null,
  category: 'Lugares turísticos',
  lat: null,
  lng: null
})

const resetForm = () => {
  form.value = {
    id: null,
    name: '',
    description: '',
    formatted_address: '',
    image_url: '',
    image_file: null,
    category: 'Lugares turísticos',
    lat: null,
    lng: null
  }
}

const closeModal = () => {
  showModal.value = false
  resetForm()
}

const showMapSheet = ref(false)

watch(showMapSheet, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (map) {
      map.invalidateSize()
    }
  }
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
      description: item.description || '',
      formatted_address: item.formatted_address,
      image_url: item.image_url,
      image_file: null,
      category: item.category || 'Lugares turísticos',
      lat: item.location.lat,
      lng: item.location.lng
    }
  } else {
    form.value = {
      id: null,
      name: '',
      description: '',
      formatted_address: '',
      image_url: '',
      image_file: null,
      category: 'Lugares turísticos',
      lat: null,
      lng: null
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
  
  if (!form.value.image_file && !form.value.image_url) {
    alert('Por favor selecciona una imagen.')
    return
  }

  try {
    saving.value = true
    const url = form.value.id ? `/api/places/${form.value.id}` : '/api/places'
    const method = form.value.id ? 'PUT' : 'POST'
    
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('description', form.value.description)
    formData.append('formatted_address', form.value.formatted_address)
    formData.append('lat', form.value.lat)
    formData.append('lng', form.value.lng)
    formData.append('category', form.value.category)
    if (form.value.image_file) {
      formData.append('image', form.value.image_file)
    } else {
      formData.append('image_url', form.value.image_url)
    }
    
    await apiFetch(url, {
      method,
      body: formData // Eliminado el JSON.stringify
    })
    
    showModal.value = false
    resetForm()
    loadData()
  } catch (err) {
    alert('Error al guardar')
  } finally {
    saving.value = false
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  form.value.image_file = file
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
