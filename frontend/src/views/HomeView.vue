<template>
  <div class="relative w-full h-screen h-dvh overflow-hidden bg-slate-100">
    <!-- El Mapa (Protagonista 100% Pantalla) -->
    <div id="osm-map" class="absolute inset-0 w-full h-full z-0" @click="isSearchFocused = false"></div>
    
    <!-- Buscador Flotante Estilo Plataforma (Search / Filtros / Ruta Activa) -->
    <div class="absolute top-[54px] sm:top-[68px] md:top-24 left-2.5 right-2.5 sm:left-3 sm:right-3 md:left-6 md:right-auto md:w-[440px] z-[1000] pointer-events-none flex flex-col gap-1.5">
      
      <!-- Input de Búsqueda Principal -->
      <div class="relative pointer-events-auto">
        <div class="bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_24px_rgba(5,46,22,0.15)] border border-white/80 flex items-center px-3.5 py-1.5 md:px-4 md:py-2.5 transition-all focus-within:ring-2 ring-amber-400">
          <svg class="w-4 h-4 md:w-5 md:h-5 text-emerald-800/60 mr-2.5 md:mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input 
            ref="searchInputRef"
            v-model="searchQuery" 
            @focus="isSearchFocused = true"
            @input="onSearchInput"
            type="text" 
            placeholder="Buscar hoteles, cafés, atractivos..." 
            class="bg-transparent border-none outline-none w-full text-emerald-950 font-semibold placeholder-slate-400 text-xs sm:text-sm md:text-base" 
          />
          <button 
            v-if="searchQuery || activeCategories.length > 0" 
            @click="clearFilters" 
            type="button"
            title="Limpiar filtros"
            class="text-slate-400 hover:text-rose-600 p-1 rounded-full hover:bg-rose-50 transition-colors shrink-0 mr-1 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          <button 
            @click="showCategoryChips = !showCategoryChips" 
            type="button"
            :title="showCategoryChips ? 'Ocultar categorías' : 'Mostrar categorías'"
            :class="[
              'rounded-full p-1.5 md:p-2 transition-all shrink-0 ml-1 shadow-sm cursor-pointer flex items-center gap-1',
              activeCategories.length > 0 ? 'bg-amber-400 text-emerald-950 hover:bg-amber-300 font-extrabold px-2' : 'bg-emerald-950 text-white hover:bg-emerald-900'
            ]"
          >
            <svg class="w-3.5 h-3.5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            <span v-if="activeCategories.length > 0" class="text-[10px] tabular-metrics">{{ activeCategories.length }}</span>
          </button>
        </div>

        <!-- Dropdown de Resultados de Búsqueda -->
        <div 
          v-if="isSearchFocused && searchQuery.trim().length > 0" 
          class="absolute top-full left-0 right-0 mt-1.5 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(5,46,22,0.18)] border border-emerald-950/10 max-h-64 overflow-y-auto z-50 divide-y divide-slate-100"
        >
          <div v-if="searchResults.length === 0" class="p-4 text-center text-sm text-slate-500">
            No encontramos lugares para "<span class="font-bold text-emerald-950">{{ searchQuery }}</span>"
          </div>
          <button 
            v-for="place in searchResults" 
            :key="place.place_id"
            type="button"
            @click="selectSearchResult(place)"
            class="w-full px-4 py-2.5 text-left hover:bg-emerald-50/70 transition-colors flex items-center gap-3 cursor-pointer"
          >
            <img :src="place.image_url || '/logo.png'" :alt="place.name" class="w-9 h-9 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200" />
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <div class="font-extrabold text-xs sm:text-sm text-emerald-950 truncate">{{ place.name }}</div>
                <span v-if="getDistanceFromUser(place)" class="text-[10px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full shrink-0 tabular-metrics">
                  {{ getDistanceFromUser(place) }}
                </span>
              </div>
              <div class="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                <span class="inline-block w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: getCategoryColor(place.category) }"></span>
                <span class="font-medium text-slate-600">{{ place.category || 'Lugar' }}</span>
                <span v-if="place.formatted_address" class="text-slate-400">· {{ place.formatted_address }}</span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Chips de Herramientas + Categorías (1 sola fila deslizable en celular para no tapar el mapa) -->
      <div v-show="showCategoryChips" class="flex flex-nowrap md:flex-wrap overflow-x-auto hide-scrollbar items-center gap-1.5 pointer-events-auto py-0.5">
        <!-- Chip Estrella: Comercios con Beneficio / Cupón -->
        <button
          @click="toggleBenefitsFilter"
          type="button"
          :class="[
            'shrink-0 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm text-[11px] md:text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer border',
            onlyWithBenefits
              ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-md'
              : 'bg-amber-50/95 backdrop-blur-md text-emerald-950 hover:bg-amber-100 border-amber-300/90'
          ]"
          title="Ver comercios aliados que dan descuentos o cortesías por usar Zapatoqueando"
        >
          <span>🎁 Beneficios</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded-full tabular-metrics bg-emerald-950 text-amber-300">
            {{ partnerBenefitsCount }}
          </span>
        </button>

        <!-- Chip: Planes Curados en 1 Clic -->
        <button
          @click="showPlansPicker = !showPlansPicker"
          type="button"
          :class="[
            'shrink-0 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm text-[11px] md:text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer border',
            activeCuratedPlanId
              ? 'bg-emerald-950 text-amber-400 border-emerald-900 shadow-md'
              : 'bg-white/95 backdrop-blur-md text-emerald-950 hover:bg-emerald-50 border-emerald-200'
          ]"
          title="Armar plan de recorrido temático en 1 clic"
        >
          <span>✨ {{ activeCuratedPlan ? activeCuratedPlan.shortTitle : 'Planes 1 Clic' }}</span>
        </button>

        <!-- Chip: Ver Red de Senderos en el Mapa -->
        <button
          @click="toggleShowAllTrails"
          type="button"
          :class="[
            'shrink-0 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm text-[11px] md:text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer border',
            showAllTrails
              ? 'bg-emerald-950 text-amber-400 border-emerald-900 shadow-md'
              : 'bg-white/95 backdrop-blur-md text-emerald-950 hover:bg-emerald-50 border-emerald-200'
          ]"
          title="Superponer todos los senderos ecológicos por color de dificultad en el mapa"
        >
          <span>🥾 Senderos</span>
        </button>

        <!-- Chip: Mi Plan Personal Guardado -->
        <button
          v-if="savedPlaceIds.length > 0"
          @click="toggleOnlySavedPlan"
          type="button"
          :class="[
            'shrink-0 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm text-[11px] md:text-xs font-extrabold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer border',
            onlySavedPlan
              ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-md'
              : 'bg-white/95 backdrop-blur-md text-emerald-950 hover:bg-amber-50 border-amber-300'
          ]"
          title="Ver lugares guardados en Mi Plan"
        >
          <span>⭐ Mi Plan</span>
          <span class="text-[9px] px-1.5 py-0.2 rounded-full tabular-metrics bg-emerald-950 text-amber-300">
            {{ savedPlaceIds.length }}
          </span>
        </button>

        <!-- Categorías Tradicionales -->
        <button v-for="cat in categories" :key="cat.name" @click="toggleCategory(cat.name)"
          type="button"
          :class="[
            'shrink-0 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full shadow-sm text-[11px] md:text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer border',
            activeCategories.includes(cat.name) 
              ? 'bg-emerald-950 text-white border-emerald-900 shadow-md' 
              : 'bg-white/92 backdrop-blur-md text-slate-700 hover:bg-white border-white/80'
          ]">
          <span class="w-2 h-2 rounded-full shrink-0" :style="{ backgroundColor: cat.color }"></span>
          <span>{{ cat.icon }} {{ cat.name }}</span>
          <span v-if="getCategoryCount(cat.name) > 0" :class="['text-[9px] px-1.5 py-0.2 rounded-full tabular-metrics', activeCategories.includes(cat.name) ? 'bg-white/20 text-amber-300' : 'bg-slate-100 text-slate-500']">
            {{ getCategoryCount(cat.name) }}
          </span>
        </button>
      </div>

      <!-- Selector Desplegable de Planes Curados en 1 Clic -->
      <div
        v-if="showPlansPicker"
        class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-emerald-950/10 p-2.5 pointer-events-auto space-y-2"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold text-emerald-950">🧭 ¿Qué plan quieres hacer hoy en Zapatoca?</span>
          <button @click="showPlansPicker = false" type="button" class="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer">✕</button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          <button
            v-for="plan in curatedPlans"
            :key="plan.id"
            type="button"
            @click="selectCuratedPlan(plan.id)"
            :class="[
              'text-left p-2 rounded-xl border transition-all cursor-pointer flex items-start gap-2',
              activeCuratedPlanId === plan.id
                ? 'bg-emerald-950 text-white border-emerald-900 shadow-sm'
                : 'bg-stone-50 hover:bg-amber-50/70 text-emerald-950 border-slate-200/80'
            ]"
          >
            <span class="text-base leading-none mt-0.5">{{ plan.icon }}</span>
            <div class="min-w-0">
              <div class="text-xs font-extrabold leading-tight">{{ plan.title }}</div>
              <div :class="['text-[10px] mt-0.5 leading-snug', activeCuratedPlanId === plan.id ? 'text-amber-300' : 'text-slate-500']">
                {{ plan.subtitle }}
              </div>
            </div>
          </button>
        </div>
        <div v-if="activeCuratedPlanId" class="pt-1 flex justify-end">
          <button @click="selectCuratedPlan(null)" type="button" class="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer">
            Quitar plan activo
          </button>
        </div>
      </div>

      <!-- Píldoras de Estado: Filtro Activo, Guía Peatonal o HUD Compacto de Ruta -->
      <div v-if="hasActiveFilter || activeRouteBanner || activeGuide" class="flex flex-col gap-1.5 pointer-events-auto">
        <div v-if="hasActiveFilter" class="flex flex-wrap items-center gap-1.5">
          <div class="bg-emerald-950/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-white/15">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span class="tabular-metrics">{{ filteredPlacesCount }} lugares en el mapa</span>
            <button @click="clearFilters" type="button" class="text-amber-300 hover:text-amber-200 underline ml-1 cursor-pointer">Ver todos</button>
          </div>
        </div>

        <!-- HUD Compacto de Guía Peatonal Interna -->
        <div
          v-if="activeGuide"
          class="bg-emerald-950/95 backdrop-blur-xl text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center justify-between gap-2 border border-amber-400/50"
        >
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="w-5 h-5 rounded-full bg-amber-400 text-emerald-950 flex items-center justify-center text-[11px] font-black shrink-0">🧭</span>
            <div class="truncate font-extrabold text-white text-[11px] sm:text-xs">
              {{ activeGuide.targetName }}
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <span class="bg-white/15 text-amber-300 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold tabular-metrics whitespace-nowrap">
              {{ activeGuide.distanceLabel }} · ~{{ activeGuide.walkingMinutes }}m
            </span>
            <button
              v-if="!isTrackingLocation"
              @click="toggleUserLocation"
              type="button"
              class="bg-amber-400 hover:bg-amber-300 text-emerald-950 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold cursor-pointer"
              title="Activar mi ubicación GPS real"
            >
              📡 GPS
            </button>
            <button @click="clearGuideLine" type="button" title="Cerrar guía peatonal" class="text-slate-300 hover:text-rose-400 font-bold px-1 cursor-pointer">✕</button>
          </div>
        </div>

        <!-- HUD Ultra-Compacto de Ruta Seleccionada (No tapa el mapa en celular) -->
        <div v-if="activeRouteBanner" class="bg-white/95 backdrop-blur-md text-emerald-950 text-xs font-bold rounded-xl shadow-lg overflow-hidden border border-amber-400">
          <!-- Barra superior fina multicolor de dificultad -->
          <div v-if="activeRouteBanner.difficulty_breakdown && activeRouteBanner.difficulty_breakdown.length > 0" class="w-full h-1 flex bg-slate-100">
            <div
              v-for="seg in activeRouteBanner.difficulty_breakdown"
              :key="seg.difficulty"
              class="h-full"
              :style="{ width: `${seg.percent ?? seg.percentage ?? 100}%`, backgroundColor: seg.color }"
              :title="`${seg.difficulty}: ${seg.percent ?? seg.percentage ?? 100}%`"
            ></div>
          </div>

          <div class="px-2.5 py-1.5 flex items-center justify-between gap-1.5">
            <!-- Nombre, dificultad y distancia en una sola línea -->
            <div class="flex items-center gap-1.5 min-w-0">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: activeRouteBanner.color || '#eab308' }"></span>
              <span class="truncate font-extrabold text-[11px] sm:text-xs">🥾 {{ activeRouteBanner.name }}</span>
              <span v-if="activeRouteBanner.difficulty" class="shrink-0 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                {{ activeRouteBanner.difficulty }}
              </span>
              <span v-if="activeRouteBanner.distance_label" class="shrink-0 text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded-full tabular-metrics border border-emerald-200/60">
                {{ activeRouteBanner.distance_label }}
              </span>
            </div>

            <!-- Botones compactos de acción -->
            <div class="flex items-center gap-1 shrink-0">
              <button @click="centerActiveRoute" type="button" title="Centrar ruta completa en el mapa" class="text-emerald-800 hover:text-emerald-950 bg-emerald-100/80 px-1.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer">
                🎯
              </button>
              <button v-if="activeRouteBanner.startCoord" @click="openActiveRouteStart" type="button" title="Guiarme al inicio" class="text-emerald-900 hover:bg-amber-300 bg-amber-200/80 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer">
                🟢 Inicio
              </button>
              <router-link
                to="/rutas"
                title="Elegir otra ruta ecológica"
                class="bg-slate-100 hover:bg-slate-200 text-emerald-950 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer"
              >
                🥾 Rutas
              </router-link>
              <button
                v-if="routeNearbyPlaces.length > 0"
                @click="showRouteStops = !showRouteStops"
                type="button"
                title="Ver paradas y recompensas cercanas al sendero"
                :class="[
                  'px-1.5 py-0.5 rounded-full text-[10px] font-extrabold cursor-pointer border transition-colors',
                  showRouteStops
                    ? 'bg-emerald-950 text-amber-300 border-emerald-900'
                    : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                ]"
              >
                🍹 {{ routeNearbyPlaces.length }}
              </button>
              <button @click="clearSelectedRoute" type="button" title="Salir de la ruta" class="text-slate-400 hover:text-rose-600 font-bold px-1 text-xs cursor-pointer">✕</button>
            </div>
          </div>

          <!-- Desglose multicolor solo si tiene más de 1 tramo de dificultad distinta -->
          <div
            v-if="activeRouteBanner.difficulty_breakdown && activeRouteBanner.difficulty_breakdown.length > 1"
            class="px-2.5 pb-1.5 flex flex-wrap items-center gap-2 text-[9px] text-slate-600"
          >
            <span v-for="seg in activeRouteBanner.difficulty_breakdown" :key="seg.difficulty" class="inline-flex items-center gap-1 tabular-metrics">
              <span class="w-1.5 h-1.5 rounded-full" :style="{ backgroundColor: seg.color }"></span>
              <span>{{ seg.difficulty }} {{ seg.percent ?? seg.percentage ?? 100 }}%</span>
            </span>
          </div>

          <!-- Paradas cercanas desplegables bajo demanda (para no tapar el mapa) -->
          <div v-if="showRouteStops && routeNearbyPlaces.length > 0" class="px-2.5 py-1.5 border-t border-slate-200/80 bg-stone-50/90">
            <div class="text-[9px] font-extrabold uppercase tracking-wider text-emerald-900 mb-1 flex items-center justify-between">
              <span>🍹 Paradas cerca del sendero</span>
              <button @click="showRouteStops = false" type="button" class="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">Ocultar ▲</button>
            </div>
            <div class="flex gap-1.5 overflow-x-auto hide-scrollbar pb-0.5">
              <button
                v-for="stop in routeNearbyPlaces"
                :key="stop.place_id"
                type="button"
                @click="selectSearchResult(stop)"
                class="shrink-0 bg-white hover:bg-amber-50 border border-slate-200/90 hover:border-amber-300 rounded-lg px-2 py-1 text-left transition-all cursor-pointer flex items-center gap-1.5 max-w-[185px]"
              >
                <img :src="stop.image_url || '/logo.png'" class="w-6 h-6 rounded-md object-cover shrink-0 border border-slate-200" />
                <div class="min-w-0">
                  <div class="text-[10px] font-extrabold text-emerald-950 truncate flex items-center gap-1">
                    <span v-if="stop.is_partner" class="text-amber-500">★</span>
                    <span>{{ stop.name }}</span>
                  </div>
                  <div class="text-[9px] text-emerald-800 font-bold truncate">
                    {{ stop.offer_title ? `🎁 ${stop.offer_title}` : stop.category }}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles Flotantes de Geolocalización GPS (Parte Inferior Derecha) -->
    <div
      style="margin-bottom: env(safe-area-inset-bottom, 0px);"
      :class="[
        'fixed right-3.5 sm:right-4 md:right-6 z-[1005] flex flex-col items-end gap-2 pointer-events-auto transition-all duration-300',
        route.path === '/rutas' || posters.length === 0
          ? 'bottom-20 sm:bottom-8'
          : isSliderCompact
            ? 'bottom-40 md:bottom-36'
            : 'bottom-56 md:bottom-64'
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
        class="fixed bottom-32 sm:bottom-24 right-16 sm:right-20 z-[1006] max-w-[260px] sm:max-w-xs bg-white/95 backdrop-blur-md border border-emerald-200 shadow-xl rounded-2xl px-4 py-3 text-xs text-emerald-950 flex items-start gap-2.5 pointer-events-auto"
      >
        <span class="text-base leading-none mt-0.5">📡</span>
        <div class="flex-1 font-semibold leading-snug">{{ locationNotice }}</div>
        <button @click="locationNotice = null" class="text-slate-400 hover:text-slate-600 font-bold cursor-pointer">✕</button>
      </div>
    </transition>

    <!-- Slider Flotante de Publicidad (Posters) -->
    <transition name="slide-up">
      <div v-show="route.path !== '/rutas' && (loading || error || posters.length > 0)" style="padding-bottom: max(1rem, env(safe-area-inset-bottom, 1rem));" class="absolute bottom-0 left-0 w-full z-[1000] pointer-events-none pb-4 md:pb-6">
      
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
              <span>🧭 Guiarme en el mapa</span>
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

    <!-- Panel Lateral Derecho (Ficha Comercial y Turística del Lugar) -->
    <transition name="slide-fade">
      <div v-if="selectedPlace" class="fixed inset-y-0 right-0 w-full md:w-[430px] bg-white shadow-2xl z-[9999] flex flex-col border-l border-slate-100">
        <!-- Botón Cerrar -->
        <button @click="closePlaceDrawer" type="button" class="absolute top-4 right-4 bg-emerald-950/75 backdrop-blur-md text-white p-2 rounded-full shadow-md hover:bg-emerald-950 transition-colors z-10 cursor-pointer">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <!-- Imagen Destacada del Lugar + Insignia de Comercio Aliado -->
        <div class="w-full h-44 sm:h-52 max-h-[28vh] relative shrink-0 overflow-hidden bg-slate-100 border-b border-slate-200">
          <img :src="selectedPlace.image_url || '/logo.png'" :alt="selectedPlace.name" class="w-full h-full object-cover object-center" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent"></div>

          <!-- Sello Superior Izquierdo: Comercio Aliado Oficial -->
          <div v-if="selectedPlace.is_partner || selectedPlace.offer_title" class="absolute top-3.5 left-4">
            <span class="px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-400 text-emerald-950 shadow-md flex items-center gap-1 border border-white/70">
              <span>🤝 Comercio Aliado Oficial</span>
            </span>
          </div>

          <div class="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
            <span v-if="selectedPlace.category" class="px-3 py-1 rounded-full text-[11px] font-extrabold text-white shadow-sm" :style="{ backgroundColor: getCategoryColor(selectedPlace.category) }">
              {{ selectedPlace.category }}
            </span>
            <div class="flex items-center gap-1.5">
              <span v-if="getDistanceFromUser(selectedPlace)" class="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/95 text-emerald-950 shadow-sm flex items-center gap-1 tabular-metrics">
                <span>📍</span>
                <span>A {{ getDistanceFromUser(selectedPlace) }}</span>
              </span>
              <span class="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/85 text-amber-300 shadow-sm tabular-metrics">
                🛂 {{ selectedPlace.checkins_count || 0 }} sellos
              </span>
            </div>
          </div>
        </div>

        <!-- Contenido Detallado Editorial y Comercial -->
        <div class="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-3.5 hide-scrollbar bg-stone-50">
          <div class="flex items-start justify-between gap-2">
            <h2 class="text-xl sm:text-2xl font-extrabold text-emerald-950 leading-tight">{{ selectedPlace.name }}</h2>
            <button
              @click="toggleSavePlace(selectedPlace)"
              type="button"
              :class="[
                'shrink-0 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all cursor-pointer flex items-center gap-1',
                isPlaceInPlan(selectedPlace.place_id)
                  ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-amber-50 border-slate-200'
              ]"
              title="Guardar en Mi Plan de viaje"
            >
              <span>{{ isPlaceInPlan(selectedPlace.place_id) ? '⭐ En Mi Plan' : '☆ Mi Plan' }}</span>
            </button>
          </div>

          <!-- Píldoras de Especialidad, Horario y Rango de Precio -->
          <div v-if="selectedPlace.specialty || selectedPlace.schedule || selectedPlace.price_range" class="flex flex-wrap gap-1.5">
            <span v-if="selectedPlace.specialty" class="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-emerald-950 border border-amber-200/90 px-3 py-1 rounded-xl">
              ✨ {{ selectedPlace.specialty }}
            </span>
            <span v-if="selectedPlace.schedule" class="inline-flex items-center gap-1 text-xs font-semibold bg-white text-slate-700 border border-slate-200/80 px-2.5 py-1 rounded-xl">
              🕒 {{ selectedPlace.schedule }}
            </span>
            <span v-if="selectedPlace.price_range" class="inline-flex items-center gap-1 text-xs font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200/70 px-2.5 py-1 rounded-xl">
              💳 {{ selectedPlace.price_range }}
            </span>
          </div>

          <!-- Tarjeta Troquelada de Beneficio / Cupón Exclusivo Zapatoqueando -->
          <div
            v-if="selectedPlace.offer_title || selectedPlace.is_partner"
            class="bg-gradient-to-br from-amber-50 via-white to-amber-100/60 border-2 border-dashed border-amber-400 rounded-2xl p-4 shadow-xs space-y-2.5"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-300/80 px-2.5 py-0.5 rounded-full">
                🎁 Beneficio Exclusivo App
              </span>
              <span v-if="selectedPlace.offer_code" class="text-[11px] font-mono font-extrabold text-emerald-950 bg-white px-2 py-0.5 rounded border border-amber-300">
                #{{ selectedPlace.offer_code }}
              </span>
            </div>
            <p class="text-sm font-extrabold text-emerald-950 leading-snug">
              {{ selectedPlace.offer_title || 'Atención preferencial y recomendación oficial del Pasaporte Zapatoqueando' }}
            </p>
            <div v-if="activeCouponTicketPlaceId === selectedPlace.place_id" class="bg-emerald-950 text-white p-3 rounded-xl space-y-1 border border-amber-400/50">
              <div class="flex items-center justify-between text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                <span>🎟️ Ticket Activo en Caja</span>
                <span class="tabular-metrics">{{ liveClockLabel }}</span>
              </div>
              <div class="text-xs font-extrabold">Muestra esta pantalla en {{ selectedPlace.name }}</div>
              <div class="text-[11px] font-mono text-amber-400 font-black">
                Código: {{ selectedPlace.offer_code || `ZPK-${selectedPlace.place_id}` }}
              </div>
            </div>
            <button
              v-else
              @click="activateCouponInBox(selectedPlace)"
              type="button"
              class="w-full bg-emerald-950 hover:bg-emerald-900 text-amber-400 font-extrabold py-2 px-3 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>🎟️ Activar Ticket para Mostrar en Caja</span>
            </button>
          </div>

          <!-- Dirección y Audio-Guía -->
          <div class="bg-white p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-2.5 shadow-2xs">
            <div class="flex items-start gap-2 min-w-0">
              <svg class="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
              <span class="text-slate-700 text-xs sm:text-sm font-medium">{{ selectedPlace.formatted_address || 'Zapatoca, Santander' }}</span>
            </div>
            <button
              @click="toggleAudioGuide(selectedPlace)"
              type="button"
              :class="[
                'shrink-0 px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1 border',
                isSpeakingAudio
                  ? 'bg-rose-100 text-rose-800 border-rose-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
              ]"
              title="Escuchar historia y recomendación con voz"
            >
              <span>{{ isSpeakingAudio ? '⏹️ Detener' : '🔊 Escuchar' }}</span>
            </button>
          </div>

          <div v-if="selectedPlace.description" class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <p class="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{{ selectedPlace.description }}</p>
          </div>

          <!-- Sellar Pasaporte Turístico Zapatoca -->
          <div class="bg-white p-3.5 rounded-2xl border border-emerald-950/15 flex items-center justify-between gap-3 shadow-2xs">
            <div class="min-w-0">
              <div class="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                <span>🛂 Pasaporte Turístico Zapatoca</span>
              </div>
              <p class="text-[11px] text-slate-500 leading-snug">
                {{ hasPassportStamp(selectedPlace.place_id) ? '¡Ya tienes el sello oficial de este lugar en tu Pasaporte!' : 'Registra tu visita y suma sellos para desbloquear beneficios.' }}
              </p>
            </div>
            <button
              @click="stampPlaceInPassport(selectedPlace)"
              type="button"
              :disabled="hasPassportStamp(selectedPlace.place_id)"
              :class="[
                'shrink-0 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer',
                hasPassportStamp(selectedPlace.place_id)
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                  : 'bg-emerald-950 hover:bg-emerald-900 text-amber-400 shadow-sm'
              ]"
            >
              {{ hasPassportStamp(selectedPlace.place_id) ? '💮 Sellado ✓' : '💮 Sellar Visita' }}
            </button>
          </div>

          <!-- Botones Principales de Conversión (WhatsApp B2B + Guía en Mapa + Compartir) -->
          <div class="mt-auto pt-2 flex flex-col gap-2">
            <button
              v-if="selectedPlace.whatsapp || selectedPlace.is_partner || selectedPlace.offer_title"
              @click="contactPlaceWhatsApp(selectedPlace)"
              type="button"
              class="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
            >
              <span>💬 Reservar / Pedir con Beneficio por WhatsApp</span>
            </button>

            <div class="flex flex-col sm:flex-row gap-2">
              <button 
                @click="openDirections(selectedPlace)" 
                type="button"
                class="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold py-3 px-4 rounded-xl shadow-sm transition-colors flex justify-center items-center gap-2 cursor-pointer text-sm"
              >
                <span>🧭 Guiarme en el mapa</span>
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

            <!-- CTA para que el dueño de un negocio aún no aliado quiera vincularse -->
            <button
              v-if="!selectedPlace.is_partner"
              @click="openPartnerApplyForPlace(selectedPlace)"
              type="button"
              class="mt-1 w-full text-center text-[11px] font-bold text-emerald-900 hover:text-emerald-950 bg-amber-50/90 hover:bg-amber-100 border border-amber-200/80 py-2 px-3 rounded-xl transition-colors cursor-pointer"
            >
              🏪 ¿Eres el propietario de {{ selectedPlace.name }}? Vincúlate como Comercio Aliado aquí →
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal del Pasaporte Turístico Oficial Zapatoca -->
    <transition name="slide-up">
      <div v-if="showPassportModal" class="fixed inset-0 bg-emerald-950/65 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
        <div class="bg-stone-50 rounded-3xl shadow-2xl w-full max-w-lg max-h-[88vh] flex flex-col overflow-hidden border border-amber-300/70">
          <!-- Cabecera Editorial del Pasaporte -->
          <div class="bg-emerald-950 text-white px-6 py-5 flex items-start justify-between gap-3 relative overflow-hidden">
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest text-amber-400 block">República del Clima de Seda · Santander</span>
              <h3 class="text-lg sm:text-xl font-extrabold text-white mt-0.5 flex items-center gap-2">
                <span>🛂 Pasaporte Turístico Zapatoca</span>
              </h3>
              <p class="text-xs text-emerald-200 mt-1">
                Nivel actual: <strong class="text-amber-300">{{ passportLevel.title }}</strong> ({{ passportStamps.length }} sellos)
              </p>
            </div>
            <button @click="showPassportModal = false" type="button" class="text-emerald-200 hover:text-white p-1.5 rounded-full bg-white/10 cursor-pointer">
              ✕
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-5 space-y-4">
            <!-- Barra de Progreso de Recompensas -->
            <div class="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
              <div class="flex justify-between items-center text-xs font-extrabold text-emerald-950">
                <span>{{ passportLevel.badge }} {{ passportLevel.title }}</span>
                <span class="tabular-metrics text-amber-700">{{ passportStamps.length }} / {{ passportLevel.nextGoal }} sellos</span>
              </div>
              <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-emerald-700 via-amber-500 to-amber-400 transition-all duration-500"
                  :style="{ width: `${Math.min(100, Math.round((passportStamps.length / passportLevel.nextGoal) * 100))}%` }"
                ></div>
              </div>
              <p class="text-[11px] text-slate-600 leading-snug">
                {{ passportLevel.hint }}
              </p>
            </div>

            <!-- Sellos Estampados -->
            <div>
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">💮 Mis Sellos Coleccionados ({{ passportStamps.length }})</h4>
              <div v-if="passportStamps.length === 0" class="bg-white p-4 rounded-2xl border border-dashed border-slate-300 text-center text-xs text-slate-500">
                Aún no tienes sellos. Abre cualquier atractivo o comercio aliado en el mapa y pulsa <strong>"💮 Sellar Visita"</strong>.
              </div>
              <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div
                  v-for="stamp in passportStamps"
                  :key="stamp.place_id"
                  class="bg-white p-3 rounded-2xl border-2 border-emerald-800/30 shadow-2xs flex flex-col justify-between relative overflow-hidden"
                >
                  <span class="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full self-start mb-1">
                    💮 Sello Oficial
                  </span>
                  <div class="font-extrabold text-xs text-emerald-950 leading-tight truncate">{{ stamp.name }}</div>
                  <div class="text-[10px] text-slate-400 mt-1 tabular-metrics">{{ stamp.date }}</div>
                </div>
              </div>
            </div>

            <!-- Beneficios Disponibles en Comercios Aliados -->
            <div>
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-amber-800 mb-2">🎁 Beneficios Activos en Comercios Aliados ({{ partnerPlacesWithOffers.length }})</h4>
              <div class="space-y-2">
                <div
                  v-for="partner in partnerPlacesWithOffers"
                  :key="partner.place_id"
                  @click="showPassportModal = false; selectSearchResult(partner)"
                  class="bg-white hover:bg-amber-50/60 p-3 rounded-2xl border border-amber-300/80 shadow-2xs flex items-center justify-between gap-3 cursor-pointer transition-colors"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <img :src="partner.image_url || '/logo.png'" class="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-200" />
                    <div class="min-w-0">
                      <div class="text-xs font-extrabold text-emerald-950 truncate">🤝 {{ partner.name }}</div>
                      <div class="text-[11px] font-bold text-amber-800 truncate">
                        🎁 {{ partner.offer_title || 'Beneficio exclusivo presentando tu Pasaporte' }}
                      </div>
                    </div>
                  </div>
                  <span class="shrink-0 text-[11px] font-extrabold bg-amber-400 text-emerald-950 px-2.5 py-1 rounded-xl">
                    Ver →
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Modal B2B Express: "¿Tienes un negocio en Zapatoca? Vincúlate en 30 segundos" -->
    <transition name="slide-up">
      <div v-if="showPartnerApplyModal" class="fixed inset-0 bg-emerald-950/65 backdrop-blur-xs z-[9999] flex items-center justify-center p-4">
        <div class="bg-stone-50 rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden border border-amber-300/80">
          <div class="bg-emerald-950 text-white px-6 py-5 flex items-start justify-between gap-3">
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest text-amber-400 block">Alianza Comercial B2B · Zapatoqueando</span>
              <h3 class="text-lg font-extrabold text-white mt-0.5">🏪 Vincular mi Negocio a la Plataforma</h3>
              <p class="text-xs text-emerald-200 mt-1">Atrae turistas y senderistas directo a tu WhatsApp y caja registradora.</p>
            </div>
            <button @click="showPartnerApplyModal = false" type="button" class="text-emerald-200 hover:text-white p-1.5 rounded-full bg-white/10 cursor-pointer">
              ✕
            </button>
          </div>

          <form @submit.prevent="submitPartnerApplication" class="flex-1 overflow-y-auto p-5 space-y-3.5">
            <div class="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-emerald-950 space-y-1">
              <div class="font-extrabold">¿Por qué vincular tu comercio a Zapatoqueando?</div>
              <div>1. 📍 <strong>Pin Dorado Destacado</strong> en el mapa y en el filtro de Beneficios.</div>
              <div>2. 🥾 <strong>Parada Recomendada</strong> para los turistas que terminan senderos cerca de tu local.</div>
              <div>3. 📲 <strong>Reservas y pedidos directo a tu WhatsApp</strong> sin comisiones de intermediarios.</div>
            </div>

            <div>
              <label class="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">Nombre de tu Negocio</label>
              <input v-model="partnerApplyForm.businessName" type="text" required placeholder="Ej: Restaurante El Solar / Café La Loma" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-emerald-950 font-semibold outline-none focus:border-emerald-700" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">Categoría</label>
                <select v-model="partnerApplyForm.category" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-bold text-emerald-950 outline-none">
                  <option value="Restaurantes">🍽️ Restaurante</option>
                  <option value="CafeBar">☕ Café / Bar</option>
                  <option value="Hospedajes">🏨 Hotel / Hospedaje</option>
                  <option value="Fuentes de soda">🥤 Fuente de soda / Postres</option>
                  <option value="Puntos de interés">🛍️ Artesanías / Dulces / Experiencias</option>
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">Tu WhatsApp Comercial</label>
                <input v-model="partnerApplyForm.whatsapp" type="text" required placeholder="Ej: 3150000000" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-emerald-950 font-semibold outline-none" />
              </div>
            </div>

            <div>
              <label class="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">Especialidad de la Casa</label>
              <input v-model="partnerApplyForm.specialty" type="text" required placeholder="Ej: Cabro santandereano, génovas, café orgánico, vino de naranja" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-emerald-950 outline-none" />
            </div>

            <div>
              <label class="block text-[11px] font-extrabold uppercase tracking-wider text-slate-600 mb-1">🎁 ¿Qué beneficio o cortesía darás a los turistas de la App?</label>
              <input v-model="partnerApplyForm.offerTitle" type="text" required placeholder="Ej: 10% de descuento o bebida/postre de cortesía" class="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-emerald-950 font-semibold outline-none" />
              <div class="flex flex-wrap gap-1.5 mt-1.5">
                <button type="button" @click="partnerApplyForm.offerTitle = '10% de descuento mostrando la App Zapatoqueando'" class="text-[10px] font-bold bg-amber-100 text-emerald-950 px-2 py-0.5 rounded-lg cursor-pointer">+ 10% Dcto</button>
                <button type="button" @click="partnerApplyForm.offerTitle = 'Café o postre típico de cortesía con tu almuerzo'" class="text-[10px] font-bold bg-amber-100 text-emerald-950 px-2 py-0.5 rounded-lg cursor-pointer">+ Cortesía</button>
                <button type="button" @click="partnerApplyForm.offerTitle = 'Bebida refrescante 2x1 para senderistas'" class="text-[10px] font-bold bg-amber-100 text-emerald-950 px-2 py-0.5 rounded-lg cursor-pointer">+ 2x1 Senderistas</button>
              </div>
            </div>

            <div class="pt-2 flex justify-end gap-2">
              <button type="button" @click="showPartnerApplyModal = false" class="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer">Cancelar</button>
              <button type="submit" class="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-5 py-2.5 rounded-xl text-xs shadow-sm cursor-pointer">
                📲 Enviar Solicitud de Alianza
              </button>
            </div>
          </form>
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

let routesLayer = null
let activeRouteSegmentsLayer = null
let guideLineLayer = null
let planCircuitLayer = null
let streetsLayer = null
let markersLayer = null
let zapatocaMarker = null
let laFuenteMarker = null
let userLocationMarker = null
let userAccuracyCircle = null
let geoWatchId = null
let locationNoticeTimeout = null
let liveClockInterval = null
let zapatocaBounds = null

let currentSelectedRouteId = null
let currentSelectedRouteName = null

const PARQUE_PRINCIPAL_COORDS = { lat: 6.816801, lng: -73.268689 }
const DIFFICULTY_COLORS = {
  'Fácil': '#eab308',
  'Media': '#f97316',
  'Difícil': '#ea580c',
  'Experto': '#dc2626'
}

// El plugin leaflet-textpath requiere que L esté en window
window.L = L
import 'leaflet-textpath'

delete L.Icon.Default.prototype._getIconUrl

// Marcador diferenciado: los Comercios Aliados tienen halo dorado e insignia estrella
const createMinimalDot = (colorHex, isPartner = false) => {
  if (isPartner) {
    return L.divIcon({
      className: 'minimal-marker partner-marker',
      html: `
        <div style="position:relative;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.25)'" onmouseout="this.style.transform='scale(1)'">
          <svg viewBox="0 0 28 28" width="26" height="26" style="filter: drop-shadow(0px 3px 5px rgba(5,46,22,0.55));">
            <circle cx="14" cy="14" r="12" fill="#fbbf24" stroke="#ffffff" stroke-width="2"/>
            <circle cx="14" cy="14" r="8.5" fill="${colorHex}"/>
          </svg>
          <span style="position:absolute;top:-4px;right:-4px;background:#052e16;color:#fbbf24;font-size:9px;font-weight:900;line-height:1;padding:2px 3px;border-radius:9999px;border:1.5px solid #fbbf24;">★</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14]
    })
  }
  return L.divIcon({
    className: 'minimal-marker',
    html: `<svg viewBox="0 0 24 24" width="20" height="20" style="filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.5)); transform-origin: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.3)'" onmouseout="this.style.transform='scale(1)'"><circle cx="12" cy="12" r="10" fill="${colorHex}" stroke="white" stroke-width="2"/></svg>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11]
  })
}

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
const allRoutesFeatures = ref([])
const loading = ref(true)
const error = ref(null)
const selectedPlace = ref(null)
const selectedPoster = ref(null)
const route = useRoute()
const isHoveringSlider = ref(false)
const isSliderCompact = ref(typeof window !== 'undefined' && window.innerWidth < 768)
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

// Estados B2B2C: Filtros de Beneficios, Planes Curados, Senderos, Mi Plan, Pasaporte, Audio-Guía y Guía Peatonal
const onlyWithBenefits = ref(false)
const showPlansPicker = ref(false)
const activeCuratedPlanId = ref(null)
const showAllTrails = ref(false)
const onlySavedPlan = ref(false)
const savedPlaceIds = ref([])
const passportStamps = ref([])
const showPassportModal = ref(false)
const showPartnerApplyModal = ref(false)
const activeCouponTicketPlaceId = ref(null)
const liveClockLabel = ref('')
const isSpeakingAudio = ref(false)
const activeGuide = ref(null)

const partnerApplyForm = ref({
  businessName: '',
  category: 'Restaurantes',
  whatsapp: '',
  specialty: '',
  offerTitle: '10% de descuento mostrando la App Zapatoqueando'
})

const curatedPlans = [
  {
    id: 'cafe-sabores',
    icon: '☕',
    shortTitle: 'Plan Café y Sabores',
    title: 'Ruta del Café, Génova y Sabores',
    subtitle: 'Cafés especiales, restaurantes típicos y dulces tradicionales',
    categories: ['CafeBar', 'Restaurantes', 'Fuentes de soda']
  },
  {
    id: 'romantico-miradores',
    icon: '💑',
    shortTitle: 'Plan Miradores',
    title: 'Fin de Semana Romántico y Miradores',
    subtitle: 'Atractivos panorámicos, hospedajes con encanto y buena mesa',
    categories: ['Lugares turísticos', 'Hospedajes', 'CafeBar']
  },
  {
    id: 'familia-tradicion',
    icon: '👨‍👩‍👧‍👦',
    shortTitle: 'Plan Familia',
    title: 'Plan Familia, Historia y Tradición',
    subtitle: 'Puntos históricos, postres, parques y gastronomía familiar',
    categories: ['Puntos de interés', 'Lugares turísticos', 'Fuentes de soda', 'Restaurantes']
  },
  {
    id: 'senderista',
    icon: '🥾',
    shortTitle: 'Plan Senderista',
    title: 'Aventura Senderista + Hidratación',
    subtitle: 'Activa la red de senderos y los puntos de hidratación cercanos',
    categories: ['Lugares turísticos', 'Fuentes de soda', 'CafeBar'],
    enableTrails: true
  }
]

const activeCuratedPlan = computed(() => {
  return curatedPlans.find(p => p.id === activeCuratedPlanId.value) || null
})

let map = null

const updateLiveClock = () => {
  const now = new Date()
  liveClockLabel.value = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

const loadLocalTouristState = () => {
  try {
    const rawPlan = localStorage.getItem('zapatoqueando_mi_plan_v1')
    savedPlaceIds.value = rawPlan ? JSON.parse(rawPlan) : []
  } catch {
    savedPlaceIds.value = []
  }
  try {
    const rawPassport = localStorage.getItem('zapatoqueando_passport_v1')
    passportStamps.value = rawPassport ? JSON.parse(rawPassport) : []
  } catch {
    passportStamps.value = []
  }
}

const isPlaceInPlan = (placeId) => {
  return savedPlaceIds.value.includes(String(placeId))
}

const toggleSavePlace = (place) => {
  if (!place) return
  const id = String(place.place_id)
  const idx = savedPlaceIds.value.indexOf(id)
  if (idx === -1) {
    savedPlaceIds.value.push(id)
    showLocationNotice(`⭐ "${place.name}" guardado en Mi Plan de viaje.`, 3200)
  } else {
    savedPlaceIds.value.splice(idx, 1)
    if (savedPlaceIds.value.length === 0) {
      onlySavedPlan.value = false
    }
  }
  localStorage.setItem('zapatoqueando_mi_plan_v1', JSON.stringify(savedPlaceIds.value))
  updateMarkers()
  syncMarkersVisibility()
}

const hasPassportStamp = (placeId) => {
  return passportStamps.value.some(s => String(s.place_id) === String(placeId))
}

const passportLevel = computed(() => {
  const count = passportStamps.value.length
  if (count >= 5) {
    return {
      badge: '👑',
      title: 'Embajador del Clima de Seda',
      nextGoal: Math.max(count, 8),
      hint: '¡Nivel máximo alcanzado! Presenta tu Pasaporte en cualquier Comercio Aliado para redimir tus beneficios VIP.'
    }
  }
  if (count >= 2) {
    return {
      badge: '🥾',
      title: 'Caminante de Lengerke',
      nextGoal: 5,
      hint: `Te faltan ${5 - count} sellos para convertirte en Embajador del Clima de Seda.`
    }
  }
  return {
    badge: '🌱',
    title: 'Visitante Curioso',
    nextGoal: 2,
    hint: 'Sella tus primeros 2 lugares o comercios aliados en Zapatoca para subir al nivel Caminante de Lengerke.'
  }
})

const partnerPlacesWithOffers = computed(() => {
  return places.value.filter(p => p.is_partner || p.offer_title)
})

const partnerBenefitsCount = computed(() => {
  return partnerPlacesWithOffers.value.length
})

const trackPlaceMetric = async (placeId, type) => {
  if (!placeId) return
  try {
    const res = await fetch(`/api/places/${encodeURIComponent(placeId)}/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type })
    })
    if (res.ok) {
      const json = await res.json().catch(() => null)
      if (json?.data) {
        const idx = places.value.findIndex(p => String(p.place_id) === String(placeId))
        if (idx !== -1) {
          places.value[idx] = { ...places.value[idx], ...json.data }
        }
        if (selectedPlace.value && String(selectedPlace.value.place_id) === String(placeId)) {
          selectedPlace.value = { ...selectedPlace.value, ...json.data }
        }
      }
    }
  } catch {
    // Silencioso si está offline
  }
}

const stampPlaceInPassport = (place) => {
  if (!place || hasPassportStamp(place.place_id)) return
  const now = new Date()
  const stamp = {
    place_id: String(place.place_id),
    name: place.name,
    category: place.category,
    date: now.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
  }
  passportStamps.value.unshift(stamp)
  localStorage.setItem('zapatoqueando_passport_v1', JSON.stringify(passportStamps.value))
  window.dispatchEvent(new CustomEvent('passport-updated'))
  trackPlaceMetric(place.place_id, 'checkin')
  showLocationNotice(`💮 ¡Sello de "${place.name}" añadido a tu Pasaporte Turístico!`, 4000)
}

const activateCouponInBox = (place) => {
  if (!place) return
  updateLiveClock()
  activeCouponTicketPlaceId.value = place.place_id
  trackPlaceMetric(place.place_id, 'checkin')
  if (!hasPassportStamp(place.place_id)) {
    stampPlaceInPassport(place)
  }
}

const contactPlaceWhatsApp = (place) => {
  if (!place) return
  trackPlaceMetric(place.place_id, 'whatsapp')
  const rawPhone = String(place.whatsapp || '573000000000').replace(/[^0-9]/g, '')
  const phone = rawPhone.startsWith('57') ? rawPhone : `57${rawPhone}`
  const benefitPart = place.offer_title
    ? ` y redimir el beneficio exclusivo: "${place.offer_title}" (Código: ${place.offer_code || 'ZPK-' + place.place_id})`
    : ''
  const text = `¡Hola ${place.name}! 👋 Los vi en la plataforma oficial *Zapatoqueando* 🥾✨ y me gustaría consultar disponibilidad / hacer un pedido${benefitPart}.`
  window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank', 'noopener')
}

const toggleAudioGuide = (place) => {
  if (!('speechSynthesis' in window) || !place) {
    showLocationNotice('Tu navegador no soporta narración de voz.', 3500)
    return
  }
  if (isSpeakingAudio.value) {
    window.speechSynthesis.cancel()
    isSpeakingAudio.value = false
    return
  }
  window.speechSynthesis.cancel()
  const parts = [
    `${place.name}.`,
    place.Category ? `Categoría: ${place.category}.` : '',
    place.specialty ? `Especialidad recomendada: ${place.specialty}.` : '',
    place.description || '',
    place.offer_title ? `Beneficio exclusivo en Zapatoqueando: ${place.offer_title}.` : ''
  ].filter(Boolean)
  const utterance = new SpeechSynthesisUtterance(parts.join(' '))
  utterance.lang = 'es-CO'
  utterance.rate = 1.0
  utterance.onend = () => {
    isSpeakingAudio.value = false
  }
  utterance.onerror = () => {
    isSpeakingAudio.value = false
  }
  isSpeakingAudio.value = true
  window.speechSynthesis.speak(utterance)
}

const stopAudioGuide = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  isSpeakingAudio.value = false
}

const closePlaceDrawer = () => {
  stopAudioGuide()
  selectedPlace.value = null
}

const openPartnerApplyForPlace = (place) => {
  partnerApplyForm.value = {
    businessName: place?.name || '',
    category: place?.category || 'Restaurantes',
    whatsapp: place?.whatsapp || '',
    specialty: place?.specialty || '',
    offerTitle: place?.offer_title || '10% de descuento mostrando la App Zapatoqueando'
  }
  showPartnerApplyModal.value = true
}

const submitPartnerApplication = () => {
  const f = partnerApplyForm.value
  const msg = `🤝 *SOLICITUD DE ALIANZA COMERCIAL - ZAPATOQUEANDO*\n\n🏪 *Negocio:* ${f.businessName}\n📂 *Categoría:* ${f.category}\n📱 *WhatsApp:* ${f.whatsapp}\n✨ *Especialidad:* ${f.specialty}\n🎁 *Beneficio para Turistas:* ${f.offerTitle}`
  showPartnerApplyModal.value = false
  showLocationNotice('¡Solicitud lista! Te conectamos por WhatsApp para activar tu Sello de Comercio Aliado.', 5000)
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank', 'noopener')
}

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
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const formatDistanceFromMeters = (meters) => {
  if (!Number.isFinite(meters) || meters <= 0) return '0 m'
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(1)} km`
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
  return formatDistanceFromMeters(meters)
}

// Motor de Guía Peatonal Interna (Reemplazo 100% dentro de nuestro mapa a Google Maps)
const clearGuideLine = () => {
  activeGuide.value = null
  if (guideLineLayer && map) {
    map.removeLayer(guideLineLayer)
    guideLineLayer = null
  }
}

const renderGuideLineOnMap = (shouldFitBounds = false) => {
  if (!map || !activeGuide.value) return
  if (guideLineLayer) {
    map.removeLayer(guideLineLayer)
    guideLineLayer = null
  }

  const originLat = userCoords.value ? userCoords.value.lat : PARQUE_PRINCIPAL_COORDS.lat
  const originLng = userCoords.value ? userCoords.value.lng : PARQUE_PRINCIPAL_COORDS.lng
  const targetLat = Number(activeGuide.value.targetLat)
  const targetLng = Number(activeGuide.value.targetLng)

  const meters = calculateDistanceMeters(originLat, originLng, targetLat, targetLng)
  const walkingMinutes = Math.max(1, Math.round(meters / 75))

  activeGuide.value = {
    ...activeGuide.value,
    fromGps: Boolean(userCoords.value),
    distanceLabel: formatDistanceFromMeters(meters),
    walkingMinutes
  }

  guideLineLayer = L.layerGroup().addTo(map)

  // Halo exterior oscuro para alto contraste sobre mapa satelital
  L.polyline(
    [
      [originLat, originLng],
      [targetLat, targetLng]
    ],
    {
      color: '#052e16',
      weight: 8,
      opacity: 0.75,
      lineCap: 'round'
    }
  ).addTo(guideLineLayer)

  // Línea punteada ámbar de guía peatonal
  L.polyline(
    [
      [originLat, originLng],
      [targetLat, targetLng]
    ],
    {
      color: '#fbbf24',
      weight: 4,
      opacity: 1,
      dashArray: '8, 10',
      lineCap: 'round'
    }
  ).addTo(guideLineLayer)

  if (!userCoords.value) {
    const originIcon = L.divIcon({
      className: 'guide-origin-marker',
      html: `<div style="background:#052e16;color:#fbbf24;font-weight:800;font-size:10px;padding:2px 7px;border-radius:9999px;border:1.5px solid #fbbf24;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,0.4);">🏛️ Parque Principal</div>`,
      iconSize: [110, 22],
      iconAnchor: [55, 11]
    })
    L.marker([originLat, originLng], { icon: originIcon }).addTo(guideLineLayer)
  }

  if (shouldFitBounds) {
    const bounds = L.latLngBounds([
      [originLat, originLng],
      [targetLat, targetLng]
    ])
    map.fitBounds(bounds, { padding: [70, 70], maxZoom: 18, duration: 1.0 })
  }
}

const drawWalkingGuideTo = (targetLat, targetLng, targetName) => {
  if (!Number.isFinite(Number(targetLat)) || !Number.isFinite(Number(targetLng))) return
  activeGuide.value = {
    targetLat: Number(targetLat),
    targetLng: Number(targetLng),
    targetName: targetName || 'Destino',
    fromGps: Boolean(userCoords.value),
    distanceLabel: '0 m',
    walkingMinutes: 1
  }
  renderGuideLineOnMap(true)
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

  if (activeGuide.value) {
    renderGuideLineOnMap(false)
  }

  if (shouldCenter) {
    if (outsideBounds) {
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

      updateUserMapLayers(latitude, longitude, accuracy, isFirstFix)

      if (
        isFirstFix ||
        !userCoords.value ||
        calculateDistanceMeters(userCoords.value.lat, userCoords.value.lng, latitude, longitude) >= 1
      ) {
        userCoords.value = { lat: latitude, lng: longitude, accuracy }
        if (activeGuide.value) {
          renderGuideLineOnMap(false)
        }
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
  if (activeGuide.value) {
    renderGuideLineOnMap(false)
  }
}

const centerOnZapatoca = () => {
  if (!map) return
  map.setView([6.816801, -73.268689], 16, { animate: false })
  if (zapatocaBounds) {
    map.setMaxBounds(zapatocaBounds)
  }
}

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

const openDirections = (place) => {
  if (!place) return
  stopAudioGuide()
  selectedPlace.value = null
  if (map && place.location && place.location.lat && place.location.lng) {
    drawWalkingGuideTo(place.location.lat, place.location.lng, place.name)
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
      openPlaceDrawer(matchedPlace)
      drawWalkingGuideTo(matchedPlace.location.lat, matchedPlace.location.lng, matchedPlace.name)
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
  const shareText = `📍 Mira "${place.name}" en Zapatoca (Zapatoqueando): ${place.offer_title ? '🎁 ' + place.offer_title : place.formatted_address || ''}`.trim()
  if (navigator.share) {
    try {
      await navigator.share({ title: place.name, text: shareText, url: shareUrl })
      return
    } catch {
      // Fallback
    }
  }
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${shareText} ${shareUrl}`)
      showLocationNotice('Enlace del lugar copiado al portapapeles.', 3500)
      return
    } catch {
      // Fallback
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
      // Fallback
    }
  }
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank', 'noopener')
}

const searchResults = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return []
  return places.value.filter(p => {
    const matchName = p.name && p.name.toLowerCase().includes(q)
    const matchCat = p.category && p.category.toLowerCase().includes(q)
    const matchAddr = p.formatted_address && p.formatted_address.toLowerCase().includes(q)
    const matchDesc = p.description && p.description.toLowerCase().includes(q)
    const matchOffer = p.offer_title && p.offer_title.toLowerCase().includes(q)
    const matchSpec = p.specialty && p.specialty.toLowerCase().includes(q)
    return matchName || matchCat || matchAddr || matchDesc || matchOffer || matchSpec
  }).slice(0, 8)
})

const onSearchInput = () => {
  isSearchFocused.value = true
  updateMarkers()
  syncMarkersVisibility()
}

const openPlaceDrawer = (place) => {
  if (!place) return
  stopAudioGuide()
  activeCouponTicketPlaceId.value = null
  selectedPlace.value = place
  selectedPoster.value = null
  trackPlaceMetric(place.place_id, 'view')
}

const selectSearchResult = (place) => {
  isSearchFocused.value = false
  openPlaceDrawer(place)
  focusPlace(place)
}

const clearFilters = () => {
  searchQuery.value = ''
  activeCategories.value = []
  onlyWithBenefits.value = false
  activeCuratedPlanId.value = null
  onlySavedPlan.value = false
  showPlansPicker.value = false
  isSearchFocused.value = false
  updateMarkers()
  syncMarkersVisibility()
}

watch(() => route.path, (newPath, oldPath) => {
  if (newPath !== '/') {
    closePlaceDrawer()
    selectedPoster.value = null
    isSearchFocused.value = false
  }
  if (oldPath === '/rutas' && newPath !== '/rutas') {
    isSliderCompact.value = true
  }
})

const activeCategories = ref([])
const activeRouteBanner = ref(null)
const routeNearbyPlaces = ref([])
const showRouteStops = ref(false)

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

const filterPlacePredicates = (p) => {
  const q = searchQuery.value.trim().toLowerCase()
  const matchesCategory = activeCategories.value.length === 0 || activeCategories.value.includes(p.category)
  const matchesBenefits = !onlyWithBenefits.value || Boolean(p.is_partner || p.offer_title)
  const matchesSavedPlan = !onlySavedPlan.value || isPlaceInPlan(p.place_id)
  const matchesCuratedPlan =
    !activeCuratedPlan.value ||
    activeCuratedPlan.value.categories.includes(p.category) ||
    Boolean(p.is_partner)
  const matchesQuery = !q || (
    (p.name && p.name.toLowerCase().includes(q)) ||
    (p.category && p.category.toLowerCase().includes(q)) ||
    (p.formatted_address && p.formatted_address.toLowerCase().includes(q)) ||
    (p.description && p.description.toLowerCase().includes(q)) ||
    (p.offer_title && p.offer_title.toLowerCase().includes(q)) ||
    (p.specialty && p.specialty.toLowerCase().includes(q))
  )
  return matchesCategory && matchesBenefits && matchesSavedPlan && matchesCuratedPlan && matchesQuery
}

const filteredPlacesCount = computed(() => {
  return places.value.filter(filterPlacePredicates).length
})

const hasActiveFilter = computed(() => {
  return (
    activeCategories.value.length > 0 ||
    searchQuery.value.trim().length > 0 ||
    onlyWithBenefits.value ||
    Boolean(activeCuratedPlanId.value) ||
    onlySavedPlan.value
  )
})

const toggleBenefitsFilter = () => {
  onlyWithBenefits.value = !onlyWithBenefits.value
  updateMarkers()
  syncMarkersVisibility()
  if (onlyWithBenefits.value && map && map.getZoom() < 16) {
    map.setView([6.816801, -73.268689], 16, { animate: true, duration: 0.8 })
  }
}

const toggleOnlySavedPlan = () => {
  onlySavedPlan.value = !onlySavedPlan.value
  updateMarkers()
  syncMarkersVisibility()
  if (onlySavedPlan.value && map && map.getZoom() < 16) {
    map.setView([6.816801, -73.268689], 16, { animate: true, duration: 0.8 })
  }
}

const selectCuratedPlan = (planId) => {
  activeCuratedPlanId.value = activeCuratedPlanId.value === planId ? null : planId
  showPlansPicker.value = false
  const chosen = curatedPlans.find(p => p.id === activeCuratedPlanId.value)
  if (chosen?.enableTrails) {
    showAllTrails.value = true
    renderAllTrailsInMap()
  }
  updateMarkers()
  syncMarkersVisibility()
  if (activeCuratedPlanId.value && map) {
    map.setView([6.816801, -73.268689], 16, { animate: true, duration: 0.8 })
  }
}

const toggleShowAllTrails = () => {
  showAllTrails.value = !showAllTrails.value
  renderAllTrailsInMap()
}

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
  updateMarkers()
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
    openPlaceDrawer(found)
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

const renderPlanCircuitLine = (filteredPlaces) => {
  if (planCircuitLayer && map) {
    map.removeLayer(planCircuitLayer)
    planCircuitLayer = null
  }
  if (!map || (!onlySavedPlan.value && !activeCuratedPlanId.value)) return
  const validCoords = filteredPlaces
    .filter(p => p.location && Number.isFinite(Number(p.location.lat)) && Number.isFinite(Number(p.location.lng)))
    .slice(0, 8)
    .map(p => [Number(p.location.lat), Number(p.location.lng)])
  if (validCoords.length < 2) return

  planCircuitLayer = L.polyline(validCoords, {
    color: '#f59e0b',
    weight: 3,
    opacity: 0.85,
    dashArray: '6, 8'
  }).addTo(map)
}

const updateMarkers = () => {
  if (markersLayer) {
    markersLayer.clearLayers()
  }

  const filteredPlaces = places.value.filter(filterPlacePredicates)
  renderPlanCircuitLine(filteredPlaces)

  filteredPlaces.forEach(place => {
    if (place.location && place.location.lat && place.location.lng) {
      const markerColor = getCategoryColor(place.category)
      const isPartner = Boolean(place.is_partner || place.offer_title)
      const marker = L.marker([place.location.lat, place.location.lng], {
        icon: createMinimalDot(markerColor, isPartner),
        zIndexOffset: isPartner ? 300 : 0
      }).addTo(markersLayer)

      const safePlaceId = escapeHtml(place.place_id)
      const safeImageUrl = escapeHtml(place.image_url || '/logo.png')
      const safePlaceName = escapeHtml(place.name)
      const safeOffer = place.offer_title ? `<div class="text-[10px] font-extrabold text-amber-700 truncate">🎁 ${escapeHtml(place.offer_title)}</div>` : ''
      const popupContent = `
        <div onclick="window.openPlaceSidebar('${safePlaceId}')" class="flex items-center gap-2.5 pr-3 cursor-pointer">
          <div class="w-9 h-9 shrink-0 rounded-full overflow-hidden border-2 ${isPartner ? 'border-amber-400' : 'border-white'} shadow-sm bg-gray-100">
            <img src="${safeImageUrl}" alt="${safePlaceName}" class="w-full h-full object-cover" />
          </div>
          <div class="min-w-0">
            <div class="font-extrabold text-emerald-950 text-xs whitespace-nowrap flex items-center gap-1">
              ${isPartner ? '<span class="text-amber-500">★</span>' : ''}
              <span>${safePlaceName}</span>
            </div>
            ${safeOffer}
          </div>
        </div>
      `
      marker.bindPopup(popupContent, {
        closeButton: false,
        className: 'custom-minimal-popup',
        offset: [0, -5]
      })

      marker.on('mouseover', function () {
        this.openPopup()
      })
      marker.on('mouseout', function () {
        this.closePopup()
      })
      marker.on('click', () => {
        window.openPlaceSidebar(place.place_id)
      })
    }
  })
}

const initMap = () => {
  if (map) {
    map.remove()
  }

  const bounds = L.latLngBounds(
    [6.50, -73.60],
    [7.10, -72.90]
  )
  zapatocaBounds = bounds

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

  map = L.map('osm-map', {
    zoomControl: false,
    maxBounds: bounds,
    maxBoundsViscosity: 0.8,
    minZoom: 10,
    maxZoom: 22,
    fadeAnimation: false,
    zoomAnimation: true,
    markerZoomAnimation: true
  }).setView([6.816801, -73.268689], 15)

  L.control.zoom({
    position: 'topright'
  }).addTo(map)

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

  markersLayer = L.featureGroup()
  if (map.getZoom() >= 16 || hasActiveFilter.value) {
    markersLayer.addTo(map)
  }

  const customIcon = L.divIcon({
    className: 'zapatoca-main-marker',
    html: `<div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
             <div style="font-size: 28px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">📍</div>
             <div style="background-color: rgba(255,255,255,0.95); color: #052e16; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 2px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">Zapatoca</div>
           </div>`,
    iconSize: [80, 60], 
    iconAnchor: [40, 30]
  })
  zapatocaMarker = L.marker([6.816801, -73.268689], { icon: customIcon })
  
  zapatocaMarker.on('click', () => {
    map.setView([6.816801, -73.268689], 16, { animate: true, duration: 1 })
  })

  const laFuenteIcon = L.divIcon({
    className: 'la-fuente-main-marker',
    html: `<div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
             <div style="font-size: 28px; line-height: 1; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">📍</div>
             <div style="background-color: rgba(255,255,255,0.95); color: #064e3b; padding: 3px 8px; border-radius: 6px; font-weight: bold; font-size: 12px; margin-top: 2px; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">La Fuente</div>
           </div>`,
    iconSize: [80, 60],
    iconAnchor: [40, 30]
  })
  laFuenteMarker = L.marker([6.7075, -73.2804], { icon: laFuenteIcon })
  
  laFuenteMarker.on('click', () => {
    map.setView([6.7075, -73.2804], 16, { animate: true, duration: 1 })
  })

  if (map.getZoom() < 16 && !hasActiveFilter.value) {
    zapatocaMarker.addTo(map)
    laFuenteMarker.addTo(map)
  }

  map.on('zoomend', () => {
    const zoom = map.getZoom()
    const mapContainer = document.getElementById('osm-map')
    
    if (streetsLayer) {
      streetsLayer.eachLayer(layer => {
        layer.setStyle({
          weight: zoom >= 17 ? 4 : (zoom >= 15 ? 2 : 1)
        })
      })
    }
    
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
  if (!map) return
  try {
    const response = await fetch('/api/streets')
    const data = await response.json()

    if (data.type === 'FeatureCollection' && data.features.length > 0) {
      streetsLayer = L.geoJSON(data, {
        style: function () {
          const currentZoom = map ? map.getZoom() : 17
          return {
            color: '#e5e7eb',
            weight: currentZoom >= 17 ? 4 : (currentZoom >= 15 ? 2 : 1),
            opacity: 0.7
          }
        }
      }).addTo(map)

      streetsLayer.eachLayer((layer) => {
        if (layer.feature && layer.feature.properties && layer.feature.properties.name) {
          if (typeof layer.getLatLngs === 'function') {
            let latlngs = layer.getLatLngs()
            const reverseSegment = (pts) => {
              if (pts.length > 0 && pts[0].lat !== undefined) {
                const start = pts[0]
                const end = pts[pts.length - 1]
                if (start.lng > end.lng || (start.lng === end.lng && start.lat > end.lat)) {
                  pts.reverse()
                }
              }
            }
            if (latlngs.length > 0) {
              if (latlngs[0].lat !== undefined) {
                reverseSegment(latlngs)
              } else {
                latlngs.forEach(segment => reverseSegment(segment))
              }
              layer.setLatLngs(latlngs)
            }
          }

          if (typeof layer.setText === 'function') {
            layer.setText(layer.feature.properties.name, {
              center: true,
              offset: 3,
              attributes: {
                class: 'street-svg-text'
              }
            })
          }
        }
      })
      
      const mapEl = document.getElementById('osm-map')
      if (map && mapEl && map.getZoom() < 16) {
        mapEl.classList.add('map-zoomed-out')
      }
    }
  } catch (err) {
    console.error('Error fetching streets:', err)
  }
}

// Renderizado Multicolor Tramo por Tramo de Senderos Ecológicos
const clearActiveRouteSegmentsLayer = () => {
  if (activeRouteSegmentsLayer && map) {
    map.removeLayer(activeRouteSegmentsLayer)
    activeRouteSegmentsLayer = null
  }
}

const drawMultiColorRouteFeature = (coords, segments, routeName, targetLayerGroup) => {
  if (!Array.isArray(coords) || coords.length < 2 || !targetLayerGroup) return
  for (let i = 0; i < coords.length - 1; i++) {
    const [lng1, lat1] = coords[i]
    const [lng2, lat2] = coords[i + 1]
    const segMeta = Array.isArray(segments) && segments[i] ? segments[i] : null
    const segDiff = segMeta?.difficulty || 'Fácil'
    const segColor = segMeta?.color || DIFFICULTY_COLORS[segDiff] || '#eab308'
    const segMeters = calculateDistanceMeters(lat1, lng1, lat2, lng2)

    // Casing oscuro para legibilidad de montaña
    L.polyline(
      [
        [lat1, lng1],
        [lat2, lng2]
      ],
      {
        color: '#052e16',
        weight: 9,
        opacity: 0.85,
        lineCap: 'round',
        lineJoin: 'round'
      }
    ).addTo(targetLayerGroup)

    // Línea del color de dificultad del tramo
    const segLine = L.polyline(
      [
        [lat1, lng1],
        [lat2, lng2]
      ],
      {
        color: segColor,
        weight: 5.5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }
    ).addTo(targetLayerGroup)

    segLine.bindPopup(
      `<div class="px-3 py-1 text-xs font-extrabold text-emerald-950 whitespace-nowrap">🥾 ${escapeHtml(routeName || 'Sendero')} · Tramo #${i + 1}: <span style="color:${segColor}">${escapeHtml(segDiff)}</span> (${formatDistanceFromMeters(segMeters)})</div>`,
      { closeButton: false, className: 'custom-minimal-popup' }
    )
  }
}

const renderAllTrailsInMap = () => {
  clearActiveRouteSegmentsLayer()
  if (!map) return
  activeRouteSegmentsLayer = L.layerGroup().addTo(map)

  if (currentSelectedRouteId || currentSelectedRouteName) {
    const feature = allRoutesFeatures.value.find(f => {
      const props = f.properties || {}
      return (
        (currentSelectedRouteId && props.id === currentSelectedRouteId) ||
        (currentSelectedRouteName && props.name === currentSelectedRouteName)
      )
    })
    if (feature) {
      const coords = feature.geometry?.coordinates || []
      const segments = feature.properties?.segments || feature.geometry?.segments || []
      drawMultiColorRouteFeature(coords, segments, feature.properties?.name, activeRouteSegmentsLayer)
      return
    }
  }

  if (showAllTrails.value) {
    allRoutesFeatures.value.forEach(f => {
      const coords = f.geometry?.coordinates || []
      const segments = f.properties?.segments || f.geometry?.segments || []
      drawMultiColorRouteFeature(coords, segments, f.properties?.name, activeRouteSegmentsLayer)
    })
  }
}

const applyRoutesGeoJson = (data) => {
  if (!map || data?.type !== 'FeatureCollection') return
  allRoutesFeatures.value = Array.isArray(data.features) ? data.features : []
  if (routesLayer) {
    map.removeLayer(routesLayer)
    routesLayer = null
  }
  renderAllTrailsInMap()
}

const loadRoutes = async () => {
  if (!map) return
  try {
    const response = await fetch('/api/routes', { cache: 'no-store' })
    const data = await response.json()
    lastRoutesSnapshot = JSON.stringify(data.features || [])
    applyRoutesGeoJson(data)
  } catch (err) {
    console.error('Error fetching routes:', err)
  }
}

const loadBoundary = async () => {
  if (!map) return
  try {
    const response = await fetch('/zapatoca_boundary.geojson')
    if (!response.ok) throw new Error('No boundary data found')
    const data = await response.json()

    if (map && data.type === 'FeatureCollection' && data.features.length > 0) {
      L.geoJSON(data, {
        filter: function(feature) {
          return feature.geometry.type !== 'Point' && feature.geometry.type !== 'MultiPoint'
        },
        style: function () {
          return {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.6,
            fillColor: '#3b82f6',
            fillOpacity: 0.05
          }
        }
      }).addTo(map)
    }
  } catch (err) {
    console.error('Error fetching boundary:', err)
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
  } catch {
    // Silencioso en sincronización de fondo
  }
}

let routeEndpointsLayer = null
let activeRouteBounds = null

const handleOpenPassportEvent = () => {
  showPassportModal.value = true
}

const handleOpenPartnerApplyEvent = () => {
  showPartnerApplyModal.value = true
}

onMounted(async () => {
  loadLocalTouristState()
  updateLiveClock()
  liveClockInterval = setInterval(updateLiveClock, 1000)

  await nextTick()
  initMap()

  try {
    await refreshMapData()

    await Promise.all([
      loadStreets(),
      loadRoutes(),
      loadBoundary()
    ])

    const placeQueryId = route.query?.place
    if (placeQueryId) {
      const targetPlace = places.value.find(p => String(p.place_id) === String(placeQueryId))
      if (targetPlace) {
        openPlaceDrawer(targetPlace)
        focusPlace(targetPlace)
      }
    }
  } catch (err) {
    console.error('Error fetching data:', err)
    error.value = 'Error de conexión con el servidor.'
  } finally {
    loading.value = false
  }
  
  window.addEventListener('route-selected', handleRouteSelected)
  window.addEventListener('route-unselected', handleRouteUnselected)
  window.addEventListener('route-focus-start', handleRouteFocusStart)
  window.addEventListener('poster-locate-on-map', handlePosterLocateOnMap)
  window.addEventListener('open-passport-modal', handleOpenPassportEvent)
  window.addEventListener('open-partner-apply-modal', handleOpenPartnerApplyEvent)
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

const computeNearbyPlacesForRoute = (coords) => {
  if (!Array.isArray(coords) || coords.length === 0 || places.value.length === 0) {
    routeNearbyPlaces.value = []
    return
  }
  const start = coords[0]
  const end = coords[coords.length - 1]
  const matches = places.value.filter(p => {
    const pLat = Number(p.location?.lat)
    const pLng = Number(p.location?.lng)
    if (!Number.isFinite(pLat) || !Number.isFinite(pLng)) return false
    const dStart = calculateDistanceMeters(start[1], start[0], pLat, pLng)
    const dEnd = calculateDistanceMeters(end[1], end[0], pLat, pLng)
    return dStart <= 750 || dEnd <= 750
  })
  matches.sort((a, b) => Number(Boolean(b.is_partner || b.offer_title)) - Number(Boolean(a.is_partner || a.offer_title)))
  routeNearbyPlaces.value = matches.slice(0, 6)
}

const centerActiveRoute = () => {
  if (map && activeRouteBounds) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    map.fitBounds(activeRouteBounds, {
      paddingTopLeft: isMobile ? [24, 150] : [60, 120],
      paddingBottomRight: isMobile ? [24, 80] : [60, 80],
      duration: 1.0
    })
  }
}

const openActiveRouteStart = () => {
  if (!map || !activeRouteBanner.value?.startCoord) return
  const [lng, lat] = activeRouteBanner.value.startCoord
  drawWalkingGuideTo(lat, lng, `Inicio: ${activeRouteBanner.value.name || 'Sendero'}`)
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
    drawWalkingGuideTo(lat, lng, `Inicio: ${ruta.name || 'Sendero'}`)
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
  if (!map) return

  const matchedFeature = allRoutesFeatures.value.find(f => {
    const props = f.properties || {}
    return (
      (currentSelectedRouteId && props.id === currentSelectedRouteId) ||
      (currentSelectedRouteName && props.name === currentSelectedRouteName)
    )
  })

  const props = matchedFeature?.properties || selectedRoute
  const coords = matchedFeature?.geometry?.coordinates || selectedRoute.coordinates || []
  const rawBreakdown = props.difficulty_breakdown || selectedRoute.difficulty_breakdown || []
  const difficulty_breakdown = rawBreakdown.map(b => ({
    ...b,
    percent: b.percentage ?? b.percent ?? 100,
    percentage: b.percentage ?? b.percent ?? 100
  }))

  showRouteStops.value = false
  if (typeof window !== 'undefined' && window.innerWidth < 768) {
    showCategoryChips.value = false
  }

  activeRouteBanner.value = {
    id: props.id,
    name: props.name || selectedRoute.name,
    difficulty: props.difficulty || selectedRoute.difficulty || 'Fácil',
    color: props.color || selectedRoute.color || '#eab308',
    distance_label: selectedRoute.distance_label || props.distance_label || '',
    duration: selectedRoute.duration || props.duration,
    difficulty_breakdown,
    startCoord: coords.length > 0 ? coords[0] : (selectedRoute.startCoord || null)
  }

  renderAllTrailsInMap()
  renderRouteEndpoints(coords, props.name || selectedRoute.name)
  computeNearbyPlacesForRoute(coords)

  if (coords.length >= 2) {
    const latLngs = coords.map(([lng, lat]) => [lat, lng])
    activeRouteBounds = L.latLngBounds(latLngs)
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    map.fitBounds(activeRouteBounds, {
      paddingTopLeft: isMobile ? [24, 150] : [60, 120],
      paddingBottomRight: isMobile ? [24, 80] : [60, 80],
      duration: 1.2
    })
  }
}

const handleRouteUnselected = () => {
  currentSelectedRouteId = null
  currentSelectedRouteName = null
  activeRouteBanner.value = null
  activeRouteBounds = null
  routeNearbyPlaces.value = []
  showRouteStops.value = false
  clearRouteEndpoints()
  renderAllTrailsInMap()
}

onBeforeUnmount(() => {
  stopAudioGuide()
  window.removeEventListener('route-selected', handleRouteSelected)
  window.removeEventListener('route-unselected', handleRouteUnselected)
  window.removeEventListener('route-focus-start', handleRouteFocusStart)
  window.removeEventListener('poster-locate-on-map', handlePosterLocateOnMap)
  window.removeEventListener('open-passport-modal', handleOpenPassportEvent)
  window.removeEventListener('open-partner-apply-modal', handleOpenPartnerApplyEvent)
  window.removeEventListener('focus', refreshMapData)
  delete window.openPlaceSidebar
  clearRouteEndpoints()
  clearGuideLine()
  clearActiveRouteSegmentsLayer()
  if (liveClockInterval) {
    clearInterval(liveClockInterval)
    liveClockInterval = null
  }
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

/* Ajuste de controles de zoom de Leaflet (ocultos en móvil donde se usa pinch-to-zoom) */
:deep(.leaflet-top.leaflet-right) {
  margin-top: 100px; /* Para que quede debajo del Navbar en Desktop */
  margin-right: 20px;
}
@media (max-width: 767px) {
  :deep(.leaflet-control-zoom) {
    display: none !important;
  }
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
