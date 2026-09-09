<template>
  <div class="space-y-6">
    <!-- Header y Acción Principal -->
    <div class="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div>
        <h3 class="text-lg font-bold text-gray-800">Tus Publicidades</h3>
        <p class="text-sm text-gray-500">Administra los carteles que aparecen en el carrusel de inicio.</p>
      </div>
      <button 
        @click="openModal()" 
        class="bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 px-5 rounded-lg shadow transition-colors flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
        Nueva Publicidad
      </button>
    </div>

    <!-- Tabla -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-500 font-medium">Cargando...</div>
      <table v-else class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 border-b border-gray-100 text-gray-500 text-sm">
            <th class="p-4 font-bold">Imagen</th>
            <th class="p-4 font-bold">Título</th>
            <th class="p-4 font-bold hidden md:table-cell">Descripción</th>
            <th class="p-4 font-bold text-center">Tipo</th>
            <th class="p-4 font-bold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="poster in posters" :key="poster.id" class="border-b border-gray-50 hover:bg-slate-50 transition-colors">
            <td class="p-4">
              <img :src="poster.imageurl" :alt="poster.title" class="w-16 h-12 object-cover rounded shadow-sm bg-gray-200" />
            </td>
            <td class="p-4 font-bold text-gray-800">{{ poster.title }}</td>
            <td class="p-4 text-sm text-gray-600 hidden md:table-cell max-w-xs truncate">{{ poster.description }}</td>
            <td class="p-4 text-center">
              <span class="px-3 py-1 rounded-full text-xs font-bold" :class="poster.type === 'event' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'">
                {{ poster.type }}
              </span>
            </td>
            <td class="p-4 text-right space-x-2">
              <button @click="openModal(poster)" class="text-blue-600 hover:text-blue-800 font-medium text-sm px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors">Editar</button>
              <button @click="deleteItem(poster.id)" class="text-red-600 hover:text-red-800 font-medium text-sm px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors">Eliminar</button>
            </td>
          </tr>
          <tr v-if="posters.length === 0">
            <td colspan="5" class="p-8 text-center text-gray-500">No hay publicidades creadas aún.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal Formulario -->
    <div v-if="showModal" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div class="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 class="text-lg font-bold text-gray-800">{{ form.id ? 'Editar Publicidad' : 'Nueva Publicidad' }}</h3>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form @submit.prevent="saveItem" class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Título</label>
            <input v-model="form.title" type="text" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
            <textarea v-model="form.description" rows="3" class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"></textarea>
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">URL de la Imagen</label>
            <input v-model="form.imageUrl" type="url" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" placeholder="https://...">
          </div>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
            <select v-model="form.type" required class="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white">
              <option value="event">Evento</option>
              <option value="business">Negocio</option>
            </select>
          </div>

          <div class="pt-4 flex justify-end gap-3">
            <button type="button" @click="showModal = false" class="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">Cancelar</button>
            <button type="submit" :disabled="saving" class="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-6 rounded-lg shadow transition-colors flex items-center">
              <span v-if="saving" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../../utils/api'

const posters = ref([])
const loading = ref(true)
const saving = ref(false)
const showModal = ref(false)
const form = ref({ id: null, title: '', description: '', imageUrl: '', type: 'event' })

const loadData = async () => {
  try {
    loading.value = true
    const res = await apiFetch('/api/posters')
    const data = await res.json()
    // Nota: El backend devuelve 'imageurl' (minúsculas) de postgres
    posters.value = data.data
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
      description: item.description, 
      imageUrl: item.imageurl, // mapear de postgres a camelCase
      type: item.type 
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
    
    await apiFetch(url, {
      method,
      body: JSON.stringify(form.value)
    })
    
    showModal.value = false
    loadData()
  } catch (err) {
    alert('Error al guardar')
  } finally {
    saving.value = false
  }
}

const deleteItem = async (id) => {
  if (!confirm('¿Estás seguro de eliminar esta publicidad?')) return
  try {
    await apiFetch(`/api/posters/${id}`, { method: 'DELETE' })
    loadData()
  } catch (err) {
    alert('Error al eliminar')
  }
}

onMounted(() => {
  loadData()
})
</script>
