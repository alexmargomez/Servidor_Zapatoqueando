<template>
  <div class="home-view-snap h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth relative" @scroll="handleScroll">
    
    <!-- 1. Hero Section -->
    <section id="hero" class="h-screen w-full snap-start relative flex flex-col items-center justify-center text-center px-4 shrink-0">
      <div 
        class="absolute inset-0 bg-cover bg-center z-0"
        style="background-image: url('/hero-bg.jpeg');"
      ></div>
      <!-- Premium Gradient Overlay con tope blanco -->
      <div class="absolute inset-0 bg-gradient-to-t from-green-950 via-green-900/60 to-white/40 z-10"></div>
      
      <div class="relative z-20 flex flex-col items-center mt-16 max-w-5xl">
        <h3 class="text-xs md:text-lg font-bold tracking-[0.4em] uppercase mb-4 md:mb-6 text-yellow-400 drop-shadow-md">
          DESCUBRE LA MAGIA DE
        </h3>
        <h2 class="text-6xl sm:text-8xl md:text-[10rem] font-black text-white tracking-tighter drop-shadow-2xl mb-8 md:mb-12 leading-none">
          Zapatoca
        </h2>
        
        <button 
          @click="scrollToSection('noticias')"
          class="bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black py-4 px-10 rounded-full shadow-[0_10px_25px_rgba(250,204,21,0.5)] hover:shadow-[0_15px_35px_rgba(250,204,21,0.6)] hover:-translate-y-2 transition-all duration-300 active:scale-95 text-lg flex items-center gap-3 group uppercase tracking-widest"
        >
          Explorar <span class="group-hover:translate-y-1 transition-transform">&darr;</span>
        </button>
      </div>
    </section>

    <!-- 2. Noticias (Posters - Slider Horizontal) -->
    <section id="noticias" class="h-screen w-full snap-start bg-slate-50 flex flex-col items-center justify-center px-0 md:px-6 relative shrink-0 overflow-hidden">
      <div class="w-full">
        
        <div v-if="posters.length === 0" class="text-gray-400 text-lg text-center font-medium animate-pulse mb-8">
          Buscando la última información de Zapatoca...
        </div>
        
        <div ref="sliderRef" class="flex overflow-x-auto snap-x snap-mandatory gap-6 px-6 md:px-0 pb-6 hide-scrollbar w-full items-center">
          <div v-for="poster in posters.slice(0,5)" :key="poster.id" class="snap-center shrink-0 w-[85vw] md:w-[400px] lg:w-[450px] group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col h-[65vh] max-h-[600px] border-t-4 border-transparent hover:border-yellow-400 hover:-translate-y-2 cursor-pointer relative">
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
            <div class="h-2/3 overflow-hidden">
              <img v-if="poster.image_url" :src="poster.image_url" class="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" alt="Poster de noticia" />
            </div>
            <div class="p-6 md:p-8 h-1/3 flex flex-col justify-center bg-white relative z-20">
              <h3 class="text-xl md:text-2xl font-black text-green-950 mb-2 md:mb-3 line-clamp-2 leading-tight group-hover:text-green-700 transition-colors">{{ poster.title }}</h3>
              <p class="text-sm md:text-base text-gray-500 line-clamp-2 font-medium">{{ poster.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Descargar App -->
    <section id="descarga" class="h-screen w-full snap-start bg-green-950 flex flex-col shrink-0 relative overflow-hidden">
      <!-- Background pattern/accent -->
      <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style="background-image: radial-gradient(circle at center, #facc15 2px, transparent 2.5px); background-size: 40px 40px;"></div>
      
      <div class="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <div class="max-w-5xl mx-auto text-center flex flex-col items-center">
          <span class="text-yellow-400 font-bold tracking-widest uppercase mb-4 text-xs md:text-sm">Disponible Ahora</span>
          <h2 class="text-5xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter mb-6 md:mb-8 leading-tight">Lleva a Zapatoca <br/>en tu bolsillo</h2>
          <p class="text-lg md:text-2xl text-green-100 mb-10 md:mb-14 max-w-3xl leading-relaxed font-light opacity-90">Descarga nuestra app oficial y accede a rutas, eventos y nuestro mapa interactivo al instante.</p>
          <button class="bg-yellow-400 hover:bg-yellow-300 text-green-950 font-black py-4 px-10 md:py-5 md:px-16 rounded-full shadow-[0_0_40px_rgba(250,204,21,0.4)] hover:shadow-[0_0_60px_rgba(250,204,21,0.6)] transition-all duration-300 hover:-translate-y-2 active:scale-95 text-xl md:text-2xl uppercase tracking-widest group flex items-center gap-3">
            Descargar App <span class="group-hover:translate-x-2 transition-transform">&rarr;</span>
          </button>
        </div>
      </div>
      <Footer class="relative z-10" />
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Footer from '../components/Footer.vue'

const posters = ref([])
const sliderRef = ref(null)
let autoScrollInterval = null

onMounted(async () => {
  try {
    const response = await fetch('/api/posters')
    if (response.ok) {
      const data = await response.json()
      if (data.message === 'success' && data.data) {
        posters.value = data.data
      }
    }
  } catch (error) {
    console.error('Error fetching posters:', error)
  }

  // Auto-scroll logic for slider
  if (sliderRef.value) {
    autoScrollInterval = setInterval(() => {
      if (!sliderRef.value) return
      
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.value
      // If reached the end, go back to start, else scroll by one card width roughly
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        sliderRef.value.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const scrollAmount = window.innerWidth < 768 ? window.innerWidth * 0.85 + 24 : 400 + 24
        sliderRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' })
      }
    }, 4000)
  }
})

onUnmounted(() => {
  if (autoScrollInterval) clearInterval(autoScrollInterval)
})

const scrollToSection = (id) => {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

const handleScroll = (e) => {
  window.dispatchEvent(new CustomEvent('home-scroll', { detail: e.target.scrollTop }))
}
</script>

<style scoped>
.home-view-snap::-webkit-scrollbar, .hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.home-view-snap, .hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
