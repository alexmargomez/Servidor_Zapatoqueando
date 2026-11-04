<template>
  <div class="fixed inset-0 z-[2000] flex justify-end md:items-center md:justify-center pointer-events-none">
    
    <!-- Backdrop oscuro -->
    <div 
      class="absolute inset-0 bg-emerald-950/50 backdrop-blur-sm pointer-events-auto transition-opacity"
      @click="close"
    ></div>

    <!-- Contenedor Principal (Panel en Móvil, Modal grande en Desktop) -->
    <div 
      class="relative w-full h-full md:w-[92vw] md:h-[88vh] md:max-w-6xl bg-stone-50 md:rounded-3xl shadow-2xl flex flex-col pointer-events-auto transition-transform overflow-hidden border border-white/60"
    >
      <!-- Cabecera -->
      <div class="px-5 sm:px-8 py-4 sm:py-5 border-b border-slate-200/80 flex flex-col gap-3 bg-white sticky top-0 z-10">
        <div class="flex justify-between items-center gap-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center text-xl shadow-sm shrink-0">
              🎭
            </div>
            <div>
              <span class="text-emerald-700 font-extrabold tracking-widest uppercase text-[10px] sm:text-xs block">Agenda Cultural y Experiencias</span>
              <h2 class="text-xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight leading-tight">Cartelera de Zapatoca</h2>
            </div>
          </div>
          <button @click="close" type="button" class="bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 p-2.5 rounded-full transition-colors focus:outline-none cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Barra de Filtros y Buscador -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
          <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full self-start">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              type="button"
              @click="activeTab = tab.value"
              :class="[
                'px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer',
                activeTab === tab.value
                  ? 'bg-emerald-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-950'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <div class="relative flex-1 max-w-xs">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar evento o experiencia..."
              class="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm bg-slate-100 focus:bg-white border border-transparent focus:border-emerald-600 rounded-full outline-none text-emerald-950 font-medium transition-all"
            />
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>
      </div>

      <!-- Contenido Scrollable -->
      <div class="flex-1 overflow-y-auto p-5 sm:p-8 bg-stone-50">
        <!-- Cargando -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <!-- Grilla de Eventos y Destacados -->
        <div v-else-if="filteredItems.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="ev in filteredItems" 
            :key="ev.id" 
            class="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200/80 transition-all duration-300 flex flex-col group"
          >
            <div class="aspect-video w-full bg-slate-100 overflow-hidden relative">
              <img 
                :src="ev.imageurl || ev.image_url || '/hero-bg.jpeg'" 
                :alt="ev.title" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span 
                class="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm"
                :class="ev.type === 'business' ? 'bg-emerald-950 text-amber-300' : 'bg-amber-400 text-emerald-950'"
              >
                {{ ev.type === 'business' ? '⭐ Destacado' : '🎉 Evento Cultural' }}
              </span>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <h3 class="text-lg font-extrabold text-emerald-950 mb-2 leading-snug">{{ ev.title }}</h3>
              <p class="text-sm text-slate-600 line-clamp-3 mb-4 flex-1 whitespace-pre-wrap leading-relaxed">
                {{ ev.description || 'Ven y disfruta de esta experiencia especial en Zapatoca, La Ciudad del Clima de Seda.' }}
              </p>
              <div class="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  @click="openDirections(ev)"
                  type="button"
                  class="flex-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path></svg>
                  <span>Ver en el mapa</span>
                </button>
                <button 
                  @click="shareEvent(ev)"
                  type="button"
                  class="bg-emerald-50 hover:bg-emerald-950 text-emerald-900 hover:text-white font-bold text-xs py-2.5 px-3.5 rounded-xl transition-colors text-center cursor-pointer"
                  title="Compartir con amigos o por WhatsApp"
                >
                  📤 Compartir
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Placeholder Estado Vacío -->
        <div v-else class="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-12 bg-white text-center">
          <svg class="w-14 h-14 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h3 class="text-lg font-extrabold text-emerald-950 mb-1">Sin resultados para este filtro</h3>
          <p class="text-slate-500 text-sm max-w-sm">
            Intenta cambiar la pestaña o limpiar el texto de búsqueda para explorar toda la cartelera de Zapatoca.
          </p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const allPosters = ref([])
const loading = ref(true)
const activeTab = ref('all')
const searchQuery = ref('')

const tabs = [
  { label: 'Todos', value: 'all' },
  { label: '🎉 Eventos', value: 'event' },
  { label: '⭐ Destacados', value: 'business' }
]

const filteredItems = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return allPosters.value.filter(item => {
    const itemType = item.type || 'event'
    const matchesTab = activeTab.value === 'all' || itemType === activeTab.value
    const matchesQuery = !q ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.description && item.description.toLowerCase().includes(q))
    return matchesTab && matchesQuery
  })
})

const openDirections = (ev) => {
  router.push('/')
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('poster-locate-on-map', { detail: ev }))
  }, 80)
}

const shareEvent = async (ev) => {
  const shareText = `✨ Mira "${ev.title}" en Zapatoca (Zapatoqueando): ${ev.description || ''}`.trim()
  const shareUrl = window.location.origin
  if (navigator.share) {
    try {
      await navigator.share({ title: ev.title, text: shareText, url: shareUrl })
      return
    } catch {
      // Fallback a WhatsApp share
    }
  }
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank', 'noopener')
}

const close = () => {
  router.push('/')
}

onMounted(async () => {
  try {
    const res = await fetch('/api/posters')
    if (res.ok) {
      const data = await res.json()
      if (data.message === 'success' && Array.isArray(data.data)) {
        allPosters.value = data.data
      }
    }
  } catch (err) {
    console.error('Error cargando eventos:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 8px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: #f8fafc;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
</style>

