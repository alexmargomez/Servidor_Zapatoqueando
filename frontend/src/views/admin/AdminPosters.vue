<template>
  <div class="space-y-6">
    <!-- Tarjetas KPI de Resumen -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Total Cartelera</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ posters.length }}</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-900 flex items-center justify-center text-xl">🖼️</div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Eventos Culturales</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ posters.filter(p => p.type === 'event').length }}</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl">🎉</div>
      </div>
      <div class="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div>
          <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">Comercios Destacados</p>
          <p class="text-2xl font-extrabold text-emerald-950 mt-1 tabular-metrics">{{ posters.filter(p => p.type === 'business').length }}</p>
        </div>
        <div class="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-xl">⭐</div>
      </div>
    </div>

    <!-- Header, Buscador y Acción Principal -->
    <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white p-6 rounded-2xl shadow-2xs border border-slate-200/80">
      <div>
        <h3 class="text-lg font-extrabold text-emerald-950">Publicidades y Eventos</h3>
        <p class="text-xs sm:text-sm text-slate-500">Administra los carteles del carrusel principal y la cartelera cultural.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por título..."
          class="px-3.5 py-2 text-xs sm:text-sm bg-stone-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-700 focus:bg-white text-emerald-950 font-medium"
        />
        <select
          v-model="typeFilter"
          class="px-3 py-2 text-xs sm:text-sm bg-stone-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-700 text-emerald-950 font-bold"
        >
          <option value="all">Todos los tipos</option>
          <option value="event">🎉 Eventos</option>
          <option value="business">⭐ Negocios</option>
        </select>
        <button 
          @click="openModal()" 
          type="button"
          class="bg-emerald-950 hover:bg-emerald-900 text-white font-extrabold py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
        >
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path></svg>
          <span>Nueva Publicidad</span>
        </button>
      </div>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-2xl shadow-2xs border border-slate-200/80 overflow-x-auto">
      <div v-if="loading" class="p-8 text-center text-slate-500 font-medium">Cargando cartelera...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-stone-50 border-b border-slate-200/80 text-slate-500 text-xs uppercase tracking-wider">
            <th class="p-4 font-extrabold">Imagen</th>
            <th class="p-4 font-extrabold">Título</th>
            <th class="p-4 font-extrabold hidden md:table-cell">Descripción</th>
            <th class="p-4 font-extrabold text-center">Tipo</th>
            <th class="p-4 font-extrabold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="poster in filteredPosters" :key="poster.id" class="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
            <td class="p-4">
              <img :src="poster.imageurl || poster.image_url || '/hero-bg.jpeg'" :alt="poster.title" class="w-16 h-12 object-cover rounded-xl shadow-xs bg-slate-100 border border-slate-200" />
            </td>
            <td class="p-4 font-extrabold text-emerald-950">{{ poster.title }}</td>
            <td class="p-4 text-sm text-slate-600 hidden md:table-cell max-w-xs truncate">{{ poster.description }}</td>
            <td class="p-4 text-center">
              <span class="px-3 py-1 rounded-full text-xs font-extrabold" :class="poster.type === 'event' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'">
                {{ poster.type === 'event' ? '🎉 Evento' : '⭐ Negocio' }}
              </span>
            </td>
            <td class="p-4 text-right space-x-2 whitespace-nowrap">
              <button @click="openModal(poster)" type="button" class="text-emerald-800 hover:text-emerald-950 font-bold text-xs px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer">Editar</button>
              <button @click="deleteItem(poster.id)" type="button" class="text-rose-600 hover:text-rose-800 font-bold text-xs px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer">Eliminar</button>
            </td>
          </tr>
          <tr v-if="filteredPosters.length === 0">
            <td colspan="5" class="p-8 text-center text-slate-500 font-medium">No hay publicidades que coincidan con el filtro.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-emerald-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div class="bg-stone-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 class="text-lg font-extrabold text-emerald-950">{{ form.id ? 'Editar Publicidad' : 'Nueva Publicidad' }}</h3>
          <button @click="showModal = false" type="button" class="text-slate-400 hover:text-slate-600 cursor-pointer">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveItem" class="p-5 md:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Título</label>
            <input v-model="form.title" type="text" required class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950 font-medium">
          </div>
          <div>
            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Descripción</label>
            <textarea v-model="form.description" rows="3" class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-emerald-950"></textarea>
          </div>
          <div>
            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Imagen (Sube una foto o pega una URL)</label>
            <div class="flex gap-2 items-center mb-2">
              <input type="file" @change="handleImageUpload" accept="image/*" class="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-950 file:text-white hover:file:bg-emerald-900 outline-none cursor-pointer"/>
              <span v-if="uploadingImage" class="animate-spin h-5 w-5 border-2 border-emerald-700 border-t-transparent rounded-full shrink-0"></span>
            </div>
            <input v-model="form.imageUrl" type="text" required class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all text-sm text-slate-700" placeholder="https://... o sube un archivo arriba">
            <div v-if="form.imageUrl" class="mt-2 rounded-xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 max-h-40">
              <img :src="form.imageUrl" alt="Vista previa" class="w-full h-full object-cover" />
            </div>
          </div>
          <div>
            <label class="block text-xs font-extrabold uppercase tracking-wider text-slate-600 mb-1">Tipo</label>
            <select v-model="form.type" required class="w-full px-4 py-2.5 bg-stone-50 border border-slate-300 focus:border-emerald-700 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 rounded-xl outline-none transition-all font-bold text-emerald-950">
              <option value="event">🎉 Evento Cultural</option>
              <option value="business">⭐ Negocio / Destacado</option>
            </select>
          </div>

          <div class="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white pb-1 border-t border-slate-100">
            <button type="button" @click="showModal = false" class="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-sm">Cancelar</button>
            <button type="submit" :disabled="saving || uploadingImage" class="bg-emerald-950 hover:bg-emerald-900 disabled:opacity-50 text-white font-extrabold py-2.5 px-6 rounded-xl shadow-sm transition-colors flex items-center cursor-pointer text-sm">
              <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-amber-400 border-t-transparent rounded-full mr-2"></span>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../../utils/api'

const posters = ref([])
const loading = ref(true)
const saving = ref(false)
const uploadingImage = ref(false)
const showModal = ref(false)
const searchQuery = ref('')
const typeFilter = ref('all')
const form = ref({ id: null, title: '', description: '', imageUrl: '', type: 'event' })

const filteredPosters = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return posters.value.filter(p => {
    const matchesType = typeFilter.value === 'all' || (p.type || 'event') === typeFilter.value
    const matchesQuery = !q ||
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    return matchesType && matchesQuery
  })
})

const loadData = async () => {
  try {
    loading.value = true
    const res = await apiFetch('/api/posters')
    const data = await res.json()
    posters.value = data.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

const openModal = (item = null) => {
  if (item) {
    form.value = { 
      id: item.id, 
      title: item.title, 
      description: item.description || '', 
      imageUrl: item.imageurl || item.image_url || '',
      type: item.type || 'event'
    }
  } else {
    form.value = { id: null, title: '', description: '', imageUrl: '', type: 'event' }
  }
  showModal.value = true
}

const saveItem = async () => {
  try {
    saving.value = true
    const url = form.value.id ? `/api/posters/${form.value.id}` : '/api/posters'
    const method = form.value.id ? 'PUT' : 'POST'
    
    const res = await apiFetch(url, {
      method,
      body: JSON.stringify(form.value)
    })
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}))
      throw new Error(errData.error || 'Error al guardar')
    }
    
    showModal.value = false
    loadData()
  } catch (err) {
    alert(err.message || 'Error al guardar')
  } finally {
    saving.value = false
  }
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  const formData = new FormData()
  formData.append('image', file)

  try {
    uploadingImage.value = true
    const response = await apiFetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    if (!response.ok) throw new Error('Error al subir')
    
    const data = await response.json()
    form.value.imageUrl = data.imageUrl
  } catch (error) {
    alert('Error al subir la imagen. Verifica el peso y formato.')
  } finally {
    uploadingImage.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta publicidad?')) return
  try {
    const res = await apiFetch(`/api/posters/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Error al eliminar')
    loadData()
  } catch (err) {
    alert('Error al eliminar')
  }
}

onMounted(() => {
  loadData()
})
</script>
