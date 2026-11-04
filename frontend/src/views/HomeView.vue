<template>
  <div class="relative w-full h-screen overflow-hidden bg-slate-100">
    <!-- El Mapa (Protagonista 100% Pantalla) -->
    <div id="osm-map" class="absolute inset-0 w-full h-full z-0" @click="isSearchFocused = false"></div>
    
    <!-- Buscador Flotante Estilo Plataforma (Search / Filtros / Ruta Activa) -->
    <div class="absolute top-[72px] md:top-24 left-3 right-3 md:left-6 md:right-auto md:w-[440px] z-[1000] pointer-events-none flex flex-col gap-2">
      
      <!-- Input de Búsqueda Principal -->
      <div class="relative pointer-events-auto">
        <div class="bg-white/95 backdrop-blur-xl rounded-full shadow-[0_10px_30px_rgba(5,46,22,0.15)] border border-white/80 flex items-center px-4 py-2.5 transition-all focus-within:ring-2 ring-amber-400">
          <svg class="w-5 h-5 text-emerald-800/60 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            ref="searchInputRef"
            v-model="searchQuery" 
            @focus="isSearchFocused = true"
            @input="onSearchInput"
            type="text" 
            placeholder="Buscar hoteles, cafés, atractivos..." 
            class="bg-transparent border-none outline-none w-full text-emerald-950 font-semibold placeholder-slate-400 text-sm md:text-base" 
          />
          <button 
            v-if="searchQuery || activeCategories.length > 0" 
            @click="clearFilters" 
            type="button"
            title="Limpiar filtros"
            class="text-slate-400 hover:text-rose-600 p-1.5 rounded-full hover:bg-rose-50 transition-colors shrink-0 mr-1 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <button 
            @click="showCategoryChips = !showCategoryChips" 
            type="button"
            :title="showCategoryChips ? 'Ocultar categorías' : 'Mostrar categorías'"
            :class="[
              'rounded-full p-2 transition-all shrink-0 ml-1 shadow-sm cursor-pointer flex items-center gap-1',
              activeCategories.length > 0 ? 'bg-amber-400 text-emerald-950 hover:bg-amber-300 font-extrabold px-2.5' : 'bg-emerald-950 text-white hover:bg-emerald-900'
            ]"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            <span v-if="activeCategories.length > 0" class="text-[11px] tabular-metrics">{{ activeCategories.length }}</span>
          </button>
        </div>

        <!-- Dropdown de Resultados de Búsqueda -->
        <div 
          v-if="isSearchFocused && searchQuery.trim().length > 0" 
          class="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(5,46,22,0.18)] border border-emerald-950/10 max-h-72 overflow-y-auto z-50 divide-y divide-slate-100"
        >
          <div v-if="searchResults.length === 0" class="p-4 text-center text-sm text-slate-500">
            No encontramos lugares para "<span class="font-bold text-emerald-950">{{ searchQuery }}</span>"
          </div>
          <button 
            v-for="place in searchResults" 
            :key="place.place_id"
            type="button"
            @click="selectSearchResult(place)"
            class="w-full px-4 py-3 text-left hover:bg-emerald-50/70 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <img :src="place.image_url || '/logo.png'" :alt="place.name" class="w-10 h-10 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="font-extrabold text-sm text-emerald-950 truncate">{{ place.name }}</div>
                <span v-if="getDistanceFromUser(place)" class="text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 tabular-metrics">
                  {{ getDistanceFromUser(place) }}
                </span>
              </div>
              <div class="text-xs text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                <span class="inline-block w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(place.category) }"></span>
                <span class="font-medium text-slate-600">{{ place.category || 'Lugar' }}</span>
                <span v-if="place.formatted_address" class="text-slate-400">· {{ place.formatted_address }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Chips de Filtros Rápidos con Punto de Color y Contador -->
      <div v-show="showCategoryChips" class="flex flex-wrap items-center gap-1.5 pointer-events-auto pb-0.5">
        <button v-for="cat in categories" :key="cat.name" @click="toggleCategory(cat.name)"
          type="button"
          :class="[
            'px-3 py-1.5 rounded-full shadow-sm text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer border',
            activeCategories.includes(cat.name) 
              ? 'bg-emerald-950 text-white border-emerald-900 shadow-md scale-[1.03]' 
              : 'bg-white/92 backdrop-blur-md text-slate-700 hover:bg-white border-white/80'
          ]">
          <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: cat.color }"></span>
          <span>{{ cat.icon }} {{ cat.name }}</span>
          <span v-if="getCategoryCount(cat.name) > 0" :class="['text-[10px] px-1.5 py-0.2 rounded-full tabular-metrics', activeCategories.includes(cat.name) ? 'bg-white/20 text-amber-300' : 'bg-slate-100 text-slate-500']">
            {{ getCategoryCount(cat.name) }}
          </span>
        </button>
      </div>

      <!-- Píldoras de Estado: Filtro Activo o HUD de Ruta Seleccionada -->
      <div v-if="hasActiveFilter || activeRouteBanner" class="flex flex-wrap items-center gap-2 pointer-events-auto">
        <div v-if="hasActiveFilter" class="bg-emerald-950/90 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-2 border border-white/15">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span class="tabular-metrics">{{ filteredPlacesCount }} lugares en el mapa</span>
          <button @click="clearFilters" type="button" class="text-amber-300 hover:text-amber-200 underline ml-1 cursor-pointer">Ver todos</button>
        </div>

        <div v-if="activeRouteBanner" class="bg-white/95 backdrop-blur-md text-emerald-950 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 border-2 border-amber-400">
          <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: activeRouteBanner.color || '#eab308' }"></span>
          <span class="truncate max-w-[140px] sm:max-w-[180px] font-extrabold">🥾 {{ activeRouteBanner.name }}</span>
          <span v-if="activeRouteBanner.distance_label" class="text-[11px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full tabular-metrics border border-emerald-200/60">
            {{ activeRouteBanner.distance_label }}
          </span>
          <button @click="centerActiveRoute" type="button" title="Ver ruta completa en el mapa" class="text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 px-2 py-0.5 rounded-full text-[11px] cursor-pointer">
            🎯
          </button>
          <button v-if="activeRouteBanner.startCoord" @click="openActiveRouteStart" type="button" title="Enfocar punto de inicio en el mapa" class="text-emerald-900 hover:bg-amber-300 bg-amber-200/80 px-2 py-0.5 rounded-full text-[11px] cursor-pointer">
            🟢 Inicio
          </button>
          <button @click="clearSelectedRoute" type="button" title="Salir de la ruta" class="text-slate-400 hover:text-rose-600 font-bold px-1 cursor-pointer">✕</button>
        </div>
      </div>
    </div>

    <!-- Controles Flotantes de Geolocalización GPS (Parte Inferior Derecha) -->
    <div
      :class="[
        'absolute right-4 md:right-6 z-[1005] flex flex-col items-end gap-2 pointer-events-auto transition-all duration-300',
        route.path === '/rutas' || posters.length === 0
          ? 'bottom-6'
          : isSliderCompact
            ? 'bottom-32 md:bottom-36'
            : 'bottom-48 md:bottom-64'
      ]"
    >
      <!-- Botón rápido para volver a Zapatoca si el usuario está fuera del municipio -->
      <button
        v-if="isTrackingLocation && isUserOutsideZapatoca"
        @click="centerOnZapatoca"
        type="button"
        class="bg-emerald-950 hover:bg-emerald-900 text-amber-400 border border-emerald-800 shadow-lg rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <span>📍 Volver a Zapatoca</span>
      </button>

      <!-- Botón para desactivar GPS cuando está activo -->
      <button
        v-if="isTrackingLocation"
        @click="stopUserLocation"
        type="button"
        title="Desactivar ubicación GPS"
        class="bg-white/95 text-slate-700 hover:text-rose-600 border border-slate-200 shadow-md rounded-full px-3 py-1 text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
      >
        <span class="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
        <span>GPS Activo · Salir</span>
      </button>

      <!-- Botón Principal Mi Ubicación -->
      <button
        @click="toggleUserLocation"
        type="button"
        :title="isTrackingLocation ? 'Centrar en mi ubicación actual' : 'Mostrar mi ubicación en el mapa'"
        :class="[
          'w-12 h-12 rounded-full shadow-xl border flex items-center justify-center transition-transform active:scale-95 cursor-pointer',
          isTrackingLocation
            ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 ring-4 ring-blue-400/30'
            : 'bg-white text-emerald-950 border-slate-200 hover:bg-emerald-50'
        ]"
      >
        <svg v-if="isLocating" class="w-5 h-5 animate-spin text-current" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z"></path>
        </svg>
      </button>
    </div>

    <!-- Aviso Flotante de Geolocalización / Compartir -->
    <transition name="slide-fade">
      <div
        v-if="locationNotice"
        class="absolute bottom-20 right-16 sm:right-20 z-[1006] max-w-xs bg-white/95 backdrop-blur-md border border-emerald-200 shadow-xl rounded-2xl px-4 py-3 text-xs text-emerald-950 flex items-start gap-2.5 pointer-events-auto"
      >
        <span class="text-base leading-none mt-0.5">📡</span>
        <div class="flex-1 font-semibold leading-snug">{{ locationNotice }}</div>
        <button @click="locationNotice = null" class="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
      </div>
    </transition>

    <!-- Slider Flotante de Publicidad (Posters) -->
    <transition name="slide-up">
      <div v-show="route.path !== '/rutas' && (loading || error || posters.length > 0)" class="absolute bottom-0 left-0 w-full z-[1000] pointer-events-none pb-4 md:pb-6">
      
        <!-- Gradiente suave inferior -->
        <div class="absolute inset-0 bg-gradient-to-t from-emerald-950/75 via-emerald-950/25 to-transparent -z-10 pointer-events-none h-52 bottom-0 top-auto"></div>
        
        <div class="w-full pointer-events-auto">
          <div v-if="loading" class="flex justify-center py-8">
            <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <div v-else-if="error" class="p-4 mx-4 bg-rose-50 rounded-xl text-center">
            <p class="text-rose-600 font-bold">{{ error }}</p>
          </div>

          <div v-else-if="posters.length > 0" class="relative w-full flex flex-col items-center justify-end pointer-events-none">
            <!-- Contenedor del Slider -->
            <div class="relative w-full overflow-hidden py-3.5 pointer-events-auto" @mouseenter="isHoveringSlider = true" @mouseleave="isHoveringSlider = false">
            
              <!-- Botón Alternar Vista Centrado -->
              <div class="absolute top-0 left-1/2 transform -translate-x-1/2 z-30">
                <button @click="isSliderCompact = !isSliderCompact" type="button" class="bg-emerald-950/85 backdrop-blur-md text-white py-1.5 px-4 rounded-full hover:bg-emerald-950 transition-colors shadow-lg border border-white/15 flex items-center gap-2 text-xs font-bold cursor-pointer" title="Cambiar tamaño de la cartelera">
                  <span class="text-amber-400">✨</span>
                  <span>{{ isSliderCompact ? 'Explorar Destacados' : 'Compactar Cartelera' }}</span>
                  <svg class="w-3.5 h-3.5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path v-if="isSliderCompact" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 15l7-7 7 7"></path>
                    <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
              </div>

              <!-- Marquee Container -->
              <div class="flex mt-3.5 overflow-hidden">
                <div class="marquee-content flex" :class="{ 'paused': isHoveringSlider || isMapMoving }">
                  <!-- Mitad 1 -->
                  <div class="flex gap-5 pr-5 shrink-0">
                    <div v-for="(poster, idx) in repeatedPosters" :key="'m1-'+idx+'-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                         class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-amber-400/25 transition-all duration-300 border border-white/60 cursor-pointer group hover:-translate-y-1.5 relative"
                         :class="isSliderCompact ? 'w-40 md:w-52' : 'w-68 md:w-[380px]'">
                      <img :src="getPosterImage(poster)" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2.5 sm:p-3 flex items-end justify-between gap-2">
                        <p class="text-white font-bold text-xs md:text-sm truncate drop-shadow-xs">{{ poster.title }}</p>
                        <span v-if="!isSliderCompact" class="shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" :class="poster.type === 'event' ? 'bg-amber-400 text-emerald-950' : 'bg-white/90 text-emerald-950'">
                          {{ poster.type === 'event' ? 'Evento' : 'Destacado' }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <!-- Mitad 2 (Idéntica para loop infinito perfecto al -50%) -->
                  <div class="flex gap-5 pr-5 shrink-0">
                    <div v-for="(poster, idx) in repeatedPosters" :key="'m2-'+idx+'-'+poster.id" @click="selectedPoster = poster; selectedPlace = null" 
                         class="shrink-0 aspect-video bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-amber-400/25 transition-all duration-300 border border-white/60 cursor-pointer group hover:-translate-y-1.5 relative"
                         :class="isSliderCompact ? 'w-40 md:w-52' : 'w-68 md:w-[380px]'">
                      <img :src="getPosterImage(poster)" :alt="poster.title" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2.5 sm:p-3 flex items-end justify-between gap-2">
                        <p class="text-white font-bold text-xs md:text-sm truncate drop-shadow-xs">{{ poster.title }}</p>
                        <span v-if="!isSliderCompact" class="shrink-0 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full" :class="poster.type === 'event' ? 'bg-amber-400 text-emerald-950' : 'bg-white/90 text-emerald-950'">
                          {{ poster.type === 'event' ? 'Evento' : 'Destacado' }}
                        </span>
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
      <div v-if="selectedPoster" class="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col border-l border-slate-100">
        <!-- Botón Cerrar -->
        <button @click="selectedPoster = null" type="button" class="absolute top-4 right-4 bg-emerald-950/70 backdrop-blur-md text-white p-2 rounded-full shadow-md hover:bg-emerald-950 transition-colors z-10 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Imagen Destacada del Cartel (Altura controlada en móvil y web) -->
        <div class="w-full h-44 sm:h-52 max-h-[28vh] relative shrink-0 overflow-hidden bg-slate-100 border-b border-slate-200">
          <img :src="getPosterImage(selectedPoster)" :alt="selectedPoster.title" class="w-full h-full object-cover object-center" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          <span class="absolute bottom-3 left-4 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-sm" :class="selectedPoster.type === 'event' ? 'bg-amber-400 text-emerald-950' : 'bg-emerald-950 text-amber-300'">
            {{ selectedPoster.type === 'event' ? '🎉 Evento Cultural' : '⭐ Comercio Destacado' }}
          </span>
        </div>

        <!-- Contenido Detallado -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-4 hide-scrollbar bg-stone-50">
          <h2 class="text-xl sm:text-2xl font-extrabold text-emerald-950 leading-tight">{{ selectedPoster.title }}</h2>
          
          <div class="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-2xs">
            <p class="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
              {{ selectedPoster.description || 'Descubre más sobre esta experiencia recomendada en Zapatoca.' }}
            </p>
          </div>

          <!-- Botones de Acción -->
          <div class="mt-auto pt-4 flex flex-col sm:flex-row gap-2.5">
            <button 
              @click="openPosterDirections(selectedPoster)" 
              type="button"
              class="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              Ver en el mapa
            </button>
            
            <button 
              @click="sharePosterItem(selectedPoster)" 
              type="button"
              class="bg-emerald-950 hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
            >
              <span>📤 Compartir</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Panel Lateral Derecho (Detalles del Lugar del Mapa) -->
    <transition name="slide-fade">
      <div v-if="selectedPlace" class="fixed inset-y-0 right-0 w-full md:w-[420px] bg-white shadow-2xl z-[9999] flex flex-col border-l border-slate-100">
        <!-- Botón Cerrar -->
        <button @click="selectedPlace = null" type="button" class="absolute top-4 right-4 bg-emerald-950/70 backdrop-blur-md text-white p-2 rounded-full shadow-md hover:bg-emerald-950 transition-colors z-10 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Imagen Destacada del Lugar (Altura controlada en móvil y web) -->
        <div class="w-full h-44 sm:h-52 max-h-[28vh] relative shrink-0 overflow-hidden bg-slate-100 border-b border-slate-200">
          <img :src="selectedPlace.image_url || '/logo.png'" :alt="selectedPlace.name" class="w-full h-full object-cover object-center" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent"></div>
          <div class="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <span v-if="selectedPlace.category" class="px-3 py-1 rounded-full text-[11px] font-extrabold text-white shadow-sm" :style="{ backgroundColor: getCategoryColor(selectedPlace.category) }">
              {{ selectedPlace.category }}
            </span>
            <span v-if="getDistanceFromUser(selectedPlace)" class="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/95 text-emerald-950 shadow-sm flex items-center gap-1 tabular-metrics">
              <span>📍</span>
              <span>A {{ getDistanceFromUser(selectedPlace) }}</span>
            </span>
          </div>
        </div>

        <!-- Contenido Detallado Editorial -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-3.5 hide-scrollbar bg-stone-50">
          <h2 class="text-xl sm:text-2xl font-extrabold text-emerald-950 leading-tight">{{ selectedPlace.name }}</h2>

          <div v-if="selectedPlace.formatted_address" class="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-start gap-2.5 shadow-2xs">
            <svg class="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
            <span class="text-slate-700 text-xs sm:text-sm font-medium">{{ selectedPlace.formatted_address }}</span>
          </div>

          <div v-if="selectedPlace.description" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{{ selectedPlace.description }}</p>
          </div>

          <!-- Botones de Acción -->
          <div class="mt-auto pt-4 flex flex-col sm:flex-row gap-2.5">
            <button 
              @click="openDirections(selectedPlace)" 
              type="button"
              class="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              Ubicar en el mapa
            </button>
            <button
              @click="sharePlaceItem(selectedPlace)"
              type="button"
              class="bg-emerald-950 hover:bg-emerald-900 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
              title="Compartir ubicación de este lugar"
            >
              <span>📤 Compartir</span>
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
let userLocationMarker = null;
let userAccuracyCircle = null;
let geoWatchId = null;
let locationNoticeTimeout = null;
let zapatocaBounds = null;

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

// Icono pulsante para la ubicación GPS del usuario
const createUserLocationIcon = () => {
  return L.divIcon({
    className: 'user-gps-marker',
    html: `
      <div class="gps-marker-wrapper">
        <div class="gps-pulse-ring"></div>
        <div class="gps-core-dot"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  })
}

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
const isMapMoving = ref(false)
const userCoords = ref(null)
const isLocating = ref(false)
const isTrackingLocation = ref(false)
const isUserOutsideZapatoca = ref(false)
const locationNotice = ref(null)
let map = null

const showLocationNotice = (msg, durationMs = 5000) => {
  locationNotice.value = msg
  if (locationNoticeTimeout) clearTimeout(locationNoticeTimeout)
  if (durationMs > 0) {
    locationNoticeTimeout = setTimeout(() => {
      locationNotice.value = null
    }, durationMs)
  }
}

// Fórmula Haversine para calcular distancia en metros entre dos coordenadas
const calculateDistanceMeters = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  const R = 6371000 // Radio de la Tierra en metros
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const getDistanceFromUser = (place) => {
  if (!userCoords.value || !place?.location?.lat || !place?.location?.lng) return null
  const meters = calculateDistanceMeters(
    userCoords.value.lat,
    userCoords.value.lng,
    Number(place.location.lat),
    Number(place.location.lng)
  )
  if (!Number.isFinite(meters)) return null
  if (meters < 1000) {
    return `${Math.round(meters)} m`
  }
  return `${(meters / 1000).toFixed(1)} km`
}

const updateUserMapLayers = (lat, lng, accuracy, shouldCenter = false) => {
  if (!map) return
  const latLng = [lat, lng]
  const radius = Math.min(Math.max(accuracy || 25, 10), 250)

  if (!userAccuracyCircle) {
    userAccuracyCircle = L.circle(latLng, {
      radius,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.14,
      weight: 1.5
    }).addTo(map)
  } else {
    userAccuracyCircle.setLatLng(latLng)
    userAccuracyCircle.setRadius(radius)
  }

  if (!userLocationMarker) {
    userLocationMarker = L.marker(latLng, {
      icon: createUserLocationIcon(),
      zIndexOffset: 1000
    }).addTo(map)
    userLocationMarker.bindPopup(
      `<div class="px-3 py-1 font-bold text-xs text-blue-900 whitespace-nowrap">📍 Tu ubicación actual</div>`,
      { closeButton: false, className: 'custom-minimal-popup', offset: [0, -6] }
    )
  } else {
    userLocationMarker.setLatLng(latLng)
  }

  const distToZapatoca = calculateDistanceMeters(lat, lng, 6.816801, -73.268689)
  const outsideBounds = zapatocaBounds ? !zapatocaBounds.contains(latLng) : distToZapatoca > 35000
  isUserOutsideZapatoca.value = outsideBounds

  if (shouldCenter) {
    if (outsideBounds) {
      // Salto directo (sin flyTo) para no descargar cientos de tiles intermedios fuera de Zapatoca
      map.setMaxBounds(null)
      map.setView(latLng, 15, { animate: false })
      const kmAway = (distToZapatoca / 1000).toFixed(1)
      showLocationNotice(
        `Estás a ${kmAway} km de Zapatoca. Usa el botón "📍 Volver a Zapatoca" para regresar al municipio.`,
        6500
      )
    } else {
      map.setView(latLng, Math.max(map.getZoom(), 17), { animate: true, duration: 0.6 })
      showLocationNotice('Ubicación GPS activa en tiempo real.', 3000)
    }
  }
}

const toggleUserLocation = () => {
  if (!('geolocation' in navigator)) {
    showLocationNotice('Tu navegador no soporta geolocalización GPS.', 5000)
    return
  }

  // Si ya está activo y tenemos coordenadas, re-centrar en el usuario
  if (isTrackingLocation.value && userCoords.value) {
    updateUserMapLayers(userCoords.value.lat, userCoords.value.lng, userCoords.value.accuracy, true)
    return
  }

  isLocating.value = true
  let isFirstFix = true

  geoWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude, accuracy } = position.coords
      isLocating.value = false
      isTrackingLocation.value = true

      // Actualizar marcador y círculo en el mapa inmediatamente en tiempo real
      updateUserMapLayers(latitude, longitude, accuracy, isFirstFix)

      // Actualizar estado reactivo de distancia cuando cambia >= 1 metro o en el primer fix
      if (
        isFirstFix ||
        !userCoords.value ||
        calculateDistanceMeters(userCoords.value.lat, userCoords.value.lng, latitude, longitude) >= 1
      ) {
        userCoords.value = { lat: latitude, lng: longitude, accuracy }
      }

      isFirstFix = false
    },
    (err) => {
      isLocating.value = false
      if (err.code === 1) {
        showLocationNotice('Permiso de ubicación denegado. Actívalo en tu navegador para ver tu posición.', 6000)
      } else if (err.code === 2) {
        showLocationNotice('No se pudo determinar tu ubicación GPS actual.', 5000)
      } else {
        showLocationNotice('Tiempo de espera agotado al obtener tu señal GPS.', 5000)
      }
      stopUserLocation()
    },
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 15000
    }
  )
}

const stopUserLocation = () => {
  if (geoWatchId !== null && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(geoWatchId)
    geoWatchId = null
  }
  isTrackingLocation.value = false
  isLocating.value = false
  userCoords.value = null
  if (map) {
    if (userLocationMarker) {
      map.removeLayer(userLocationMarker)
      userLocationMarker = null
    }
    if (userAccuracyCircle) {
      map.removeLayer(userAccuracyCircle)
      userAccuracyCircle = null
    }
    if (zapatocaBounds) {
      map.setMaxBounds(zapatocaBounds)
    }
  }
  isUserOutsideZapatoca.value = false
}

const centerOnZapatoca = () => {
  if (!map) return
  // Salto directo a Zapatoca sin descargar tiles intermedios y restaurando límites
  map.setView([6.816801, -73.268689], 16, { animate: false })
  if (zapatocaBounds) {
    map.setMaxBounds(zapatocaBounds)
  }
}

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
  selectedPlace.value = null
  if (map && place.location && place.location.lat && place.location.lng) {
    map.flyTo([place.location.lat, place.location.lng], 18, {
      duration: 1.2
    })
    setTimeout(() => {
      syncMarkersVisibility()
      if (markersLayer) {
        markersLayer.eachLayer((layer) => {
          const ll = layer.getLatLng?.()
          if (
            ll &&
            Math.abs(ll.lat - Number(place.location.lat)) < 0.00001 &&
            Math.abs(ll.lng - Number(place.location.lng)) < 0.00001
          ) {
            layer.openPopup()
          }
        })
      }
    }, 450)
  }
}

const openPosterDirections = (poster) => {
  if (!poster) return
  const titleQuery = (poster.title || '').trim().toLowerCase()
  selectedPoster.value = null
  if (titleQuery) {
    const matchedPlace = places.value.find(
      p =>
        (p.name && p.name.toLowerCase().includes(titleQuery)) ||
        (titleQuery.includes((p.name || '').toLowerCase()) && (p.name || '').length > 3)
    )
    if (matchedPlace && matchedPlace.location?.lat && matchedPlace.location?.lng) {
      selectedPlace.value = matchedPlace
      focusPlace(matchedPlace)
      return
    }
  }
  if (map) {
    map.flyTo([6.816801, -73.268689], 17, { duration: 1.0 })
  }
}

const sharePlaceItem = async (place) => {
  if (!place) return
  const shareUrl = `${window.location.origin}/?place=${encodeURIComponent(place.place_id)}`
  const shareText = `📍 Mira "${place.name}" en Zapatoca (Zapatoqueando): ${place.formatted_address || ''}`.trim()
  if (navigator.share) {
    try {
      await navigator.share({ title: place.name, text: shareText, url: shareUrl })
      return
    } catch {
      // Fallback a copiar o WhatsApp
    }
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      showLocationNotice('Enlace del lugar copiado al portapapeles.', 3500)
      return
    } catch {
      // Fallback a WhatsApp
    }
  }
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank', 'noopener')
}

const sharePosterItem = async (poster) => {
  if (!poster) return
  const shareUrl = window.location.origin
  const shareText = `✨ Mira "${poster.title}" en Zapatoca (Zapatoqueando): ${poster.description || ''}`.trim()
  if (navigator.share) {
    try {
      await navigator.share({ title: poster.title, text: shareText, url: shareUrl })
      return
    } catch {
      // Fallback a WhatsApp
    }
  }
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank', 'noopener')
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
const activeRouteBanner = ref(null)
const categories = [
  { name: 'Hospedajes', icon: '🏨', color: '#3b82f6' },
  { name: 'Restaurantes', icon: '🍽️', color: '#f97316' },
  { name: 'CafeBar', icon: '☕', color: '#8b5cf6' },
  { name: 'Fuentes de soda', icon: '🥤', color: '#06b6d4' },
  { name: 'Lugares turísticos', icon: '📸', color: '#ec4899' },
  { name: 'Puntos de interés', icon: '⭐', color: '#64748b' }
]

const getCategoryCount = (catName) => {
  return places.value.filter(p => p.category === catName).length
}

const filteredPlacesCount = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return places.value.filter(p => {
    const matchesCategory = activeCategories.value.length === 0 || activeCategories.value.includes(p.category)
    const matchesQuery = !q || (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.formatted_address && p.formatted_address.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    )
    return matchesCategory && matchesQuery
  }).length
})

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

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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

      // Mini-modal (Popup) minimalista estilo cápsula (sin 'X') con escape HTML seguro
      const safePlaceId = escapeHtml(place.place_id)
      const safeImageUrl = escapeHtml(place.image_url || '/logo.png')
      const safePlaceName = escapeHtml(place.name)
      const popupContent = `
        <div onclick="window.openPlaceSidebar('${safePlaceId}')" class="flex items-center gap-3 pr-3 cursor-pointer">
          <div class="w-10 h-10 shrink-0 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-100">
            <img src="${safeImageUrl}" alt="${safePlaceName}" class="w-full h-full object-cover" />
          </div>
          <span class="font-bold text-gray-800 text-sm whitespace-nowrap">${safePlaceName}</span>
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
  zapatocaBounds = bounds

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

  // Capa Base del Mapa: Usamos nuestro servidor local con Precarga Balanceada
  L.tileLayer('/map-cache/{z}/{x}/{y}.jpg', {
    maxZoom: 22,
    maxNativeZoom: 19,
    attribution: ' Zapatoqueando Map Cache',
    keepBuffer: 4,
    edgeBufferTiles: 1,
    updateWhenIdle: true,
    updateWhenZooming: false
  }).addTo(map)

  map.on('movestart', () => {
    isMapMoving.value = true
  })
  map.on('moveend', () => {
    isMapMoving.value = false
  })

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

const applyRoutesGeoJson = (data) => {
  if (!map || data?.type !== 'FeatureCollection') return
  if (routesLayer) {
    map.removeLayer(routesLayer)
    routesLayer = null
  }
  if (!Array.isArray(data.features) || data.features.length === 0) return

  routesLayer = L.geoJSON(data, {
    style: function (feature) {
      const props = feature?.properties || {}
      const isSelected = (currentSelectedRouteId && props.id === currentSelectedRouteId) ||
                         (currentSelectedRouteName && props.name === currentSelectedRouteName)
      return {
        color: props.color || '#fbbf24',
        weight: isSelected ? (map.getZoom() >= 17 ? 6 : 5) : 4,
        opacity: isSelected ? 1 : 0, // Ocultas por defecto salvo la ruta activa
        dashArray: 'none',
        className: ''
      }
    }
  }).addTo(map)
}

const loadRoutes = async () => {
  if (!map) return;
  try {
    const response = await fetch('/api/routes', { cache: 'no-store' });
    const data = await response.json();
    lastRoutesSnapshot = JSON.stringify(data.features || []);
    applyRoutesGeoJson(data);
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

let realtimeSyncInterval = null
let lastPlacesSnapshot = ''
let lastPostersSnapshot = ''
let lastRoutesSnapshot = ''

const refreshMapData = async () => {
  if (document.hidden) return
  try {
    const [postersResponse, placesResponse, routesResponse] = await Promise.all([
      fetch('/api/posters', { cache: 'no-store' }).catch(() => null),
      fetch('/api/places', { cache: 'no-store' }).catch(() => null),
      fetch('/api/routes', { cache: 'no-store' }).catch(() => null)
    ])

    if (postersResponse && postersResponse.ok) {
      const postersData = await postersResponse.json()
      if (postersData.message === 'success' && Array.isArray(postersData.data)) {
        const nextPostersJson = JSON.stringify(postersData.data)
        if (nextPostersJson !== lastPostersSnapshot) {
          lastPostersSnapshot = nextPostersJson
          posters.value = postersData.data
          if (selectedPoster.value) {
            const updatedPoster = postersData.data.find(p => p.id === selectedPoster.value.id)
            selectedPoster.value = updatedPoster || null
          }
        }
      }
    }

    if (placesResponse && placesResponse.ok) {
      const data = await placesResponse.json()
      if (data.message === 'success' && Array.isArray(data.data)) {
        const nextPlacesJson = JSON.stringify(data.data)
        if (nextPlacesJson !== lastPlacesSnapshot) {
          lastPlacesSnapshot = nextPlacesJson
          places.value = data.data
          addMarkers()
          syncMarkersVisibility()
          if (selectedPlace.value) {
            const updatedPlace = data.data.find(
              p => String(p.place_id) === String(selectedPlace.value.place_id)
            )
            selectedPlace.value = updatedPlace || null
          }
        }
      }
    }

    if (routesResponse && routesResponse.ok) {
      const routesData = await routesResponse.json()
      if (routesData.type === 'FeatureCollection' && Array.isArray(routesData.features)) {
        const nextRoutesJson = JSON.stringify(routesData.features)
        if (nextRoutesJson !== lastRoutesSnapshot) {
          lastRoutesSnapshot = nextRoutesJson
          applyRoutesGeoJson(routesData)
        }
      }
    }
  } catch (err) {
    // Silencioso en sincronización de fondo
  }
}

let routeEndpointsLayer = null
let activeRouteBounds = null

onMounted(async () => {
  await nextTick()
  initMap()

  try {
    await refreshMapData()

    // Cargar capas del mapa
    await Promise.all([
      loadStreets(),
      loadRoutes(),
      loadBoundary()
    ])

    // Si viene un deep link ?place=ID, enfocar y abrir el lugar automáticamente
    const placeQueryId = route.query?.place
    if (placeQueryId) {
      const targetPlace = places.value.find(p => String(p.place_id) === String(placeQueryId))
      if (targetPlace) {
        selectedPlace.value = targetPlace
        focusPlace(targetPlace)
      }
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
  window.addEventListener('route-focus-start', handleRouteFocusStart)
  window.addEventListener('poster-locate-on-map', handlePosterLocateOnMap)
  window.addEventListener('focus', refreshMapData)
  realtimeSyncInterval = setInterval(refreshMapData, 8000)
})

let startEndpointMarker = null

const clearRouteEndpoints = () => {
  startEndpointMarker = null
  if (routeEndpointsLayer && map) {
    map.removeLayer(routeEndpointsLayer)
    routeEndpointsLayer = null
  }
}

const renderRouteEndpoints = (coords, routeName) => {
  clearRouteEndpoints()
  if (!map || !Array.isArray(coords) || coords.length < 2) return
  routeEndpointsLayer = L.layerGroup().addTo(map)

  const [startLng, startLat] = coords[0]
  const [endLng, endLat] = coords[coords.length - 1]

  const startIcon = L.divIcon({
    className: 'route-endpoint-marker',
    html: `<div style="background:#059669;color:#fff;font-weight:800;font-size:10px;padding:2px 7px;border-radius:9999px;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);white-space:nowrap;">🟢 Inicio</div>`,
    iconSize: [64, 22],
    iconAnchor: [32, 11]
  })

  const endIcon = L.divIcon({
    className: 'route-endpoint-marker',
    html: `<div style="background:#e11d48;color:#fff;font-weight:800;font-size:10px;padding:2px 7px;border-radius:9999px;border:2px solid #fff;box-shadow:0 3px 8px rgba(0,0,0,0.35);white-space:nowrap;">🏁 Meta</div>`,
    iconSize: [60, 22],
    iconAnchor: [30, 11]
  })

  startEndpointMarker = L.marker([startLat, startLng], { icon: startIcon, zIndexOffset: 900 })
    .bindPopup(`<div class="px-3 py-1 font-bold text-xs text-emerald-950">🟢 Punto de partida: ${escapeHtml(routeName || 'Ruta')}</div>`, { closeButton: false, className: 'custom-minimal-popup' })
    .addTo(routeEndpointsLayer)

  L.marker([endLat, endLng], { icon: endIcon, zIndexOffset: 900 })
    .bindPopup(`<div class="px-3 py-1 font-bold text-xs text-rose-900">🏁 Meta: ${escapeHtml(routeName || 'Ruta')}</div>`, { closeButton: false, className: 'custom-minimal-popup' })
    .addTo(routeEndpointsLayer)
}

const centerActiveRoute = () => {
  if (map && activeRouteBounds) {
    map.fitBounds(activeRouteBounds, { padding: [60, 60], duration: 1.0 })
  }
}

const openActiveRouteStart = () => {
  if (!map || !activeRouteBanner.value?.startCoord) return
  const [lng, lat] = activeRouteBanner.value.startCoord
  map.flyTo([lat, lng], 18, { duration: 1.0 })
  if (startEndpointMarker) {
    setTimeout(() => {
      if (startEndpointMarker) startEndpointMarker.openPopup()
    }, 350)
  }
}

const handleRouteFocusStart = (e) => {
  const ruta = e.detail
  if (!ruta) return
  handleRouteSelected({ detail: ruta })
  if (map && Array.isArray(ruta.startCoord) && ruta.startCoord.length >= 2) {
    const [lng, lat] = ruta.startCoord
    map.flyTo([lat, lng], 18, { duration: 1.0 })
    if (startEndpointMarker) {
      setTimeout(() => {
        if (startEndpointMarker) startEndpointMarker.openPopup()
      }, 350)
    }
  }
}

const handlePosterLocateOnMap = (e) => {
  const poster = e.detail
  if (!poster) return
  openPosterDirections(poster)
}

const clearSelectedRoute = () => {
  window.dispatchEvent(new CustomEvent('route-unselected'))
}

const handleRouteSelected = (e) => {
  const selectedRoute = e.detail
  if (!selectedRoute) return
  currentSelectedRouteId = selectedRoute.id || selectedRoute.route_id || null
  currentSelectedRouteName = selectedRoute.name || null
  if (!map || !routesLayer) return
  
  routesLayer.eachLayer((layer) => {
    const props = layer.feature?.properties || {}
    const coords = layer.feature?.geometry?.coordinates || []
    const isMatch = (currentSelectedRouteId && props.id === currentSelectedRouteId) ||
                    (currentSelectedRouteName && props.name === currentSelectedRouteName)
    if (isMatch) {
      layer.setStyle({
        color: props.color || '#facc15',
        weight: map.getZoom() >= 17 ? 6 : 5,
        opacity: 1,
        dashArray: 'none',
        className: ''
      })
      activeRouteBanner.value = {
        id: props.id,
        name: props.name || selectedRoute.name,
        color: props.color || selectedRoute.color || '#eab308',
        distance_label: selectedRoute.distance_label || props.distance_label || '',
        duration: selectedRoute.duration || props.duration,
        startCoord: coords.length > 0 ? coords[0] : (selectedRoute.startCoord || null)
      }
      renderRouteEndpoints(coords, props.name || selectedRoute.name)
      if (typeof layer.getBounds === 'function') {
        activeRouteBounds = layer.getBounds()
        map.fitBounds(activeRouteBounds, { padding: [60, 60], duration: 1.2 })
      }
    } else {
      layer.setStyle({
        opacity: 0
      })
    }
  })
}

const handleRouteUnselected = () => {
  currentSelectedRouteId = null
  currentSelectedRouteName = null
  activeRouteBanner.value = null
  activeRouteBounds = null
  clearRouteEndpoints()
  if (!map || !routesLayer) return
  routesLayer.eachLayer((layer) => {
    layer.setStyle({
      opacity: 0
    })
  })
}

onBeforeUnmount(() => {
  window.removeEventListener('route-selected', handleRouteSelected)
  window.removeEventListener('route-unselected', handleRouteUnselected)
  window.removeEventListener('route-focus-start', handleRouteFocusStart)
  window.removeEventListener('poster-locate-on-map', handlePosterLocateOnMap)
  window.removeEventListener('focus', refreshMapData)
  delete window.openPlaceSidebar
  clearRouteEndpoints()
  if (realtimeSyncInterval) {
    clearInterval(realtimeSyncInterval)
    realtimeSyncInterval = null
  }
  if (geoWatchId !== null && 'geolocation' in navigator) {
    navigator.geolocation.clearWatch(geoWatchId)
    geoWatchId = null
  }
  if (locationNoticeTimeout) {
    clearTimeout(locationNoticeTimeout)
    locationNoticeTimeout = null
  }
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

/* Marcador GPS en tiempo real del usuario */
:deep(.user-gps-marker) {
  background: transparent;
  border: none;
}
:deep(.gps-marker-wrapper) {
  position: relative;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.gps-core-dot) {
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  background-color: #2563eb;
  border: 2.5px solid #ffffff;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.6);
  z-index: 2;
}
:deep(.gps-pulse-ring) {
  position: absolute;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background-color: rgba(59, 130, 246, 0.45);
  animation: gps-pulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
  z-index: 1;
}
@keyframes gps-pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.9;
  }
  100% {
    transform: scale(2.2);
    opacity: 0;
  }
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
