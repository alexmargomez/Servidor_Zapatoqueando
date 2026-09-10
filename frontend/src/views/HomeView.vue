<template>
  <div class="relative w-full h-screen overflow-hidden bg-slate-100">
    <!-- El Mapa (Protagonista 100% Pantalla) -->
    <div id="osm-map" class="absolute inset-0 w-full h-full z-0"></div>
    
    <!-- Buscador Flotante Estilo Plataforma (Search / Filtros) -->
    <div class="absolute top-24 md:top-28 left-4 right-4 md:left-8 md:right-auto md:w-[420px] z-[1000] pointer-events-none flex flex-col gap-3">
      
      <!-- Input de Búsqueda Principal -->
      <div class="bg-white rounded-full shadow-xl border border-gray-100 flex items-center px-4 py-3 pointer-events-auto transition-transform hover:-translate-y-0.5 focus-within:ring-2 ring-yellow-400">
        <svg class="w-5 h-5 text-gray-400 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        <input type="text" placeholder="¿Qué buscas en Zapatoca?" class="bg-transparent border-none outline-none w-full text-gray-700 font-semibold placeholder-gray-400 text-sm md:text-base" />
        <button class="bg-green-900 text-white rounded-full p-2 hover:bg-green-800 transition-colors shrink-0 ml-2 shadow-sm">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
        </button>
      </div>

      <!-- Chips de Filtros Rápidos -->
      <div class="flex items-center gap-2 overflow-x-auto hide-scrollbar pointer-events-auto pb-1 px-1">
        <button v-for="cat in categories" :key="cat.name" @click="toggleCategory(cat.name)"
          :class="[
            'px-4 py-2 rounded-full shadow-md text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border',
            activeCategories.includes(cat.name) 
              ? 'bg-green-600 text-white border-green-700' 
              : 'bg-white/95 backdrop-blur-sm text-gray-700 hover:bg-gray-50 border-gray-100'
          ]">
          {{ cat.icon }} {{ cat.name }}
        </button>
      </div>
    </div>

    <!-- Slider Flotante de Publicidad (Posters) -->
    <transition name="slide-up">
      <div v-show="route.path !== '/rutas'" class="absolute bottom-0 left-0 w-full z-[1000] pointer-events-none pb-6 md:pb-8">
      
      <!-- Fondo oscuro opcional para resaltar las tarjetas -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent -z-10 pointer-events-none h-64 bottom-0 top-auto"></div>
      
      <div class="w-full pointer-events-auto">
        <div v-if="loading" class="flex justify-center py-10">
          <div class="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div v-else-if="error" class="p-4 mx-4 bg-red-50 rounded-xl text-center">
          <p class="text-red-500 font-bold">{{ error }}</p>
        </div>

        <div v-else class="relative w-full flex flex-col items-center justify-end pointer-events-none">
          <!-- Contenedor del Slider -->
          <div class="relative w-full overflow-hidden py-4 pointer-events-auto" @mouseenter="isHoveringSlider = true" @mouseleave="isHoveringSlider = false">
          
          <!-- Botón Alternar Vista Centrado -->
          <div class="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
            <button @click="isSliderCompact = !isSliderCompact" class="bg-black/30 backdrop-blur-md text-white/90 py-1.5 px-5 rounded-full hover:bg-black/50 transition-colors shadow flex items-center gap-2 text-xs font-medium" title="Cambiar tamaño">
              {{ isSliderCompact ? 'Ampliar' : 'Reducir' }}
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <!-- Flecha arriba si está compacto -->
                <path v-if="isSliderCompact" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                <!-- Flecha abajo si está grande -->
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
          </div>

          <!-- Marquee Container -->
          <div class="flex mt-2">
            <div class="marquee-content flex gap-6 px-3" :class="{ 'paused': isHoveringSlider }">
              <!-- Set 1 -->
              <div v-for="poster in posters" :key="'a-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                   class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 border border-white/40 cursor-pointer group hover:-translate-y-2"
                   :class="isSliderCompact ? 'w-32 md:w-48' : 'w-72 md:w-[450px]'">
                <img v-if="poster.imageurl" :src="poster.imageurl" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
              </div>
              <!-- Set 2 -->
              <div v-for="poster in posters" :key="'b-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                   class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 border border-white/40 cursor-pointer group hover:-translate-y-2"
                   :class="isSliderCompact ? 'w-32 md:w-48' : 'w-72 md:w-[450px]'">
                <img v-if="poster.imageurl" :src="poster.imageurl" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
              </div>
              <!-- Set 3 (para asegurar que cubra pantallas ultra anchas) -->
              <div v-for="poster in posters" :key="'c-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                   class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 border border-white/40 cursor-pointer group hover:-translate-y-2"
                   :class="isSliderCompact ? 'w-32 md:w-48' : 'w-72 md:w-[450px]'">
                <img v-if="poster.imageurl" :src="poster.imageurl" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
              </div>
              <!-- Set 4 -->
              <div v-for="poster in posters" :key="'d-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                   class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-2xl hover:shadow-yellow-500/20 transition-all duration-300 border border-white/40 cursor-pointer group hover:-translate-y-2"
                   :class="isSliderCompact ? 'w-32 md:w-48' : 'w-72 md:w-[450px]'">
                <img v-if="poster.imageurl" :src="poster.imageurl" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
      </div>
    </transition>
  </div>

  <!-- Panel Lateral Derecho (Detalles del Cartel / Publicidad) -->
  <transition name="slide-fade">
    <div v-if="selectedPoster" class="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col border-l border-gray-100">
      <!-- Botón Cerrar -->
      <button @click="selectedPoster = null" class="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-black/70 transition-colors z-10">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <!-- Imagen Destacada del Cartel -->
      <div class="w-full aspect-video relative shrink-0 bg-slate-100 border-b border-gray-200">
        <img :src="selectedPoster.imageurl || 'https://via.placeholder.com/400'" :alt="selectedPoster.title" class="w-full h-full object-cover" />
      </div>

      <!-- Contenido Detallado -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar bg-slate-50">
        <h2 class="text-2xl font-black text-green-950 leading-tight">{{ selectedPoster.title }}</h2>
        
        <!-- Descripción -->
        <div>
          <p class="text-gray-600 leading-relaxed text-sm text-justify whitespace-pre-wrap">
            {{ selectedPoster.description }}
          </p>
        </div>

        <!-- Botones de Acción (WhatsApp y Cómo llegar) -->
        <div class="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
          <button class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-green-950 font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            ¿Cómo llegar?
          </button>
          
          <a href="https://wa.me/573000000000?text=Hola,%20vengo%20desde%20la%20App%20Zapatoqueando%20y%20quiero%20m%C3%A1s%20informaci%C3%B3n" target="_blank" class="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
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
      <button @click="selectedPlace = null" class="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full shadow-md hover:bg-black/70 transition-colors z-10">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>

      <!-- Imagen Destacada del Lugar -->
      <div class="w-full aspect-video relative shrink-0 bg-slate-100 border-b border-gray-200">
        <img :src="selectedPlace.image_url || 'https://via.placeholder.com/400'" :alt="selectedPlace.name" class="w-full h-full object-cover" />
      </div>

      <!-- Contenido Detallado -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 hide-scrollbar bg-slate-50">
        <h2 class="text-2xl font-black text-green-950 leading-tight">{{ selectedPlace.name }}</h2>

        <p class="text-gray-600 text-sm flex items-start">
          <svg class="w-4 h-4 mr-2 shrink-0 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
          {{ selectedPlace.formatted_address }}
        </p>

        <!-- Botones de Acción -->
        <div class="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
          <button class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-green-950 font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-center items-center gap-2">
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
    html: `<svg viewBox="0 0 24 24" width="22" height="22" style="filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.5)); transform-origin: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><path fill="${colorHex}" stroke="white" stroke-width="1.5" stroke-linejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
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
let map = null

// Al cerrar las rutas (salir de /rutas), hacer que el slider reaparezca en estado minimizado
watch(() => route.path, (newPath, oldPath) => {
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
  { name: 'Puntos de interés', icon: '📍', color: '#64748b' }
]

const toggleCategory = (category) => {
  const index = activeCategories.value.indexOf(category)
  if (index === -1) {
    activeCategories.value.push(category)
  } else {
    activeCategories.value.splice(index, 1)
  }
  updateMarkers() // Redibujar marcadores
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

  const filteredPlaces = activeCategories.value.length === 0 
    ? places.value 
    : places.value.filter(p => activeCategories.value.includes(p.category))

  // Agregar marcadores
  filteredPlaces.forEach(place => {
    if (place.location && place.location.lat && place.location.lng) {
      const markerColor = getCategoryColor(place.category)
      const marker = L.marker([place.location.lat, place.location.lng], { icon: createMinimalDot(markerColor) }).addTo(markersLayer)

      // Popup estilizado sin estrellas, con imagen pequeña y clickable
      const popupContent = `
        <div onclick="window.openPlaceSidebar('${place.place_id}')" style="text-align: center; font-family: sans-serif; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <img src="${place.image_url || 'https://via.placeholder.com/150'}" alt="${place.name}" style="width: 120px; height: 80px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
          <h4 style="margin: 0; color: #052e16; font-weight: bold; font-size: 14px;">${place.name}</h4>
        </div>
      `
      marker.bindPopup(popupContent)

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

  // Inicializar mapa centrado en Zapatoca
  map = L.map('osm-map', {
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 0.8, // 0.8 permite un ligero rebote suave en los bordes
    minZoom: 10, // Permitimos alejar el zoom para ver grandes extensiones
    maxZoom: 22
  }).setView([6.816801, -73.268689], 15)

  // Añadir controles de zoom en la parte superior derecha para no solapar los widgets
  L.control.zoom({ position: 'topright' }).addTo(map)

  L.tileLayer('http://{s}.google.com/vt/lyrs=s&hl=es&x={x}&y={y}&z={z}', {
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '&copy; Google Maps',
    maxZoom: 22,
    maxNativeZoom: 19
  }).addTo(map)

  // Capa para marcadores (NO se añade al mapa de inmediato si el zoom es lejano)
  markersLayer = L.featureGroup()
  if (map.getZoom() >= 16) {
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

  // Evento para deseleccionar ruta al hacer clic en el mapa vacío ELIMINADO A PETICIÓN DEL USUARIO
  // map.on('click', () => {
  //   const event = new CustomEvent('route-unselected');
  //   window.dispatchEvent(event);
  // })

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

  if (map.getZoom() < 16) {
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
        if (currentSelectedRouteName && layer.feature.properties.name === currentSelectedRouteName) {
          layer.setStyle({
            weight: zoom >= 17 ? 6 : 4
          })
        }
      })
    }
    
    // Transición entre marcador general y marcadores detallados
    if (markersLayer) {
      if (zoom < 16) {
        if (map.hasLayer(markersLayer)) map.removeLayer(markersLayer)
        if (zapatocaMarker && !map.hasLayer(zapatocaMarker)) zapatocaMarker.addTo(map)
        if (laFuenteMarker && !map.hasLayer(laFuenteMarker)) laFuenteMarker.addTo(map)
      } else {
        if (!map.hasLayer(markersLayer)) map.addLayer(markersLayer)
        if (zapatocaMarker && map.hasLayer(zapatocaMarker)) map.removeLayer(zapatocaMarker)
        if (laFuenteMarker && map.hasLayer(laFuenteMarker)) map.removeLayer(laFuenteMarker)
      }
    }

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
      if (map.getZoom() < 16) {
        document.getElementById('osm-map').classList.add('map-zoomed-out');
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
    
    if (data.type === 'FeatureCollection' && data.features.length > 0) {
      routesLayer = L.geoJSON(data, {
        style: function (feature) {
          return {
            color: '#fbbf24', // Yellow color but hidden by default
            weight: 4,
            opacity: 0, // Ocultas por defecto
            dashArray: 'none', // Sin puntear
            className: '' // Sin neón
          };
        }
      }).addTo(map);

      routesLayer.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
          // No textpath for tourist routes
        }
      });
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

    if (data.type === 'FeatureCollection' && data.features.length > 0) {
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
  try {
    // Cargar Posters
    const postersResponse = await fetch('/api/posters')
    const postersData = await postersResponse.json()
    if (postersData.message === 'success') {
      posters.value = postersData.data
    }

    // Cargar Lugares
    const response = await fetch('/api/places')
    const data = await response.json()
    
    if (data.message === 'success') {
      places.value = data.data
      
      // Inicializar mapa después de que el DOM esté listo
      await nextTick()
      initMap()
      if (places.value.length > 0) {
        addMarkers(places.value)
      }
      
      // Cargar rutas de calles
      await loadStreets()
      
      // Cargar rutas turísticas
      await loadRoutes()
      
      // Cargar límite territorial
      await loadBoundary()
      
    } else {
      console.error('Failed to load places:', data.message)
    }
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
  currentSelectedRouteName = selectedRoute.name
  if (!map || !routesLayer) return
  
  routesLayer.eachLayer((layer) => {
    if (layer.feature && layer.feature.properties && layer.feature.properties.name === currentSelectedRouteName) {
      // Mostrar y resaltar SÓLO la ruta seleccionada (amarilla, solida, delgada)
      layer.setStyle({
        color: '#facc15', // amarillo
        weight: 4,
        opacity: 1,
        dashArray: 'none',
        className: ''
      })
      // Hacer zoom a los límites de esta ruta
      if (typeof layer.getBounds === 'function') {
        map.fitBounds(layer.getBounds(), { padding: [50, 50], duration: 1.5 })
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

/* Estilos para que los nombres de las calles parezcan dibujados en el mapa */
:deep(.street-svg-text) {
  fill: #ffffff;
  font-weight: 800;
  font-size: 9px;
  stroke: #000000;
  stroke-width: 1.5px;
  paint-order: stroke fill;
  font-family: sans-serif;
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
  animation: marquee 30s linear infinite;
  min-width: 200%;
}

.marquee-content.paused {
  animation-play-state: paused;
}
</style>
