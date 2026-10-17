<template>
  <div class="fixed inset-0 z-[2000] flex justify-end md:items-center md:justify-center pointer-events-none">
    
    <!-- Backdrop oscuro -->
    <div 
      class="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity"
      @click="close"
    ></div>

    <!-- Contenedor Principal (Panel Lateral en Móvil, Modal grande en Desktop) -->
    <div 
      class="relative w-full h-full md:w-[90vw] md:h-[88vh] md:max-w-6xl bg-white md:rounded-3xl shadow-2xl flex flex-col pointer-events-auto transition-transform overflow-hidden"
    >
      <!-- Cabecera -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <span class="text-yellow-500 font-bold tracking-widest uppercase text-xs mb-1 block">Agenda Cultural</span>
          <h2 class="text-2xl md:text-4xl font-black text-green-950 tracking-tighter">Eventos en Zapatoca</h2>
        </div>
        <button @click="close" class="bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 p-2 md:p-3 rounded-full transition-colors focus:outline-none cursor-pointer">
          <svg class="w-6 h-6 md:w-7 md:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <!-- Contenido Scrollable -->
      <div class="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50">
        <p class="text-base md:text-lg text-gray-500 max-w-3xl mb-8">
          Descubre los eventos culturales, ferias y festividades que dan vida a nuestro hermoso pueblo. No te pierdas de nada.
        </p>

        <!-- Cargando -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
        
        <!-- Grilla de Eventos -->
        <div v-else-if="events.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="ev in events" 
            :key="ev.id" 
            class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col group"
          >
            <div class="aspect-video w-full bg-slate-100 overflow-hidden relative">
              <img 
                :src="ev.imageurl || ev.image_url || '/hero-bg.jpeg'" 
                :alt="ev.title" 
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span class="absolute top-3 left-3 bg-yellow-400 text-green-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow">
                Evento
              </span>
            </div>
            <div class="p-5 flex-1 flex flex-col">
              <h3 class="text-lg font-black text-green-950 mb-2 leading-snug">{{ ev.title }}</h3>
              <p class="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 whitespace-pre-wrap">
                {{ ev.description || 'Ven y disfruta de este evento especial en Zapatoca.' }}
              </p>
              <div class="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <a 
                  :href="`https://wa.me/573000000000?text=${encodeURIComponent('Hola, vengo desde Zapatoqueando y quiero más información sobre el evento: ' + ev.title)}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="w-full bg-green-50 hover:bg-green-600 text-green-800 hover:text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors text-center"
                >
                  Más información
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Placeholder Estado Vacío -->
        <div v-else class="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-3xl p-12 bg-white text-center">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          <h3 class="text-xl font-bold text-gray-700 mb-2">Próximamente...</h3>
          <p class="text-gray-400 font-medium max-w-sm">
            Estamos preparando la cartelera de eventos más increíble para ti. ¡Vuelve pronto!
          </p>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const events = ref([])
const loading = ref(true)

const close = () => {
  router.push('/')
}

onMounted(async () => {
  try {
    const res = await fetch('/api/posters')
    if (res.ok) {
      const data = await res.json()
      if (data.message === 'success' && Array.isArray(data.data)) {
        events.value = data.data.filter(item => !item.type || item.type === 'event')
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
