<template>
  <div class="space-y-6">
    <!-- Tarjetas KPI de Resumen -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Lugares</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ places.length }}</p>
        </div>
        <div class="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center text-lg">📍</div>
      </div>
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Hospedajes</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ places.filter(p => p.category === 'Hospedajes').length }}</p>
        </div>
        <div class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center text-lg">🏨</div>
      </div>
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Gastronomía y Café</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ places.filter(p => ['Restaurantes', 'CafeBar', 'Fuentes de soda'].includes(p.category)).length }}</p>
        </div>
        <div class="w-10 h-10 rounded-2xl bg-orange-50 text-orange-700 flex items-center justify-center text-lg">🍽️</div>
      </div>
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Atractivos y Puntos</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ places.filter(p => ['Lugares turísticos', 'Puntos de interés'].includes(p.category)).length }}</p>
        </div>
        <div class="w-10 h-10 rounded-2xl bg-pink-50 text-pink-700 flex items-center justify-center text-lg">📸</div>
      </div>
    </div>

    <!-- Header, Buscador y Acción Principal -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
      <div>
        <h3 class="text-lg font-extrabold text-emerald-950">Directorio de Lugares</h3>
        <p class="text-xs sm:text-sm text-slate-500">Administra hoteles, restaurantes, cafés y atractivos turísticos en el mapa.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar lugar o dirección..."
          class="px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-700 focus:bg-white text-emerald-950 font-medium"
        />
        <select
          v-model="categoryFilter"
          class="px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-700 text-emerald-950 font-bold"
        >
          <option value="all">Todas las categorías</option>
          <option value="Hospedajes">🏨 Hospedajes</option>
          <option value="Restaurantes">🍽️ Restaurantes</option>
          <option value="CafeBar">☕ CafeBar</option>
          <option value="Fuentes de soda">🥤 Fuentes de soda</option>
          <option value="Lugares turísticos">📸 Lugares turísticos</option>
          <option value="Puntos de interés">⭐ Puntos de interés</option>
        </select>
        <button 
          @click="openModal()" 
          type="button"
          class="bg-emerald-950 hover:bg-emerald-900 text-white font-extrabold py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
        >
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          <span>Nuevo Lugar</span>
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-x-auto">
      <div v-if="loading" class="p-8 text-center text-slate-500 font-medium">Cargando directorio...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-stone-50 border-b border-slate-200/80 text-slate-500 text-xs uppercase tracking-wider">
            <th class="p-4 font-extrabold">Lugar</th>
            <th class="p-4 font-extrabold hidden sm:table-cell">Categoría</th>
            <th class="p-4 font-extrabold hidden md:table-cell">Dirección</th>
            <th class="p-4 font-extrabold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="place in filteredPlaces" :key="place.place_id" class="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
            <td class="p-3.5">
              <div class="flex items-center gap-3">
                <img :src="place.image_url || '/logo.png'" class="w-11 h-11 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0" />
                <div>
                  <span class="font-extrabold text-emerald-950 block">{{ place.name }}</span>
                  <span class="block sm:hidden text-xs text-slate-500">{{ place.category }}</span>
                </div>
              </div>
            </td>
            <td class="p-4 hidden sm:table-cell">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                <span class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: getCategoryColor(place.category) }"></span>
                {{ place.category }}
              </span>
            </td>
            <td class="p-4 text-sm text-slate-600 hidden md:table-cell">{{ place.formatted_address }}</td>
            <td class="p-4 text-right space-x-2 whitespace-nowrap">
              <button @click="openModal(place)" type="button" class="text-emerald-800 hover:text-emerald-950 font-bold text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer">Editar</button>
              <button @click="deleteItem(place.place_id)" type="button" class="text-rose-600 hover:text-rose-800 font-bold text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer">Eliminar</button>
            </td>
          </tr>
          <tr v-if="filteredPlaces.length === 0">
            <td colspan="4" class="p-8 text-center text-slate-500 font-medium">No se encontraron lugares con este filtro.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden relative border border-slate-200">
        <div class="bg-stone-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
          <h3 class="text-lg font-extrabold text-emerald-950">{{ form.id ? 'Editar Lugar' : 'Nuevo Lugar' }}</h3>
          <button @click="closeModal" type="button" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form id="placeForm" @submit.prevent="saveItem" class="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col md:flex-row gap-6">
          <div class="flex-1 space-y-4">
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Nombre</label>
              <input v-model="form.name" type="text" required class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950 font-medium">
            </div>
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Dirección</label>
              <input v-model="form.formatted_address" type="text" required class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950">
            </div>
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Descripción</label>
              <textarea v-model="form.description" rows="3" required class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950"></textarea>
            </div>
            <div>
              <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Imagen (Sube una foto)</label>
              <div class="flex gap-2 items-center mb-2">
                <input type="file" @change="handleImageUpload" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-950 file:text-white hover:file:bg-emerald-900 outline-none cursor-pointer transition-all"/>
                <span v-if="uploadingImage" class="animate-spin h-5 w-5 border-2 border-emerald-900 border-t-transparent rounded-full shrink-0"></span>
              </div>
              <div v-if="imagePreview || form.image_url" class="mt-2 rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 max-h-36">
                <img :src="imagePreview || form.image_url" alt="Vista previa" class="w-full h-full object-cover" />
              </div>
            </div>
            <!-- Category Select -->
            <div class="flex flex-col gap-1">
              <label for="category" class="text-xs font-extrabold uppercase tracking-wider text-slate-600">Categoría</label>
              <select v-model="form.category" id="category" required class="p-2.5 border border-slate-300 rounded-xl bg-stone-50 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 focus:border-emerald-700 outline-none font-bold text-emerald-950">
                <option value="Hospedajes">🏨 Hospedajes</option>
                <option value="Restaurantes">🍽️ Restaurantes</option>
                <option value="CafeBar">☕ CafeBar</option>
                <option value="Fuentes de soda">🥤 Fuentes de soda</option>
                <option value="Lugares turísticos">📸 Lugares turísticos</option>
                <option value="Puntos de interés">⭐ Puntos de interés</option>
              </select>
            </div>
          </div>
        </form>

        <!-- Handle para abrir el mapa -->
        <div class="flex justify-center items-center h-[65px] shrink-0 border-t border-slate-200 cursor-pointer bg-stone-50 hover:bg-emerald-50/50 transition-colors" @click="showMapSheet = true">
          <div class="flex flex-col items-center" :class="form.lat ? 'text-emerald-700' : 'text-slate-500'">
            <svg v-if="!form.lat" class="w-6 h-6 animate-bounce mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path></svg>
            <svg v-else class="w-6 h-6 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            <span class="text-xs font-extrabold uppercase tracking-wider tabular-metrics">
              {{ form.lat ? `Ubicación Seleccionada (${Number(form.lat).toFixed(5)}, ${Number(form.lng).toFixed(5)}) ✓` : 'Abrir Mapa y Seleccionar Ubicación' }}
            </span>
          </div>
        </div>

        <!-- Bottom Sheet del Mapa -->
        <div class="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-transform duration-300 z-50 flex flex-col h-[82%]" :class="showMapSheet ? 'translate-y-0' : 'translate-y-full'">
          <div class="px-6 py-3.5 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-3xl shrink-0">
            <h4 class="font-extrabold text-emerald-950">Seleccionar Ubicación en el Mapa</h4>
            <button @click="showMapSheet = false" type="button" class="text-slate-400 hover:text-slate-600 cursor-pointer">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
          <div class="px-6 py-2 text-xs text-slate-600 bg-stone-50 flex items-center justify-between gap-2 shrink-0 border-b border-slate-200/70">
            <span>Haz clic en el mapa para marcar la coordenada exacta.</span>
            <span v-if="form.lat && form.lng" class="font-bold text-emerald-800 tabular-metrics">
              📍 {{ Number(form.lat).toFixed(5) }}, {{ Number(form.lng).toFixed(5) }}
            </span>
          </div>
          <div id="admin-map" class="flex-1 w-full bg-slate-100"></div>
          <div class="p-4 bg-white border-t border-slate-200 shrink-0">
            <button @click="showMapSheet = false" type="button" class="w-full bg-emerald-950 hover:bg-emerald-900 text-white font-extrabold py-3 rounded-xl shadow-sm transition-colors cursor-pointer text-sm">Confirmar Ubicación</button>
          </div>
        </div>

        <div class="bg-stone-50 px-5 md:px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shrink-0">
          <button type="button" @click="closeModal" class="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-sm">Cancelar</button>
          <button type="submit" form="placeForm" :disabled="saving" class="bg-emerald-950 hover:bg-emerald-900 text-white font-extrabold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center cursor-pointer text-sm">
            <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full mr-2"></span>
            Guardar
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
const imagePreview = ref('')
const searchQuery = ref('')
const categoryFilter = ref('all')

const filteredPlaces = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return places.value.filter(p => {
    const matchesCategory = categoryFilter.value === 'all' || p.category === categoryFilter.value
    const matchesQuery = !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.formatted_address && p.formatted_address.toLowerCase().includes(q))
    return matchesCategory && matchesQuery
  })
})

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

const revokeImagePreview = () => {
  if (imagePreview.value && imagePreview.value.startsWith('blob:')) {
    URL.revokeObjectURL(imagePreview.value)
  }
  imagePreview.value = ''
}

const resetForm = () => {
  revokeImagePreview()
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
  showMapSheet.value = false
  resetForm()
}

const showMapSheet = ref(false)

watch(showMapSheet, async (newVal) => {
  if (newVal) {
    await nextTick()
    if (map) {
      map.invalidateSize()
      setTimeout(() => {
        if (map) map.invalidateSize()
      }, 320)
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
    places.value = data.data || []
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
  L.tileLayer('/map-cache/{z}/{x}/{y}.jpg', {
    maxZoom: 20,
    maxNativeZoom: 19
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
  revokeImagePreview()
  showMapSheet.value = false
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
    
    const res = await apiFetch(url, {
      method,
      body: formData
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Error al guardar')
    }
    
    showModal.value = false
    showMapSheet.value = false
    resetForm()
    loadData()
  } catch (err) {
    alert(err.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return
  revokeImagePreview()
  form.value.image_file = file
  imagePreview.value = URL.createObjectURL(file)
}

const deleteItem = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este lugar?')) return
  try {
    const res = await apiFetch(`/api/places/${id}`, { method: 'DELETE' })
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
  revokeImagePreview()
  if (map) {
    map.remove()
    map = null
  }
})
</script>
