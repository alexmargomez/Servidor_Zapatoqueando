<template>
  <div class="pt-32 px-6 min-h-screen max-w-7xl mx-auto flex flex-col pb-20">
    <div class="mb-8">
      <span class="text-yellow-500 font-bold tracking-widest uppercase text-sm mb-2 block">Directorio Comercial & Mapa</span>
      <h1 class="text-5xl md:text-7xl font-black text-green-950 mb-4 tracking-tighter">Lugares de Interés</h1>
      <p class="text-xl text-gray-500 max-w-2xl">Navega por el mapa interactivo y explora los mejores hospedajes, restaurantes y atracciones de Zapatoca.</p>
    </div>
    
    <!-- Contenedor Principal: Mapa + Lista -->
    <div class="flex flex-col lg:flex-row gap-8 flex-1">
      
      <!-- Lado Izquierdo: El Mapa -->
      <div class="w-full lg:w-2/3 h-[50vh] lg:h-[70vh] rounded-3xl overflow-hidden shadow-lg border-4 border-white relative bg-gray-200 flex flex-col items-center justify-center group">
        <!-- Espacio reservado para el mapa de OpenStreetMap (Leaflet) -->
        <div id="osm-map" class="absolute inset-0 w-full h-full z-10 bg-slate-100"></div>
      </div>

      <!-- Lado Derecho: Lista de Lugares -->
      <div class="w-full lg:w-1/3 flex flex-col h-[50vh] lg:h-[70vh] overflow-y-auto hide-scrollbar pr-2 pb-4">
        <h3 class="text-2xl font-black text-green-950 mb-6 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-10 border-b border-gray-100">Lugares Destacados</h3>
        
        <div v-if="loading" class="flex-1 flex flex-col items-center justify-center py-10">
          <div class="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        </div>

        <div v-else-if="error" class="p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
          <p class="text-red-500 font-bold">{{ error }}</p>
        </div>

        <div v-else class="flex flex-col gap-6">
          <!-- Tarjetas de Lugares (Formato Lista) -->
          <div v-for="place in places" :key="place.place_id" class="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100 flex flex-col sm:flex-row lg:flex-col xl:flex-row cursor-pointer">
            
            <div class="w-full sm:w-2/5 lg:w-full xl:w-2/5 h-40 sm:h-auto lg:h-40 xl:h-auto relative bg-gray-100 overflow-hidden shrink-0">
              <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10"></div>
              <img v-if="place.image_url" :src="place.image_url" :alt="place.name" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
                <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </div>
            </div>
            
            <div class="p-4 flex flex-col flex-1 justify-center">
              <h4 class="text-lg font-black text-green-950 leading-tight mb-1 group-hover:text-yellow-600 transition-colors">{{ place.name }}</h4>
              <div class="flex items-center text-xs font-bold text-gray-700 mb-2">
                <span class="text-yellow-500 mr-1 text-sm">★</span> {{ place.rating || 'N/A' }} 
                <span class="text-gray-400 font-medium ml-1">({{ place.user_ratings_total || 0 }})</span>
              </div>
              <p class="text-gray-500 text-xs flex items-start line-clamp-2">
                <svg class="w-3 h-3 mr-1 shrink-0 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                {{ place.formatted_address }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icons in Vite/Vue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const places = ref([])
const loading = ref(true)
const error = ref(null)
let map = null

const initMap = () => {
  if (map) {
    map.remove()
  }

  // Expandir los límites para abarcar rutas, caminatas, cuevas y cañones cercanos a Zapatoca
  const southWest = L.latLng(6.7000, -73.4000)
  const northEast = L.latLng(6.9000, -73.1500)
  const bounds = L.latLngBounds(southWest, northEast)

  // Inicializar mapa centrado exactamente en el Parque Principal de Zapatoca
  map = L.map('osm-map', {
    maxBounds: bounds,
    maxBoundsViscosity: 1.0,
    minZoom: 12, // Permitimos alejar más el zoom para ver grandes extensiones de senderos
    maxZoom: 18
  }).setView([6.816801, -73.268689], 15)

  // CAPA ÚNICA: Satélite Híbrido (Imágenes reales de satélite con nombres de lugares)
  L.tileLayer('http://mt0.google.com/vt/lyrs=y&hl=es&x={x}&y={y}&z={z}', {
    attribution: '&copy; Google Maps'
  }).addTo(map)

  setTimeout(() => {
    if (map) map.invalidateSize()
  }, 100)
}

const addMarkers = () => {
  if (!map) return
  
  places.value.forEach(place => {
    if (place.location && place.location.lat && place.location.lng) {
      const marker = L.marker([place.location.lat, place.location.lng]).addTo(map)
      
      // Popup estilizado
      const popupContent = `
        <div style="text-align: center; font-family: sans-serif;">
          <h4 style="margin: 0 0 5px 0; color: #052e16; font-weight: bold;">${place.name}</h4>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">★ ${place.rating}</p>
        </div>
      `
      marker.bindPopup(popupContent)
    }
  })
}

const focusPlace = (place) => {
  if (map && place.location && place.location.lat && place.location.lng) {
    map.flyTo([place.location.lat, place.location.lng], 17, {
      duration: 1.5
    })
  }
}

onMounted(async () => {
  try {
    const response = await fetch('/api/places')
    const data = await response.json()
    
    if (data.message === 'success') {
      places.value = data.data
      
      // Inicializar mapa después de que el DOM esté listo
      await nextTick()
      initMap()
      addMarkers()
    } else {
      error.value = 'No se pudieron cargar los lugares.'
    }
  } catch (err) {
    console.error('Error fetching places:', err)
    error.value = 'Error de conexión con el servidor.'
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
