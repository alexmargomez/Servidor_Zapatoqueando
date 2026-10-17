<template>
  <div class="relative w-full h-screen overflow-hidden bg-slate-100">
    <!-- El Mapa (Protagonista 100% Pantalla) -->
    <div id="osm-map" class="absolute inset-0 w-full h-full z-0" @click="isSearchFocused = false"></div>
    
    <!-- Buscador Flotante Estilo Plataforma (Search / Filtros) -->
    <div class="absolute top-24 md:top-28 left-4 right-4 md:left-8 md:right-auto md:w-[420px] z-[1000] pointer-events-none flex flex-col gap-2.5">
      
      <!-- Input de Búsqueda Principal -->
      <div class="relative pointer-events-auto">
        <div class="bg-white rounded-full shadow-xl border border-gray-100 flex items-center px-4 py-2.5 transition-transform focus-within:ring-2 ring-yellow-400">
          <svg class="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            ref="searchInputRef"
            v-model="searchQuery" 
            @focus="isSearchFocused = true"
            @input="onSearchInput"
            type="text" 
            placeholder="¿Qué buscas en Zapatoca?" 
            class="bg-transparent border-none outline-none w-full text-gray-700 font-semibold placeholder-gray-400 text-sm md:text-base" 
          />
          <button 
            v-if="searchQuery || activeCategories.length > 0" 
            @click="clearFilters" 
            type="button"
            title="Limpiar filtros"
            class="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0 mr-1"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <button 
            @click="showCategoryChips = !showCategoryChips" 
            type="button"
            :title="showCategoryChips ? 'Ocultar categorías' : 'Mostrar categorías'"
            :class="[
              'rounded-full p-2 transition-colors shrink-0 ml-1 shadow-sm cursor-pointer',
              activeCategories.length > 0 ? 'bg-yellow-400 text-green-950 hover:bg-yellow-300' : 'bg-green-900 text-white hover:bg-green-800'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
          </button>
        </div>

        <!-- Dropdown de Resultados de Búsqueda -->
        <div 
          v-if="isSearchFocused && searchQuery.trim().length > 0" 
          class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-100 max-h-72 overflow-y-auto z-50 divide-y divide-gray-50"
        >
          <div v-if="searchResults.length === 0" class="p-4 text-center text-sm text-gray-500">
            No se encontraron lugares para "<span class="font-bold text-gray-700">{{ searchQuery }}</span>"
          </div>
          <button 
            v-for="place in searchResults" 
            :key="place.place_id"
            type="button"
            @click="selectSearchResult(place)"
            class="w-full px-4 py-3 text-left hover:bg-green-50/70 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <img :src="place.image_url || '/logo.png'" :alt="place.name" class="w-10 h-10 rounded-xl object-cover shrink-0 bg-gray-100 border border-gray-200" />
            <div class="min-w-0 flex-1">
              <div class="font-bold text-sm text-green-950 truncate">{{ place.name }}</div>
              <div class="text-xs text-gray-500 truncate flex items-center gap-1.5">
                <span class="inline-block w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(place.category) }"></span>
                <span>{{ place.category || 'Lugar' }}</span>
                <span v-if="place.formatted_address" class="text-gray-400">· {{ place.formatted_address }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Chips de Filtros Rápidos (flex-wrap para que ninguno quede cortado) -->
      <div v-show="showCategoryChips" class="flex flex-wrap items-center gap-2 pointer-events-auto pb-1 px-1">
        <button v-for="cat in categories" :key="cat.name" @click="toggleCategory(cat.name)"
          :class="[
            'px-3.5 py-1.5 rounded-full shadow-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border',
            activeCategories.includes(cat.name) 
              ? 'bg-green-600 text-white border-green-700 scale-105' 
              : 'bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-gray-50 border-gray-100'
          ]">
          <span>{{ cat.icon }}</span>
          <span>{{ cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Slider Flotante de Publicidad (Posters) -->
    <transition name="slide-up">
      <div v-show="route.path !== '/rutas' && (loading || error || posters.length > 0)" class="absolute bottom-0 left-0 w-full z-[1000] pointer-events-none pb-6 md:pb-8">
      
        <!-- Fondo oscuro opcional para resaltar las tarjetas -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10 pointer-events-none h-64 bottom-0 top-auto"></div>
        
        <div class="w-full pointer-events-auto">
          <div v-if="loading" class="flex justify-center py-10">
            <div class="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else-if="error" class="p-4 mx-4 bg-red-50 rounded-xl text-center">
            <p class="text-red-500 font-bold">{{ error }}</p>
          </div>

          <div v-else-if="posters.length > 0" class="relative w-full flex flex-col items-center justify-end pointer-events-none">
            <!-- Contenedor del Slider -->
            <div class="relative w-full overflow-hidden py-4 pointer-events-auto" @mouseenter="isHoveringSlider = true" @mouseleave="isHoveringSlider = false">
            
              <!-- Botón Alternar Vista Centrado -->
              <div class="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
                <button @click="isSliderCompact = !isSliderCompact" class="bg-black/40 backdrop-blur-md text-white/90 py-1.5 px-5 rounded-full hover:bg-black/60 transition-colors shadow flex items-center gap-2 text-xs font-medium cursor-pointer" title="Cambiar tamaño">
                  {{ isSliderCompact ? 'Ampliar' : 'Reducir' }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="isSliderCompact" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <!-- Marquee Container -->
              <div class="flex mt-3 overflow-hidden">
                <div class="marquee-content flex" :class="{ 'paused': isHoveringSlider }">
                  <!-- Mitad 1 -->
                  <div class="flex gap-6 pr-6 shrink-0">
                    <div v-for="(poster, idx) in repeatedPosters" :key="'m1-'+idx+'-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                         class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 border border-white/40 cursor-pointer group hover:-translate-y-2 relative"
                         :class="isSliderCompact ? 'w-36 md:w-48' : 'w-72 md:w-[420px]'">
                      <img :src="getPosterImage(poster)" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p class="text-white font-bold text-xs md:text-sm truncate">{{ poster.title }}</p>
                      </div>
                    </div>
                  </div>
                  <!-- Mitad 2 (Idéntica para loop infinito perfecto al -50%) -->
                  <div class="flex gap-6 pr-6 shrink-0">
                    <div v-for="(poster, idx) in repeatedPosters" :key="'m2-'+idx+'-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                         class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 border border-white/40 cursor-pointer group hover:-translate-y-2 relative"
                         :class="isSliderCompact ? 'w-36 md:w-48' : 'w-72 md:w-[420px]'">
                      <img :src="getPosterImage(poster)" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <p class="text-white font-bold text-xs md:text-sm truncate">{{ poster.title }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Panel Lateral Derecho (Detalles del Cartel / Publicidad) -->
    <transition name="slide-fade">
      <div v-if="selectedPoster" class="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col border-l border-gray-100">
        <!-- Botón Cerrar -->
        <button @click="selectedPoster = null" class="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-black/70 transition-colors z-10 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Imagen Destacada del Cartel -->
        <div class="w-full aspect-video relative shrink-0 bg-slate-100 border-b border-gray-200">
          <img :src="getPosterImage(selectedPoster)" :alt="selectedPoster.title" class="w-full h-full object-cover" />
        </div>

        <!-- Contenido Detallado -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar bg-slate-50">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider" :class="selectedPoster.type === 'event' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'">
              {{ selectedPoster.type === 'event' ? 'Evento' : 'Destacado' }}
            </span>
          </div>
          <h2 class="text-2xl font-black text-green-950 leading-tight">{{ selectedPoster.title }}</h2>
          
          <!-- Descripción -->
          <div>
            <p class="text-gray-600 leading-relaxed text-sm text-justify whitespace-pre-wrap">
              {{ selectedPoster.description || 'Descubre más sobre esta experiencia en Zapatoca.' }}
            </p>
          </div>

          <!-- Botones de Acción (WhatsApp y Cómo llegar) -->
          <div class="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
            <button 
              @click="openPosterDirections(selectedPoster)" 
              type="button"
              class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-green-950 font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              ¿Cómo llegar?
            </button>
            
            <a 
              :href="getWhatsAppUrl(selectedPoster.title)" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2"
            >
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.012c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </transition>

    <!-- Panel Lateral Derecho (Detalles del Lugar del Mapa) -->
    <transition name="slide-fade">
      <div v-if="selectedPlace" class="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col border-l border-gray-100">
        <!-- Botón Cerrar -->
        <button @click="selectedPlace = null" class="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-black/70 transition-colors z-10 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Imagen Destacada del Lugar -->
        <div class="w-full aspect-video relative shrink-0 bg-slate-100 border-b border-gray-200">
          <img :src="selectedPlace.image_url || '/logo.png'" :alt="selectedPlace.name" class="w-full h-full object-cover" />
        </div>

        <!-- Contenido Detallado -->
        <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar bg-slate-50">
          <div v-if="selectedPlace.category" class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-xs font-bold text-white" :style="{ backgroundColor: getCategoryColor(selectedPlace.category) }">
              {{ selectedPlace.category }}
            </span>
          </div>

          <h2 class="text-2xl font-black text-green-950 leading-tight">{{ selectedPlace.name }}</h2>

          <p v-if="selectedPlace.formatted_address" class="text-gray-600 text-sm flex items-start">
            <svg class="w-4 h-4 mr-2 shrink-0 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            {{ selectedPlace.formatted_address }}
          </p>

          <div v-if="selectedPlace.description" class="mt-2">
            <p class="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{{ selectedPlace.description }}</p>
          </div>

          <!-- Botones de Acción -->
          <div class="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
            <button 
              @click="openDirections(selectedPlace)" 
              type="button"
              class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-green-950 font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2 cursor-pointer"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              ¿Cómo llegar?
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Portal para Modales y Paneles Flotantes (Eventos, Rutas, Descargar) -->
    <router-view v-slot="{ Component }">
      <transition name="slide-up" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount, watch } from 'vue'
import { useRoute } from 'vue-router'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

let routesLayer = null;
let streetsLayer = null;
let markersLayer = null;
let sliderInterval = null;
let zapatocaMarker = null;
let laFuenteMarker = null;

let currentSelectedRouteId = null;
let currentSelectedRouteName = null; // Guardar ruta activa

// El plugin leaflet-textpath requiere que L esté en window
window.L = L
import 'leaflet-textpath'

// Fix for default marker icons in Vite/Vue
// Using a minimalist modern design instead of default markers
delete L.Icon.Default.prototype._getIconUrl;

// Helper to create a minimal colored dot icon
const createMinimalDot = (colorHex) => {
  return L.divIcon({
    className: 'minimal-marker',
    html: `<svg viewBox="0 0 24 24" width="20" height="20" style="filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.5)); transform-origin: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><circle cx="12" cy="12" r="10" fill="${colorHex}" stroke="white" stroke-width="2"/></svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11]
  });
};

const places = ref([])
const posters = ref([])
const loading = ref(true)
const error = ref(null)
const selectedPlace = ref(null)
const selectedPoster = ref(null)
const route = useRoute()
const isHoveringSlider = ref(false)
const isSliderCompact = ref(false)
const searchQuery = ref('')
const isSearchFocused = ref(false)
const showCategoryChips = ref(true)
const searchInputRef = ref(null)
let map = null

// Repetir posters para que cada mitad del marquee cubra pantallas grandes sin espacios vacíos
const repeatedPosters = computed(() => {
  if (!posters.value || posters.value.length === 0) return []
  const list = posters.value
  const minItems = 6
  const repeats = Math.max(2, Math.ceil(minItems / list.length))
  const result = []
  for (let i = 0; i < repeats; i++) {
    result.push(...list)
  }
  return result
})

const getPosterImage = (poster) => {
  return poster?.imageurl || poster?.image_url || '/hero-bg.jpeg'
}

const getWhatsAppUrl = (title) => {
  const text = `Hola, vengo desde la App Zapatoqueando y quiero más información${title ? ' sobre: ' + title : ''}`
  return `https://wa.me/573000000000?text=${encodeURIComponent(text)}`
}

const openDirections = (place) => {
  if (!place) return
  focusPlace(place)
  if (place.location && place.location.lat && place.location.lng) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${place.location.lat},${place.location.lng}`, '_blank', 'noopener')
  }
}

const openPosterDirections = (poster) => {
  if (!poster) return
  const query = encodeURIComponent(`${poster.title || ''} Zapatoca Santander`)
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener')
}

// Resultados filtrados para el autocompletado del buscador
const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return places.value.filter(p => {
    const matchName = p.name && p.name.toLowerCase().includes(q)
    const matchCat = p.category && p.category.toLowerCase().includes(q)
    const matchAddr = p.formatted_address && p.formatted_address.toLowerCase().includes(q)
    const matchDesc = p.description && p.description.toLowerCase().includes(q)
    return matchName || matchCat || matchAddr || matchDesc
  }).slice(0, 8)
})

const onSearchInput = () => {
  isSearchFocused.value = true
  updateMarkers()
  syncMarkersVisibility()
}

const selectSearchResult = (place) => {
  isSearchFocused.value = false
  selectedPlace.value = place
  selectedPoster.value = null
  focusPlace(place)
}

const clearFilters = () => {
  searchQuery.value = ''
  activeCategories.value = []
  isSearchFocused.value = false
  updateMarkers()
  syncMarkersVisibility()
}

// Al navegar entre subrutas (/eventos, /rutas, /descargar), cerrar paneles laterales abiertos
watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== '/') {
    selectedPlace.value = null
    selectedPoster.value = null
    isSearchFocused.value = false
  }
  if (oldPath === '/rutas' && newPath !== '/rutas') {
    isSliderCompact.value = true
  }
})

const activeCategories = ref([])
const categories = [
  { name: 'Hospedajes', icon: '🏨', color: '#3b82f6' },
  { name: 'Restaurantes', icon: '🍽️', color: '#f97316' },
  { name: 'CafeBar', icon: '☕', color: '#8b5cf6' },
  { name: 'Fuentes de soda', icon: '🥤', color: '#06b6d4' },
  { name: 'Lugares turísticos', icon: '📸', color: '#ec4899' },
  { name: 'Puntos de interés', icon: '⭐', color: '#64748b' }
]

const hasActiveFilter = computed(() => {
  return activeCategories.value.length > 0 || searchQuery.value.trim().length > 0
})

const syncMarkersVisibility = () => {
  if (!map || !markersLayer) return
  const zoom = map.getZoom()
  if (zoom >= 16 || hasActiveFilter.value) {
    if (!map.hasLayer(markersLayer)) map.addLayer(markersLayer)
    if (zapatocaMarker && map.hasLayer(zapatocaMarker)) map.removeLayer(zapatocaMarker)
    if (laFuenteMarker && map.hasLayer(laFuenteMarker)) map.removeLayer(laFuenteMarker)
  } else {
    if (map.hasLayer(markersLayer)) map.removeLayer(markersLayer)
    if (zapatocaMarker && !map.hasLayer(zapatocaMarker)) zapatocaMarker.addTo(map)
    if (laFuenteMarker && !map.hasLayer(laFuenteMarker)) laFuenteMarker.addTo(map)
  }
}

const toggleCategory = (category) => {
  const index = activeCategories.value.indexOf(category)
  if (index === -1) {
    activeCategories.value.push(category)
  } else {
    activeCategories.value.splice(index, 1)
  }
  updateMarkers() // Redibujar marcadores
  syncMarkersVisibility()
  if (activeCategories.value.length > 0 && map && map.getZoom() < 16) {
    map.setView([6.816801, -73.268689], 16, { animate: true, duration: 0.8 })
  }
}

const getCategoryColor = (category) => {
  const cat = categories.find(c => c.name === category)
  return cat ? cat.color : '#eab308'
}

window.openPlaceSidebar = (placeId) => {
  const found = places.value.find(p => String(p.place_id) === String(placeId))
  if (found) {
    selectedPlace.value = found
    selectedPoster.value = null
    // Centrar suavemente el mapa sin modificar el nivel de zoom actual
    if (map && found.location) {
      map.panTo([found.location.lat, found.location.lng], { animate: true, duration: 1 })
    }
  }
}

// Función para actualizar y dibujar los marcadores
const updateMarkers = () => {
  if (markersLayer) {
    markersLayer.clearLayers()
  }

  const q = searchQuery.value.trim().toLowerCase()

  const filteredPlaces = places.value.filter(p => {
    const matchesCategory = activeCategories.value.length === 0 || activeCategories.value.includes(p.category)
    const matchesQuery = !q || (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.formatted_address && p.formatted_address.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
    return matchesCategory && matchesQuery
  })

  // Agregar marcadores
  filteredPlaces.forEach(place => {
    if (place.location && place.location.lat && place.location.lng) {
      const markerColor = getCategoryColor(place.category)
      const marker = L.marker([place.location.lat, place.location.lng], { icon: createMinimalDot(markerColor) }).addTo(markersLayer)

      // Mini-modal (Popup) minimalista estilo cápsula (sin 'X')
      const popupContent = `
        <div onclick="window.openPlaceSidebar('${place.place_id}')" class="flex items-center gap-3 pr-3 cursor-pointer">
          <div class="w-10 h-10 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100">
            <img src="${place.image_url || '/logo.png'}" alt="${place.name}" class="w-full h-full object-cover" />
          </div>
          <span class="font-bold text-gray-800 text-sm whitespace-nowrap">${place.name}</span>
        </div>
      `
      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-minimal-popup',
        offset: [0, -5]
      })

      // Abrir popup al pasar el cursor (hover)
      marker.on('mouseover', function () {
        this.openPopup()
      })
      // Cerrar popup al quitar el cursor
      marker.on('mouseout', function () {
        this.closePopup()
      })
      // Abrir sidebar al hacer clic en el marcador
      marker.on('click', () => {
        window.openPlaceSidebar(place.place_id)
      })
    }
  })
}

// Inicializar y Centrar Mapa (Versión Moderna Sin Textos y Sin Iconos default)
const initMap = () => {
  if (map) {
    map.remove()
  }

  // Límites de movimiento (maxBounds) restaurados pero muy amplios para evitar que se pierdan en el mundo
  const bounds = L.latLngBounds(
    [6.50, -73.60], // Suroeste (mucho margen hacia abajo y la izquierda)
    [7.10, -72.90]  // Noreste (mucho margen hacia arriba y la derecha)
  )

  // PARCHE MANUAL: Forzar a Leaflet a cargar tiles fuera del viewport real
  if (!L.GridLayer.prototype._patchedEdgeBuffer) {
    const originalGetBounds = L.GridLayer.prototype._getTiledPixelBounds
    L.GridLayer.include({
      _patchedEdgeBuffer: true,
      _getTiledPixelBounds: function(center, zoom, tileZoom) {
        let pixelBounds = originalGetBounds.call(this, center, zoom, tileZoom)
        const edgeBufferTiles = this.options.edgeBufferTiles || 0
        if (edgeBufferTiles > 0) {
          const pixelEdgeBuffer = this.getTileSize().multiplyBy(edgeBufferTiles)
          pixelBounds = new L.Bounds(
            pixelBounds.min.subtract(pixelEdgeBuffer),
            pixelBounds.max.add(pixelEdgeBuffer)
          )
        }
        return pixelBounds
      }
    })
  }

  // Inicializar mapa centrado en Zapatoca
  map = L.map('osm-map', {
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 0.8,
    minZoom: 10,
    maxZoom: 22,
    fadeAnimation: false, // Evita el efecto de "cuadro blanco que se pinta"
    zoomAnimation: true,
    markerZoomAnimation: true
  }).setView([6.816801, -73.268689], 15)

  // Añadir controles de zoom en la parte superior derecha
  L.control.zoom({
    position: 'topright'
  }).addTo(map)

  // Capa Base del Mapa: Usamos nuestro servidor local con Precarga Activa real
  L.tileLayer('/map-cache/{z}/{x}/{y}.jpg', {
    maxZoom: 22,
    maxNativeZoom: 19,
    attribution: ' Zapatoqueando Map Cache',
    keepBuffer: 10, 
    edgeBufferTiles: 2, // PRECARGA REAL: Carga 2 imágenes invisibles por cada lado (balance perfecto)
    updateWhenIdle: false, 
    updateWhenZooming: false 
  }).addTo(map)

  // Capa para marcadores (NO se añade al mapa de inmediato si el zoom es lejano)
  markersLayer = L.featureGroup()
  if (map.getZoom() >= 16 || hasActiveFilter.value) {
    markersLayer.addTo(map)
  }

  // Marcador principal de Zapatoca para el zoom lejano (Punto pequeño con texto discreto)
  const customIcon = L.divIcon({
    className: 'zapatoca-main-marker',
    html: `<div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
             <div style="font-size: 28px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">📍</div>
             <div style="background-color: rgba(255,255,255,0.95); color: #052e16; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 2px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">Zapatoca</div>
           </div>`,
    iconSize: [80, 60], 
    iconAnchor: [40, 30] // Ajustado para centrar el icono y texto
  })
  zapatocaMarker = L.marker([6.816801, -73.268689], { icon: customIcon })
  
  zapatocaMarker.on('click', () => {
    map.setView([6.816801, -73.268689], 16, { animate: true, duration: 1 })
  })

  // Marcador principal de La Fuente para el zoom lejano (Punto pequeño con texto discreto)
  const laFuenteIcon = L.divIcon({
    className: 'la-fuente-main-marker',
    html: `<div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
             <div style="font-size: 28px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">📍</div>
             <div style="background-color: rgba(255,255,255,0.95); color: #064e3b; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 2px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">La Fuente</div>
           </div>`,
    iconSize: [80, 60],
    iconAnchor: [40, 30] // Ajustado para centrar el icono y texto
  })
  laFuenteMarker = L.marker([6.7075, -73.2804], { icon: laFuenteIcon })
  
  // Al hacer clic en el marcador general, hacer zoom hacia La Fuente
  laFuenteMarker.on('click', () => {
    map.setView([6.7075, -73.2804], 16, { animate: true, duration: 1 })
  })

  if (map.getZoom() < 16 && !hasActiveFilter.value) {
    zapatocaMarker.addTo(map)
    laFuenteMarker.addTo(map)
  }

  // Evento para ocultar textos de las calles al alejar el zoom y adelgazar las vías
  map.on('zoomend', () => {
    const zoom = map.getZoom()
    const mapContainer = document.getElementById('osm-map')
    
    // Adelgazar dinámicamente las vías al alejar
    if (streetsLayer) {
      streetsLayer.eachLayer(layer => {
        layer.setStyle({
          weight: zoom >= 17 ? 4 : (zoom >= 15 ? 2 : 1)
        })
      })
    }
    
    if (routesLayer) {
      routesLayer.eachLayer((layer) => {
        const props = layer.feature?.properties || {}
        const isSelected = (currentSelectedRouteId && props.id === currentSelectedRouteId) ||
                           (currentSelectedRouteName && props.name === currentSelectedRouteName)
        if (isSelected) {
          layer.setStyle({
            weight: zoom >= 17 ? 6 : 4
          })
        }
      })
    }
    
    // Transición entre marcador general y marcadores detallados
    syncMarkersVisibility()

    if (mapContainer) {
      if (zoom < 16) {
        mapContainer.classList.add('map-zoomed-out')
      } else {
        mapContainer.classList.remove('map-zoomed-out')
      }
    }
  })

  setTimeout(() => {
    if (map) map.invalidateSize()
  }, 100)
}

const addMarkers = () => {
  if (!map || !markersLayer) return

  // Llamar la funcion que dibuja los marcadores
  updateMarkers()
}

const focusPlace = (place) => {
  if (map && place.location && place.location.lat && place.location.lng) {
    map.flyTo([place.location.lat, place.location.lng], 17, {
      duration: 1.5
    })
  }
}

const loadStreets = async () => {
  if (!map) return;
  try {
    const response = await fetch('/api/streets');
    const data = await response.json();

    if (data.type === 'FeatureCollection' && data.features.length > 0) {
      streetsLayer = L.geoJSON(data, {
        style: function (feature) {
          const currentZoom = map ? map.getZoom() : 17;
          return {
            color: '#e5e7eb', // gray-200 for a thin clear street line
            weight: currentZoom >= 17 ? 4 : (currentZoom >= 15 ? 2 : 1),
            opacity: 0.7
          };
        }
      }).addTo(map);

      // Aplicar texto a las líneas una vez que ya están en el mapa (requisito de leaflet-textpath)
      streetsLayer.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
          
          // Lógica para evitar textos al revés: revertir las coordenadas si van de derecha a izquierda o de arriba a abajo
          if (typeof layer.getLatLngs === 'function') {
            let latlngs = layer.getLatLngs();
            const reverseSegment = (pts) => {
              if (pts.length > 0 && pts[0].lat !== undefined) {
                const start = pts[0];
                const end = pts[pts.length - 1];
                // Si va de Este a Oeste, o Norte a Sur verticalmente, revertimos la línea
                if (start.lng > end.lng || (start.lng === end.lng && start.lat > end.lat)) {
                  pts.reverse();
                }
              }
            };
            if (latlngs.length > 0) {
              if (latlngs[0].lat !== undefined) {
                reverseSegment(latlngs);
              } else {
                latlngs.forEach(segment => reverseSegment(segment));
              }
              layer.setLatLngs(latlngs);
            }
          }

          if (typeof layer.setText === 'function') {
            layer.setText(layer.feature.properties.name, {
              center: true,
              offset: 3, // Offset positivo baja el texto para que quede dentro del centro de la línea
              attributes: {
                class: 'street-svg-text'
              }
            });
          }
        }
      });
      
      // Aplicar estado de zoom inicial
      const mapEl = document.getElementById('osm-map');
      if (map && mapEl && map.getZoom() < 16) {
        mapEl.classList.add('map-zoomed-out');
      }
    }
  } catch (err) {
    console.error('Error fetching streets:', err);
  }
}

const loadRoutes = async () => {
  if (!map) return;
  try {
    const response = await fetch('/api/routes');
    const data = await response.json();
    
    if (map && data.type === 'FeatureCollection' && data.features.length > 0) {
      routesLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            color: feature?.properties?.color || '#fbbf24',
            weight: 4,
            opacity: 0, // Ocultas por defecto
            dashArray: 'none',
            className: ''
          };
        }
      }).addTo(map);
    }
  } catch (err) {
    console.error('Error fetching routes:', err);
  }
}

const loadBoundary = async () => {
  if (!map) return;
  try {
    const response = await fetch('/zapatoca_boundary.geojson');
    if (!response.ok) throw new Error('No boundary data found');
    const data = await response.json();

    if (map && data.type === 'FeatureCollection' && data.features.length > 0) {
      L.geoJSON(data, {
        filter: function(feature) {
          // No renderizar los "Point" del geojson (que son los que generan el punto azul no deseado)
          return feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint';
        },
        style: function (feature) {
          return {
            color: '#3b82f6', // blue-500
            weight: 4,
            opacity: 0.6,
            fillColor: '#3b82f6',
            fillOpacity: 0.05 // Sombreado azul muy sutil
          };
        }
      }).addTo(map);
    }
  } catch (err) {
    console.error('Error fetching boundary:', err);
  }
}

onMounted(async () => {
  await nextTick()
  initMap()

  try {
    // Cargar Posters y Lugares en paralelo
    const [postersResponse, placesResponse] = await Promise.all([
      fetch('/api/posters').catch(() => null),
      fetch('/api/places').catch(() => null)
    ])

    if (postersResponse && postersResponse.ok) {
      const postersData = await postersResponse.json()
      if (postersData.message === 'success' && Array.isArray(postersData.data)) {
        posters.value = postersData.data
      }
    }

    if (placesResponse && placesResponse.ok) {
      const data = await placesResponse.json()
      if (data.message === 'success' && Array.isArray(data.data)) {
        places.value = data.data
        if (places.value.length > 0) {
          addMarkers(places.value)
        }
      }
    }

    // Cargar capas del mapa
    await Promise.all([
      loadStreets(),
      loadRoutes(),
      loadBoundary()
    ])
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Error de conexión con el servidor.'
  } finally {
    loading.value = false
  }
  
  // Escuchar eventos de selección de rutas desde el panel lateral
  window.addEventListener('route-selected', handleRouteSelected)
  window.addEventListener('route-unselected', handleRouteUnselected)
})

const handleRouteSelected = (e) => {
  const selectedRoute = e.detail
  if (!selectedRoute) return
  currentSelectedRouteId = selectedRoute.id || selectedRoute.route_id || null
  currentSelectedRouteName = selectedRoute.name || null
  if (!map || !routesLayer) return
  
  routesLayer.eachLayer((layer) => {
    const props = layer.feature?.properties || {}
    const isMatch = (currentSelectedRouteId && props.id === currentSelectedRouteId) ||
                    (currentSelectedRouteName && props.name === currentSelectedRouteName)
    if (isMatch) {
      // Mostrar y resaltar SÓLO la ruta seleccionada con su color configurado
      layer.setStyle({
        color: props.color || '#facc15',
        weight: map.getZoom() >= 17 ? 6 : 5,
        opacity: 1,
        dashArray: 'none',
        className: ''
      })
      // Hacer zoom a los límites de esta ruta
      if (typeof layer.getBounds === 'function') {
        map.fitBounds(layer.getBounds(), { padding: [60, 60], duration: 1.5 })
      }
    } else {
      // Mantener invisibles las demás rutas
      layer.setStyle({
        opacity: 0
      })
    }
  })
}

const handleRouteUnselected = () => {
  currentSelectedRouteId = null
  currentSelectedRouteName = null
  if (!map || !routesLayer) return
  // Ocultar de nuevo todas las rutas
  routesLayer.eachLayer((layer) => {
    layer.setStyle({
      opacity: 0 // Volver a ocultar todas
    })
  })
}

onBeforeUnmount(() => {
  window.removeEventListener('route-selected', handleRouteSelected)
  window.removeEventListener('route-unselected', handleRouteUnselected)
  if (map) {
    map.remove()
    map = null
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

/* Diseño UI/UX Minimalista para el Popup del Mapa */
:deep(.custom-minimal-popup .leaflet-popup-content-wrapper) {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border-radius: 50px; /* Forma de píldora */
  padding: 4px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
:deep(.custom-minimal-popup .leaflet-popup-content) {
  margin: 0;
  width: auto !important;
}
:deep(.custom-minimal-popup .leaflet-popup-tip-container) {
  display: none; /* Ocultar el triangulito para un diseño más limpio flotante */
}

/* Cambiar el fondo gris/blanco por defecto de Leaflet a oscuro para que no destelle al moverse rápido */
:deep(.leaflet-container) {
  background: #1c211a !important; /* Color tierra/bosque muy oscuro */
}

/* Forzar repintado de la capa SVG entera en Leaflet y marcadores (Evita borrosidad en PC al hacer zoom) */
:deep(.leaflet-overlay-pane svg),
:deep(.minimal-marker svg) {
  will-change: transform;
  transform: translateZ(0);
  shape-rendering: geometricPrecision;
  -webkit-font-smoothing: antialiased;
}

/* Estilos para que los nombres de las calles parezcan dibujados en el mapa */
:deep(.street-svg-text) {
  fill: #ffffff;
  font-weight: 800;
  font-size: 10px; /* Tamaño base para celulares */
  stroke: #000000;
  stroke-width: 1.5px;
  paint-order: stroke fill;
  font-family: sans-serif;
  
  /* Optimizaciones para forzar nitidez (Fix para PC/Chrome donde se queda borroso hasta hacer clic) */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
  shape-rendering: geometricPrecision;
  will-change: transform;
}

/* En PC (pantallas más grandes), agrandar el texto para que se lea mejor */
@media (min-width: 768px) {
  :deep(.street-svg-text) {
    font-size: 14px;
    stroke-width: 2px;
  }
}

/* Ocultar las letras cuando el zoom es lejano */
:deep(.map-zoomed-out .street-svg-text) {
  display: none !important;
}

/* Eliminado efecto neón y estilos de texto de ruta */

/* Transición para el Panel Lateral - Optimizada para GPU */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  will-change: transform;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
}

/* Transición Desplazamiento Inferior (Para Slider y Rutas) */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.4s;
  will-change: transform, opacity;
}
.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* Ajuste de controles de zoom de Leaflet */
:deep(.leaflet-top.leaflet-right) {
  margin-top: 100px; /* Para que quede debajo del Navbar */
  margin-right: 20px;
}

/* Animación Infinita para Carteles (Marquee) */
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

.marquee-content {
  animation: marquee 35s linear infinite;
  width: max-content;
}

.marquee-content.paused {
  animation-play-state: paused;
}
</style>
